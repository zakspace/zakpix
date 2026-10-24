/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import JSZip from 'jszip';
import {
  analyzeImageHeuristically,
  analyzeWithGeminiVision,
} from './src/server/aiOptimizer.js';
import { ImageMetadata } from './src/types/compression.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configure in-memory upload handling with 55MB limit
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 55 * 1024 * 1024, // 55 MB max
    files: 20, // Max 20 concurrent files per batch
  },
});

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Minimal metadata used when the client does not supply its own during AI analysis.
function buildDefaultMetadata(file: Express.Multer.File): ImageMetadata {
  return {
    format: (file.mimetype || 'image/jpeg').replace('image/', ''),
    width: 0,
    height: 0,
    space: 'srgb',
    channels: 3,
    hasAlpha: false,
    isAnimated: false,
    pageCount: 1,
    hasProfile: false,
    fileSizeBytes: file.size,
    mimeType: file.mimetype || 'image/jpeg',
    detectedType: 'general',
    entropy: 5.0,
  };
}

// Health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Deep AI analysis endpoint (Gemini Vision, with local heuristic fallback).
// Image compression & inspection now run entirely in the browser via the Canvas API,
// so the client sends its locally-computed metadata for the heuristic fallback.
app.post('/api/ai-analyze', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No image file provided for analysis.' });
    }

    let metadata: ImageMetadata;
    try {
      metadata = req.body.metadata ? JSON.parse(req.body.metadata) : buildDefaultMetadata(req.file);
    } catch {
      metadata = buildDefaultMetadata(req.file);
    }

    const buffer = req.file.buffer;
    const useGemini = req.body.useGemini === 'true' || req.body.useGemini === true;

    let analysis;
    if (useGemini) {
      analysis = await analyzeWithGeminiVision(buffer, metadata, req.file.mimetype);
    } else {
      analysis = analyzeImageHeuristically(metadata);
    }

    res.json({ analysis, metadata });
  } catch (err: any) {
    res.status(500).json({
      error: 'AI Analysis failed',
      message: err?.message || 'Could not analyze image',
    });
  }
});

// Create ZIP bundle for batch downloads
app.post('/api/create-zip', async (req: Request, res: Response) => {
  try {
    const { items, zipName = 'zakpix-optimized-images.zip' } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No files provided for ZIP generation.' });
    }

    const zip = new JSZip();

    for (const item of items) {
      if (!item.name || !item.dataUrl) continue;
      // Extract base64 payload
      const matches = item.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches[2]) {
        const fileBuffer = Buffer.from(matches[2], 'base64');
        zip.file(item.name, fileBuffer);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({
      error: 'ZIP creation failed',
      message: err?.message || 'Could not assemble ZIP archive',
    });
  }
});

// Serve frontend: Vite dev middlewares or production static files
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexExists = fs.existsSync(path.resolve(distPath, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || distIndexExists;

  if (isProd && distIndexExists) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZakPix AI Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
