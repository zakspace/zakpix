/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sniffFormat } from './formatRegistry.js';
import { sanitizeSvg } from '../utils/svg.js';

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_IMAGE_PIXELS = 100_000_000; // 100 Megapixels
export const MAX_DIMENSION_PX = 16_384; // 16k width or height limit

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedBuffer?: Buffer;
  sniffedFormat?: string;
}

// Sanitization logic lives in the shared util so the browser and server stay in sync.
export { sanitizeSvg };

/**
 * Validate incoming image buffer for security risks, decompression bombs, and format spoofing
 */
export function validateImageBuffer(
  buffer: Buffer,
  declaredMimeType?: string
): ValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Empty file buffer received.' };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(buffer.length / 1024 / 1024).toFixed(1)} MB) exceeds the maximum allowed limit of 50 MB.`,
    };
  }

  const sniffed = sniffFormat(buffer);
  if (!sniffed) {
    return {
      valid: false,
      error: 'Unrecognized image format or corrupt file signature.',
    };
  }

  // Handle SVG specifically
  if (sniffed.format === 'svg') {
    const rawSvg = buffer.toString('utf8');
    const sanitized = sanitizeSvg(rawSvg);
    return {
      valid: true,
      sniffedFormat: 'svg',
      sanitizedBuffer: Buffer.from(sanitized, 'utf8'),
    };
  }

  return {
    valid: true,
    sniffedFormat: sniffed.format,
    sanitizedBuffer: buffer,
  };
}

/**
 * Check dimensions after Sharp metadata inspection to protect against decompression bombs
 */
export function checkDimensionSafety(width?: number, height?: number): { safe: boolean; error?: string } {
  if (!width || !height) return { safe: true };

  if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
    return {
      safe: false,
      error: `Image dimensions (${width}x${height}) exceed the safety boundary of ${MAX_DIMENSION_PX}px.`,
    };
  }

  const totalPixels = width * height;
  if (totalPixels > MAX_IMAGE_PIXELS) {
    return {
      safe: false,
      error: `Total pixel count (${(totalPixels / 1_000_000).toFixed(1)} MP) exceeds the decompression limit of 100 MP.`,
    };
  }

  return { safe: true };
}
