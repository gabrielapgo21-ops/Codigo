import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { SourceImage } from '../types';

interface Props {
  image: SourceImage | null;
  onChange: (image: SourceImage | null) => void;
}

function readImage(file: File): Promise<SourceImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] ?? '';
      const img = new Image();
      img.onload = () =>
        resolve({
          base64,
          mimeType: file.type || 'image/png',
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          name: file.name,
        });
      img.onerror = () => reject(new Error('Could not decode image.'));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageUploader({ image, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      setError(null);
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please pick an image file (PNG, JPG, WebP).');
        return;
      }
      try {
        const decoded = await readImage(file);
        onChange(decoded);
      } catch (e: any) {
        setError(e?.message ?? 'Could not read image.');
      }
    },
    [onChange],
  );

  if (image) {
    return (
      <div className="relative group rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950">
        <img
          src={image.dataUrl}
          alt={image.name}
          className="w-full h-auto max-h-[420px] object-contain"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
          <div className="text-xs text-zinc-300 font-mono truncate max-w-[70%]">
            {image.name} · {image.width}×{image.height}
          </div>
          <button
            onClick={() => onChange(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur"
          >
            <X size={14} /> Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`w-full rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 py-16 px-6 text-center ${
          dragging
            ? 'border-violet-400 bg-violet-500/10'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/40'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <ImageIcon size={26} className="text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-zinc-100 font-semibold">
            Drop an image or click to upload
          </p>
          <p className="text-xs text-zinc-500">
            PNG · JPG · WebP — up to ~10MB
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-violet-300 mt-2">
          <Upload size={14} /> Choose file
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && (
        <p className="mt-3 text-sm text-rose-400">{error}</p>
      )}
    </div>
  );
}
