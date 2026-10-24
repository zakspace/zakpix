/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AIAnalysisResult,
  CodecCapability,
  CompressionOptions,
  CompressionResult,
  ImageMetadata,
} from '../types/compression.js';

export async function fetchActiveCodecs(): Promise<{
  sharpVersion: string;
  vipsVersion: string;
  codecs: CodecCapability[];
}> {
  const res = await fetch('/api/codecs');
  if (!res.ok) {
    throw new Error(`Failed to fetch codecs: ${res.statusText}`);
  }
  return res.json();
}

export async function inspectFileOnServer(file: File): Promise<{
  metadata: ImageMetadata;
  aiAnalysis: AIAnalysisResult;
}> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/inspect', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Inspection failed on server');
  }

  return res.json();
}

export async function compressFileOnServer(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('options', JSON.stringify(options));

  const res = await fetch('/api/compress', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Compression failed on server');
  }

  return res.json();
}

export async function requestDeepAiAnalysis(
  file: File,
  useGemini = false
): Promise<{ analysis: AIAnalysisResult; metadata: ImageMetadata }> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('useGemini', String(useGemini));

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
  zipName = 'optisqueeze-batch.zip'
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
