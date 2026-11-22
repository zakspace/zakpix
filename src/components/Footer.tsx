/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Sparkles, ExternalLink, Mail, Heart, Cpu, FileCheck } from 'lucide-react';

interface FooterProps {
  onOpenCodecs?: () => void;
  onOpenTests?: () => void;
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCodecs,
  onOpenTests,
  onNavigate,
}) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="flex items-center gap-2 group cursor-pointer inline-flex"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 border border-primary-500/20 text-white p-1 transition-transform group-hover:scale-105">
                <svg width="40" height="40" viewBox="0 0 375 366" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M356.331 17.8266L356.332 17.8278C362.168 23.5264 366.595 30.0992 369.622 37.1226L369.779 37.4874L370.046 38.1248C372.971 45.1584 374.59 52.8358 374.59 60.8666V60.8678C374.59 68.8883 372.976 76.5581 370.055 83.5866L369.754 84.3021L369.633 84.5862C366.605 91.6186 362.175 98.2016 356.332 103.907L106.348 347.977C82.1024 371.649 42.4301 371.649 18.1843 347.977V347.976C-6.06144 324.303 -6.06144 285.571 18.1843 261.898L161.744 121.733H62.7936C28.505 121.733 0.452484 94.345 0.452484 60.8678V60.8666C0.452484 27.3894 28.505 0 62.7936 0H312.249C320.486 0 328.362 1.58464 335.576 4.45056L336.115 4.66688L336.602 4.86528C343.783 7.81952 350.503 12.137 356.331 17.8266Z" fill="white"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M312.25 365.696C277.776 365.696 249.909 338.488 249.909 304.829C249.909 271.171 277.776 243.963 312.25 243.963C346.724 243.963 374.591 271.171 374.591 304.829C374.591 338.488 346.724 365.696 312.25 365.696Z" fill="#EEF2FF"></path>
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                <span className="text-primary-600 dark:text-primary-400 font-semibold">ZAK</span>
                <span className="text-slate-600 dark:text-slate-300 font-normal">Pix AI</span>
              </span>
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Production-grade image compression, modern format transcoding, and perceptual tuning engine powered by client-side Canvas and Sharp/libvips pipelines.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100% In-Browser & Ephemeral RAM Processing</span>
            </div>
          </div>

          {/* Column 2: Navigation & Tools */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/"
                  onClick={(e) => handleLinkClick(e, '/')}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Image Compression Tool
                </a>
              </li>
              <li>
                <a
                  href="/#guide"
                  onClick={(e) => {
                    if (window.location.pathname !== '/') {
                      handleLinkClick(e, '/#guide');
                    }
                  }}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Optimization Guide & FAQ
                </a>
              </li>
              {onOpenCodecs && (
                <li>
                  <button
                    onClick={onOpenCodecs}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer text-left"
                  >
                    Codec Compatibility Matrix
                  </button>
                </li>
              )}
              {onOpenTests && (
                <li>
                  <button
                    onClick={onOpenTests}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer text-left"
                  >
                    Client Security Test Suite
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Legal & Architecture */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Resources & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleLinkClick(e, '/about')}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  About ZakPix AI
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleLinkClick(e, '/privacy')}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Privacy Policy & Disclosures
                </a>
              </li>
              <li>
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                >
                  Google Ads Settings
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://optout.aboutads.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                >
                  AdChoices / aboutads.info
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Author */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Contact & Creator
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="mailto:abdulsk.design@gmail.com"
                  className="inline-flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-slate-700 dark:text-slate-300 font-medium"
                >
                  <Mail className="h-3.5 w-3.5 text-primary-500" />
                  <span>abdulsk.design@gmail.com</span>
                </a>
              </li>
              {/* <li className="pt-1">
                <span className="text-slate-500 dark:text-slate-400">Created by:</span>{' '}
                <a
                  href="https://arshaikh.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 dark:text-white font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1 underline underline-offset-4 decoration-primary-500/40"
                >
                  Abdul Razak Shaikh
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              </li> */}
              <li>
                <a
                  href="https://github.com/zakspace/zakpix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                >
                  GitHub Repository
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} (<a href="https://zakpix.vercel.app/" className="hover:underline">ZakPix AI</a>). All rights reserved.
          </p>

          <p className="flex items-center gap-1">
            Built with precision by{' '}
            <a
              href="https://arshaikh.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors underline underline-offset-2 decoration-primary-500/40"
            >
              Abdul Razak Shaikh
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
