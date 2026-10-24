/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { sniffFormat } from '../src/server/formatRegistry.js';
import { checkDimensionSafety } from '../src/server/securityValidator.js';
import { sanitizeSvg, minifySvgText } from '../src/utils/svg.js';
import { analyzeImageHeuristically } from '../src/utils/imageHeuristics.js';

describe('Format Registry & Sniffing', () => {
  it('correctly sniffs PNG header bytes', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const sniffed = sniffFormat(pngBuffer);
    expect(sniffed?.format).toBe('png');
    expect(sniffed?.mimeType).toBe('image/png');
  });

  it('correctly sniffs JPEG header bytes', () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const sniffed = sniffFormat(jpegBuffer);
    expect(sniffed?.format).toBe('jpeg');
    expect(sniffed?.mimeType).toBe('image/jpeg');
  });

  it('correctly sniffs WebP header bytes', () => {
    const webpBuffer = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    const sniffed = sniffFormat(webpBuffer);
    expect(sniffed?.format).toBe('webp');
    expect(sniffed?.mimeType).toBe('image/webp');
  });
});

describe('SVG Utilities', () => {
  it('sanitizes malicious script tags and inline events from SVG', () => {
    const dirtySvg = `<svg xmlns="http://www.w3.org/2000/svg">
      <script>alert("xss")</script>
      <circle cx="10" cy="10" r="5" onload="doEvil()" />
      <a href="javascript:attack()">link</a>
      <foreignObject><iframe src="evil.com"></iframe></foreignObject>
    </svg>`;

    const cleaned = sanitizeSvg(dirtySvg);
    expect(cleaned).not.toContain('<script');
    expect(cleaned).not.toContain('alert');
    expect(cleaned).not.toContain('onload=');
    expect(cleaned).not.toContain('javascript:');
    expect(cleaned).not.toContain('<foreignObject');
  });

  it('minifies SVG text without breaking structure', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <!-- comment should be stripped -->
      <rect width="100" height="100" fill="#10B981" />
    </svg>`;

    const minified = minifySvgText(svg);
    expect(minified).not.toContain('<!-- comment');
    expect(minified).toContain('<rect');
    expect(minified).not.toContain('\n');
  });
});

describe('Security Validator', () => {
  it('rejects image dimensions that trigger decompression bomb limits', () => {
    const dimensionBomb = checkDimensionSafety(20000, 1000); // Exceeds 16384px dimension
    expect(dimensionBomb.safe).toBe(false);
    expect(dimensionBomb.error).toContain('safety boundary');

    const pixelBomb = checkDimensionSafety(12000, 12000); // 144 MP > 100 MP limit
    expect(pixelBomb.safe).toBe(false);
    expect(pixelBomb.error).toContain('decompression limit');
  });

  it('accepts safe image dimensions', () => {
    const safe = checkDimensionSafety(1920, 1080);
    expect(safe.safe).toBe(true);
  });
});

describe('AI Heuristic Inspection', () => {
  it('identifies alpha transparency and assigns appropriate strategy', () => {
    const mockMeta = {
      format: 'png',
      width: 500,
      height: 500,
      space: 'srgb',
      channels: 4,
      hasAlpha: true,
      isAnimated: false,
      hasProfile: false,
      fileSizeBytes: 120000,
      mimeType: 'image/png',
      detectedType: 'logo_or_icon' as const,
      entropy: 3.8,
    };

    const analysis = analyzeImageHeuristically(mockMeta);
    expect(analysis.recommendedFormat).toBe('png');
    expect(analysis.visualComplexity).toBe('low');
    expect(analysis.reasons.some((r) => r.includes('Alpha transparency'))).toBe(true);
  });
});
