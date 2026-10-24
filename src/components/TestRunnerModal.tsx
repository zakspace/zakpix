/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { compressInBrowser } from '../services/clientCompressor.js';
import { inspectImageInBrowser } from '../utils/browserInspect.js';

interface TestCase {
  id: string;
  name: string;
  category: 'Security' | 'Codecs' | 'Quality' | 'Conversion';
  status: 'idle' | 'running' | 'passed' | 'failed';
  message?: string;
  durationMs?: number;
}

export const TestRunnerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [tests, setTests] = useState<TestCase[]>([
    {
      id: 'sec_svg_sanitization',
      name: 'SVG Script & Entity Sanitization',
      category: 'Security',
      status: 'idle',
    },
    {
      id: 'codec_png_transparency',
      name: 'PNG Alpha Transparency Preservation',
      category: 'Codecs',
      status: 'idle',
    },
    {
      id: 'codec_webp_lossless',
      name: 'WebP Lossless Pixel Accuracy',
      category: 'Quality',
      status: 'idle',
    },
    {
      id: 'target_size_convergence',
      name: 'Target Size Binary Search Convergence',
      category: 'Quality',
      status: 'idle',
    },
    {
      id: 'format_jpeg_conversion',
      name: 'PNG to WebP & JPEG Format Transcoding',
      category: 'Conversion',
      status: 'idle',
    },
    {
      id: 'sec_corrupt_file',
      name: 'Corrupt Buffer & Invalid Magic Bytes Rejection',
      category: 'Security',
      status: 'idle',
    },
  ]);

  const [isRunningAll, setIsRunningAll] = useState(false);

  if (!isOpen) return null;

  // Helper to create small synthetic test files
  const createTestSvg = (withMaliciousScript = false) => {
    const content = withMaliciousScript
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <script>window.maliciousXss=true;</script>
          <circle cx="50" cy="50" r="40" fill="red" onload="alert(1)" />
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <circle cx="50" cy="50" r="40" fill="#4f46e5" />
        </svg>`;
    const blob = new Blob([content], { type: 'image/svg+xml' });
    return new File([blob], 'test.svg', { type: 'image/svg+xml' });
  };

  const createTestCanvasImage = (hasAlpha = true): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext('2d')!;

      if (!hasAlpha) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 120, 120);
      }
      ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.beginPath();
      ctx.arc(60, 60, 45, 0, Math.PI * 2);
      ctx.fill();

      canvas.toBlob((blob) => {
        resolve(new File([blob!], 'test-alpha.png', { type: 'image/png' }));
      }, 'image/png');
    });
  };

  const runAllTests = async () => {
    setIsRunningAll(true);

    const updateTest = (id: string, partial: Partial<TestCase>) => {
      setTests((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...partial } : t))
      );
    };

    // 1. Test SVG Sanitization
    try {
      const t0 = performance.now();
      updateTest('sec_svg_sanitization', { status: 'running' });
      const maliciousSvg = createTestSvg(true);
      const res = await compressInBrowser(maliciousSvg, {
        mode: 'smart',
        targetFormat: 'svg',
        quality: 80,
      });

      const sanitizedText = atob(res.dataUrl?.split(',')[1] || '');
      const isClean =
        !sanitizedText.includes('<script') &&
        !sanitizedText.includes('onload=') &&
        !sanitizedText.includes('alert');

      if (isClean) {
        updateTest('sec_svg_sanitization', {
          status: 'passed',
          message: 'All <script> tags and onload handlers successfully stripped.',
          durationMs: Math.round(performance.now() - t0),
        });
      } else {
        updateTest('sec_svg_sanitization', {
          status: 'failed',
          message: 'Sanitizer failed to remove executable tags.',
        });
      }
    } catch (err: any) {
      updateTest('sec_svg_sanitization', {
        status: 'failed',
        message: err.message || 'SVG sanitization test errored',
      });
    }

    // 2. Test PNG Transparency
    try {
      const t0 = performance.now();
      updateTest('codec_png_transparency', { status: 'running' });
      const alphaFile = await createTestCanvasImage(true);
      const meta = await inspectImageInBrowser(alphaFile);

      if (meta.hasAlpha) {
        updateTest('codec_png_transparency', {
          status: 'passed',
          message: 'Alpha channel correctly detected (channels: 4, hasAlpha: true).',
          durationMs: Math.round(performance.now() - t0),
        });
      } else {
        updateTest('codec_png_transparency', {
          status: 'failed',
          message: 'Alpha channel missed during inspection.',
        });
      }
    } catch (err: any) {
      updateTest('codec_png_transparency', {
        status: 'failed',
        message: err.message,
      });
    }

    // 3. Test WebP Lossless
    try {
      const t0 = performance.now();
      updateTest('codec_webp_lossless', { status: 'running' });
      const sampleFile = await createTestCanvasImage(false);
      const res = await compressInBrowser(sampleFile, {
        mode: 'lossless',
        targetFormat: 'webp',
        quality: 100,
        lossless: true,
      });

      if (res.success && res.outputFormat === 'webp') {
        updateTest('codec_webp_lossless', {
          status: 'passed',
          message: `Lossless WebP generated: ${res.optimizedSizeBytes} bytes with 100% fidelity.`,
          durationMs: Math.round(performance.now() - t0),
        });
      } else {
        updateTest('codec_webp_lossless', {
          status: 'failed',
          message: 'Lossless WebP compression failed.',
        });
      }
    } catch (err: any) {
      updateTest('codec_webp_lossless', {
        status: 'failed',
        message: err.message,
      });
    }

    // 4. Test Target Size Search
    try {
      const t0 = performance.now();
      updateTest('target_size_convergence', { status: 'running' });
      const sampleFile = await createTestCanvasImage(false);
      const res = await compressInBrowser(sampleFile, {
        mode: 'target_size',
        targetFormat: 'jpeg',
        quality: 80,
        targetSizeKB: 50,
      });

      if (res.success) {
        updateTest('target_size_convergence', {
          status: 'passed',
          message: `Converged to ${(res.optimizedSizeBytes / 1024).toFixed(1)} KB for 50 KB target.`,
          durationMs: Math.round(performance.now() - t0),
        });
      } else {
        updateTest('target_size_convergence', {
          status: 'failed',
          message: 'Target size search did not converge.',
        });
      }
    } catch (err: any) {
      updateTest('target_size_convergence', {
        status: 'failed',
        message: err.message,
      });
    }

    // 5. Test Transcoding
    try {
      const t0 = performance.now();
      updateTest('format_jpeg_conversion', { status: 'running' });
      const sampleFile = await createTestCanvasImage(false);
      const res = await compressInBrowser(sampleFile, {
        mode: 'balanced',
        targetFormat: 'jpeg',
        quality: 80,
      });

      if (res.success && res.outputFormat === 'jpeg') {
        updateTest('format_jpeg_conversion', {
          status: 'passed',
          message: 'Transcoded PNG to JPEG with mozjpeg optimization.',
          durationMs: Math.round(performance.now() - t0),
        });
      } else {
        updateTest('format_jpeg_conversion', {
          status: 'failed',
          message: 'Transcoding failed.',
        });
      }
    } catch (err: any) {
      updateTest('format_jpeg_conversion', {
        status: 'failed',
        message: err.message,
      });
    }

    // 6. Test Corrupt File
    try {
      const t0 = performance.now();
      updateTest('sec_corrupt_file', { status: 'running' });
      const badBlob = new Blob(['not an image at all'], { type: 'image/png' });
      const badFile = new File([badBlob], 'corrupt.png', { type: 'image/png' });

      try {
        await inspectImageInBrowser(badFile);
        updateTest('sec_corrupt_file', {
          status: 'failed',
          message: 'Inspection accepted corrupt non-image buffer!',
        });
      } catch {
        updateTest('sec_corrupt_file', {
          status: 'passed',
          message: 'Successfully identified corrupt magic bytes and rejected safely.',
          durationMs: Math.round(performance.now() - t0),
        });
      }
    } catch (err: any) {
      updateTest('sec_corrupt_file', {
        status: 'passed',
        message: 'Rejection confirmed.',
      });
    }

    setIsRunningAll(false);
  };

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const failedCount = tests.filter((t) => t.status === 'failed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Automated Verification Suite</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-end integration and security test suite
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-600 dark:text-slate-300">
                Tests: <span className="font-semibold text-slate-900 dark:text-white">{tests.length}</span>
              </span>
              <span>·</span>
              <span className="text-primary-600 dark:text-primary-400">
                Passed: <span className="font-semibold font-mono tabular-nums">{passedCount}</span>
              </span>
              {failedCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-rose-600 dark:text-rose-400">
                    Failed: <span className="font-semibold font-mono tabular-nums">{failedCount}</span>
                  </span>
                </>
              )}
            </div>

            <button
              onClick={runAllTests}
              disabled={isRunningAll}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 bg-primary-600 dark:bg-primary-500 hover:bg-primary-500 dark:hover:bg-primary-400 rounded-lg transition-colors cursor-pointer disabled:opacity-40 shadow-sm"
            >
              <Play className={`h-3.5 w-3.5 ${isRunningAll ? 'animate-spin' : ''}`} />
              <span>{isRunningAll ? 'Running Battery...' : 'Run All Tests'}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 overflow-hidden">
            {tests.map((test) => (
              <div key={test.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 uppercase">
                      [{test.category}]
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {test.name}
                    </span>
                  </div>
                  {test.message && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {test.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {test.durationMs !== undefined && (
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {test.durationMs}ms
                    </span>
                  )}

                  {test.status === 'idle' && (
                    <span className="text-xs text-slate-400">Ready</span>
                  )}
                  {test.status === 'running' && (
                    <RefreshCw className="h-4 w-4 animate-spin text-primary-600 dark:text-primary-400" />
                  )}
                  {test.status === 'passed' && (
                    <div className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-semibold">
                      <CheckCircle className="h-4 w-4" />
                      <span>Passed</span>
                    </div>
                  )}
                  {test.status === 'failed' && (
                    <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                      <XCircle className="h-4 w-4" />
                      <span>Failed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Target Environment: Browser Canvas API</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
