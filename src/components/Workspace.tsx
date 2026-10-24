/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileQueueItem,
  CompressionMode,
  ImageFormat,
  SocialPreset,
  CompressionOptions,
} from '../types/compression.js';
import { formatBytes, formatDimensions, formatPercentage } from '../utils/formatters.js';
import { ComparisonViewer } from './ComparisonViewer.js';
import {
  Sliders,
  Sparkles,
  Settings,
  Trash2,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  Maximize,
  ArrowRight,
  Shield,
  Plus,
  Download,
  Archive,
  Layers,
  Check,
} from 'lucide-react';

interface WorkspaceProps {
  queue: FileQueueItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onOptimizeItem: (id: string) => void;
  onOptimizeAll: () => void;
  onUpdateGlobalOptions: (options: Partial<CompressionOptions>) => void;
  onUpdateItemOptions: (id: string, options: Partial<CompressionOptions>) => void;
  globalOptions: CompressionOptions;
  onDeepAiInspect: (item: FileQueueItem) => void;
  isProcessing: boolean;
  onDownloadItem: (item: FileQueueItem) => void;
  onDownloadAllZip: () => void;
  onAddMoreFiles?: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  queue,
  selectedItemId,
  onSelectItem,
  onRemoveItem,
  onClearAll,
  onOptimizeItem,
  onOptimizeAll,
  onUpdateGlobalOptions,
  onUpdateItemOptions,
  globalOptions,
  onDeepAiInspect,
  isProcessing,
  onDownloadItem,
  onDownloadAllZip,
  onAddMoreFiles,
}) => {
  const [activeTab, setActiveTab] = useState<'batch' | 'item'>('batch');
  const selectedItem = queue.find((q) => q.id === selectedItemId) || (queue.length > 0 ? queue[0] : null);

  const compressionModes: Array<{ id: CompressionMode; label: string; desc: string }> = [
    { id: 'smart', label: 'Smart AI', desc: 'Heuristic auto-tuning based on entropy & content' },
    { id: 'balanced', label: 'Balanced', desc: 'Visually lossless (~80 quality), balanced size' },
    { id: 'max', label: 'Max Compression', desc: 'Maximum byte reduction for bandwidth savings' },
    { id: 'lossless', label: 'Lossless', desc: '100% bit-exact pixel preservation' },
    { id: 'target_size', label: 'Target Size', desc: 'Iteratively hit exact target KB' },
    { id: 'web', label: 'Web Optimized', desc: 'Modern WebP/AVIF format with responsive sizing' },
    { id: 'ecommerce', label: 'E-Commerce', desc: 'High-fidelity product detail & 4:4:4 color' },
    { id: 'social', label: 'Social Media', desc: 'Formatted for Instagram, X, LinkedIn, YouTube' },
    { id: 'transparent', label: 'Transparent Assets', desc: 'Alpha channel preservation guarantee' },
    { id: 'custom', label: 'Custom Manual', desc: 'Full control over quality, effort, and subsampling' },
  ];

  // Calculate totals for quick summary
  const totalOriginal = queue.reduce((acc, q) => acc + q.size, 0);
  const totalOptimized = queue.reduce(
    (acc, q) => acc + (q.result?.optimizedSizeBytes ?? q.size),
    0
  );
  const totalSaved = Math.max(0, totalOriginal - totalOptimized);
  const totalPercentSaved = totalOriginal > 0 ? (totalSaved / totalOriginal) * 100 : 0;
  const completedCount = queue.filter((q) => q.result).length;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-2xl overflow-hidden backdrop-blur-sm transition-colors">
      {/* ──────────────────────────────────────────────────────────────────────────
          TOP SECTION: Compression Engine Controls & Preset Toolbar
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 p-5 sm:p-6 transition-colors">
        {/* Header Strip with Engine Badge & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Compression Engine
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                  <Sparkles className="h-2.5 w-2.5" /> Sharp libvips
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure content-aware optimization modes, output formats, and visual fidelity
              </p>
            </div>
          </div>

          {/* Scope Tabs & Batch Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <button
                onClick={() => setActiveTab('batch')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'batch'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Global Settings
              </button>
              <button
                onClick={() => setActiveTab('item')}
                disabled={!selectedItem}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 ${
                  activeTab === 'item'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Selected Image {selectedItem ? `(${selectedItem.name.slice(0, 12)}...)` : ''}
              </button>
            </div>

            <button
              onClick={onClearAll}
              className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium px-2 py-1 transition-colors cursor-pointer"
            >
              Clear Queue
            </button>

            <button
              onClick={onOptimizeAll}
              disabled={isProcessing || queue.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white dark:text-slate-950 bg-primary-600 dark:bg-primary-500 hover:bg-primary-500 dark:hover:bg-primary-400 rounded-lg transition-all cursor-pointer disabled:opacity-40 shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Optimizing Batch...' : 'Optimize Batch Now'}</span>
            </button>
          </div>
        </div>

        {/* Control Grid: Mode, Format, and Quality / Target Size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {/* 1. Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Optimization Mode
            </label>
            <select
              value={activeTab === 'item' && selectedItem ? selectedItem.options.mode : globalOptions.mode}
              onChange={(e) => {
                const mode = e.target.value as CompressionMode;
                if (activeTab === 'item' && selectedItem) {
                  onUpdateItemOptions(selectedItem.id, { mode });
                } else {
                  onUpdateGlobalOptions({ mode });
                }
              }}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-primary-500 focus:outline-none shadow-sm"
            >
              {compressionModes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <span className="block mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {compressionModes.find((m) => m.id === (activeTab === 'item' && selectedItem ? selectedItem.options.mode : globalOptions.mode))?.desc}
            </span>
          </div>

          {/* 2. Target Format */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Output Format
            </label>
            <select
              value={activeTab === 'item' && selectedItem ? selectedItem.options.targetFormat : globalOptions.targetFormat}
              onChange={(e) => {
                const targetFormat = e.target.value as 'original' | ImageFormat;
                if (activeTab === 'item' && selectedItem) {
                  onUpdateItemOptions(selectedItem.id, { targetFormat });
                } else {
                  onUpdateGlobalOptions({ targetFormat });
                }
              }}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-primary-500 focus:outline-none shadow-sm"
            >
              <option value="original">Keep Original Format</option>
              <option value="webp">WebP (Modern Standard, High Savings)</option>
              <option value="avif">AVIF (Next-Gen AV1, Superior Quality)</option>
              <option value="jpeg">JPEG (Universal Compatibility)</option>
              <option value="png">PNG (Lossless & Alpha Transparency)</option>
              <option value="gif">GIF (Animated Graphics)</option>
              <option value="tiff">TIFF (Archival Quality)</option>
            </select>
            <span className="block mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Transcodes container while maintaining color profiles & alpha transparency
            </span>
          </div>

          {/* 3. Dynamic Setting (Quality / Target Size / Social Preset) */}
          <div>
            {(activeTab === 'item' && selectedItem ? selectedItem.options.mode : globalOptions.mode) === 'target_size' ? (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Target File Size</span>
                  <span className="font-mono tabular-nums text-primary-600 dark:text-primary-400 font-semibold">
                    {(activeTab === 'item' && selectedItem ? selectedItem.options.targetSizeKB : globalOptions.targetSizeKB) || 200} KB
                  </span>
                </div>
                <input
                  type="number"
                  min="20"
                  max="10000"
                  step="10"
                  value={(activeTab === 'item' && selectedItem ? selectedItem.options.targetSizeKB : globalOptions.targetSizeKB) || 200}
                  onChange={(e) => {
                    const targetSizeKB = parseInt(e.target.value, 10) || 200;
                    if (activeTab === 'item' && selectedItem) {
                      onUpdateItemOptions(selectedItem.id, { targetSizeKB });
                    } else {
                      onUpdateGlobalOptions({ targetSizeKB });
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-primary-500 focus:outline-none font-mono shadow-sm"
                />
                <span className="block mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Iterative binary search converges quality to meet byte target
                </span>
              </div>
            ) : (activeTab === 'item' && selectedItem ? selectedItem.options.mode : globalOptions.mode) === 'social' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Social Preset
                </label>
                <select
                  value={
                    (activeTab === 'item' && selectedItem
                      ? selectedItem.options.resize?.preset
                      : globalOptions.resize?.preset) || 'instagram_post'
                  }
                  onChange={(e) => {
                    const preset = e.target.value as SocialPreset;
                    const resize = { ...(globalOptions.resize || {}), preset };
                    if (activeTab === 'item' && selectedItem) {
                      onUpdateItemOptions(selectedItem.id, { resize });
                    } else {
                      onUpdateGlobalOptions({ resize });
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-primary-500 focus:outline-none shadow-sm"
                >
                  <option value="instagram_post">Instagram Square (1080×1080)</option>
                  <option value="instagram_story">Instagram Story / Reels (1080×1920)</option>
                  <option value="twitter_post">Twitter / X Post (1200×675)</option>
                  <option value="twitter_header">Twitter / X Header (1500×500)</option>
                  <option value="linkedin_banner">LinkedIn Banner (1584×396)</option>
                  <option value="youtube_thumbnail">YouTube Thumbnail (1280×720)</option>
                </select>
                <span className="block mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Auto-resizes and crops for social feed specifications
                </span>
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Quality Level</span>
                  <span className="font-mono tabular-nums text-primary-600 dark:text-primary-400 font-bold">
                    {(activeTab === 'item' && selectedItem ? selectedItem.options.quality : globalOptions.quality) ?? 80}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={(activeTab === 'item' && selectedItem ? selectedItem.options.quality : globalOptions.quality) ?? 80}
                  onChange={(e) => {
                    const quality = parseInt(e.target.value, 10);
                    if (activeTab === 'item' && selectedItem) {
                      onUpdateItemOptions(selectedItem.id, { quality });
                    } else {
                      onUpdateGlobalOptions({ quality });
                    }
                  }}
                  className="w-full accent-primary-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Maximum Compression</span>
                  <span>Balanced</span>
                  <span>Lossless Quality</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Toggles Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={globalOptions.stripMetadata ?? true}
                onChange={(e) => onUpdateGlobalOptions({ stripMetadata: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-primary-600 focus:ring-0"
              />
              <span>Strip metadata (EXIF / GPS) to minimize payload size</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={globalOptions.preserveTransparency ?? true}
                onChange={(e) => onUpdateGlobalOptions({ preserveTransparency: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-primary-600 focus:ring-0"
              />
              <span>Preserve alpha transparency channel</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {completedCount > 0 ? (
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                {completedCount} of {queue.length} files optimized ({formatPercentage(totalPercentSaved)} aggregate reduction)
              </span>
            ) : (
              <span>Ready to compress {queue.length} {queue.length === 1 ? 'file' : 'files'}</span>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          BOTTOM SECTION: Split Grid (Interactive Before/After on Left, Queue on Right)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 min-h-[580px]">
        {/* ── LEFT PANE: Interactive Before & After Inspection Viewer (7 cols) ── */}
        <div className="lg:col-span-7 flex flex-col bg-slate-50/40 dark:bg-slate-950/40">
          <ComparisonViewer
            item={selectedItem}
            embedded={true}
            onDownloadItem={onDownloadItem}
            onOptimizeItem={onOptimizeItem}
          />
        </div>

        {/* ── RIGHT PANE: Processing Queue (5 cols) ── */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900/40">
          {/* Queue Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-400">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Processing Queue ({queue.length})
              </h4>
            </div>

            {onAddMoreFiles && (
              <button
                onClick={onAddMoreFiles}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Files</span>
              </button>
            )}
          </div>

          {/* Scrollable File Items List */}
          <div className="flex-1 overflow-y-auto max-h-[460px] lg:max-h-[520px] divide-y divide-slate-100 dark:divide-slate-800/80">
            {queue.map((item) => {
              const isSelected = item.id === selectedItem?.id;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item.id)}
                  className={`flex items-center justify-between gap-3 p-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary-50/70 dark:bg-primary-950/30 border-l-3 border-primary-500 dark:border-primary-400'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Thumbnail & File Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 bg-checkerboard-light dark:bg-checkerboard flex items-center justify-center">
                      <img
                        src={item.result?.dataUrl || item.previewUrl}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-[180px]">
                          {item.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold bg-primary-500/10 px-1 rounded">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-mono tabular-nums">{formatBytes(item.size)}</span>
                        <span>·</span>
                        <span className="uppercase">{item.metadata?.format || 'FILE'}</span>
                        {item.metadata?.width && (
                          <>
                            <span>·</span>
                            <span className="font-mono tabular-nums">
                              {item.metadata.width}×{item.metadata.height}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status, Savings & Actions */}
                  <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {item.status === 'processing' && (
                      <div className="flex items-center gap-1 text-[11px] text-primary-600 dark:text-primary-400 font-medium">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span className="hidden sm:inline">Optimizing</span>
                      </div>
                    )}

                    {item.status === 'error' && (
                      <div className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Failed</span>
                      </div>
                    )}

                    {item.result && item.status === 'done' && (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 font-mono tabular-nums">
                          {formatPercentage(item.result.percentageSaved)}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          {formatBytes(item.result.optimizedSizeBytes)}
                        </span>
                      </div>
                    )}

                    {item.status === 'ready' && !item.result && (
                      <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        Ready
                      </span>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDeepAiInspect(item)}
                        title="Run AI Heuristic Analysis"
                        className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <BrainCircuit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => onOptimizeItem(item.id)}
                        disabled={item.status === 'processing'}
                        title="Optimize this image"
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${item.status === 'processing' ? 'animate-spin' : ''}`} />
                      </button>

                      {item.result && (
                        <button
                          onClick={() => onDownloadItem(item)}
                          title="Download optimized file"
                          className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove from queue"
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Queue Footer Summary & ZIP Download */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 flex items-center justify-between gap-3 text-xs">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Queue Total: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatBytes(totalOriginal)}</strong>
              </div>
              {totalSaved > 0 && (
                <div className="text-[11px] text-primary-600 dark:text-primary-400 font-bold font-mono">
                  Saved {formatBytes(totalSaved)} ({formatPercentage(totalPercentSaved)})
                </div>
              )}
            </div>

            <button
              onClick={onDownloadAllZip}
              disabled={completedCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-950 bg-primary-600 dark:bg-primary-500 hover:bg-primary-500 dark:hover:bg-primary-400 rounded-lg transition-colors cursor-pointer disabled:opacity-40 shadow-sm"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Download ZIP ({completedCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
