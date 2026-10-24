/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIAnalysisResult, ImageMetadata } from '../types/compression.js';

/**
 * Image compression and inspection run entirely in the browser (Canvas API).
 * The server only powers optional deep Gemini AI analysis and ZIP bundling.
 */
export async function requestDeepAiAnalysis(
  file: File,
  useGemini: boolean,
  metadata?: ImageMetadata
): Promise<{ analysis: AIAnalysisResult; metadata?: ImageMetadata }> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('useGemini', String(useGemini));
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const res = await fetch('/api/ai-analyze', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'AI analysis failed');
  }

  return res.json();
}

export async function downloadZipBundle(
  items: Array<{ name: string; dataUrl: string }>,
  zipName = 'zakpix-optimized-images.zip'
): Promise<void> {
  const res = await fetch('/api/create-zip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, zipName }),
  });

  if (!res.ok) {
    throw new Error('Failed to create ZIP bundle');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
