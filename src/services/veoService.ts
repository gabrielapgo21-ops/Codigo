import { GoogleGenAI } from '@google/genai';
import { GenerationOptions, GenerationStatus, SourceImage } from '../types';

const apiKey = process.env.GEMINI_API_KEY as string;
const ai = new GoogleGenAI({ apiKey });

export interface GenerateVideoCallbacks {
  onStatus?: (status: GenerationStatus, info?: string) => void;
}

export async function generateVideoFromImage(
  image: SourceImage,
  options: GenerationOptions,
  callbacks: GenerateVideoCallbacks = {},
): Promise<Blob> {
  const { onStatus } = callbacks;

  onStatus?.('queued', 'Submitting to Veo...');

  let operation = await ai.models.generateVideos({
    model: options.model,
    prompt: options.prompt,
    image: {
      imageBytes: image.base64,
      mimeType: image.mimeType,
    },
    config: {
      numberOfVideos: 1,
      aspectRatio: options.aspectRatio,
      ...(options.negativePrompt ? { negativePrompt: options.negativePrompt } : {}),
    },
  });

  onStatus?.('rendering', 'Veo is rendering your video...');

  while (!operation.done) {
    await new Promise((r) => setTimeout(r, 8000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const generated = operation.response?.generatedVideos?.[0];
  if (!generated?.video?.uri) {
    throw new Error('Veo returned no video URI.');
  }

  onStatus?.('downloading', 'Downloading rendered video...');

  const uri = generated.video.uri;
  const separator = uri.includes('?') ? '&' : '?';
  const url = `${uri}${separator}key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download video (${res.status}).`);
  }
  return res.blob();
}
