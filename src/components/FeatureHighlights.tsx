/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, ShieldCheck, Zap, Split, FileCheck2, Sparkles } from 'lucide-react';

export const FeatureHighlights: React.FC = () => {
  const features = [
    {
      icon: Cpu,
      title: 'Real Libvips & Sharp Engine',
      description:
        'Powered by high-performance C++ image processing bindings. Zero simulated numbers or fake compression statistics.',
    },
    {
      icon: Sparkles,
      title: 'Content-Aware AI Tuning',
      description:
        'Analyzes visual entropy, alpha channel distribution, and high-frequency textures to pick optimal quantization matrices.',
    },
    {
      icon: Split,
      title: 'Sub-Pixel Inspection Viewer',
      description:
        'Draggable split-slider and side-by-side comparison with up to 400% zoom and alpha transparency checkerboard.',
    },
    {
      icon: ShieldCheck,
      title: 'Decompression Bomb Guards',
      description:
        'Strict limits (100 MP / 16K px), sanitized SVG vectors, and zero permanent server storage for complete privacy.',
    },
    {
      icon: Zap,
      title: 'Target File Size Convergence',
      description:
        'Iterative binary search quality stepping achieves exact kilobyte targets without excessive blurring or guesswork.',
    },
    {
      icon: FileCheck2,
      title: 'Batch Optimization & ZIP Bundles',
      description:
        'Process queues with bounded concurrency and download complete bundles in a single compressed ZIP file.',
    },
  ];

  return (
    <section id="features" className="py-12 border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Engineered for Precision & Real Performance
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            A production-ready platform that combines native Node.js codecs with client-side fallback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-colors shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
