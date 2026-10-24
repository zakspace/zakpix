/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import sharp, { OutputInfo, FitEnum } from 'sharp';
import {
  CompressionOptions,
  CompressionResult,
  ImageFormat,
  SocialPreset,
} from '../types/compression.js';
import { inspectImageBuffer } from './imageInspector.js';
import { sanitizeSvg } from './securityValidator.js';

// Social media dimension lookup
export const SOCIAL_PRESETS: Record<SocialPreset, { width?: number; height?: number; fit: keyof FitEnum }> = {
  none: { fit: 'inside' },
  instagram_post: { width: 1080, height: 1080, fit: 'cover' },
  instagram_story: { width: 1080, height: 1920, fit: 'cover' },
  twitter_header: { width: 1500, height: 500, fit: 'cover' },
  twitter_post: { width: 1200, height: 675, fit: 'cover' },
  linkedin_banner: { width: 1584, height: 396, fit: 'cover' },
  facebook_post: { width: 1200, height: 630, fit: 'cover' },
  youtube_thumbnail: { width: 1280, height: 720, fit: 'cover' },
};

/**
 * Minify SVG text without breaking structure
 */
function minifySvgText(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
    .replace(/\s+/g, ' ') // collapse whitespaces
    .replace(/>\s+</g, '><') // remove whitespace between tags
    .trim();
}

/**
 * Run compression pipeline for a specific quality/settings instance
 */
async function executeSharpPipeline(
  inputBuffer: Buffer,
  targetFormat: ImageFormat | 'svg',
  effectiveQuality: number,
  options: CompressionOptions,
  isLossless: boolean,
  isAnimated: boolean,
  hasAlpha: boolean
): Promise<{ buffer: Buffer; info: OutputInfo }> {
  let pipeline = sharp(inputBuffer, { failOn: 'none', animated: isAnimated });

  // Auto-rotate according to EXIF orientation
  pipeline = pipeline.rotate();

  // Apply social media preset or custom resizing
  if (options.resize?.preset && options.resize.preset !== 'none') {
    const preset = SOCIAL_PRESETS[options.resize.preset];
    if (preset.width || preset.height) {
      pipeline = pipeline.resize({
        width: preset.width,
        height: preset.height,
        fit: preset.fit,
        background: { r: 255, g: 255, b: 255, alpha: hasAlpha ? 0 : 1 },
      });
    }
  } else if (options.resize?.width || options.resize?.height) {
    pipeline = pipeline.resize({
      width: options.resize.width || undefined,
      height: options.resize.height || undefined,
      fit: options.resize.fit || 'inside',
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: hasAlpha ? 0 : 1 },
    });
  }

  // Preserve or strip metadata
  if (!options.stripMetadata) {
    pipeline = pipeline.withMetadata();
  }

  const effort = options.effort ?? (options.mode === 'max' ? 8 : 4);
  const chroma = options.chromaSubsampling ?? (options.mode === 'ecommerce' ? '4:4:4' : '4:2:0');

  // Format-specific encoding
  switch (targetFormat) {
    case 'jpeg':
    case 'jpg': {
      pipeline = pipeline.jpeg({
        quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
        progressive: true,
        chromaSubsampling: chroma,
        mozjpeg: true,
      });
      break;
    }

    case 'png': {
      if (isLossless) {
        pipeline = pipeline.png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          effort,
        });
      } else {
        pipeline = pipeline.png({
          quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
          compressionLevel: 8,
          palette: true,
          effort,
        });
      }
      break;
    }

    case 'webp': {
      pipeline = pipeline.webp({
        quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
        lossless: isLossless,
        effort,
        smartSubsample: true,
      });
      break;
    }

    case 'avif': {
      pipeline = pipeline.avif({
        quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
        lossless: isLossless,
        effort: Math.min(6, effort), // AVIF effort 7-9 can be very slow
        chromaSubsampling: chroma,
      });
      break;
    }

    case 'gif': {
      pipeline = pipeline.gif({
        effort: Math.min(7, effort),
        reuse: true,
      });
      break;
    }

    case 'tiff': {
      pipeline = pipeline.tiff({
        quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
        compression: isLossless ? 'deflate' : 'jpeg',
      });
      break;
    }

    default: {
      // Default to WebP for modern efficiency
      pipeline = pipeline.webp({
        quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
        effort,
      });
    }
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { buffer: data, info };
}

