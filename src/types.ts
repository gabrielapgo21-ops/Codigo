export type AspectRatio = '16:9' | '9:16' | '1:1';

export type GenerationStatus = 'idle' | 'rendering' | 'encoding' | 'done' | 'error';

export interface SourceImage {
  base64: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}

export type MotionId =
  | 'zoom-in'
  | 'zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'ken-burns'
  | 'orbit'
  | 'dolly-in'
  | 'sway';

export interface MotionPreset {
  id: MotionId;
  label: string;
  emoji: string;
  description: string;
}

export interface RenderOptions {
  motion: MotionId;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  fps: number;
  intensity: number;
  vignette: boolean;
  grain: boolean;
}

export interface GenerationRecord {
  id: string;
  createdAt: number;
  motion: MotionId;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  intensity: number;
  thumbnailDataUrl: string;
  videoMimeType: string;
}
