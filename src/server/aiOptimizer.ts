/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import {
  AIAnalysisResult,
  ImageMetadata,
} from '../types/compression.js';
import { analyzeImageHeuristically } from '../utils/imageHeuristics.js';

// Re-export the shared heuristic analyzer so the server Gemini fallback and the
// browser both rely on a single implementation.
export { analyzeImageHeuristically };

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