/**
 * Binary search to achieve a target file size in KB
 */
async function searchTargetSize(
  inputBuffer: Buffer,
  targetFormat: ImageFormat,
  targetSizeKB: number,
  options: CompressionOptions,
  isAnimated: boolean,
  hasAlpha: boolean
): Promise<{ buffer: Buffer; info: OutputInfo; finalQuality: number }> {
  const targetBytes = targetSizeKB * 1024;
  let low = 10;
  let high = 95;
  let bestBuffer: Buffer | null = null;
  let bestInfo: OutputInfo | null = null;
  let bestQuality = 80;

  // Maximum 5 iterations for speed and responsiveness
  for (let i = 0; i < 5; i++) {
    const mid = Math.round((low + high) / 2);
    const result = await executeSharpPipeline(
      inputBuffer,
      targetFormat,
      mid,
      options,
      false,
      isAnimated,
      hasAlpha
    );

    bestBuffer = result.buffer;
    bestInfo = result.info;
    bestQuality = mid;

    // Check if we are within 5% of target or below
    if (result.buffer.length <= targetBytes) {
      if (targetBytes - result.buffer.length < targetBytes * 0.08) {
        break; // Closely matched
      }
      low = mid + 1; // Can attempt higher quality
    } else {
      high = mid - 1; // Need smaller file
    }

    if (low > high) break;
  }

  return {
    buffer: bestBuffer!,
    info: bestInfo!,
    finalQuality: bestQuality,
  };
}

/**
 * Main compression function
 */
