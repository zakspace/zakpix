/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, Zap, Layers, ShieldCheck, Sparkles, Sliders, ArrowLeft, ExternalLink, Workflow, Code2, Server } from 'lucide-react';

interface AboutViewProps {
  onNavigateHome: () => void;
  onOpenCodecs?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateHome, onOpenCodecs }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-up">
      {/* Back button and breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Image Compressor</span>
        </button>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-xs font-medium text-slate-500">Architecture & Engine</span>
      </div>

      {/* Header Banner */}
      <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60">
          <Cpu className="h-3.5 w-3.5" />
          <span>Engineering Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          About ZakPix AI
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          ZakPix AI is a production-grade image optimization, format conversion, and compression platform designed for developers, designers, and high-traffic web applications. It bridges the gap between instantaneous, zero-latency browser execution and industrial-strength libvips processing pipelines.
        </p>
      </div>

      {/* The Core Engine: Sharp & libvips */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white font-bold">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              The Sharp / libvips Compression Pipeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Industrial-grade asynchronous image transformation architecture
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 sm:p-8 space-y-4 shadow-sm">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            At the core of ZakPix AI&apos;s computational design is the <strong className="text-slate-900 dark:text-white">libvips</strong> image processing library paired with the <strong className="text-slate-900 dark:text-white">Sharp</strong> native binding pipeline. Traditional image engines (such as ImageMagick or GraphicsMagick) decompress the entire image into monolithic uncompressed pixel bitmaps in memory, consuming hundreds of megabytes or gigabytes of RAM during high-resolution processing.
          </p>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            In contrast, libvips operates on a <em>demand-driven, horizontally multi-threaded streaming architecture</em>. Rather than storing entire rasters in memory:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-xs">
                <Workflow className="h-4 w-4" />
                <span>Streaming Scanline Pipeline</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Images are processed in parallel regions and scanlines as data flows through the pipeline. Memory footprint is proportional to the number of simultaneous CPU worker threads, not the pixel dimensions of the image.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-xs">
                <Server className="h-4 w-4" />
                <span>SIMD Vectorization & Concurrency</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Color-space conversions (e.g., sRGB to linear RGB for gamma-accurate bicubic resampling) leverage hardware vector instructions (AVX2/NEON), completing operations 4x to 8x faster than traditional libraries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hybrid Architecture Diagram & Explanation */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Hybrid Client-First Processing Model
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Zero network latency meets deterministic quality
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Two-Tier Execution Framework:
            </h3>
            <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li>
                <strong>Tier 1 — In-Browser Canvas API & WebAssembly (Default):</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  For standard everyday compression, images are decoded and re-encoded directly within the client browser utilizing hardware-accelerated Canvas APIs. WebP, JPEG, and PNG conversions happen with zero round-trip latency, ensuring 100% privacy and full offline capability.
                </p>
              </li>
              <li>
                <strong>Tier 2 — Ephemeral RAM Sharp/libvips Processing (Advanced & Batch):</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  For specialized batch exports, multi-image ZIP bundling, and deep perceptual AI analysis, workloads stream through non-blocking Node.js memory buffers backed by Sharp and Google Gemini Vision heuristics. Files are never persisted to disk.
                </p>
              </li>
            </ol>
          </div>

          {/* Format Transcoding Matrix preview */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Supported Codecs & Transcoding Matrix
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive support across WebP, AVIF, JPEG, PNG, SVG, and legacy formats
                </p>
              </div>
              {onOpenCodecs && (
                <button
                  onClick={onOpenCodecs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 transition-colors cursor-pointer"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>View Interactive Codec Matrix</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Heuristic AI & Content-Aware Engine */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Content-Aware Heuristic Inspection
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Automated classification without manual guesswork
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-2">
            <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Step 1: Entropy & Variance
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shannon Entropy Profiling</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Analyzes bits per pixel and color distribution standard deviation to differentiate natural photographic gradients from flat UI illustrations.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-2">
            <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Step 2: Alpha Detection
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transparency Preservation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detects translucent pixels and transparent alpha channels, automatically safeguarding logos and badges from being flattened to black JPEG backgrounds.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-2">
            <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Step 3: Convergence
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Target Size Convergence</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Executes a binary search stepping algorithm over quantization tables to converge on exact user-defined kilobyte targets without excessive blurring.
            </p>
          </div>
        </div>
      </section>

      {/* Creator & Contact */}
      <section className="border-t border-slate-200 dark:border-slate-800 pt-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Creator & Open Innovation
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          ZakPix AI was conceived and crafted by <strong className="text-slate-900 dark:text-white">Abdul Razak Shaikh</strong>, a full-stack engineer and designer passionate about high-efficiency web architectures, image processing algorithms, and accessible software engineering.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href="https://arshaikh.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            <span>Visit Portfolio (arshaikh.vercel.app)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <a
            href="mailto:abdulsk.design@gmail.com"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span>abdulsk.design@gmail.com</span>
          </a>

          <a
            href="https://github.com/zakspace/zakpix"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
};
