import { AspectRatio, MotionId, RenderOptions, SourceImage } from '../types';

export interface RenderProgress {
  frame: number;
  totalFrames: number;
  phase: 'rendering' | 'encoding';
}

export interface RenderCallbacks {
  onProgress?: (progress: RenderProgress) => void;
}

const ASPECT_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '1:1': { width: 1024, height: 1024 },
};

function pickMimeType(): string {
  const candidates = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return 'video/webm';
}

function easeInOut(t: number): number {
  return t * t * (3 - 2 * t);
}

interface Transform {
  scale: number;
  tx: number;
  ty: number;
}

function transformAt(motion: MotionId, t: number, intensity: number): Transform {
  const e = easeInOut(t);
  const amp = intensity;
  switch (motion) {
    case 'zoom-in':
      return { scale: 1 + 0.35 * amp * e, tx: 0, ty: 0 };
    case 'zoom-out':
      return { scale: 1 + 0.35 * amp * (1 - e), tx: 0, ty: 0 };
    case 'pan-left':
      return { scale: 1.15, tx: 0.12 * amp * e, ty: 0 };
    case 'pan-right':
      return { scale: 1.15, tx: -0.12 * amp * e, ty: 0 };
    case 'ken-burns':
      return {
        scale: 1 + 0.25 * amp * e,
        tx: -0.08 * amp * e,
        ty: -0.05 * amp * e,
      };
    case 'orbit': {
      const angle = e * Math.PI * 2;
      return {
        scale: 1.18,
        tx: Math.cos(angle) * 0.05 * amp,
        ty: Math.sin(angle) * 0.05 * amp,
      };
    }
    case 'dolly-in':
      return { scale: 1 + 0.55 * amp * e, tx: 0, ty: -0.04 * amp * e };
    case 'sway': {
      const sway = Math.sin(t * Math.PI * 2);
      return {
        scale: 1.1,
        tx: sway * 0.05 * amp,
        ty: Math.cos(t * Math.PI * 2) * 0.025 * amp,
      };
    }
  }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  motion: MotionId,
  t: number,
  options: RenderOptions,
  grainCanvas: HTMLCanvasElement | null,
) {
  const transform = transformAt(motion, t, options.intensity);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  const imgAspect = image.width / image.height;
  const canvasAspect = width / height;

  let baseW: number;
  let baseH: number;
  if (imgAspect > canvasAspect) {
    baseH = height;
    baseW = height * imgAspect;
  } else {
    baseW = width;
    baseH = width / imgAspect;
  }

  const scale = transform.scale;
  const drawW = baseW * scale;
  const drawH = baseH * scale;
  const dx = (width - drawW) / 2 + transform.tx * width;
  const dy = (height - drawH) / 2 + transform.ty * height;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, dx, dy, drawW, drawH);

  if (options.vignette) {
    const radius = Math.hypot(width, height) / 2;
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      radius * 0.55,
      width / 2,
      height / 2,
      radius,
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  if (options.grain && grainCanvas) {
    ctx.globalAlpha = 0.08;
    const offsetX = Math.floor(Math.random() * (grainCanvas.width - width));
    const offsetY = Math.floor(Math.random() * (grainCanvas.height - height));
    ctx.drawImage(
      grainCanvas,
      offsetX,
      offsetY,
      width,
      height,
      0,
      0,
      width,
      height,
    );
    ctx.globalAlpha = 1;
  }
}

function buildGrainCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d')!;
  const data = ctx.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 120 + Math.random() * 100;
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image.'));
    img.src = dataUrl;
  });
}

export async function renderMotionVideo(
  source: SourceImage,
  options: RenderOptions,
  callbacks: RenderCallbacks = {},
): Promise<Blob> {
  const { width, height } = ASPECT_DIMENSIONS[options.aspectRatio];
  const fps = options.fps;
  const totalFrames = Math.max(1, Math.round(options.durationSeconds * fps));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D context unavailable.');

  const image = await loadImage(source.dataUrl);
  const grainCanvas = options.grain ? buildGrainCanvas(width, height) : null;

  if (typeof MediaRecorder === 'undefined') {
    throw new Error('Your browser does not support MediaRecorder.');
  }

  const stream = (canvas as HTMLCanvasElement).captureStream(fps);
  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = (e: any) =>
      reject(e?.error ?? new Error('Recorder failed.'));
  });

  recorder.start();

  drawFrame(ctx, image, width, height, options.motion, 0, options, grainCanvas);
  await new Promise((r) => setTimeout(r, 1000 / fps));

  for (let i = 1; i < totalFrames; i++) {
    const t = i / (totalFrames - 1);
    drawFrame(ctx, image, width, height, options.motion, t, options, grainCanvas);
    callbacks.onProgress?.({ frame: i, totalFrames, phase: 'rendering' });
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  callbacks.onProgress?.({ frame: totalFrames, totalFrames, phase: 'encoding' });
  recorder.stop();

  return stopped;
}
