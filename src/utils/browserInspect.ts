/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ImageCategory, ImageMetadata } from '../types/compression.js';

/** Maximum edge used when sampling pixels so inspection stays fast on huge images. */
const SAMPLE_MAX_EDGE = 256;

interface ChannelStats {
  stdev: number;
}

/**
 * Classify content type using entropy and color variance thresholds that mirror
 * the previous server-side (libvips) inspector so recommendations stay honest.
 */
function classifyImageType(
  avgStdev: number,
  entropy: number,
  hasAlpha: boolean
): ImageCategory {
  // Alpha + low entropy usually represents an icon, UI element or logo
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

function loadBitmap(file: File): Promise<{
  width: number;
  height: number;
  channels: ChannelStats[];
  hasAlpha: boolean;
}> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Browser failed to decode image'));
    };
    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || 1;
        const naturalHeight = img.naturalHeight || 1;

        // Downscale for pixel sampling while preserving aspect ratio
        const scale = Math.min(1, SAMPLE_MAX_EDGE / Math.max(naturalWidth, naturalHeight));
        const sampleW = Math.max(1, Math.round(naturalWidth * scale));
        const sampleH = Math.max(1, Math.round(naturalHeight * scale));

        const canvas = document.createElement('canvas');
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }
        ctx.clearRect(0, 0, sampleW, sampleH);
        ctx.drawImage(img, 0, 0, sampleW, sampleH);

        const { data } = ctx.getImageData(0, 0, sampleW, sampleH);
        const pixelCount = data.length / 4;

        const sums = [0, 0, 0];
        const sumSquares = [0, 0, 0];
        let hasAlpha = false;

        for (let i = 0; i < data.length; i += 4) {
          for (let c = 0; c < 3; c++) {
            const v = data[i + c];
            sums[c] += v;
            sumSquares[c] += v * v;
          }
          if (data[i + 3] < 255) hasAlpha = true;
        }

        const channels: ChannelStats[] = [];
        for (let c = 0; c < 3; c++) {
          const mean = sums[c] / pixelCount;
          const variance = Math.max(0, sumSquares[c] / pixelCount - mean * mean);
          channels.push({ stdev: Math.sqrt(variance) });
        }

        URL.revokeObjectURL(url);
        resolve({
          width: naturalWidth,
          height: naturalHeight,
          channels,
          hasAlpha,
        });
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.src = url;
  });
}

/**
 * Inspect a File entirely in the browser and return comprehensive metadata + heuristics.
 */
export async function inspectImageInBrowser(file: File): Promise<ImageMetadata> {
  const isSvg =
    file.type === 'image/svg+xml' ||
    file.name.toLowerCase().endsWith('.svg');

  if (isSvg) {
    const text = await file.text();
    const widthMatch = text.match(/width=["'](\d+(?:\.\d+)?)["']/);
    const heightMatch = text.match(/height=["'](\d+(?:\.\d+)?)["']/);

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
      fileSizeBytes: file.size,
      mimeType: 'image/svg+xml',
      detectedType: 'logo_or_icon',
      entropy: 3.5,
      warnings: [],
    };
  }

  const { width, height, channels, hasAlpha } = await loadBitmap(file);

  const avgStdev = channels.reduce((acc, c) => acc + c.stdev, 0) / channels.length;
  const entropy = Number(
    (
      channels.reduce((acc, c) => acc + Math.min(8, Math.log2(1 + c.stdev)), 0) /
      channels.length
    ).toFixed(2)
  );

  const detectedType = classifyImageType(avgStdev, entropy, hasAlpha);

  const warnings: string[] = [];
  if (hasAlpha) {
    warnings.push('Alpha transparency channel present.');
  }

  return {
    format: file.type.replace('image/', '') || 'jpeg',
    width,
    height,
    space: 'srgb',
    channels: hasAlpha ? 4 : 3,
    depth: 'uchar',
    hasAlpha,
    isAnimated: false,
    pageCount: 1,
    hasProfile: false,
    fileSizeBytes: file.size,
    mimeType: file.type || 'image/jpeg',
    detectedType,
    entropy,
    warnings,
  };
}
