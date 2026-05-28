import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { AspectRatio, GenerationRecord, GenerationStatus, MotionId, SourceImage } from './types';
import ImageUploader from './components/ImageUploader';
import MotionControls from './components/MotionControls';
import VideoStage from './components/VideoStage';
import Gallery from './components/Gallery';
import { renderMotionVideo } from './services/motionRenderer';
import { saveGeneration } from './services/galleryStore';

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const [image, setImage] = useState<SourceImage | null>(null);
  const [motion, setMotion] = useState<MotionId>('ken-burns');
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [intensity, setIntensity] = useState(0.8);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [vignette, setVignette] = useState(true);
  const [grain, setGrain] = useState(false);

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
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

  const busy = status === 'rendering' || status === 'encoding';
  const canRender = !!image && !busy;

  const handleRender = async () => {
    if (!image || busy) return;
    setErrorMessage(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setStatus('rendering');
    setProgress(0);

    try {
      const blob = await renderMotionVideo(
        image,
        {
          motion,
          durationSeconds,
          aspectRatio,
          fps: 30,
          intensity,
          vignette,
          grain,
        },
        {
          onProgress: (p) => {
            setProgress(p.frame / p.totalFrames);
            if (p.phase === 'encoding' && status !== 'encoding') {
              setStatus('encoding');
            }
          },
        },
      );

      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setStatus('done');
      setProgress(1);

      const record: GenerationRecord = {
        id: randomId(),
        createdAt: Date.now(),
        motion,
        durationSeconds,
        aspectRatio,
        intensity,
        thumbnailDataUrl: image.dataUrl,
        videoMimeType: blob.type || 'video/webm',
      };
      await saveGeneration(record, blob);
      setGalleryKey((k) => k + 1);
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      setErrorMessage(e?.message ?? 'Could not render the animation.');
    }
  };

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
                Image → Video · runs in your browser · 100% free
              </p>
            </div>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            No API · No login
          </span>
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
                    {image.width}×{image.height}
                  </span>
                )}
              </div>
              <ImageUploader image={image} onChange={setImage} />
            </div>

            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-5 md:p-6 space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                2 · Motion
              </h2>
              <MotionControls
                motion={motion}
                onMotionChange={setMotion}
                durationSeconds={durationSeconds}
                onDurationChange={setDurationSeconds}
                intensity={intensity}
                onIntensityChange={setIntensity}
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                vignette={vignette}
                onVignetteChange={setVignette}
                grain={grain}
                onGrainChange={setGrain}
                disabled={busy}
              />
            </div>

            <button
              type="button"
              onClick={handleRender}
              disabled={!canRender}
              className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {busy ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {status === 'encoding'
                    ? 'Encoding...'
                    : `Rendering... ${Math.round(progress * 100)}%`}
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
              <VideoStage
                status={status}
                progress={progress}
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
          Everything runs in your browser — no servers, no API keys, no cost.
        </footer>
      </div>
    </div>
  );
}
