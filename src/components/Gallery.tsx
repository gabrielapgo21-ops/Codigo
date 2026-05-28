import React, { useEffect, useState } from 'react';
import { Clock, Play, Trash2, X } from 'lucide-react';
import { GenerationRecord } from '../types';
import { deleteGeneration, getVideoBlob, listGenerations } from '../services/galleryStore';
import { MOTION_PRESETS } from './MotionControls';

interface Props {
  refreshKey: number;
}

function formatTime(ms: number) {
  return new Date(ms).toLocaleString();
}

function motionLabel(id: string) {
  return MOTION_PRESETS.find((p) => p.id === id)?.label ?? id;
}

export default function Gallery({ refreshKey }: Props) {
  const [items, setItems] = useState<GenerationRecord[]>([]);
  const [active, setActive] = useState<{ url: string; record: GenerationRecord } | null>(
    null,
  );

  useEffect(() => {
    setItems(listGenerations());
  }, [refreshKey]);

  useEffect(() => {
    return () => {
      if (active?.url) URL.revokeObjectURL(active.url);
    };
  }, [active?.url]);

  const openItem = async (record: GenerationRecord) => {
    const blob = await getVideoBlob(record.id);
    if (!blob) return;
    if (active?.url) URL.revokeObjectURL(active.url);
    setActive({ url: URL.createObjectURL(blob), record });
  };

  const removeItem = async (id: string) => {
    await deleteGeneration(id);
    setItems(listGenerations());
    if (active?.record.id === id) {
      URL.revokeObjectURL(active.url);
      setActive(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-10 text-center">
        <Clock className="mx-auto text-zinc-600" size={22} />
        <p className="text-sm text-zinc-500 mt-2">
          Your animations will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((record) => (
          <div
            key={record.id}
            className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 transition"
          >
            <button
              type="button"
              onClick={() => openItem(record)}
              className="block w-full"
            >
              <img
                src={record.thumbnailDataUrl}
                alt={motionLabel(record.motion)}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Play size={28} className="text-white drop-shadow" />
              </div>
            </button>
            <div className="p-2.5">
              <p className="text-xs text-zinc-200 font-semibold">
                {motionLabel(record.motion)}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {record.durationSeconds.toFixed(1)}s · {record.aspectRatio}
              </p>
              <p className="text-[10px] text-zinc-600 mt-1">
                {formatTime(record.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(record.id);
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-zinc-300 hover:bg-rose-600 hover:text-white opacity-0 group-hover:opacity-100 transition"
              aria-label="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4"
          onClick={() => {
            URL.revokeObjectURL(active.url);
            setActive(null);
          }}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                URL.revokeObjectURL(active.url);
                setActive(null);
              }}
              className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:bg-zinc-800"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <video
              src={active.url}
              controls
              autoPlay
              loop
              playsInline
              className="w-full rounded-2xl bg-black"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
              <span>
                {motionLabel(active.record.motion)} · {active.record.aspectRatio} ·{' '}
                {active.record.durationSeconds.toFixed(1)}s
              </span>
              <a
                href={active.url}
                download={`animation-${active.record.id}.webm`}
                className="text-violet-300 hover:text-violet-200"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
