/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AIAnalysisResult,
  CompressionMode,
  ImageFormat,
  ImageMetadata,
} from '../types/compression.js';

/**
 * Deterministic local heuristic optimizer.
 * Runs entirely on the client (browser) so smart recommendations work offline,
 * and is reused by the server as the Gemini-analysis fallback.
 */
export function analyzeImageHeuristically(meta: ImageMetadata): AIAnalysisResult {
  const reasons: string[] = [];
  const artifactRisks: string[] = [];

  let recommendedFormat: ImageFormat = 'webp';
  let recommendedMode: CompressionMode = 'smart';
  let recommendedQuality = 80;
  let visualComplexity: 'low' | 'medium' | 'high' = 'medium';

  const entropy = meta.entropy ?? 5.0;

  if (entropy > 6.2) {
    visualComplexity = 'high';
  } else if (entropy < 4.2) {
    visualComplexity = 'low';
  }

  // 1. Transparency checks
  if (meta.hasAlpha) {
    reasons.push('Alpha transparency channel detected. Choosing alpha-capable container to avoid black background artifacts.');
    recommendedFormat = 'webp';
    recommendedMode = 'transparent';
  }

  // 2. Animation checks
  if (meta.isAnimated) {
    reasons.push(`Animation with ${meta.pageCount ?? 'multiple'} frames detected. Retaining animated frames in WebP format.`);
    recommendedFormat = 'webp';
    artifactRisks.push('Converting animated image to static format will flatten frames into a single image.');
  }

  // 3. Category-specific tuning
  switch (meta.detectedType) {
    case 'photograph':
      reasons.push('High color variation and texture entropy characteristic of photographic imagery.');
      recommendedFormat = 'webp';
      recommendedQuality = 82;
      recommendedMode = 'balanced';
      artifactRisks.push('Excessive compression may produce visible blockiness in gradients, sky, and shadow details.');
      break;

    case 'screenshot':
      reasons.push('Crisp vector lines, text elements, and discrete UI boundaries detected.');
      recommendedFormat = meta.hasAlpha ? 'png' : 'webp';
      recommendedQuality = 88;
      artifactRisks.push('Lossy chroma subsampling (4:2:0) will blur subpixel text rendering. Recommended 4:4:4 or lossless PNG.');
      break;

    case 'logo_or_icon':
      reasons.push('Flat geometric regions and limited color palette suitable for indexed palette optimization.');
      recommendedFormat = meta.format === 'svg' ? 'svg' : 'png';
      recommendedQuality = 90;
      recommendedMode = 'lossless';
      artifactRisks.push('Lossy JPEG ringing artifacts will severely degrade crisp logo outlines.');
      break;

    case 'document_scan':
      reasons.push('High-contrast monochrome or near-monochrome document text detected.');
      recommendedFormat = 'webp';
      recommendedQuality = 85;
      artifactRisks.push('Heavy compression will cause halos around typography and drop character legibility.');
      break;

    default:
      reasons.push('Balanced web asset profile applied.');
      recommendedFormat = 'webp';
      recommendedQuality = 80;
  }

  // Dimensions & file size check
  if (meta.width > 2500 || meta.height > 2500) {
    reasons.push(`High resolution (${meta.width}x${meta.height}) may benefit from responsive downsampling for web delivery.`);
  }

  return {
    detectedCategory: meta.detectedType,
    confidence: 0.92,
    visualComplexity,
    recommendedFormat,
    recommendedMode,
    recommendedQuality,
    reasons,
    artifactRisks,
    geminiModelUsed: false,
  };
}
