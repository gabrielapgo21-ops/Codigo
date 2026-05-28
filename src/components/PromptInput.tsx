import React from 'react';
import { Wand2 } from 'lucide-react';
import { AspectRatio, MotionPreset } from '../types';

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'zoom-in',
    label: 'Zoom in',
    emoji: '🔍',
    prompt: 'Slow cinematic zoom into the subject, gentle depth of field, smooth camera dolly.',
  },
  {
    id: 'pan-left',
    label: 'Pan left',
    emoji: '⬅️',
    prompt: 'Steady horizontal camera pan to the left, revealing the scene with subtle parallax.',
  },
  {
    id: 'pan-right',
    label: 'Pan right',
    emoji: '➡️',
    prompt: 'Steady horizontal camera pan to the right, revealing the scene with subtle parallax.',
  },
  {
    id: 'parallax',
    label: 'Parallax 3D',
    emoji: '🎞️',
    prompt: '2.5D parallax effect, foreground and background separate, soft camera drift.',
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    emoji: '🎬',
    prompt: 'Cinematic slow motion with shallow depth of field, dramatic lighting, film grain.',
  },
  {
    id: 'wind',
    label: 'Wind & flow',
    emoji: '🍃',
    prompt: 'Gentle wind moves through hair, fabric, leaves and water — natural living motion.',
  },
  {
    id: 'orbit',
    label: 'Orbit',
    emoji: '🪐',
    prompt: 'Camera orbits slowly around the subject keeping it centered, cinematic framing.',
  },
  {
    id: 'dolly-out',
    label: 'Dolly out',
    emoji: '🎥',
    prompt: 'Smooth dolly-out reveal pulling the camera back to expose more of the scene.',
  },
];

interface Props {
  prompt: string;
  onPromptChange: (v: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (v: string) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (v: AspectRatio) => void;
  model: string;
  onModelChange: (v: string) => void;
  disabled?: boolean;
}

const ASPECTS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: '16 : 9' },
  { value: '9:16', label: '9 : 16' },
  { value: '1:1', label: '1 : 1' },
];

const MODELS = [
  { value: 'veo-3.1-generate-preview', label: 'Veo 3.1 (preview)' },
  { value: 'veo-3.0-generate-001', label: 'Veo 3.0 (stable)' },
];

export default function PromptInput({
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  aspectRatio,
  onAspectRatioChange,
  model,
  onModelChange,
  disabled,
}: Props) {
  const applyPreset = (p: MotionPreset) => {
    onPromptChange(prompt ? `${prompt.trim()} ${p.prompt}` : p.prompt);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
          <Wand2 size={14} /> Describe the motion
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="A slow cinematic zoom into the subject while leaves rustle in the breeze..."
          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-zinc-100 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none disabled:opacity-50"
        />
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
          Motion presets
        </div>
        <div className="flex flex-wrap gap-2">
          {MOTION_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 text-xs rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition disabled:opacity-50"
            >
              <span className="mr-1.5">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            Model
          </div>
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            disabled={disabled}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 disabled:opacity-50"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <details className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <summary className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-400 cursor-pointer select-none hover:text-zinc-200">
          Advanced · negative prompt
        </summary>
        <div className="px-4 pb-4">
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => onNegativePromptChange(e.target.value)}
            disabled={disabled}
            placeholder="blurry, distorted, low quality, extra fingers..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
          />
        </div>
      </details>
    </div>
  );
}
