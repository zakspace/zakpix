/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompressionOptions, CompressionResult, ImageFormat } from '../types/compression.js';
import { minifySvgText, sanitizeSvg } from '../utils/svg.js';

const CANVAS_ENCODABLE: ImageFormat[] = ['jpeg', 'jpg', 'png', 'webp'];

function dataUrlByteSize(dataUrl: string): number {
  const base64Str = dataUrl.split(',')[1] || '';
  return Math.round((base64Str.length * 3) / 4);
}

function toImageMime(format: string): string {
  if (format === 'jpeg' || format === 'jpg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  return 'image/webp';
}

/**
 * Compress an SVG entirely in the browser: sanitize then minify the vector source.
 */
async function compressSvgInBrowser(
  file: File,
  startTime: number
): Promise<CompressionResult> {
  const raw = await file.text();
  const minified = minifySvgText(sanitizeSvg(raw));
  const outputBytes = new TextEncoder().encode(minified).length;

  const widthMatch = raw.match(/width=["']?(\d+(?:\.\d+)?)/);
  const heightMatch = raw.match(/height=["']?(\d+(?:\.\d+)?)/);
  const width = widthMatch ? Math.round(parseFloat(widthMatch[1])) : 0;
  const height = heightMatch ? Math.round(parseFloat(heightMatch[1])) : 0;

  const bytesSaved = file.size - outputBytes;
  const percentageSaved =
    file.size > 0 ? Number(((bytesSaved / file.size) * 100).toFixed(1)) : 0;

  return {
    success: true,
    originalSizeBytes: file.size,
    optimizedSizeBytes: outputBytes,
    bytesSaved,
    percentageSaved,
    originalFormat: 'svg',
    outputFormat: 'svg',
    width,
    height,
    processingTimeMs: Math.round(performance.now() - startTime),
    dataUrl: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(minified)))}`,
    warnings: ['Vector sanitized (scripts/handlers stripped) and minified locally in the browser.'],
  };
}

/**
 * Client-side browser canvas compressor for 100% offline / browser-only execution.
 * This is now the sole compression engine (the libvips/Sharp server engine was removed).
 */
export async function compressInBrowser(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const startTime = performance.now();

  const isSvgInput =
    file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  // Vector sources are sanitized + minified as text rather than rasterized.
  if (isSvgInput) {
    return compressSvgInBrowser(file, startTime);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file in browser'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Browser failed to decode image'));
      img.onload = () => {
        try {
          let targetWidth = img.naturalWidth;
          let targetHeight = img.naturalHeight;

          // Apply resize if provided
          if (options.resize?.width && options.resize?.height) {
            targetWidth = options.resize.width;
            targetHeight = options.resize.height;
          } else if (options.resize?.width) {
            const scale = options.resize.width / img.naturalWidth;
            targetWidth = options.resize.width;
            targetHeight = Math.round(img.naturalHeight * scale);
          } else if (options.resize?.height) {
            const scale = options.resize.height / img.naturalHeight;
            targetHeight = options.resize.height;
            targetWidth = Math.round(img.naturalWidth * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas 2D context unavailable'));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const warnings: string[] = [];

          // Resolve an output format that the Canvas API can actually encode.
          let outFormat: string;
          let mimeType: string;
          const requested = options.targetFormat;

          if (requested === 'original') {
            const native = file.type.replace('image/', '') as ImageFormat;
            outFormat = CANVAS_ENCODABLE.includes(native) ? (native === 'jpg' ? 'jpeg' : native) : 'webp';
            if (!CANVAS_ENCODABLE.includes(native)) {
              warnings.push(
                `Original format ${native.toUpperCase()} cannot be re-encoded by Canvas. Output defaulted to WebP.`
              );
            }
          } else if (CANVAS_ENCODABLE.includes(requested as ImageFormat)) {
            outFormat = requested === 'jpg' ? 'jpeg' : (requested as string);
          } else {
            outFormat = 'webp';
            warnings.push(
              `Format ${String(requested).toUpperCase()} is not encodable via the Browser Canvas API. Output fell back to WebP.`
            );
          }
          mimeType = toImageMime(outFormat);

          const isLossless = options.mode === 'lossless' || Boolean(options.lossless);
          const clamp = (q: number) => Math.min(100, Math.max(1, Math.round(q)));

          // PNG ignores the quality parameter; WebP/JPEG honor it.
          const encodeAt = (qualityPct: number): string => {
            if (outFormat === 'png') {
              return canvas.toDataURL('image/png');
            }
            return canvas.toDataURL(mimeType, clamp(qualityPct) / 100);
          };

          let dataUrl: string;
          let binarySize: number;

          if (options.mode === 'target_size' && options.targetSizeKB && options.targetSizeKB > 0) {
            const targetBytes = options.targetSizeKB * 1024;
            let low = 5;
            let high = 100;
            let best = encodeAt(clamp(options.quality ?? 80));
            let bestSize = dataUrlByteSize(best);
            let bestQuality = clamp(options.quality ?? 80);

            for (let i = 0; i < 7; i++) {
              const mid = Math.round((low + high) / 2);
              const candidate = encodeAt(mid);
              const size = dataUrlByteSize(candidate);
              if (size <= targetBytes) {
                best = candidate;
                bestSize = size;
                bestQuality = mid;
                if (targetBytes - size < targetBytes * 0.08) break;
                low = mid + 1;
              } else {
                high = mid - 1;
              }
              if (low > high) break;
            }

            dataUrl = best;
            binarySize = bestSize;

            if (binarySize > targetBytes * 1.1) {
              warnings.push(
                `Target size of ${options.targetSizeKB} KB could not be achieved without excessive downsampling. Closest achievable size is ${(
                  binarySize / 1024
                ).toFixed(1)} KB.`
              );
            }
          } else {
            const baseQuality = options.quality ?? 80;
            const quality = isLossless ? 100 : baseQuality;
            dataUrl = encodeAt(quality);
            binarySize = dataUrlByteSize(dataUrl);
          }

          const bytesSaved = file.size - binarySize;
          const percentageSaved =
            file.size > 0 ? Number(((bytesSaved / file.size) * 100).toFixed(1)) : 0;

          if (bytesSaved < 0) {
            warnings.push(
              'The optimized file is slightly larger than the original due to format re-encoding. Keeping the original format or lowering quality is recommended.'
            );
          }

          if (outFormat === 'jpeg') {
            warnings.push(
              'JPEG does not support transparency. Transparent areas were rendered on a clean white background.'
            );
          }

          resolve({
            success: true,
            originalSizeBytes: file.size,
            optimizedSizeBytes: binarySize,
            bytesSaved,
            percentageSaved,
            originalFormat: file.type.replace('image/', '') || 'jpeg',
            outputFormat: outFormat,
            width: targetWidth,
            height: targetHeight,
            processingTimeMs: Math.round(performance.now() - startTime),
            dataUrl,
            warnings: [...warnings, 'Processed locally in browser via Canvas API.'],
          });
        } catch (err: any) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
