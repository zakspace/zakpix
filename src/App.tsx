/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { DropZone } from './components/DropZone.js';
import { Workspace } from './components/Workspace.js';
import { ResultsPanel } from './components/ResultsPanel.js';
import { FormatMatrixModal } from './components/FormatMatrixModal.js';
import { AiAnalysisModal } from './components/AiAnalysisModal.js';
import { TestRunnerModal } from './components/TestRunnerModal.js';
import { FeatureHighlights } from './components/FeatureHighlights.js';
import { ImageOptimizationGuide } from './components/ImageOptimizationGuide.js';
import { PrivacyView } from './components/PrivacyView.js';
import { AboutView } from './components/AboutView.js';
import { Footer } from './components/Footer.js';
import {
  FileQueueItem,
  CompressionOptions,
  CodecCapability,
  AIAnalysisResult,
} from './types/compression.js';
import { downloadZipBundle } from './services/api.js';
import { compressInBrowser } from './services/clientCompressor.js';
import { inspectImageInBrowser } from './utils/browserInspect.js';
import { analyzeImageHeuristically } from './utils/imageHeuristics.js';
import { BROWSER_CODECS } from './constants/browserCodecs.js';
import samplePhotoPath from './assets/images/sample_landscape_photo_1792670244403.jpg';
import sampleProductPath from './assets/images/sample_product_watch_1792670260266.jpg';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zakpix-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Client-side routing state: supports '/', '/privacy', '/about'
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.replace(/\/+$/, '') || '/';
      return p;
    }
    return '/';
  });

  const [queue, setQueue] = useState<FileQueueItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);

  // Sync theme with document element class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('zakpix-theme', theme);
  }, [theme]);

  // Sync route changes with browser history and document title
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.replace(/\/+$/, '') || '/';
      setPathname(p);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (pathname === '/privacy') {
      document.title = 'Privacy Policy - ZakPix AI';
    } else if (pathname === '/about') {
      document.title = 'About ZakPix AI - Architecture & High-Performance Optimization';
    } else {
      document.title = 'ZakPix AI - Production Image Compression & Optimization Platform';
    }
  }, [pathname]);

  // Handle in-app navigation
  const handleNavigate = useCallback((path: string) => {
    if (path.startsWith('/#') || path.startsWith('#')) {
      const hash = path.startsWith('/#') ? path.substring(1) : path;
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', `/${hash}`);
        setPathname('/');
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.history.pushState(null, '', hash);
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const normalized = path.replace(/\/+$/, '') || '/';
    window.history.pushState(null, '', normalized);
    setPathname(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleToggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  // Modals state
  const [isCodecsModalOpen, setIsCodecsModalOpen] = useState(false);
  const [isTestsModalOpen, setIsTestsModalOpen] = useState(false);
  const [inspectingAiItem, setInspectingAiItem] = useState<FileQueueItem | null>(null);

  // Codec capabilities surfaced in the Format Matrix modal (Browser Canvas API)
  const [codecs] = useState<CodecCapability[]>(BROWSER_CODECS);

  // Global compression settings
  const [globalOptions, setGlobalOptions] = useState<CompressionOptions>({
    mode: 'smart',
    targetFormat: 'original',
    quality: 80,
    targetSizeKB: 250,
    stripMetadata: true,
    preserveTransparency: true,
  });

  // Inspect and add files to queue
  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const newItems: FileQueueItem[] = files.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        status: 'inspecting',
        progress: 0,
        options: { ...globalOptions },
      }));

      setQueue((prev) => [...prev, ...newItems]);
      if (!selectedItemId && newItems.length > 0) {
        setSelectedItemId(newItems[0].id);
      }

      // If on another route, navigate home to show tool
      if (pathname !== '/') {
        handleNavigate('/');
      }

      // Inspect each file locally in the browser (Canvas API)
      for (const item of newItems) {
        try {
          const metadata = await inspectImageInBrowser(item.file);
          const aiAnalysis = analyzeImageHeuristically(metadata);
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? {
                    ...q,
                    status: 'ready',
                    metadata,
                    aiAnalysis,
                    // If smart mode, pre-populate recommended format
                    options: {
                      ...q.options,
                      targetFormat:
                        q.options.mode === 'smart'
                          ? aiAnalysis.recommendedFormat
                          : q.options.targetFormat,
                    },
                  }
                : q
            )
          );
        } catch (err: any) {
          console.error('Inspection failed for:', item.name, err);
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? {
                    ...q,
                    status: 'ready',
                    errorMessage: err.message,
                  }
                : q
            )
          );
        }
      }
    },
    [globalOptions, selectedItemId, pathname, handleNavigate]
  );

  // Load sample image
  const handleLoadSample = useCallback(
    async (sampleType: 'photo' | 'product' | 'vector') => {
      let sampleUrl = '';
      let fileName = '';

      if (sampleType === 'photo') {
        sampleUrl = samplePhotoPath;
        fileName = 'landscape-golden-hour.jpg';
      } else if (sampleType === 'product') {
        sampleUrl = sampleProductPath;
        fileName = 'titanium-watch-studio.jpg';
      } else {
        // Sample SVG vector
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#10B981" />
              <stop offset="100%" stop-color="#065F46" />
            </linearGradient>
          </defs>
          <rect width="400" height="400" rx="40" fill="#0F172A" />
          <circle cx="200" cy="200" r="120" fill="url(#g1)" />
          <path d="M150 200 L185 235 L260 160" fill="none" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
        </svg>`;
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const file = new File([blob], 'zakpix-vector-badge.svg', { type: 'image/svg+xml' });
        handleFilesSelected([file]);
        return;
      }

      try {
        const response = await fetch(sampleUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
        handleFilesSelected([file]);
      } catch (err) {
        console.error('Failed to load sample image:', err);
      }
    },
    [handleFilesSelected]
  );

  // Optimize a single item
  const handleOptimizeItem = useCallback(
    async (id: string) => {
      const item = queue.find((q) => q.id === id);
      if (!item) return;

      setQueue((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: 'processing', progress: 50 } : q))
      );

      try {
        const result = await compressInBrowser(item.file, item.options);

        setQueue((prev) =>
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  status: 'done',
                  progress: 100,
                  result,
                }
              : q
          )
        );
      } catch (err: any) {
        console.error('Optimization failed for item:', id, err);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  status: 'error',
                  progress: 0,
                  errorMessage: err?.message || 'Compression failed',
                }
              : q
          )
        );
      }
    },
    [queue]
  );

  // Batch optimize all items in queue
  const handleOptimizeAll = useCallback(async () => {
    setIsProcessingBatch(true);
    for (const item of queue) {
      await handleOptimizeItem(item.id);
    }
    setIsProcessingBatch(false);
  }, [handleOptimizeItem, queue]);

  // Remove an item from queue
  const handleRemoveItem = useCallback(
    (id: string) => {
      setQueue((prev) => {
        const next = prev.filter((q) => q.id !== id);
        if (selectedItemId === id) {
          setSelectedItemId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
    },
    [selectedItemId]
  );

  // Clear all items
  const handleClearAll = useCallback(() => {
    queue.forEach((q) => {
      if (q.previewUrl) URL.revokeObjectURL(q.previewUrl);
    });
    setQueue([]);
    setSelectedItemId(null);
  }, [queue]);

  // Update global options
  const handleUpdateGlobalOptions = useCallback(
    (opts: Partial<CompressionOptions>) => {
      setGlobalOptions((prev) => {
        const updated = { ...prev, ...opts };
        // Sync existing queue items with new global options
        setQueue((qList) =>
          qList.map((item) => ({
            ...item,
            options: { ...item.options, ...opts },
          }))
        );
        return updated;
      });
    },
    []
  );

  // Update per-item options
  const handleUpdateItemOptions = useCallback(
    (id: string, opts: Partial<CompressionOptions>) => {
      setQueue((prev) =>
        prev.map((q) => (q.id === id ? { ...q, options: { ...q.options, ...opts } } : q))
      );
    },
    []
  );

  // Download a single item
  const handleDownloadSingle = useCallback((item: FileQueueItem) => {
    if (!item.result?.dataUrl) return;
    const a = document.createElement('a');
    a.href = item.result.dataUrl;
    const ext = item.result.outputFormat === 'jpeg' ? 'jpg' : item.result.outputFormat;
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    a.download = `${baseName}-optimized.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  // Download all as ZIP
  const handleDownloadAllZip = useCallback(async () => {
    const itemsToZip = queue
      .filter((q) => q.result?.dataUrl)
      .map((q) => {
        const ext = q.result!.outputFormat === 'jpeg' ? 'jpg' : q.result!.outputFormat;
        const baseName = q.name.substring(0, q.name.lastIndexOf('.')) || q.name;
        return {
          name: `${baseName}-optimized.${ext}`,
          dataUrl: q.result!.dataUrl!,
        };
      });

    if (itemsToZip.length === 0) return;
    await downloadZipBundle(itemsToZip, 'zakpix-all-optimized.zip');
  }, [queue]);

  // Apply AI recommendations
  const handleApplyAiRecommendation = useCallback(
    (item: FileQueueItem, analysis: AIAnalysisResult) => {
      handleUpdateItemOptions(item.id, {
        mode: analysis.recommendedMode,
        targetFormat: analysis.recommendedFormat,
        quality: analysis.recommendedQuality,
      });
    },
    [handleUpdateItemOptions]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-primary-500/20 selection:text-primary-500 dark:selection:text-primary-300 transition-colors">
      <Navbar
        onOpenCodecs={() => setIsCodecsModalOpen(true)}
        onOpenTests={() => setIsTestsModalOpen(true)}
        queueCount={queue.length}
        onProcessAll={handleOptimizeAll}
        isProcessing={isProcessingBatch}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentPath={pathname}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 w-full">
        {pathname === '/privacy' ? (
          <PrivacyView onNavigateHome={() => handleNavigate('/')} />
        ) : pathname === '/about' ? (
          <AboutView
            onNavigateHome={() => handleNavigate('/')}
            onOpenCodecs={() => setIsCodecsModalOpen(true)}
          />
        ) : (
          /* Home View: Image compression tool front and center + below-the-fold Guide & FAQ */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto pt-4 pb-2">
              <h1
                className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white animate-fade-up"
                style={{ textWrap: 'balance' }}
              >
                ZakPix AI —{' '}
                <span className="gradient-text">Intelligent Image Compression &amp; Optimization</span>
              </h1>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                100% in-browser, content-aware optimization powered by the Canvas API and smart heuristic content classification. Images never leave your device. Transcode across WebP, JPEG, PNG, and SVG.
              </p>
            </div>

            {/* Upload DropZone */}
            <section id="upload">
              <DropZone
                onFilesSelected={handleFilesSelected}
                onLoadSample={handleLoadSample}
                disabled={isProcessingBatch}
              />
            </section>

            {/* Workspace & Batch Studio: 1 Card uniting Compression Engine (Top), Before/After (Left), and Queue (Right) */}
            {queue.length > 0 && (
              <section id="workspace" className="space-y-8">
                {/* Unified 1-Card Image Compression Studio */}
                <Workspace
                  queue={queue}
                  selectedItemId={selectedItemId}
                  onSelectItem={(id) => setSelectedItemId(id)}
                  onRemoveItem={handleRemoveItem}
                  onClearAll={handleClearAll}
                  onOptimizeItem={handleOptimizeItem}
                  onOptimizeAll={handleOptimizeAll}
                  onUpdateGlobalOptions={handleUpdateGlobalOptions}
                  onUpdateItemOptions={handleUpdateItemOptions}
                  globalOptions={globalOptions}
                  onDeepAiInspect={(item) => setInspectingAiItem(item)}
                  isProcessing={isProcessingBatch}
                  onDownloadItem={handleDownloadSingle}
                  onDownloadAllZip={handleDownloadAllZip}
                  onAddMoreFiles={() => {
                    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                    if (input) input.click();
                  }}
                />

                {/* Overall Results & KPI Panel (visible when at least one image has completed) */}
                {queue.some((q) => q.result) && (
                  <ResultsPanel
                    queue={queue}
                    onDownloadAllZip={handleDownloadAllZip}
                    onDownloadSingle={handleDownloadSingle}
                    onAddMore={() => {
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                      if (input) input.click();
                    }}
                  />
                )}
              </section>
            )}

            {/* Technical Architecture Feature Highlights */}
            <FeatureHighlights />

            {/* Below-the-fold Image Optimization Guide & FAQ */}
            <ImageOptimizationGuide />
          </div>
        )}
      </main>

      {/* Accessible Footer with Links & Attribution */}
      <Footer
        onOpenCodecs={() => setIsCodecsModalOpen(true)}
        onOpenTests={() => setIsTestsModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Modals */}
      <FormatMatrixModal
        isOpen={isCodecsModalOpen}
        onClose={() => setIsCodecsModalOpen(false)}
        codecs={codecs}
      />

      <AiAnalysisModal
        isOpen={Boolean(inspectingAiItem)}
        onClose={() => setInspectingAiItem(null)}
        item={inspectingAiItem}
        onApplyRecommendation={handleApplyAiRecommendation}
      />

      <TestRunnerModal
        isOpen={isTestsModalOpen}
        onClose={() => setIsTestsModalOpen(false)}
      />
    </div>
  );
}
