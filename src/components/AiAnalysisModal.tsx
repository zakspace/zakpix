/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  Layers,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { FileQueueItem, AIAnalysisResult } from '../types/compression.js';
import { requestDeepAiAnalysis } from '../services/api.js';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileQueueItem | null;
  onApplyRecommendation: (item: FileQueueItem, analysis: AIAnalysisResult) => void;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  item,
  onApplyRecommendation,
}) => {
  const [isRunningGemini, setIsRunningGemini] = useState(false);
  const [analysisState, setAnalysisState] = useState<AIAnalysisResult | undefined>(
    item?.aiAnalysis
  );

  if (!isOpen || !item) return null;

  const currentAnalysis = analysisState || item.aiAnalysis;

  const handleRunGeminiScan = async () => {
    setIsRunningGemini(true);
    try {
      const res = await requestDeepAiAnalysis(item.file, true);
      setAnalysisState(res.analysis);
    } catch (err) {
      console.error('Gemini scan failed:', err);
    } finally {
      setIsRunningGemini(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">AI Content & Artifact Inspection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm sm:max-w-md">
                {item.name}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Classification & Entropy Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5">
              <span className="text-slate-500 text-xs block mb-1">Detected Class</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
                {currentAnalysis?.detectedCategory?.replace('_', ' ') || item.metadata?.detectedType || 'Unknown'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5">
              <span className="text-slate-500 text-xs block mb-1">Visual Complexity</span>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 capitalize">
                {currentAnalysis?.visualComplexity || 'Medium'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5">
              <span className="text-slate-500 text-xs block mb-1">Channel Entropy</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                {item.metadata?.entropy ?? 5.2} / 8.0 bits
              </span>
            </div>
          </div>

          {/* AI Strategy Recommendation */}
          <div className="rounded-xl border border-primary-500/30 bg-primary-50 dark:bg-primary-950/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recommended Strategy: {currentAnalysis?.recommendedFormat?.toUpperCase()} @ {currentAnalysis?.recommendedQuality}%
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Mode: <span className="text-primary-600 dark:text-primary-400 font-semibold capitalize">{currentAnalysis?.recommendedMode}</span>
            </p>

            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {currentAnalysis?.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Perceptual Artifact Risks */}
          {currentAnalysis?.artifactRisks && currentAnalysis.artifactRisks.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                  Perceptual Artifact Risks
                </h4>
              </div>
              <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200/90">
                {currentAnalysis.artifactRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500">·</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optional Gemini Vision Trigger */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 flex items-center justify-between gap-4">
            <div>
              <h5 className="text-xs font-semibold text-slate-900 dark:text-white">
                Deep Visual Inspection with Gemini 2.5 Flash
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Requires user consent. Evaluates subpixel text ringing, edge contrast, and dynamic highlights.
              </p>
            </div>
            <button
              onClick={handleRunGeminiScan}
              disabled={isRunningGemini}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRunningGemini ? 'animate-spin' : ''}`} />
              <span>{isRunningGemini ? 'Inspecting...' : 'Run Vision Scan'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-3.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {currentAnalysis?.geminiModelUsed ? 'Enhanced by Gemini Vision' : 'Deterministic Local Heuristics'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {currentAnalysis && (
              <button
                onClick={() => {
                  onApplyRecommendation(item, currentAnalysis);
                  onClose();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white dark:text-slate-950 bg-primary-600 dark:bg-primary-500 hover:bg-primary-500 dark:hover:bg-primary-400 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Apply Recommendation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
