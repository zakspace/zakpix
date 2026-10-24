// server.ts
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import JSZip from "jszip";

// src/server/formatRegistry.ts
import sharp from "sharp";
var STANDARD_CODECS = {
  jpeg: {
    format: "jpeg",
    name: "JPEG / JPG / JFIF",
    extensions: ["jpg", "jpeg", "jfif", "pjpeg"],
    mimeType: "image/jpeg",
    losslessSupport: false,
    transparencySupport: false,
    animationSupport: false,
    multiPageSupport: false,
    metadataSupport: true,
    notes: "Universal compatibility. Lossy compression only, no alpha channel."
  },
  png: {
    format: "png",
    name: "PNG (Portable Network Graphics)",
    extensions: ["png"],
    mimeType: "image/png",
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: false,
    multiPageSupport: false,
    metadataSupport: true,
    notes: "Deflate-based lossless compression. Full 8-bit alpha transparency."
  },
  webp: {
    format: "webp",
    name: "WebP",
    extensions: ["webp"],
    mimeType: "image/webp",
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: true,
    multiPageSupport: false,
    metadataSupport: true,
    notes: "Modern web standard. Supports both lossy and lossless with alpha channel."
  },
  avif: {
    format: "avif",
    name: "AVIF (AV1 Image File Format)",
    extensions: ["avif"],
    mimeType: "image/avif",
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: true,
    multiPageSupport: false,
    metadataSupport: true,
    notes: "State-of-the-art compression efficiency. Excellent at low bitrates."
  },
  gif: {
    format: "gif",
    name: "GIF (Graphics Interchange Format)",
    extensions: ["gif"],
    mimeType: "image/gif",
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: true,
    multiPageSupport: false,
    metadataSupport: false,
    notes: "256-color palette. Universal animation support."
  },
  svg: {
    format: "svg",
    name: "SVG (Scalable Vector Graphics)",
    extensions: ["svg"],
    mimeType: "image/svg+xml",
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: true,
    multiPageSupport: false,
    metadataSupport: true,
    notes: "XML-based vector format. Scalable to any resolution without loss."
  },
  tiff: {
    format: "tiff",
    name: "TIFF (Tagged Image File Format)",
    extensions: ["tif", "tiff"],
    mimeType: "image/tiff",
    losslessSupport: true,
    transparencySupport: true,
    animationSupport: false,
    multiPageSupport: true,
    metadataSupport: true,
    notes: "Professional archival format with high bit-depth and multi-page support."
  },
  bmp: {
    format: "bmp",
    name: "BMP (Bitmap)",
    extensions: ["bmp"],
    mimeType: "image/bmp",
    losslessSupport: true,
    transparencySupport: false,
    animationSupport: false,
    multiPageSupport: false,
    metadataSupport: false,
    notes: "Uncompressed raster bitmap. Supported for conversion to modern formats."
  },
  heif: {
    format: "heif",
    name: "HEIF / HEIC",
    extensions: ["heic", "heif"],
    mimeType: "image/heif",
    losslessSupport: false,
    transparencySupport: true,
    animationSupport: false,
    multiPageSupport: true,
    metadataSupport: true,
    notes: "High Efficiency Image Container. Dependent on libheif codec."
  }
};
function sniffFormat(buffer) {
  if (buffer.length < 4) return null;
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
    return { format: "jpeg", mimeType: "image/jpeg" };
  }
  if (buffer.length >= 8 && buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71 && buffer[4] === 13 && buffer[5] === 10 && buffer[6] === 26 && buffer[7] === 10) {
    return { format: "png", mimeType: "image/png" };
  }
  if (buffer[0] === 71 && buffer[1] === 73 && buffer[2] === 70 && buffer[3] === 56) {
    return { format: "gif", mimeType: "image/gif" };
  }
  if (buffer.length >= 12 && buffer[0] === 82 && buffer[1] === 73 && buffer[2] === 70 && buffer[3] === 70 && buffer[8] === 87 && buffer[9] === 69 && buffer[10] === 66 && buffer[11] === 80) {
    return { format: "webp", mimeType: "image/webp" };
  }
  if (buffer[0] === 66 && buffer[1] === 77) {
    return { format: "bmp", mimeType: "image/bmp" };
  }
  if (buffer[0] === 73 && buffer[1] === 73 && buffer[2] === 42 && buffer[3] === 0 || buffer[0] === 77 && buffer[1] === 77 && buffer[2] === 0 && buffer[3] === 42) {
    return { format: "tiff", mimeType: "image/tiff" };
  }
  if (buffer.length >= 12) {
    const ftyp = buffer.toString("ascii", 4, 8);
    if (ftyp === "ftyp") {
      const brand = buffer.toString("ascii", 8, 12);
      if (brand.includes("avif") || brand.includes("avis")) {
        return { format: "avif", mimeType: "image/avif" };
      }
      if (brand.includes("heic") || brand.includes("mif1") || brand.includes("heif")) {
        return { format: "heif", mimeType: "image/heif" };
      }
    }
  }
  const snippet = buffer.subarray(0, Math.min(buffer.length, 512)).toString("utf8").trim();
  if (snippet.startsWith("<svg") || snippet.startsWith("<?xml") && snippet.includes("<svg")) {
    return { format: "svg", mimeType: "image/svg+xml" };
  }
  return null;
}
function getActiveCodecs() {
  const sharpFormats = sharp.format || {};
  const sharpVersions = sharp.versions || {};
  const codecs = Object.keys(STANDARD_CODECS).map((key) => {
    const base = STANDARD_CODECS[key];
    const sf = sharpFormats[key] || {};
    const inputSupported = sf.input?.buffer ?? (key === "svg" || key === "bmp");
    const outputSupported = sf.output?.buffer ?? false;
    return {
      ...base,
      input: Boolean(inputSupported),
      output: Boolean(outputSupported)
    };
  });
  return {
    sharpVersion: sharpVersions.sharp || "installed",
    vipsVersion: sharpVersions.vips || "installed",
    codecs
  };
}

