/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Check, AlertCircle, Cpu, Layers } from 'lucide-react';
import { CodecCapability } from '../types/compression.js';

interface FormatMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  codecs: CodecCapability[];
}

export const FormatMatrixModal: React.FC<FormatMatrixModalProps> = ({
  isOpen,
  onClose,
  codecs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Format Matrix &amp; Codec Support</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Capabilities of the Browser Canvas API encoding pipeline
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

        {/* Content Table */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Every format is audited against what the Canvas API can actually decode and encode. Features like alpha transparency and lossless output are reported honestly, without simulated fallbacks.
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-3 text-center">Decode (Input)</th>
                  <th className="py-3 px-3 text-center">Encode (Output)</th>
                  <th className="py-3 px-3 text-center">Lossless</th>
                  <th className="py-3 px-3 text-center">Alpha / Transparency</th>
                  <th className="py-3 px-3 text-center">Animation</th>
                  <th className="py-3 px-4">Notes & Capabilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300">
                {codecs.map((c) => (
                  <tr key={c.format} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{c.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{c.extensions.join(', .')}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {c.input ? (
                        <span className="inline-flex items-center text-primary-600 dark:text-primary-400">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-slate-400 dark:text-slate-600">
                          <X className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {c.output ? (
                        <span className="inline-flex items-center text-primary-600 dark:text-primary-400">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-500" title="Input only">
                          <AlertCircle className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {c.losslessSupport ? (
                        <span className="text-primary-600 dark:text-primary-400 font-medium">Yes</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Lossy</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {c.transparencySupport ? (
                        <span className="text-primary-600 dark:text-primary-400 font-medium">Yes</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">No</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {c.animationSupport ? (
                        <span className="text-primary-600 dark:text-primary-400 font-medium">Multi-frame</span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Static</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {c.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Engine: Browser Canvas API</span>
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
