import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { AspectRatio, GenerationRecord, GenerationStatus, SourceImage } from './types';
import ImageUploader from './components/ImageUploader';
import PromptInput from './components/PromptInput';
import VideoPreview from './components/VideoPreview';
import Gallery from './components/Gallery';
import { generateVideoFromImage } from './services/veoService';
import { saveGeneration } from './services/galleryStore';

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const [image, setImage] = useState<SourceImage | null>(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [model, setModel] = useState('veo-3.1-generate-preview');

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [galleryKey, setGalleryKey] = useState(0);

  const currentUrlRef = useRef<string | null>(null);
  useEffect(() => {
    currentUrlRef.current = videoUrl;
    return () => {
      if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);
    };
  }, [videoUrl]);

  const busy =
    status === 'queued' || status === 'rendering' || status === 'downloading';

  const handleGenerate = async () => {
    if (!image || !prompt.trim() || busy) return;
    setErrorMessage(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setStatus('queued');
    setStatusMessage('Preparing request...');

    try {
      const blob = await generateVideoFromImage(
        image,
        {
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          aspectRatio,
          model,
        },
        {
          onStatus: (s, msg) => {
            setStatus(s);
            setStatusMessage(msg);
          },
        },
      );

      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setStatus('done');
      setStatusMessage(undefined);

      const record: GenerationRecord = {
        id: randomId(),
        createdAt: Date.now(),
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        aspectRatio,
        model,
        thumbnailDataUrl: image.dataUrl,
        videoMimeType: blob.type || 'video/mp4',
      };
      await saveGeneration(record, blob);
      setGalleryKey((k) => k + 1);
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      setStatusMessage(undefined);
      setErrorMessage(e?.message ?? 'Something went wrong while generating the video.');
    }
  };

  const canGenerate = !!image && prompt.trim().length > 0 && !busy;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Códigø <span className="text-violet-400">Animate</span>
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1">
                Image → Video · powered by Veo
              </p>
            </div>
          </div>
          <a
            href="https://ai.google.dev/gemini-api/docs/video"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex text-xs text-zinc-500 hover:text-zinc-300"
          >
            About Veo →
          </a>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="space-y-6">
            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-5 md:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                  1 · Source image
                </h2>
                {image && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {(image.base64.length * 0.75 / 1024).toFixed(0)} KB
                  </span>
                )}
              </div>
              <ImageUploader image={image} onChange={setImage} />
            </div>

            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-5 md:p-6 space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                2 · Motion direction
              </h2>
              <PromptInput
                prompt={prompt}
                onPromptChange={setPrompt}
                negativePrompt={negativePrompt}
                onNegativePromptChange={setNegativePrompt}
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                model={model}
                onModelChange={setModel}
                disabled={busy}
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {busy ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {statusMessage ?? 'Rendering...'}
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Animate image
                </>
              )}
            </button>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-5 md:p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                3 · Result
              </h2>
              <VideoPreview
                status={status}
                statusMessage={statusMessage}
                videoUrl={videoUrl}
                errorMessage={errorMessage}
              />
            </div>

            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                  Gallery
                </h2>
                <span className="text-[10px] text-zinc-600 font-mono">
                  saved locally
                </span>
              </div>
              <Gallery refreshKey={galleryKey} />
            </div>
          </section>
        </div>

        <footer className="mt-10 text-center text-[11px] text-zinc-600">
          Generations use your <span className="font-mono">GEMINI_API_KEY</span>. Costs apply.
        </footer>
      </div>
    </div>
  );
}
