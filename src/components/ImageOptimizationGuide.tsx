/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  Layers,
  Gauge,
  TrendingUp,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  FileImage,
  Zap,
  Globe2,
  Sparkles,
} from 'lucide-react';

export const ImageOptimizationGuide: React.FC = () => {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'formats' | 'quality' | 'vitals'>('formats');

  const faqs = [
    {
      q: 'Which image formats should I use for modern websites?',
      a: 'WebP is today’s universal sweet spot, boasting 97%+ browser support with 25-35% smaller file sizes than JPEG and full alpha transparency support. For bleeding-edge performance, AVIF provides an additional 20-30% byte reduction beyond WebP, especially for photography and high dynamic range content. As a best practice, serve WebP or AVIF with fallback to JPEG or PNG via the HTML5 <picture> element.',
    },
    {
      q: 'What is the optimal quality setting for web images?',
      a: 'For WebP and JPEG, quality between 75% and 82% is the perceptual sweet spot. In this range, psychoacoustic and visual frequency algorithms eliminate imperceptible high-frequency noise, yielding a 65-80% file size reduction. Setting quality above 85% doubles the file size with virtually zero perceptible improvement to the human eye on standard displays.',
    },
    {
      q: 'How does image compression improve Core Web Vitals (CWV) and Google SEO?',
      a: 'Images typically account for 60-70% of total webpage payload. Heavy uncompressed hero images are the primary cause of poor Largest Contentful Paint (LCP) scores (> 2.5s). Compressing images and transcoding them to WebP/AVIF slashes download and decode times, moving LCP into Google’s green zone (< 1.2s), directly improving your PageSpeed scores and mobile search rankings.',
    },
    {
      q: 'How does ZakPix AI protect my privacy during compression?',
      a: 'Standard compression and metadata stripping execute 100% locally on your computer or mobile device inside your browser memory using the HTML5 Canvas API and WebAssembly. Your images never leave your machine or traverse the network. Optional server features (such as ZIP batch bundling or deep Gemini Vision heuristics) process strictly in ephemeral RAM and never write files to permanent storage.',
    },
    {
      q: 'What is the difference between Lossy and Lossless compression?',
      a: 'Lossless compression mathematically shrinks file size without modifying a single pixel (100% bit-exact). It is ideal for logos, screenshots, and vector graphics with hard edges. Lossy compression selectively reduces high-frequency spatial color details that human vision cannot detect, yielding 70-85% size reductions with zero perceptible difference for photographic imagery.',
    },
    {
      q: 'How does Target File Size (KB) mode work?',
      a: 'Instead of manually guessing a quality percentage slider, you specify an exact target size (e.g. 200 KB). ZakPix AI runs an iterative binary-search stepping algorithm over Canvas re-encodes, converging on the highest possible visual quality that remains strictly under your target byte ceiling.',
    },
    {
      q: 'Can I compress animated GIFs or vector SVGs?',
      a: 'Yes. For SVGs, ZakPix AI sanitizes dangerous script tags, strips inline event handlers, and minifies XML text without degrading vector quality. For animated GIFs, we recommend transcoding to modern animated WebP, which cuts file size by up to 80% while retaining full 24-bit color and smooth frame rates.',
    },
  ];

  return (
    <section id="guide" className="py-16 border-t border-slate-200 dark:border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Developer Reference &amp; Performance Manual</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Image Optimization Guide &amp; FAQ
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Master modern format trade-offs, perceptual compression science, and Core Web Vitals to build lightning-fast web experiences.
          </p>
        </div>

        {/* Tab Controls for the 3 Guide Modules */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('formats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'formats'
                  ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileImage className="h-4 w-4" />
              <span>Format Trade-offs (WebP / AVIF / JPEG / PNG)</span>
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'quality'
                  ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Gauge className="h-4 w-4" />
              <span>Quality vs. File Size</span>
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'vitals'
                  ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Core Web Vitals &amp; SEO</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Format Trade-offs */}
        {activeTab === 'formats' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* WebP Card */}
              <div className="rounded-2xl border border-primary-500/30 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Recommended Default
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 uppercase">Modern Standard</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">WebP</h3>
                </div>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Compression:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Lossy &amp; Lossless</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Alpha Transparency:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Yes (8-bit)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Typical Savings:</span>
                    <span className="font-semibold text-primary-600 dark:text-primary-400">25% – 35% vs JPEG</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Browser Support:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">&gt; 97% Global</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  <strong>Best for:</strong> General web graphics, e-commerce product photos, and transparent assets. WebP offers the best balance of compression ratio and universal client compatibility.
                </p>
              </div>

              {/* AVIF Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
                <div>
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">Next-Gen Tech</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">AVIF</h3>
                </div>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Compression:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Lossy &amp; Lossless</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Alpha Transparency:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Yes (Full 12-bit)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Typical Savings:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">50% vs JPEG, 20% vs WebP</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Browser Support:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">~93% Modern</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  <strong>Best for:</strong> High-resolution hero banners, HDR photography, and bandwidth-constrained mobile apps. Unrivaled compression density with slightly higher encoding CPU time.
                </p>
              </div>

              {/* JPEG Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">Universal Legacy</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">JPEG / JPG</h3>
                </div>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Compression:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Lossy Only</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Alpha Transparency:</span>
                    <span className="font-semibold text-rose-500">No (Flattens)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Typical Savings:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Baseline Standard</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Browser Support:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% Universal</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  <strong>Best for:</strong> Safe universal fallback and legacy email clients. Excellent for complex photographic scenes when transparency is not required and broad compatibility is essential.
                </p>
              </div>

              {/* PNG Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">Pixel-Exact Lossless</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">PNG</h3>
                </div>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Compression:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Lossless (Deflate)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Alpha Transparency:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Yes (8 &amp; 16-bit)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Typical Savings:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Higher file size</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Browser Support:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% Universal</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  <strong>Best for:</strong> Screenshots, diagrammatic illustrations, logos, and UI assets with sharp edges and text where lossy compression artifacts would create visual blur.
                </p>
              </div>
            </div>

            {/* Strategic Summary Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-semibold">Pro Tip for Production Web Developers:</strong> Use HTML5 <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-primary-600 dark:text-primary-400">&lt;picture&gt;</code> element to deliver AVIF as primary, WebP as secondary, and JPEG/PNG as fallback. This guarantees that modern browsers receive the smallest possible payload without leaving older clients behind.
            </div>
          </div>
        )}

        {/* Tab 2: Quality vs. File Size */}
        {activeTab === 'quality' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle className="h-5 w-5" />
                  <span>The Sweet Spot (75% – 82%)</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Maximum Perceptual Efficiency</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  In this range, psychovisual quantization removes high-frequency spatial frequencies that human rod and cone photoreceptors cannot perceive. File size drops by <strong>70% to 80%</strong> with zero perceptible loss.
                </p>
                <div className="pt-2 text-[11px] font-mono text-emerald-800 dark:text-emerald-400">
                  Recommended for: 95% of web photographs, marketing pages, and hero banners.
                </div>
              </div>

              <div className="rounded-2xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20 p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                  <AlertCircle className="h-5 w-5" />
                  <span>The Byte Cliff (85% – 100%)</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Diminishing Returns</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bumping quality from 80% to 95% can more than <strong>double or triple the file size</strong> (e.g. 150 KB jumps to 480 KB) for an imperceptible 1% increase in visual clarity on standard retina displays.
                </p>
                <div className="pt-2 text-[11px] font-mono text-amber-800 dark:text-amber-400">
                  Caveat: Causes high bounce rates on 4G/5G mobile connections.
                </div>
              </div>

              <div className="rounded-2xl border border-blue-300 dark:border-blue-800/60 bg-blue-50/30 dark:bg-blue-950/20 p-6 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  <Gauge className="h-5 w-5" />
                  <span>Target Size Mode</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Binary Search Convergence</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Instead of guessing a quality slider, define a hard budget (e.g. 200 KB). ZakPix AI iteratively re-encodes via Canvas to find the highest possible fidelity that meets your exact constraint.
                </p>
                <div className="pt-2 text-[11px] font-mono text-blue-800 dark:text-blue-400">
                  Ideal for: Strict advertising specifications and performance budgets.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Core Web Vitals & SEO */}
        {activeTab === 'vitals' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-bold">
                  LCP
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Largest Contentful Paint</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  LCP measures when the largest visual element on screen (typically the hero image or banner) completes rendering. Optimizing an uncompressed 2.8 MB image down to an 85 KB WebP cuts LCP from 4.2 seconds down to 0.8 seconds, achieving Google&apos;s &quot;Good&quot; score.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
                  CLS
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Cumulative Layout Shift</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  When images lack explicit dimensions or take seconds to download, surrounding text and buttons violently shift down the screen. ZakPix AI preserves intrinsic pixel dimensions and aspect ratios so browsers reserve layout space immediately.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold">
                  SEO
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Google Mobile Search Ranking</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Page experience is an official Google ranking signal. Sites that pass Core Web Vitals receive preferential ranking in mobile search results and enjoy lower bounce rates, higher ad conversion rates, and superior user retention.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Accordion Section */}
        <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <HelpCircle className="h-4 w-4" />
              <span>Got Questions?</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Technical answers regarding format conversion, client security, and compression algorithms
            </p>
          </div>

          <div className="max-w-4xl mx-auto divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden shadow-sm">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="transition-colors">
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-primary-600 dark:text-primary-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
