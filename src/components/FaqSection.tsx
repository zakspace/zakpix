/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Which image formats can I compress and convert?',
      a: 'ZakPix AI decodes JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF, BMP, and HEIC/HEIF containers. Output transcoding is fully supported for WebP, AVIF, JPEG, PNG, GIF, and TIFF using Sharp and libvips runtime bindings.',
    },
    {
      q: 'What is the difference between Lossless and Lossy compression?',
      a: 'Lossless compression mathematically shrinks file size without modifying a single pixel (100% bit-exact). Lossy compression selectively reduces high-frequency spatial color details that human vision cannot detect, yielding 70-85% size reductions with zero perceptible difference.',
    },
    {
      q: 'How does Target File Size mode work?',
      a: 'Instead of guessing a quality slider, you enter your target in kilobytes (e.g., 200 KB). ZakPix AI executes a multi-pass binary search across quantization matrices to converge on the highest visual fidelity that stays under your ceiling.',
    },
    {
      q: 'Are my images stored on the server?',
      a: 'No. Files are held strictly in ephemeral RAM buffers during compression and immediately garbage-collected upon response completion. We also offer a Browser Canvas engine for 100% client-local offline processing.',
    },
    {
      q: 'How does the AI Content Inspection work?',
      a: 'The engine examines color channel standard deviation, entropy bits, edge frequency, and alpha channel presence to identify whether an image is a Photograph, Screenshot, Document Scan, or Graphic Logo. An optional Gemini 2.5 Flash model can be activated with your consent for perceptual artifact evaluation.',
    },
  ];

  return (
    <section id="faq" className="py-12 border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Answers to common questions regarding formats, compression safety, and AI heuristics
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden shadow-sm">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
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
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
