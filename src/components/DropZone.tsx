/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image, FileCode, CheckCircle, Sparkles } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSample: (sampleType: 'photo' | 'product' | 'vector') => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onLoadSample,
  disabled,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  // Clipboard paste support (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const imageFiles: File[] = [];
        for (let i = 0; i < e.clipboardData.files.length; i++) {
          const item = e.clipboardData.files[i];
          if (item.type.startsWith('image/')) {
            imageFiles.push(item);
          }
        }
        if (imageFiles.length > 0) {
          onFilesSelected(imageFiles);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, onFilesSelected]);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          isDragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 shadow-lg shadow-primary-500/10'
            : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white/80 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 shadow-sm'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.svg,.avif,.webp,.heic,.heif,.tiff,.tif,.bmp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFilesSelected(Array.from(e.target.files));
              e.target.value = '';
            }
          }}
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-slate-800/80 border border-primary-100 dark:border-slate-700/60 text-primary-600 dark:text-primary-400 mb-4 shadow-sm">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Drop your images here, or browse
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mb-4">
          Supports JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF, BMP & HEIF up to 50 MB each.
          Paste directly from your clipboard with <kbd className="px-1.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300">Ctrl+V</kbd>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            <span>Zero Quality Hallucination</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            <span>Ephemeral Safe Memory</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            <span>Batch Concurrency</span>
          </div>
        </div>
      </div>

      {/* Quick Test Samples */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
          Test with high-fidelity sample images:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('photo');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Image className="h-3.5 w-3.5 text-amber-500" />
            <span>Landscape Photo (8K)</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('product');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Image className="h-3.5 w-3.5 text-cyan-500" />
            <span>Studio Watch (E-Commerce)</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSample('vector');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <FileCode className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
            <span>Vector SVG Asset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
