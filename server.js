// server.ts
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import JSZip from "jszip";

// src/server/aiOptimizer.ts
import { GoogleGenAI } from "@google/genai";

// src/utils/imageHeuristics.ts
function analyzeImageHeuristically(meta) {
  const reasons = [];
  const artifactRisks = [];
  let recommendedFormat = "webp";
  let recommendedMode = "smart";
  let recommendedQuality = 80;
  let visualComplexity = "medium";
  const entropy = meta.entropy ?? 5;
  if (entropy > 6.2) {
    visualComplexity = "high";
  } else if (entropy < 4.2) {
    visualComplexity = "low";
  }
  if (meta.hasAlpha) {
    reasons.push("Alpha transparency channel detected. Choosing alpha-capable container to avoid black background artifacts.");
    recommendedFormat = "webp";
    recommendedMode = "transparent";
  }
  if (meta.isAnimated) {
    reasons.push(`Animation with ${meta.pageCount ?? "multiple"} frames detected. Retaining animated frames in WebP format.`);
    recommendedFormat = "webp";
    artifactRisks.push("Converting animated image to static format will flatten frames into a single image.");
  }
  switch (meta.detectedType) {
    case "photograph":
      reasons.push("High color variation and texture entropy characteristic of photographic imagery.");
      recommendedFormat = "webp";
      recommendedQuality = 82;
      recommendedMode = "balanced";
      artifactRisks.push("Excessive compression may produce visible blockiness in gradients, sky, and shadow details.");
      break;
    case "screenshot":
      reasons.push("Crisp vector lines, text elements, and discrete UI boundaries detected.");
      recommendedFormat = meta.hasAlpha ? "png" : "webp";
      recommendedQuality = 88;
      artifactRisks.push("Lossy chroma subsampling (4:2:0) will blur subpixel text rendering. Recommended 4:4:4 or lossless PNG.");
      break;
    case "logo_or_icon":
      reasons.push("Flat geometric regions and limited color palette suitable for indexed palette optimization.");
      recommendedFormat = meta.format === "svg" ? "svg" : "png";
      recommendedQuality = 90;
      recommendedMode = "lossless";
      artifactRisks.push("Lossy JPEG ringing artifacts will severely degrade crisp logo outlines.");
      break;
    case "document_scan":
      reasons.push("High-contrast monochrome or near-monochrome document text detected.");
      recommendedFormat = "webp";
      recommendedQuality = 85;
      artifactRisks.push("Heavy compression will cause halos around typography and drop character legibility.");
      break;
    default:
      reasons.push("Balanced web asset profile applied.");
      recommendedFormat = "webp";
      recommendedQuality = 80;
  }
  if (meta.width > 2500 || meta.height > 2500) {
    reasons.push(`High resolution (${meta.width}x${meta.height}) may benefit from responsive downsampling for web delivery.`);
  }
  return {
    detectedCategory: meta.detectedType,
    confidence: 0.92,
    visualComplexity,
    recommendedFormat,
    recommendedMode,
    recommendedQuality,
    reasons,
    artifactRisks,
    geminiModelUsed: false
  };
}

// src/server/aiOptimizer.ts
async function analyzeWithGeminiVision(buffer, meta, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return analyzeImageHeuristically(meta);
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = buffer.toString("base64");
    const prompt = `You are a professional image compression engineer and color scientist.
Analyze this image and return a JSON object with:
{
  "detectedCategory": "photograph" | "screenshot" | "logo_or_icon" | "illustration" | "document_scan" | "general",
  "confidence": number between 0.5 and 1.0,
  "visualComplexity": "low" | "medium" | "high",
  "recommendedFormat": "webp" | "avif" | "jpeg" | "png" | "svg",
  "recommendedMode": "smart" | "balanced" | "max" | "lossless" | "ecommerce" | "web",
  "recommendedQuality": number between 40 and 95,
  "reasons": array of 2-3 concise factual observations explaining why this format and quality was chosen,
  "artifactRisks": array of 1-2 perceptual artifact risks if over-compressed (e.g. banding, ringing around text, chroma subsampling blur)
}
Return valid JSON only, no markdown markers or conversational preamble.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || "image/jpeg"
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return {
      detectedCategory: parsed.detectedCategory || meta.detectedType,
      confidence: parsed.confidence || 0.95,
      visualComplexity: parsed.visualComplexity || "medium",
      recommendedFormat: parsed.recommendedFormat || "webp",
      recommendedMode: parsed.recommendedMode || "smart",
      recommendedQuality: parsed.recommendedQuality || 82,
      reasons: parsed.reasons || ["Perceptually optimized with Gemini 2.5 Flash analysis."],
      artifactRisks: parsed.artifactRisks || ["Standard high-frequency noise risks."],
      geminiModelUsed: true
    };
  } catch (err) {
    console.warn("Gemini vision analysis failed or was skipped, falling back to local heuristics:", err);
    return analyzeImageHeuristically(meta);
  }
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var storage = multer.memoryStorage();
var upload = multer({
  storage,
  limits: {
    fileSize: 55 * 1024 * 1024,
    // 55 MB max
    files: 20
    // Max 20 concurrent files per batch
  }
});
app.use(express.json({ limit: "60mb" }));
app.use(express.urlencoded({ extended: true, limit: "60mb" }));
function buildDefaultMetadata(file) {
  return {
    format: (file.mimetype || "image/jpeg").replace("image/", ""),
    width: 0,
    height: 0,
    space: "srgb",
    channels: 3,
    hasAlpha: false,
    isAnimated: false,
    pageCount: 1,
    hasProfile: false,
    fileSizeBytes: file.size,
    mimeType: file.mimetype || "image/jpeg",
    detectedType: "general",
    entropy: 5
  };
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/ai-analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No image file provided for analysis." });
    }
    let metadata;
    try {
      metadata = req.body.metadata ? JSON.parse(req.body.metadata) : buildDefaultMetadata(req.file);
    } catch {
      metadata = buildDefaultMetadata(req.file);
    }
    const buffer = req.file.buffer;
    const useGemini = req.body.useGemini === "true" || req.body.useGemini === true;
    let analysis;
    if (useGemini) {
      analysis = await analyzeWithGeminiVision(buffer, metadata, req.file.mimetype);
    } else {
      analysis = analyzeImageHeuristically(metadata);
    }
    res.json({ analysis, metadata });
  } catch (err) {
    res.status(500).json({
      error: "AI Analysis failed",
      message: err?.message || "Could not analyze image"
    });
  }
});
app.post("/api/create-zip", async (req, res) => {
  try {
    const { items, zipName = "zakpix-optimized-images.zip" } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No files provided for ZIP generation." });
    }
    const zip = new JSZip();
    for (const item of items) {
      if (!item.name || !item.dataUrl) continue;
      const matches = item.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches[2]) {
        const fileBuffer = Buffer.from(matches[2], "base64");
        zip.file(item.name, fileBuffer);
      }
    }
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);
    res.send(zipBuffer);
  } catch (err) {
    res.status(500).json({
      error: "ZIP creation failed",
      message: err?.message || "Could not assemble ZIP archive"
    });
  }
});
async function startServer() {
  const distPath = path.resolve(__dirname, "dist");
  const distIndexExists = fs.existsSync(path.resolve(distPath, "index.html"));
  const isProd = process.env.NODE_ENV === "production" || distIndexExists;
  if (isProd && distIndexExists) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ZakPix AI Server running on port ${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
