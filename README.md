# ZakPix AI — Image Compression & Optimization Platform

ZakPix AI is a production-ready, AI-powered image optimization and format conversion platform built with React, TypeScript, Vite, Tailwind CSS, Express, and Sharp with native libvips C++ bindings.

## Features

- **10 Compression Modes**: Smart AI, Balanced, Maximum Compression, Lossless, Target File Size (KB), Custom Manual, Web Optimized, Social Media Presets, E-Commerce, and Transparent Assets.
- **Format Support**: JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF, BMP, and HEIC/HEIF containers with magic byte sniffing.
- **Real-Time Interactive Comparison**: Split slider and side-by-side modes with 100%–400% zoom, pan, and transparency checkerboards.
- **Dual Processing Engines**:
  - **Server (Sharp / libvips)**: High-performance C++ image processing pipeline.
  - **Browser (Canvas / WASM)**: 100% offline client-local processing for private in-browser compression.
- **Light & Dark Theme**: Full theme support with system preference detection and manual toggle.
- **Batch Processing & ZIP Export**: Queue multiple files and download individual files or a single bundled ZIP archive.
- **Security**: 100 Megapixel decompression bomb limits, SVG script/entity sanitization, and ephemeral memory execution.

## Quick Start (Local Setup)

### Prerequisites

- Node.js 18 or higher (Node 20 or 22 recommended)
- npm, pnpm, or bun

### 1. Install Dependencies

```bash
npm install
```

### 2. Run in Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Run

To build both client and server:

```bash
npm run build
npm start
```

### 4. Run Automated Tests

```bash
npm test
```

## Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```
