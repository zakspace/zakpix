/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, ShieldCheck, Cpu, Sun, Moon, Link, Github } from 'lucide-react';

interface NavbarProps {
  onOpenCodecs: () => void;
  onOpenTests: () => void;
  engine: 'server' | 'browser';
  onToggleEngine: () => void;
  queueCount: number;
  onProcessAll: () => void;
  isProcessing: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  githubUrl?: string; // Optional prop for your repository URL
  brandUrl?: string;  // Optional prop for your brand/home URL
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCodecs,
  onOpenTests,
  engine,
  onToggleEngine,
  queueCount,
  onProcessAll,
  isProcessing,
  theme,
  onToggleTheme,
  githubUrl = 'https://github.com/zakspace/zakpix',
  brandUrl = '#',
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark with link */}
        <a 
          href={brandUrl}
          className="flex items-center gap-2 shrink-0 group cursor-pointer focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 border border-primary-500/20 text-primary-600 dark:text-primary-400 p-1 transition-transform group-hover:scale-105">
            <svg width="375" height="366" viewBox="0 0 375 366" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M356.331 17.8266L356.332 17.8278C362.168 23.5264 366.595 30.0992 369.622 37.1226L369.779 37.4874L370.046 38.1248C372.971 45.1584 374.59 52.8358 374.59 60.8666V60.8678C374.59 68.8883 372.976 76.5581 370.055 83.5866L369.754 84.3021L369.633 84.5862C366.605 91.6186 362.175 98.2016 356.332 103.907L106.348 347.977C82.1024 371.649 42.4301 371.649 18.1843 347.977V347.976C-6.06144 324.303 -6.06144 285.571 18.1843 261.898L161.744 121.733H62.7936C28.505 121.733 0.452484 94.345 0.452484 60.8678V60.8666C0.452484 27.3894 28.505 0 62.7936 0H312.249C320.486 0 328.362 1.58464 335.576 4.45056L336.115 4.66688L336.602 4.86528C343.783 7.81952 350.503 12.137 356.331 17.8266Z" fill="white"></path> 
              <path fill-rule="evenodd" clip-rule="evenodd" d="M312.25 365.696C277.776 365.696 249.909 338.488 249.909 304.829C249.909 271.171 277.776 243.963 312.25 243.963C346.724 243.963 374.591 271.171 374.591 304.829C374.591 338.488 346.724 365.696 312.25 365.696Z" fill="#EEF2FF"></path>               
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            <span className="text-primary-600 dark:text-primary-400 font-semibold">ZAK</span>
            <span className="text-slate-600 dark:text-slate-300 font-normal">Pix</span>
          </span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={onOpenCodecs}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Cpu className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span>Format Matrix</span>
          </button>
          <button
            onClick={onOpenTests}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span>Test Suite</span>
          </button>
          <a
            href="#features"
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Architecture
          </a>
          <a
            href="#faq"
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            FAQ
          </a>
        </nav>

        {/* Zone 3: Engine selector, Theme toggle & Primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle theme"
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>

          {/* Subtle engine switch */}
          <button
            onClick={onToggleEngine}
            title={`Active Engine: ${engine === 'server' ? 'Sharp (libvips)' : 'Browser Canvas'}`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <span className="text-slate-400 dark:text-slate-500">Engine:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {engine === 'server' ? 'Sharp / libvips' : 'Browser Canvas'}
            </span>
          </button>

          {queueCount > 0 && (
            <button
              onClick={onProcessAll}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-white dark:text-slate-950 bg-primary-600 dark:bg-primary-500 hover:bg-primary-500 dark:hover:bg-primary-400 rounded-lg transition-colors whitespace-nowrap shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? 'Processing Queue...' : `Optimize All (${queueCount})`}
            </button>
          )}

          {/* GitHub Link */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repository"
            aria-label="GitHub Repository"
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Github className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          </a>
        </div>
      </div>
    </header>
  );
};