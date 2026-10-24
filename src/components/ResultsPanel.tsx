/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Archive,
  CheckCircle2,
  TrendingDown,
  HardDrive,
  FileCheck,
  Plus,
} from 'lucide-react';
import { FileQueueItem } from '../types/compression.js';
import { formatBytes, formatPercentage } from '../utils/formatters.js';

interface ResultsPanelProps {
  queue: FileQueueItem[];
  onDownloadAllZip: () => Promise<void>;
  onDownloadSingle: (item: FileQueueItem) => void;
  onAddMore: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  queue,
  onDownloadAllZip,
  onDownloadSingle,
  onAddMore,
}) => {
  const [isZipping, setIsZipping] = useState(false);

  // Filter completed items
  const completedItems = queue.filter((q) => q.result && q.status === 'done');
  if (completedItems.length === 0) return null;

  const totalOriginalBytes = completedItems.reduce(
    (acc, item) => acc + (item.result?.originalSizeBytes || item.size),
    0
  );
  const totalOptimizedBytes = completedItems.reduce(
    (acc, item) => acc + (item.result?.optimizedSizeBytes || item.size),
    0
  );
  const totalBytesSaved = totalOriginalBytes - totalOptimizedBytes;
  const overallPercentageSaved =
    totalOriginalBytes > 0
      ? Number(((totalBytesSaved / totalOriginalBytes) * 100).toFixed(1))
      : 0;

  const handleZipClick = async () => {
    setIsZipping(true);
    try {
      await onDownloadAllZip();
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-xl transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Optimization Summary</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {completedItems.length} of {queue.length} {queue.length === 1 ? 'image' : 'images'} successfully processed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAddMore}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add More</span>
          </button>

          <button
            onClick={handleZipClick}
            disabled={isZipping || completedItems.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 bg-primary-600 dark:bg-primary-500 hover:bg-primary-500 dark:hover:bg-primary-400 rounded-lg transition-colors cursor-pointer disabled:opacity-40 shadow-sm"
          >
            <Archive className="h-4 w-4" />
            <span>{isZipping ? 'Assembling ZIP...' : `Download All as ZIP (${completedItems.length})`}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <HardDrive className="h-3.5 w-3.5" />
            <span>Original Size</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatBytes(totalOriginalBytes)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <FileCheck className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            <span>Optimized Size</span>
          </div>
          <div className="text-lg font-bold text-primary-600 dark:text-primary-400 font-mono tabular-nums">
            {formatBytes(totalOptimizedBytes)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <TrendingDown className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            <span>Total Reduction</span>
          </div>
          <div className="text-lg font-bold text-primary-600 dark:text-primary-400 font-mono tabular-nums">
            {formatPercentage(overallPercentageSaved)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            <span>Bytes Saved</span>
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
            {formatBytes(Math.max(0, totalBytesSaved))}
          </div>
        </div>
      </div>

      {/* Per-Image Fast Download Row */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Individual Downloads</span>
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          {completedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-900/30 transition-colors"
            >
              <div className="flex items-center gap-3 truncate">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                  {item.name}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {formatBytes(item.result?.optimizedSizeBytes ?? item.size)}
                </span>
                <span className="text-primary-600 dark:text-primary-400 font-semibold font-mono tabular-nums">
                  {formatPercentage(item.result?.percentageSaved ?? 0)}
                </span>
              </div>

              <button
                onClick={() => onDownloadSingle(item)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer shrink-0 ml-4 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
