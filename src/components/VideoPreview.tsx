import React from 'react';
import { Download, Film, Loader2 } from 'lucide-react';
import { GenerationStatus } from '../types';

interface Props {
  status: GenerationStatus;
  statusMessage?: string;
  videoUrl: string | null;
  errorMessage?: string | null;
  fileName?: string;
}

function StatusPanel({
  status,
  statusMessage,
}: {
  status: GenerationStatus;
  statusMessage?: string;
}) {
  const isBusy =
    status === 'queued' || status === 'rendering' || status === 'downloading';
  return (
    <div className="aspect-video w-full bg-zinc-900/60 border border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 text-center px-6">
      {isBusy ? (
        <>
          <Loader2 size={36} className="text-violet-400 animate-spin" />
          <div>
            <p className="text-zinc-100 font-semibold">
              {statusMessage ?? 'Working...'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Veo image-to-video typically takes 1–3 minutes.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center">
            <Film size={26} className="text-zinc-500" />
          </div>
          <p className="text-zinc-500 text-sm">
            Your animated video will appear here.
          </p>
        </>
      )}
    </div>
  );
}

export default function VideoPreview({
  status,
  statusMessage,
  videoUrl,
  errorMessage,
  fileName = 'animated.mp4',
}: Props) {
  return (
    <div className="space-y-3">
      {videoUrl && status === 'done' ? (
        <div className="rounded-3xl overflow-hidden bg-black border border-zinc-800">
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-auto max-h-[520px]"
          />
        </div>
      ) : (
        <StatusPanel status={status} statusMessage={statusMessage} />
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-800 bg-rose-950/40 text-rose-200 px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      {videoUrl && status === 'done' && (
        <div className="flex items-center justify-end">
          <a
            href={videoUrl}
            download={fileName}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 transition"
          >
            <Download size={16} /> Download MP4
          </a>
        </div>
      )}
    </div>
  );
}
