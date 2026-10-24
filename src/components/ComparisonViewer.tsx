/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Columns,
  Split,
  Eye,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { FileQueueItem } from '../types/compression.js';
import { formatBytes, formatPercentage, formatDimensions, formatMs } from '../utils/formatters.js';

interface ComparisonViewerProps {
  item: FileQueueItem | null;
  onClose?: () => void;
  onDownloadItem?: (item: FileQueueItem) => void;
  onOptimizeItem?: (id: string) => void;
  embedded?: boolean;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  item,
  onClose,
  onDownloadItem,
  onOptimizeItem,
  embedded = false,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0-100
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = fit, 2 = 200%, 4 = 400%
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [backgroundStyle, setBackgroundStyle] = useState<'dark-checker' | 'light-checker' | 'dark' | 'white'>('dark-checker');

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef<boolean>(false);

  // Handle slider drag
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPos(percentage);
  }, []);

  const handleMouseDownSlider = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDraggingSlider.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider.current) {
        handleSliderMove(e.clientX);
      }
    };

    const handleMouseUp = () => {
      isDraggingSlider.current = false;
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleSliderMove]);

  // Handle pan when zoomed
  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handlePanMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Get background class
  const getBgClass = () => {
    switch (backgroundStyle) {
      case 'dark-checker':
        return 'bg-checkerboard';
      case 'light-checker':
        return 'bg-checkerboard-light';
      case 'dark':
        return 'bg-slate-950';
      case 'white':
        return 'bg-white';
    }
  };

  if (!item) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center ${embedded ? 'h-full min-h-[460px]' : 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-12 shadow-xl'}`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 mb-3">
          <Eye className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Interactive Before & After Inspection</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1.5 leading-relaxed">
          Select any image from the processing queue on the right to inspect pixel fidelity, drag the split slider, or zoom.
        </p>
      </div>
    );
  }

  const originalUrl = item.previewUrl;
  const optimizedUrl = item.result?.dataUrl || item.previewUrl;

  return (
    <div className={`flex flex-col ${embedded ? 'h-full w-full' : 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xl'} transition-colors`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{item.metadata?.detectedType || 'Image'}</span>
              <span>·</span>
              <span className="font-mono tabular-nums">{formatDimensions(item.metadata?.width, item.metadata?.height)}</span>
              {item.result && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-mono tabular-nums">
                    <Clock className="h-3 w-3" />
                    {formatMs(item.result.processingTimeMs)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('split')}
              title="Split comparison slider"
              className={`p-1.5 text-xs rounded transition-colors ${
                viewMode === 'split' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Split className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              title="Side-by-side comparison"
              className={`p-1.5 text-xs rounded transition-colors ${
                viewMode === 'side-by-side' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
              disabled={zoomLevel <= 1}
              title="Zoom out"
              className="p-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(4, z + 0.5))}
              disabled={zoomLevel >= 4}
              title="Zoom in"
              className="p-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                title="Reset zoom to fit"
                className="p-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Background pattern toggle */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setBackgroundStyle('dark-checker')}
              title="Dark Checkerboard"
              className={`px-2 py-1 rounded text-xs transition-colors ${
                backgroundStyle === 'dark-checker' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Checker
            </button>
            <button
              onClick={() => setBackgroundStyle('white')}
              title="White background"
              className={`px-2 py-1 rounded text-xs transition-colors ${
                backgroundStyle === 'white' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setBackgroundStyle('dark')}
              title="Solid Dark"
              className={`px-2 py-1 rounded text-xs transition-colors ${
                backgroundStyle === 'dark' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dark
            </button>
          </div>

          {item.result && onDownloadItem && (
            <button
              onClick={() => onDownloadItem(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-950 bg-primary-600 dark:bg-primary-500 hover:bg-primary-500 dark:hover:bg-primary-400 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          )}

          {!item.result && onOptimizeItem && (
            <button
              onClick={() => onOptimizeItem(item.id)}
              disabled={item.status === 'processing'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-950 bg-primary-600 dark:bg-primary-500 hover:bg-primary-500 dark:hover:bg-primary-400 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${item.status === 'processing' ? 'animate-spin' : ''}`} />
              <span>{item.status === 'processing' ? 'Optimizing...' : 'Optimize'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats comparison strip */}
      {item.result ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/60 px-5 py-2.5 text-xs">
          <div>
            <span className="text-slate-500 block">Original</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
              {formatBytes(item.result.originalSizeBytes)} · {item.result.originalFormat.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Optimized</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400 font-mono tabular-nums">
              {formatBytes(item.result.optimizedSizeBytes)} · {item.result.outputFormat.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Savings</span>
            <span className="font-bold text-primary-600 dark:text-primary-400 font-mono tabular-nums">
              {formatPercentage(item.result.percentageSaved)} ({formatBytes(Math.abs(item.result.bytesSaved))})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Resolution</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
              {formatDimensions(item.result.width, item.result.height)}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/60 px-4 py-2 text-xs">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <span>Size: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatBytes(item.size)}</strong></span>
            <span>Format: <strong className="text-slate-800 dark:text-slate-200 uppercase">{item.metadata?.format || 'IMAGE'}</strong></span>
            <span>Dimensions: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatDimensions(item.metadata?.width, item.metadata?.height)}</strong></span>
          </div>
          <span className="text-[11px] text-primary-600 dark:text-primary-400 font-medium">
            Ready to compress · Click "Optimize" or "Optimize Batch" to inspect differences
          </span>
        </div>
      )}

      {/* Warnings banner if any */}
      {item.result?.warnings && item.result.warnings.length > 0 && (
        <div className="flex items-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-5 py-2 text-xs text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{item.result.warnings.join(' · ')}</span>
        </div>
      )}

      {/* Viewport Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handlePanMouseDown}
        onMouseMove={handlePanMouseMove}
        className={`relative w-full h-[460px] select-none overflow-hidden flex items-center justify-center ${getBgClass()} ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        {viewMode === 'split' ? (
          /* Split Slider Mode */
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {/* Background: Optimized Image */}
            <img
              src={optimizedUrl}
              alt="Optimized preview"
              className="max-h-full max-w-full object-contain pointer-events-none"
            />

            {/* Foreground: Original Image with clip-path */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
              }}
            >
              <img
                src={originalUrl}
                alt="Original preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Draggable Divider Line & Handle */}
            <div
              onMouseDown={handleMouseDownSlider}
              className="absolute top-0 bottom-0 z-20 flex items-center justify-center cursor-ew-resize"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-0.5 h-full bg-primary-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              <div className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 border-2 border-primary-400 text-primary-400 shadow-xl cursor-ew-resize">
                <Split className="h-4 w-4" />
              </div>
            </div>

            {/* Corner tags */}
            <div className="absolute top-4 left-4 z-10 px-2.5 py-1 text-xs font-semibold text-slate-200 bg-slate-950/80 backdrop-blur rounded border border-slate-700 pointer-events-none">
              Original
            </div>
            <div className="absolute top-4 right-4 z-10 px-2.5 py-1 text-xs font-semibold text-primary-300 bg-slate-950/80 backdrop-blur rounded border border-primary-500/30 pointer-events-none">
              Optimized
            </div>
          </div>
        ) : (
          /* Side by Side Mode */
          <div
            className="grid grid-cols-2 w-full h-full divide-x divide-slate-800"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <div className="relative flex items-center justify-center p-4 h-full">
              <img
                src={originalUrl}
                alt="Original"
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-semibold bg-slate-950/80 border border-slate-700 text-slate-200 rounded">
                Original ({formatBytes(item.size)})
              </span>
            </div>
            <div className="relative flex items-center justify-center p-4 h-full">
              <img
                src={optimizedUrl}
                alt="Optimized"
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold bg-slate-950/80 border border-primary-500/30 text-primary-300 rounded">
                Optimized ({formatBytes(item.result?.optimizedSizeBytes ?? item.size)})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Helpful inspection tip */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
        <span>Drag the slider left and right to inspect fine texture retention and edges.</span>
        {zoomLevel > 1 && (
          <span className="text-primary-400">Click and drag to pan across the image</span>
        )}
      </div>
    </div>
  );
};
