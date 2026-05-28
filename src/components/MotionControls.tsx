import React from 'react';
import { AspectRatio, MotionId, MotionPreset } from '../types';

export const MOTION_PRESETS: MotionPreset[] = [
  { id: 'zoom-in', label: 'Zoom in', emoji: '🔍', description: 'Slow cinematic zoom in' },
  { id: 'zoom-out', label: 'Zoom out', emoji: '🔭', description: 'Pull back reveal' },
  { id: 'pan-left', label: 'Pan left', emoji: '⬅️', description: 'Camera drifts left' },
  { id: 'pan-right', label: 'Pan right', emoji: '➡️', description: 'Camera drifts right' },
  { id: 'ken-burns', label: 'Ken Burns', emoji: '🎞️', description: 'Zoom + diagonal pan' },
  { id: 'orbit', label: 'Orbit', emoji: '🪐', description: 'Subtle circular drift' },
  { id: 'dolly-in', label: 'Dolly in', emoji: '🎥', description: 'Strong push toward subject' },
  { id: 'sway', label: 'Gentle sway', emoji: '🍃', description: 'Soft back-and-forth motion' },
];

interface Props {
  motion: MotionId;
  onMotionChange: (id: MotionId) => void;
  durationSeconds: number;
  onDurationChange: (v: number) => void;
  intensity: number;
  onIntensityChange: (v: number) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (v: AspectRatio) => void;
  vignette: boolean;
  onVignetteChange: (v: boolean) => void;
  grain: boolean;
  onGrainChange: (v: boolean) => void;
  disabled?: boolean;
}

const ASPECTS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: '16 : 9' },
  { value: '9:16', label: '9 : 16' },
  { value: '1:1', label: '1 : 1' },
];

export default function MotionControls({
  motion,
  onMotionChange,
  durationSeconds,
  onDurationChange,
  intensity,
  onIntensityChange,
  aspectRatio,
  onAspectRatioChange,
  vignette,
  onVignetteChange,
  grain,
  onGrainChange,
  disabled,
}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
          Motion preset
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MOTION_PRESETS.map((p) => {
            const active = p.id === motion;
            return (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                onClick={() => onMotionChange(p.id)}
                className={`px-3 py-3 rounded-2xl border text-left transition disabled:opacity-50 ${
                  active
                    ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 border-violet-400 text-white shadow-lg shadow-violet-500/30'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 text-zinc-200'
                }`}
              >
                <div className="text-xl">{p.emoji}</div>
                <div className="text-xs font-semibold mt-1">{p.label}</div>
                <div className={`text-[10px] mt-0.5 leading-tight ${active ? 'text-violet-100' : 'text-zinc-500'}`}>
                  {p.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            <span>Duration</span>
            <span className="text-violet-300 font-mono normal-case tracking-normal">
              {durationSeconds.toFixed(1)}s
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={12}
            step={0.5}
            value={durationSeconds}
            disabled={disabled}
            onChange={(e) => onDurationChange(parseFloat(e.target.value))}
            className="w-full accent-violet-500 disabled:opacity-50"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            <span>Intensity</span>
            <span className="text-violet-300 font-mono normal-case tracking-normal">
              {Math.round(intensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={1.5}
            step={0.05}
            value={intensity}
            disabled={disabled}
            onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
            className="w-full accent-violet-500 disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
          Aspect ratio
        </div>
        <div className="grid grid-cols-3 gap-1.5 bg-zinc-900/60 border border-zinc-800 p-1 rounded-xl">
          {ASPECTS.map((a) => (
            <button
              key={a.value}
              type="button"
              disabled={disabled}
              onClick={() => onAspectRatioChange(a.value)}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                aspectRatio === a.value
                  ? 'bg-violet-600 text-white shadow shadow-violet-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              } disabled:opacity-50`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <label className="flex-1 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:border-zinc-600">
          <span className="text-sm text-zinc-200">Vignette</span>
          <input
            type="checkbox"
            checked={vignette}
            disabled={disabled}
            onChange={(e) => onVignetteChange(e.target.checked)}
            className="w-4 h-4 accent-violet-500"
          />
        </label>
        <label className="flex-1 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer hover:border-zinc-600">
          <span className="text-sm text-zinc-200">Film grain</span>
          <input
            type="checkbox"
            checked={grain}
            disabled={disabled}
            onChange={(e) => onGrainChange(e.target.checked)}
            className="w-4 h-4 accent-violet-500"
          />
        </label>
      </div>
    </div>
  );
}
