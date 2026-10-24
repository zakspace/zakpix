/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompressionOptions, CompressionResult } from '../types/compression.js';

/**
 * Client-side browser canvas compressor for 100% offline / browser-only execution
 */
export async function compressInBrowser(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file in browser'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Browser failed to decode image'));
      img.onload = () => {
        try {
          let targetWidth = img.naturalWidth;
          let targetHeight = img.naturalHeight;

          // Apply resize if provided
          if (options.resize?.width && options.resize?.height) {
            targetWidth = options.resize.width;
            targetHeight = options.resize.height;
          } else if (options.resize?.width) {
            const scale = options.resize.width / img.naturalWidth;
            targetWidth = options.resize.width;
            targetHeight = Math.round(img.naturalHeight * scale);
          } else if (options.resize?.height) {
            const scale = options.resize.height / img.naturalHeight;
            targetHeight = options.resize.height;
            targetWidth = Math.round(img.naturalWidth * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas 2D context unavailable'));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          let mimeType = 'image/webp';
          let outFormat = 'webp';

          if (options.targetFormat === 'png') {
            mimeType = 'image/png';
            outFormat = 'png';
          } else if (options.targetFormat === 'jpeg' || options.targetFormat === 'jpg') {
            mimeType = 'image/jpeg';
            outFormat = 'jpeg';
          }

          const quality = (options.quality ?? 80) / 100;
          const dataUrl = canvas.toDataURL(mimeType, quality);

          // Calculate size from base64
          const base64Str = dataUrl.split(',')[1] || '';
          const binarySize = Math.round((base64Str.length * 3) / 4);

          const bytesSaved = file.size - binarySize;
          const percentageSaved = file.size > 0
            ? Number(((bytesSaved / file.size) * 100).toFixed(1))
            : 0;

          resolve({
            success: true,
            originalSizeBytes: file.size,
            optimizedSizeBytes: binarySize,
            bytesSaved,
            percentageSaved,
            originalFormat: file.type.replace('image/', ''),
            outputFormat: outFormat,
            width: targetWidth,
            height: targetHeight,
            processingTimeMs: Math.round(performance.now() - startTime),
            dataUrl,
            warnings: ['Processed locally in browser via Canvas API.'],
          });
        } catch (err: any) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