export async function compressImage(
  inputBuffer: Buffer,
  options: CompressionOptions
): Promise<{ result: CompressionResult; outputBuffer: Buffer }> {
  const startTime = Date.now();
  const meta = await inspectImageBuffer(inputBuffer);
  const warnings: string[] = [];

  // Determine target format
  let targetFormat: ImageFormat | 'svg' = 'webp';

  if (options.targetFormat === 'original') {
    targetFormat = (meta.format as ImageFormat) || 'webp';
  } else if (options.mode === 'smart') {
    // Smart heuristic choice
    if (meta.format === 'svg') {
      targetFormat = 'svg';
    } else if (meta.hasAlpha) {
      targetFormat = 'webp'; // Preserves transparency with superior compression
    } else if (meta.detectedType === 'photograph') {
      targetFormat = 'webp';
    } else if (meta.detectedType === 'screenshot' || meta.detectedType === 'document_scan') {
      targetFormat = 'png';
    } else {
      targetFormat = 'webp';
    }
  } else {
    targetFormat = options.targetFormat as ImageFormat;
  }

  // Handle transparency preservation warning
  if (meta.hasAlpha && (targetFormat === 'jpeg' || targetFormat === 'jpg')) {
    warnings.push(
      'Target format JPEG does not support transparency. Transparent areas were rendered on a clean white background.'
    );
  }

  // Handle animated preservation warning
  if (meta.isAnimated && targetFormat !== 'gif' && targetFormat !== 'webp') {
    warnings.push(
      `Format ${targetFormat.toUpperCase()} does not support animation. Only the first frame was preserved.`
    );
  }

  // SVG Specific Handling
  if (meta.format === 'svg' && targetFormat === 'svg') {
    const sanitized = sanitizeSvg(inputBuffer.toString('utf8'));
    const minified = minifySvgText(sanitized);
    const outputBuffer = Buffer.from(minified, 'utf8');

    const bytesSaved = Math.max(0, inputBuffer.length - outputBuffer.length);
    const percentageSaved = inputBuffer.length > 0
      ? Number(((bytesSaved / inputBuffer.length) * 100).toFixed(1))
      : 0;

    return {
      outputBuffer,
      result: {
        success: true,
        originalSizeBytes: inputBuffer.length,
        optimizedSizeBytes: outputBuffer.length,
        bytesSaved,
        percentageSaved,
        originalFormat: 'svg',
        outputFormat: 'svg',
        width: meta.width,
        height: meta.height,
        processingTimeMs: Date.now() - startTime,
        warnings,
      },
    };
  }

  // Quality determination by mode
  let effectiveQuality = options.quality ?? 80;
  let isLossless = options.mode === 'lossless' || Boolean(options.lossless);

  switch (options.mode) {
    case 'smart':
      if (meta.detectedType === 'photograph') effectiveQuality = 82;
      else if (meta.detectedType === 'screenshot') effectiveQuality = 85;
      else if (meta.detectedType === 'logo_or_icon') effectiveQuality = 90;
      else effectiveQuality = 80;
      break;

    case 'balanced':
      effectiveQuality = 80;
      break;

    case 'max':
      effectiveQuality = 55;
      warnings.push('Maximum compression applied: minor visual artifacts may be visible on high-DPI displays.');
      break;

    case 'lossless':
      isLossless = true;
      effectiveQuality = 100;
      break;

    case 'web':
      effectiveQuality = 78;
      break;

    case 'ecommerce':
      effectiveQuality = 88;
      break;

    case 'social':
      effectiveQuality = 85;
      break;

    case 'transparent':
      effectiveQuality = 82;
      break;

    case 'custom':
      effectiveQuality = options.quality;
      break;

    default:
      effectiveQuality = options.quality || 80;
  }

  let finalOutputBuffer: Buffer;
  let outputInfo: OutputInfo;

  // Target size mode
  if (options.mode === 'target_size' && options.targetSizeKB && options.targetSizeKB > 0) {
    const searchRes = await searchTargetSize(
      inputBuffer,
      targetFormat as ImageFormat,
      options.targetSizeKB,
      options,
      meta.isAnimated,
      meta.hasAlpha
    );
    finalOutputBuffer = searchRes.buffer;
    outputInfo = searchRes.info;

    if (finalOutputBuffer.length > options.targetSizeKB * 1024 * 1.1) {
      warnings.push(
        `Target size of ${options.targetSizeKB} KB could not be achieved without excessive downsampling. Closest achievable size is ${(
          finalOutputBuffer.length / 1024
        ).toFixed(1)} KB.`
      );
    }
  } else {
    const executed = await executeSharpPipeline(
      inputBuffer,
      targetFormat as ImageFormat,
      effectiveQuality,
      options,
      isLossless,
      meta.isAnimated,
      meta.hasAlpha
    );
    finalOutputBuffer = executed.buffer;
    outputInfo = executed.info;
  }

  const bytesSaved = inputBuffer.length - finalOutputBuffer.length;
  const percentageSaved = inputBuffer.length > 0
    ? Number(((bytesSaved / inputBuffer.length) * 100).toFixed(1))
    : 0;

  if (bytesSaved < 0) {
    warnings.push(
      'The optimized file is slightly larger than the original due to format re-encoding. Keeping original format or lowering quality is recommended.'
    );
  }

  return {
    outputBuffer: finalOutputBuffer,
    result: {
      success: true,
      originalSizeBytes: inputBuffer.length,
      optimizedSizeBytes: finalOutputBuffer.length,
      bytesSaved,
      percentageSaved,
      originalFormat: meta.format,
      outputFormat: targetFormat,
      width: outputInfo.width || meta.width,
      height: outputInfo.height || meta.height,
      processingTimeMs: Date.now() - startTime,
      warnings,
    },
  };
}
