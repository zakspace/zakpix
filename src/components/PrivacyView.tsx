/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Lock, HardDrive, Cookie, Megaphone, Mail, ExternalLink, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface PrivacyViewProps {
  onNavigateHome: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-up">
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
        <span className="text-xs font-medium text-slate-500">Legal & Privacy</span>
      </div>

      {/* Header Banner */}
      <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Privacy Policy & Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Privacy Policy for ZakPix AI
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          At ZakPix AI (<a href="https://zakpix.vercel.app/" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">https://zakpix.vercel.app/</a>), accessible from web browsers worldwide, user privacy and data security are foundational principles. This Privacy Policy details how images and information are handled when you use our platform.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
          <span>Effective Date: November 22, 2026</span>
          <span>·</span>
          <span>Scope: Global (GDPR, CCPA & Google AdSense Compliant)</span>
        </div>
      </div>

      {/* Key Guarantees Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>100% In-Browser Execution</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Standard image optimization executes locally in your browser memory via the HTML5 Canvas API. Your source files never traverse the Internet.
          </p>
        </div>

        <div className="rounded-xl border border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-950/20 p-4">
          <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300 font-semibold text-xs mb-1">
            <HardDrive className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
            <span>Zero Permanent File Storage</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We do not store, archive, index, or retain your images. Any optional server memory buffers are instantly purged upon request delivery.
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold text-xs mb-1">
            <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>No Account Required</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ZakPix AI operates entirely anonymously. We do not demand sign-ups, passwords, email captures, or payment card details.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {/* Section 1: Image Processing & Storage */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-mono font-bold">1</span>
            <span>Image Processing & Ephemeral Storage Architecture</span>
          </h2>
          <p>
            ZakPix AI is built from the ground up as a privacy-preserving image optimization utility. When you drag and drop or upload files to ZakPix AI:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>
              <strong>Client-Side Processing:</strong> Image resizing, re-encoding (WebP, JPEG, PNG, SVG), metadata stripping, and visual heuristic analysis execute natively on your device via the HTML5 Canvas API and WebAssembly.
            </li>
            <li>
              <strong>Temporary Server Buffers:</strong> If you explicitly trigger optional server-assisted features (such as batch ZIP archive bundling or deep Gemini AI vision inspection), image buffers are processed exclusively in volatile random-access memory (RAM).
            </li>
            <li>
              <strong>No Permanent Storage:</strong> Images, EXIF metadata, and generated files are <em>never</em> written to hard drives, databases, or cloud storage buckets. As soon as the payload response is returned to your browser, all memory allocations are freed and deleted.
            </li>
          </ul>
        </section>

        {/* Section 2: Hosting and Request Logs */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-mono font-bold">2</span>
            <span>Standard Request & Hosting Telemetry</span>
          </h2>
          <p>
            Like virtually all modern web applications hosted on global content delivery networks (Vercel), standard non-personally-identifying server request data may be recorded in operational diagnostic logs. This data includes:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>Internet Protocol (IP) addresses (for DDoS defense and rate-limiting)</li>
            <li>Browser type and user-agent details</li>
            <li>Date, time stamp, and HTTP referring/exit URLs</li>
            <li>Request bandwidth and HTTP response status codes</li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This operational data is used exclusively to maintain site availability, defend against automated bot exploitation, and diagnose server latency. It is not connected to any personal identity.
          </p>
        </section>

        {/* Section 3: Cookies & Local Storage */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-mono font-bold">3</span>
            <span>Cookies and Local Storage</span>
          </h2>
          <p>
            ZakPix AI uses standard browser <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">localStorage</code> strictly to store your chosen UI preferences, notably your dark or light theme preference (<code className="font-mono text-xs px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">zakpix-theme</code>) and your selected default compression mode. We do not use first-party tracking cookies to build user browsing profiles.
          </p>
        </section>

        {/* Section 4: Google AdSense Advertising Disclosures */}
        <section className="space-y-3 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/10 p-6">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-base">
            <Megaphone className="h-5 w-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Google AdSense & Third-Party Advertising Disclosures
            </h2>
          </div>
          <p className="text-slate-700 dark:text-slate-300">
            ZakPix AI displays advertising to support the ongoing development, hosting, and free availability of our compression platform. In compliance with Google AdSense program policies, please review the following disclosures regarding how advertising partners manage data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            <li>
              <strong>Third-Party Vendors & Cookies:</strong> Third-party vendors, including Google, use cookies to serve advertisements based on a user&apos;s prior visits to this website (<a href="https://zakpix.vercel.app/" className="text-primary-600 dark:text-primary-400 underline">https://zakpix.vercel.app/</a>) or other websites across the Internet.
            </li>
            <li>
              <strong>Google Advertising Cookies:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visits to our site and/or other sites on the web.
            </li>
            <li>
              <strong>Opting Out of Personalized Advertising:</strong> You have the right and ability to disable personalized advertising at any time. You may opt out of personalized advertising by visiting:
              <div className="mt-2 pl-2">
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Google Ads Settings (https://adssettings.google.com/)</span>
                </a>
              </div>
            </li>
            <li>
              <strong>Third-Party Network Opt-Out:</strong> Alternatively, you may opt out of third-party vendors&apos; use of cookies for personalized advertising by visiting the Digital Advertising Alliance Consumer Choice tool:
              <div className="mt-2 pl-2">
                <a
                  href="https://optout.aboutads.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>aboutads.info Consumer Choice Page (https://optout.aboutads.info/)</span>
                </a>
              </div>
            </li>
          </ul>
        </section>

        {/* Section 5: Security & SVG Sanitization */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-mono font-bold">4</span>
            <span>File Sanitization & Client Security</span>
          </h2>
          <p>
            To protect users from malicious payloads, ZakPix AI executes automated sanitization on all SVG uploads, stripping embedded <code className="font-mono text-xs px-1 rounded bg-slate-100 dark:bg-slate-800">&lt;script&gt;</code> tags, inline Javascript event handlers (<code className="font-mono text-xs px-1 rounded bg-slate-100 dark:bg-slate-800">onload</code>, <code className="font-mono text-xs px-1 rounded bg-slate-100 dark:bg-slate-800">onclick</code>), and remote iframe references. Furthermore, pixel dimension limits (maximum 16,384px and 100 Megapixels) strictly prevent decompression bomb attacks from harming client systems.
          </p>
        </section>

        {/* Section 6: Contact Information */}
        <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span>Contact Information & Inquiries</span>
          </h2>
          <p>
            If you have questions, feedback, or concerns regarding this Privacy Policy or the handling of data on ZakPix AI, please contact the maintainer directly:
          </p>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white">Abdul Razak Shaikh</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Creator & Lead Engineer of ZakPix AI</p>
            <p className="text-xs">
              Direct Email:{' '}
              <a
                href="mailto:abdulsk.design@gmail.com"
                className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                abdulsk.design@gmail.com
              </a>
            </p>
            <p className="text-xs">
              Portfolio & Contact:{' '}
              <a
                href="https://arshaikh.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
              >
                https://arshaikh.vercel.app/
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