// src/server/securityValidator.ts
var MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
var MAX_IMAGE_PIXELS = 1e8;
var MAX_DIMENSION_PX = 16384;
function sanitizeSvg(svgContent) {
  let cleaned = svgContent;
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  cleaned = cleaned.replace(/<!ENTITY\b[^>]*>/gi, "");
  cleaned = cleaned.replace(/<!DOCTYPE\b[^>]*>/gi, "");
  cleaned = cleaned.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");
  cleaned = cleaned.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
  cleaned = cleaned.replace(/(href|xlink:href|src)\s*=\s*["']\s*(?:javascript|data):[^"']*["']/gi, "");
  cleaned = cleaned.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, "");
  return cleaned.trim();
}
function validateImageBuffer(buffer, declaredMimeType) {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "Empty file buffer received." };
  }
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(buffer.length / 1024 / 1024).toFixed(1)} MB) exceeds the maximum allowed limit of 50 MB.`
    };
  }
  const sniffed = sniffFormat(buffer);
  if (!sniffed) {
    return {
      valid: false,
      error: "Unrecognized image format or corrupt file signature."
    };
  }
  if (sniffed.format === "svg") {
    const rawSvg = buffer.toString("utf8");
    const sanitized = sanitizeSvg(rawSvg);
    return {
      valid: true,
      sniffedFormat: "svg",
      sanitizedBuffer: Buffer.from(sanitized, "utf8")
    };
  }
  return {
    valid: true,
    sniffedFormat: sniffed.format,
    sanitizedBuffer: buffer
  };
}
function checkDimensionSafety(width, height) {
  if (!width || !height) return { safe: true };
  if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
    return {
      safe: false,
      error: `Image dimensions (${width}x${height}) exceed the safety boundary of ${MAX_DIMENSION_PX}px.`
    };
  }
  const totalPixels = width * height;
  if (totalPixels > MAX_IMAGE_PIXELS) {
    return {
      safe: false,
      error: `Total pixel count (${(totalPixels / 1e6).toFixed(1)} MP) exceeds the decompression limit of 100 MP.`
    };
  }
  return { safe: true };
}

// src/server/imageInspector.ts
import sharp2 from "sharp";
function calculateEntropyFromStats(stats) {
  let totalEntropy = 0;
  for (const channel of stats.channels) {
    const rawEntropy = channel.entropy;
    const channelEntropy = typeof rawEntropy === "number" ? rawEntropy : Math.min(8, Math.log2(1 + channel.stdev));
    totalEntropy += channelEntropy;
  }
  return Number((totalEntropy / stats.channels.length).toFixed(2));
}
function classifyImageType(stats, meta, hasAlpha) {
  if (meta.format === "svg") {
    return "logo_or_icon";
  }
  if (!stats) return "general";
  const avgStdev = stats.channels.reduce((acc, c) => acc + c.stdev, 0) / stats.channels.length;
  const entropy = calculateEntropyFromStats(stats);
  if (hasAlpha && entropy < 5) {
    return "logo_or_icon";
  }
  if (entropy < 4.2 && avgStdev < 30) {
    return "document_scan";
  }
  if (entropy >= 4 && entropy < 6.2 && avgStdev < 60) {
    return "screenshot";
  }
  if (entropy >= 4.5 && entropy < 6.8 && hasAlpha) {
    return "illustration";
  }
  if (entropy >= 5.8 || avgStdev >= 60) {
    return "photograph";
  }
  return "general";
}
async function inspectImageBuffer(buffer) {
  const sniffed = sniffFormat(buffer);
  const detectedFormat = sniffed?.format || "unknown";
  if (detectedFormat === "svg") {
    const text = buffer.toString("utf8");
    const widthMatch = text.match(/width=["'](\d+(?:\.\d+)?)["']/);
    const heightMatch = text.match(/height=["'](\d+(?:\.\d+)?)["']/);
    const viewBoxMatch = text.match(/viewBox=["'][\d\.\s,-]+["']/);
    const width = widthMatch ? parseFloat(widthMatch[1]) : 800;
    const height = heightMatch ? parseFloat(heightMatch[1]) : 600;
    return {
      format: "svg",
      width: Math.round(width),
      height: Math.round(height),
      space: "srgb",
      channels: 4,
      depth: "vector",
      density: 72,
      hasAlpha: true,
      isAnimated: text.includes("<animate") || text.includes("<animateTransform"),
      pageCount: 1,
      hasProfile: false,
      fileSizeBytes: buffer.length,
      mimeType: "image/svg+xml",
      detectedType: "logo_or_icon",
      entropy: 3.5,
      warnings: []
    };
  }
  const sharpInstance = sharp2(buffer, { failOn: "none", animated: true });
  const meta = await sharpInstance.metadata();
  const dimensionCheck = checkDimensionSafety(meta.width, meta.height);
  if (!dimensionCheck.safe) {
    throw new Error(dimensionCheck.error);
  }
  let stats = null;
  try {
    stats = await sharp2(buffer).stats();
  } catch (err) {
  }
  const hasAlpha = Boolean(meta.hasAlpha || meta.channels === 4 || meta.channels === 2);
  const isAnimated = Boolean(meta.pages && meta.pages > 1 || meta.pageHeight && meta.pageHeight > 0);
  const detectedType = classifyImageType(stats, meta, hasAlpha);
  const entropy = stats ? calculateEntropyFromStats(stats) : 5;
  const warnings = [];
  if (meta.orientation && meta.orientation > 1) {
    warnings.push(`EXIF orientation tag ${meta.orientation} detected; auto-rotation will be applied.`);
  }
  if (meta.icc) {
    warnings.push("Embedded ICC color profile detected.");
  }
  if (isAnimated) {
    warnings.push(`Multi-frame animated image detected (${meta.pages || "multiple"} frames).`);
  }
  if (hasAlpha) {
    warnings.push("Alpha transparency channel present.");
  }
  return {
    format: meta.format || detectedFormat,
    width: meta.width || 0,
    height: meta.pageHeight || meta.height || 0,
    space: meta.space || "srgb",
    channels: meta.channels || 3,
    depth: meta.depth || "uchar",
    density: meta.density,
    hasAlpha,
    isAnimated,
    pageCount: meta.pages || 1,
    hasProfile: Boolean(meta.icc),
    orientation: meta.orientation,
    fileSizeBytes: buffer.length,
    mimeType: sniffed?.mimeType || `image/${meta.format || "octet-stream"}`,
    detectedType,
    entropy,
    warnings
  };
}

// src/server/compressionEngine.ts
import sharp3 from "sharp";
var SOCIAL_PRESETS = {
  none: { fit: "inside" },
  instagram_post: { width: 1080, height: 1080, fit: "cover" },
  instagram_story: { width: 1080, height: 1920, fit: "cover" },
  twitter_header: { width: 1500, height: 500, fit: "cover" },
  twitter_post: { width: 1200, height: 675, fit: "cover" },
  linkedin_banner: { width: 1584, height: 396, fit: "cover" },
  facebook_post: { width: 1200, height: 630, fit: "cover" },
  youtube_thumbnail: { width: 1280, height: 720, fit: "cover" }
};
function minifySvgText(svg) {
  return svg.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
}
async function executeSharpPipeline(inputBuffer, targetFormat, effectiveQuality, options, isLossless, isAnimated, hasAlpha) {
  let pipeline = sharp3(inputBuffer, { failOn: "none", animated: isAnimated });
  pipeline = pipeline.rotate();
  if (options.resize?.preset && options.resize.preset !== "none") {
    const preset = SOCIAL_PRESETS[options.resize.preset];
    if (preset.width || preset.height) {
      pipeline = pipeline.resize({
        width: preset.width,
        height: preset.height,
        fit: preset.fit,
        background: { r: 255, g: 255, b: 255, alpha: hasAlpha ? 0 : 1 }
      });
    }
  } else if (options.resize?.width || options.resize?.height) {
    pipeline = pipeline.resize({
      width: options.resize.width || void 0,
      height: options.resize.height || void 0,
      fit: options.resize.fit || "inside",
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: hasAlpha ? 0 : 1 }
    });
  }
  if (!options.stripMetadata) {
    pipeline = pipeline.withMetadata();
  }
  const effort = options.effort ?? (options.mode === "max" ? 8 : 4);
  const chroma = options.chromaSubsampling ?? (options.mode === "ecommerce" ? "4:4:4" : "4:2:0");
  switch (targetFormat) {
    case "jpeg":
    case "jpg": {
      pipeline = pipeline.jpeg({
        quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
        progressive: true,
        chromaSubsampling: chroma,
        mozjpeg: true
      });
      break;
    }
    case "png": {
      if (isLossless) {
        pipeline = pipeline.png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          effort
        });
      } else {
        pipeline = pipeline.png({
          quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
          compressionLevel: 8,
          palette: true,
          effort
        });
      }
      break;
    }
    case "webp": {
      pipeline = pipeline.webp({
        quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
        lossless: isLossless,
        effort,
        smartSubsample: true
      });
      break;
    }
    case "avif": {
      pipeline = pipeline.avif({
        quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
        lossless: isLossless,
        effort: Math.min(6, effort),
        // AVIF effort 7-9 can be very slow
        chromaSubsampling: chroma
      });
      break;
    }
    case "gif": {
      pipeline = pipeline.gif({
        effort: Math.min(7, effort),
        reuse: true
      });
      break;
    }
    case "tiff": {
      pipeline = pipeline.tiff({
        quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
        compression: isLossless ? "deflate" : "jpeg"
      });
      break;
    }
    default: {
      pipeline = pipeline.webp({
        quality: Math.min(100, Math.max(1, Math.round(effectiveQuality))),
        effort
      });
    }
  }
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { buffer: data, info };
}
async function searchTargetSize(inputBuffer, targetFormat, targetSizeKB, options, isAnimated, hasAlpha) {
  const targetBytes = targetSizeKB * 1024;
  let low = 10;
  let high = 95;
  let bestBuffer = null;
  let bestInfo = null;
  let bestQuality = 80;
  for (let i = 0; i < 5; i++) {
    const mid = Math.round((low + high) / 2);
    const result = await executeSharpPipeline(
      inputBuffer,
      targetFormat,
      mid,
      options,
      false,
      isAnimated,
      hasAlpha
    );
    bestBuffer = result.buffer;
    bestInfo = result.info;
    bestQuality = mid;
    if (result.buffer.length <= targetBytes) {
      if (targetBytes - result.buffer.length < targetBytes * 0.08) {
        break;
      }
      low = mid + 1;
    } else {
      high = mid - 1;
    }
    if (low > high) break;
  }
  return {
    buffer: bestBuffer,
    info: bestInfo,
    finalQuality: bestQuality
  };
}
async function compressImage(inputBuffer, options) {
  const startTime = Date.now();
  const meta = await inspectImageBuffer(inputBuffer);
  const warnings = [];
  let targetFormat = "webp";
  if (options.targetFormat === "original") {
    targetFormat = meta.format || "webp";
  } else if (options.mode === "smart") {
    if (meta.format === "svg") {
      targetFormat = "svg";
    } else if (meta.hasAlpha) {
      targetFormat = "webp";
    } else if (meta.detectedType === "photograph") {
      targetFormat = "webp";
    } else if (meta.detectedType === "screenshot" || meta.detectedType === "document_scan") {
      targetFormat = "png";
    } else {
      targetFormat = "webp";
    }
  } else {
    targetFormat = options.targetFormat;
  }
  if (meta.hasAlpha && (targetFormat === "jpeg" || targetFormat === "jpg")) {
    warnings.push(
      "Target format JPEG does not support transparency. Transparent areas were rendered on a clean white background."
    );
  }
  if (meta.isAnimated && targetFormat !== "gif" && targetFormat !== "webp") {
    warnings.push(
      `Format ${targetFormat.toUpperCase()} does not support animation. Only the first frame was preserved.`
    );
  }
  if (meta.format === "svg" && targetFormat === "svg") {
    const sanitized = sanitizeSvg(inputBuffer.toString("utf8"));
    const minified = minifySvgText(sanitized);
    const outputBuffer = Buffer.from(minified, "utf8");
    const bytesSaved2 = Math.max(0, inputBuffer.length - outputBuffer.length);
    const percentageSaved2 = inputBuffer.length > 0 ? Number((bytesSaved2 / inputBuffer.length * 100).toFixed(1)) : 0;
    return {
      outputBuffer,
      result: {
        success: true,
        originalSizeBytes: inputBuffer.length,
        optimizedSizeBytes: outputBuffer.length,
        bytesSaved: bytesSaved2,
        percentageSaved: percentageSaved2,
        originalFormat: "svg",
        outputFormat: "svg",
        width: meta.width,
        height: meta.height,
        processingTimeMs: Date.now() - startTime,
        warnings
      }
    };
  }
  let effectiveQuality = options.quality ?? 80;
  let isLossless = options.mode === "lossless" || Boolean(options.lossless);
  switch (options.mode) {
    case "smart":
      if (meta.detectedType === "photograph") effectiveQuality = 82;
      else if (meta.detectedType === "screenshot") effectiveQuality = 85;
      else if (meta.detectedType === "logo_or_icon") effectiveQuality = 90;
      else effectiveQuality = 80;
      break;
    case "balanced":
      effectiveQuality = 80;
      break;
    case "max":
      effectiveQuality = 55;
      warnings.push("Maximum compression applied: minor visual artifacts may be visible on high-DPI displays.");
      break;
    case "lossless":
      isLossless = true;
      effectiveQuality = 100;
      break;
    case "web":
      effectiveQuality = 78;
      break;
    case "ecommerce":
      effectiveQuality = 88;
      break;
    case "social":
      effectiveQuality = 85;
      break;
    case "transparent":
      effectiveQuality = 82;
      break;
    case "custom":
      effectiveQuality = options.quality;
      break;
    default:
      effectiveQuality = options.quality || 80;
  }
  let finalOutputBuffer;
  let outputInfo;
  if (options.mode === "target_size" && options.targetSizeKB && options.targetSizeKB > 0) {
    const searchRes = await searchTargetSize(
      inputBuffer,
      targetFormat,
      options.targetSizeKB,
      options,
      meta.isAnimated,
      meta.hasAlpha
    );
    finalOutputBuffer = searchRes.buffer;
    outputInfo = searchRes.info;
    if (finalOutputBuffer.length > options.targetSizeKB * 1024 * 1.1) {
      warnings.push(
        `Target size of ${options.targetSizeKB} KB could not be achieved without excessive downsampling. Closest achievable size is ${(finalOutputBuffer.length / 1024).toFixed(1)} KB.`
      );
    }
  } else {
    const executed = await executeSharpPipeline(
      inputBuffer,
      targetFormat,
      effectiveQuality,
      options,
      isLossless,
      meta.isAnimated,
      meta.hasAlpha
    );
    finalOutputBuffer = executed.buffer;
    outputInfo = executed.info;
  }
  const bytesSaved = inputBuffer.length - finalOutputBuffer.length;
  const percentageSaved = inputBuffer.length > 0 ? Number((bytesSaved / inputBuffer.length * 100).toFixed(1)) : 0;
  if (bytesSaved < 0) {
    warnings.push(
      "The optimized file is slightly larger than the original due to format re-encoding. Keeping original format or lowering quality is recommended."
    );
  }
  return {
    outputBuffer: finalOutputBuffer,
    result: {
      success: true,
      originalSizeBytes: inputBuffer.length,
      optimizedSizeBytes: finalOutputBuffer.length,
      bytesSaved,
      percentageSaved,
      originalFormat: meta.format,
      outputFormat: targetFormat,
      width: outputInfo.width || meta.width,
      height: outputInfo.height || meta.height,
      processingTimeMs: Date.now() - startTime,
      warnings
    }
  };
}

// src/server/aiOptimizer.ts
import { GoogleGenAI } from "@google/genai";
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
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/codecs", (_req, res) => {
  try {
    const data = getActiveCodecs();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to inspect codecs", message: err?.message });
  }
});
app.post("/api/inspect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No image file uploaded." });
    }
    const validation = validateImageBuffer(req.file.buffer, req.file.mimetype);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    const buffer = validation.sanitizedBuffer || req.file.buffer;
    const metadata = await inspectImageBuffer(buffer);
    const initialAI = analyzeImageHeuristically(metadata);
    res.json({
      metadata,
      aiAnalysis: initialAI
    });
  } catch (err) {
    res.status(500).json({
      error: "Inspection failed",
      message: err?.message || "Internal processing error"
    });
  }
});
app.post("/api/compress", upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No image file provided." });
    }
    const validation = validateImageBuffer(req.file.buffer, req.file.mimetype);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    const buffer = validation.sanitizedBuffer || req.file.buffer;
    let options;
    try {
      options = req.body.options ? JSON.parse(req.body.options) : {
        mode: "smart",
        targetFormat: "original",
        quality: 80
      };
    } catch {
      options = {
        mode: "smart",
        targetFormat: "original",
        quality: 80
      };
    }
    const { result, outputBuffer } = await compressImage(buffer, options);
    const mimeType = result.outputFormat === "svg" ? "image/svg+xml" : `image/${result.outputFormat === "jpg" ? "jpeg" : result.outputFormat}`;
    const dataUrl = `data:${mimeType};base64,${outputBuffer.toString("base64")}`;
    res.json({
      ...result,
      dataUrl
    });
  } catch (err) {
    console.error("Compression error:", err);
    res.status(500).json({
      error: "Compression failed",
      message: err?.message || "Error occurred during image compression"
    });
  }
});
app.post("/api/ai-analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No image file provided for analysis." });
    }
    const buffer = req.file.buffer;
    const metadata = await inspectImageBuffer(buffer);
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
