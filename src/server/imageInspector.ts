/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import sharp, { Stats, Metadata, ChannelStats } from 'sharp';
import { ImageCategory, ImageMetadata } from '../types/compression.js';
import { checkDimensionSafety } from './securityValidator.js';
import { sniffFormat } from './formatRegistry.js';

/**
 * Calculate approximate image entropy (measure of information density/randomness)
 * Higher entropy indicates photographic content or complex texture;
 * Lower entropy indicates logos, flat graphics, charts, or document scans.
 */
function calculateEntropyFromStats(stats: Stats): number {
  let totalEntropy = 0;
  for (const channel of stats.channels) {
    const rawEntropy = (channel as any).entropy;
    const channelEntropy = typeof rawEntropy === 'number'
      ? rawEntropy
      : Math.min(8, Math.log2(1 + channel.stdev));
    totalEntropy += channelEntropy;
  }
  return Number((totalEntropy / stats.channels.length).toFixed(2));
}

/**
 * Categorize image using entropy, color variance, dimensions, and alpha channel
 */
function classifyImageType(
  stats: Stats | null,
  meta: Metadata,
  hasAlpha: boolean
): ImageCategory {
  if (meta.format === 'svg') {
    return 'logo_or_icon';
  }

  if (!stats) return 'general';

  const avgStdev =
    stats.channels.reduce((acc: number, c: ChannelStats) => acc + c.stdev, 0) / stats.channels.length;
  const entropy = calculateEntropyFromStats(stats);

  // If there is alpha and low entropy, likely an icon, UI element or logo
  if (hasAlpha && entropy < 5.0) {
    return 'logo_or_icon';
  }

  // Low entropy & low stdev usually represents document scans or simple flat screenshots
  if (entropy < 4.2 && avgStdev < 30) {
    return 'document_scan';
  }

  // Moderate entropy with crisp color bounds usually indicates UI screenshots or illustrations
  if (entropy >= 4.0 && entropy < 6.2 && avgStdev < 60) {
    return 'screenshot';
  }

  // Illustrations often have clear colors, medium entropy
  if (entropy >= 4.5 && entropy < 6.8 && hasAlpha) {
    return 'illustration';
  }

  // High entropy + high color standard deviation indicates real-world photographs or rich textures
  if (entropy >= 5.8 || avgStdev >= 60) {
    return 'photograph';
  }

  return 'general';
}

/**
 * Inspect image buffer and return comprehensive metadata and heuristics
 */
export async function inspectImageBuffer(buffer: Buffer): Promise<ImageMetadata> {
  const sniffed = sniffFormat(buffer);
  const detectedFormat = sniffed?.format || 'unknown';

  if (detectedFormat === 'svg') {
    const text = buffer.toString('utf8');
    const widthMatch = text.match(/width=["'](\d+(?:\.\d+)?)["']/);
    const heightMatch = text.match(/height=["'](\d+(?:\.\d+)?)["']/);
    const viewBoxMatch = text.match(/viewBox=["'][\d\.\s,-]+["']/);

    const width = widthMatch ? parseFloat(widthMatch[1]) : 800;
    const height = heightMatch ? parseFloat(heightMatch[1]) : 600;

    return {
      format: 'svg',
      width: Math.round(width),
      height: Math.round(height),
      space: 'srgb',
      channels: 4,
      depth: 'vector',
      density: 72,
      hasAlpha: true,
      isAnimated: text.includes('<animate') || text.includes('<animateTransform'),
      pageCount: 1,
      hasProfile: false,
      fileSizeBytes: buffer.length,
      mimeType: 'image/svg+xml',
      detectedType: 'logo_or_icon',
      entropy: 3.5,
      warnings: [],
    };
  }

  const sharpInstance = sharp(buffer, { failOn: 'none', animated: true });
  const meta = await sharpInstance.metadata();

  const dimensionCheck = checkDimensionSafety(meta.width, meta.height);
  if (!dimensionCheck.safe) {
    throw new Error(dimensionCheck.error);
  }

  // Retrieve channel stats for entropy and type classification
  let stats: Stats | null = null;
  try {
    stats = await sharp(buffer).stats();
  } catch (err) {
    // Stats calculation may fail for certain rare formats, ignore gracefully
  }

  const hasAlpha = Boolean(meta.hasAlpha || meta.channels === 4 || meta.channels === 2);
  const isAnimated = Boolean((meta.pages && meta.pages > 1) || (meta.pageHeight && meta.pageHeight > 0));
  const detectedType = classifyImageType(stats, meta, hasAlpha);
  const entropy = stats ? calculateEntropyFromStats(stats) : 5.0;

  const warnings: string[] = [];
  if (meta.orientation && meta.orientation > 1) {
    warnings.push(`EXIF orientation tag ${meta.orientation} detected; auto-rotation will be applied.`);
  }
  if (meta.icc) {
    warnings.push('Embedded ICC color profile detected.');
  }
  if (isAnimated) {
    warnings.push(`Multi-frame animated image detected (${meta.pages || 'multiple'} frames).`);
  }
  if (hasAlpha) {
    warnings.push('Alpha transparency channel present.');
  }

  return {
    format: meta.format || detectedFormat,
    width: meta.width || 0,
    height: meta.pageHeight || meta.height || 0,
    space: meta.space || 'srgb',
    channels: meta.channels || 3,
    depth: meta.depth || 'uchar',
    density: meta.density,
    hasAlpha,
    isAnimated,
    pageCount: meta.pages || 1,
    hasProfile: Boolean(meta.icc),
    orientation: meta.orientation,
    fileSizeBytes: buffer.length,
    mimeType: sniffed?.mimeType || `image/${meta.format || 'octet-stream'}`,
    detectedType,
    entropy,
    warnings,
  };
}
