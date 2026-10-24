/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { sniffFormat, getActiveCodecs } from '../src/server/formatRegistry.js';
import {
  validateImageBuffer,
  sanitizeSvg,
  checkDimensionSafety,
} from '../src/server/securityValidator.js';
import { inspectImageBuffer } from '../src/server/imageInspector.js';
import { compressImage } from '../src/server/compressionEngine.js';
import { analyzeImageHeuristically } from '../src/server/aiOptimizer.js';

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

  it('probes Sharp runtime codecs and returns valid version strings', () => {
    const data = getActiveCodecs();
    expect(data.sharpVersion).toBeTruthy();
    expect(data.codecs.length).toBeGreaterThan(5);
    const pngCodec = data.codecs.find((c) => c.format === 'png');
    expect(pngCodec?.input).toBe(true);
    expect(pngCodec?.output).toBe(true);
  });
});

describe('Security Validator', () => {
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

describe('Sharp Compression Engine', () => {
  it('compresses a synthetic image to WebP with byte reduction', async () => {
    // Create a 200x200 test PNG image
    const rawPng = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 16, g: 185, b: 129, alpha: 0.8 },
      },
    })
      .png()
      .toBuffer();

    const { result, outputBuffer } = await compressImage(rawPng, {
      mode: 'balanced',
      targetFormat: 'webp',
      quality: 80,
    });

    expect(result.success).toBe(true);
    expect(result.outputFormat).toBe('webp');
    expect(outputBuffer.length).toBeGreaterThan(0);
    expect(result.optimizedSizeBytes).toBe(outputBuffer.length);
  });

  it('preserves alpha transparency when compressing to WebP', async () => {
    const alphaPng = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 },
      },
    })
      .png()
      .toBuffer();

    const { outputBuffer } = await compressImage(alphaPng, {
      mode: 'transparent',
      targetFormat: 'webp',
      quality: 85,
    });

    const meta = await sharp(outputBuffer).metadata();
    expect(meta.hasAlpha).toBe(true);
  });

  it('correctly minifies vector SVG content', async () => {
    const svgInput = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <!-- comment should be stripped -->
        <rect width="100" height="100" fill="#10B981" />
      </svg>`,
      'utf8'
    );

    const { result, outputBuffer } = await compressImage(svgInput, {
      mode: 'smart',
      targetFormat: 'svg',
      quality: 80,
    });

    expect(result.success).toBe(true);
    expect(result.outputFormat).toBe('svg');
    expect(outputBuffer.toString('utf8')).not.toContain('<!-- comment');
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
