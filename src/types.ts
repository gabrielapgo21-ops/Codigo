export type AspectRatio = '16:9' | '9:16' | '1:1';

export type GenerationStatus =
  | 'idle'
  | 'uploading'
  | 'queued'
  | 'rendering'
  | 'downloading'
  | 'done'
  | 'error';

export interface SourceImage {
  base64: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}

export interface GenerationOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  model: string;
}

export interface GenerationRecord {
  id: string;
  createdAt: number;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  model: string;
  thumbnailDataUrl: string;
  videoMimeType: string;
}

export interface MotionPreset {
  id: string;
  label: string;
  emoji: string;
  prompt: string;
}
