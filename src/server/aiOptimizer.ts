/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import {
  AIAnalysisResult,
  CompressionMode,
  ImageCategory,
  ImageFormat,
  ImageMetadata,
} from '../types/compression.js';

/**
 * Deterministic local heuristic optimizer
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

/**
 * Optional Gemini Vision AI Analyzer
 * Invoked only when user explicitly enables AI Deep Inspection
 */
export async function analyzeWithGeminiVision(
  buffer: Buffer,
  meta: ImageMetadata,
  mimeType: string
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Graceful fallback to heuristic analysis
    return analyzeImageHeuristically(meta);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = buffer.toString('base64');

    const prompt = `You are a professional image compression engineer and color scientist.
Analyze this image and return a JSON object with:
{
  "detectedCategory": "photograph" | "screenshot" | "logo_or_icon" | "illustration" | "document_scan" | "general",
  "confidence": number between 0.5 and 1.0,
  "visualComplexity": "low" | "medium" | "high",
  "recommendedFormat": "webp" | "avif" | "jpeg" | "png" | "svg",
  "recommendedMode": "smart" | "balanced" | "max" | "lossless" | "ecommerce" | "web",
  "recommendedQuality": number between 40 and 95,
  "reasons": array of 2-3 concise factual observations explaining why this format and quality was chosen,
  "artifactRisks": array of 1-2 perceptual artifact risks if over-compressed (e.g. banding, ringing around text, chroma subsampling blur)
}
Return valid JSON only, no markdown markers or conversational preamble.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'image/jpeg',
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      detectedCategory: parsed.detectedCategory || meta.detectedType,
      confidence: parsed.confidence || 0.95,
      visualComplexity: parsed.visualComplexity || 'medium',
      recommendedFormat: parsed.recommendedFormat || 'webp',
      recommendedMode: parsed.recommendedMode || 'smart',
      recommendedQuality: parsed.recommendedQuality || 82,
      reasons: parsed.reasons || ['Perceptually optimized with Gemini 2.5 Flash analysis.'],
      artifactRisks: parsed.artifactRisks || ['Standard high-frequency noise risks.'],
      geminiModelUsed: true,
    };
  } catch (err) {
    console.warn('Gemini vision analysis failed or was skipped, falling back to local heuristics:', err);
    return analyzeImageHeuristically(meta);
  }
}
