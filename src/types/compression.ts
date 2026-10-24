/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ImageFormat =
  | 'jpeg'
  | 'jpg'
  | 'png'
  | 'webp'
  | 'avif'
  | 'gif'
  | 'svg'
  | 'tiff'
  | 'bmp'
  | 'heif'
  | 'heic'
  | 'ico';

export type CompressionMode =
  | 'smart'
  | 'balanced'
  | 'max'
  | 'lossless'
  | 'target_size'
  | 'custom'
  | 'web'
  | 'social'
  | 'ecommerce'
  | 'transparent';

export type SocialPreset =
  | 'none'
  | 'instagram_post'    // 1080x1080
  | 'instagram_story'   // 1080x1920
  | 'twitter_header'    // 1500x500
  | 'twitter_post'      // 1200x675
  | 'linkedin_banner'   // 1584x396
  | 'facebook_post'     // 1200x630
  | 'youtube_thumbnail';// 1280x720

export type ImageCategory =
  | 'photograph'
  | 'screenshot'
  | 'logo_or_icon'
  | 'illustration'
  | 'document_scan'
  | 'general';

export interface CodecCapability {
  format: string;
  name: string;
  extensions: string[];
  mimeType: string;
  input: boolean;
  output: boolean;
  losslessSupport: boolean;
  transparencySupport: boolean;
  animationSupport: boolean;
  multiPageSupport: boolean;
  metadataSupport: boolean;
  notes?: string;
}

export interface ImageMetadata {
  format: string;
  width: number;
  height: number;
  space: string;
  channels: number;
  depth?: string;
  density?: number;
  hasAlpha: boolean;
  isAnimated: boolean;
  pageCount?: number;
  hasProfile: boolean;
  orientation?: number;
  fileSizeBytes: number;
  mimeType: string;
  detectedType: ImageCategory;
  entropy?: number;
  warnings?: string[];
}

export interface AIAnalysisResult {
  detectedCategory: ImageCategory;
  confidence: number;
  visualComplexity: 'low' | 'medium' | 'high';
  recommendedFormat: ImageFormat;
  recommendedMode: CompressionMode;
  recommendedQuality: number;
  reasons: string[];
  artifactRisks: string[];
  colorPaletteSummary?: {
    dominantColors: string[];
    hasBroadGamut: boolean;
  };
  geminiModelUsed?: boolean;
}

export interface CompressionOptions {
  mode: CompressionMode;
  targetFormat: 'original' | ImageFormat;
  quality: number; // 1-100
  targetSizeKB?: number;
  lossless?: boolean;
  stripMetadata?: boolean;
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'inside' | 'outside' | 'fill';
    preset?: SocialPreset;
  };
  effort?: number; // 1-9
  chromaSubsampling?: '4:4:4' | '4:2:0';
  preserveTransparency?: boolean;
}

export interface CompressionResult {
  success: boolean;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  bytesSaved: number;
  percentageSaved: number;
  originalFormat: string;
  outputFormat: string;
  width: number;
  height: number;
  processingTimeMs: number;
  dataUrl?: string;
  blobUrl?: string;
  downloadUrl?: string;
  warnings?: string[];
  error?: string;
}

export interface FileQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  status: 'idle' | 'inspecting' | 'ready' | 'processing' | 'done' | 'error';
  progress: number;
  metadata?: ImageMetadata;
  aiAnalysis?: AIAnalysisResult;
  options: CompressionOptions;
  result?: CompressionResult;
  errorMessage?: string;
}
