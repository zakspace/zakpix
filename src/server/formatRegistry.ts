/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodecCapability } from '../types/compression.js';

// Base capabilities dictionary
export const STANDARD_CODECS: Record<string, Omit<CodecCapability, 'input' | 'output'>> = {
  jpeg: {
    format: 'jpeg',
    name: 'JPEG / JPG / JFIF',
    extensions: ['jpg', 'jpeg', 'jfif', 'pjpeg'],
    mimeType: 'image/jpeg',
    losslessSupport: false,
    transparencySupport: false,
    animationSupport: false,
    multiPageSupport: false,
    metadataSupport: true,
    notes: 'Universal compatibility. Lossy compression only, no alpha channel.',
  },
  png: {
    format: 'png',
    name: 'PNG (Portable Network Graphics)',
    extensions: ['png'],
    mimeType: 'image/png',
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: false,
    multiPageSupport: false,
    metadataSupport: true,
    notes: 'Deflate-based lossless compression. Full 8-bit alpha transparency.',
  },
  webp: {
    format: 'webp',
    name: 'WebP',
    extensions: ['webp'],
    mimeType: 'image/webp',
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: true,
    multiPageSupport: false,
    metadataSupport: true,
    notes: 'Modern web standard. Supports both lossy and lossless with alpha channel.',
  },
  avif: {
    format: 'avif',
    name: 'AVIF (AV1 Image File Format)',
    extensions: ['avif'],
    mimeType: 'image/avif',
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: true,
    multiPageSupport: false,
    metadataSupport: true,
    notes: 'State-of-the-art compression efficiency. Excellent at low bitrates.',
  },
  gif: {
    format: 'gif',
    name: 'GIF (Graphics Interchange Format)',
    extensions: ['gif'],
    mimeType: 'image/gif',
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: true,
    multiPageSupport: false,
    metadataSupport: false,
    notes: '256-color palette. Universal animation support.',
  },
  svg: {
    format: 'svg',
    name: 'SVG (Scalable Vector Graphics)',
    extensions: ['svg'],
    mimeType: 'image/svg+xml',
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: true,
    multiPageSupport: false,
    metadataSupport: true,
    notes: 'XML-based vector format. Scalable to any resolution without loss.',
  },
  tiff: {
    format: 'tiff',
    name: 'TIFF (Tagged Image File Format)',
    extensions: ['tif', 'tiff'],
    mimeType: 'image/tiff',
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: false,
    multiPageSupport: true,
    metadataSupport: true,
    notes: 'Professional archival format with high bit-depth and multi-page support.',
  },
  bmp: {
    format: 'bmp',
    name: 'BMP (Bitmap)',
    extensions: ['bmp'],
    mimeType: 'image/bmp',
    losslessSupport: true,
    transparencySupport: false,
    animationSupport: false,
    multiPageSupport: false,
    metadataSupport: false,
    notes: 'Uncompressed raster bitmap. Supported for conversion to modern formats.',
  },
  heif: {
    format: 'heif',
    name: 'HEIF / HEIC',
    extensions: ['heic', 'heif'],
    mimeType: 'image/heif',
    losslessSupport: false,
    transparencySupport: true,
    animationSupport: false,
    multiPageSupport: true,
    metadataSupport: true,
    notes: 'High Efficiency Image Container. Dependent on libheif codec.',
  },
};

/**
 * Sniff file format from magic bytes (file signature)
 */
export function sniffFormat(buffer: Buffer): { format: string; mimeType: string } | null {
  if (buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { format: 'jpeg', mimeType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { format: 'png', mimeType: 'image/png' };
  }

  // GIF: 47 49 46 38 ('GIF87a' or 'GIF89a')
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { format: 'gif', mimeType: 'image/gif' };
  }

  // WebP: RIFF ... WEBP (starts with RIFF at 0, WEBP at 8)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { format: 'webp', mimeType: 'image/webp' };
  }

  // BMP: 42 4D ('BM')
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return { format: 'bmp', mimeType: 'image/bmp' };
  }

  // TIFF: 49 49 2A 00 (little-endian) or 4D 4D 00 2A (big-endian)
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
    (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a)
  ) {
    return { format: 'tiff', mimeType: 'image/tiff' };
  }

  // AVIF / HEIF: 'ftypavif', 'ftypmif1', 'ftypmsf1', 'ftypheic'
  if (buffer.length >= 12) {
    const ftyp = buffer.toString('ascii', 4, 8);
    if (ftyp === 'ftyp') {
      const brand = buffer.toString('ascii', 8, 12);
      if (brand.includes('avif') || brand.includes('avis')) {
        return { format: 'avif', mimeType: 'image/avif' };
      }
      if (brand.includes('heic') || brand.includes('mif1') || brand.includes('heif')) {
        return { format: 'heif', mimeType: 'image/heif' };
      }
    }
  }

  // SVG: Inspect text snippet for <svg or <?xml ... <svg
  const snippet = buffer.subarray(0, Math.min(buffer.length, 512)).toString('utf8').trim();
  if (snippet.startsWith('<svg') || (snippet.startsWith('<?xml') && snippet.includes('<svg'))) {
    return { format: 'svg', mimeType: 'image/svg+xml' };
  }

  return null;
}
