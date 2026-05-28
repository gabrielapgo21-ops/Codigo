# Códigø Animate

Turn any static image into a cinematic short video — **100% free, runs entirely in your browser**. No API keys, no servers, no login.

## What it does

Renders procedural camera motion over your image using `<canvas>` and exports the result as a real video file via `MediaRecorder`.

## Motion presets

- **Zoom in / Zoom out** — slow cinematic zoom
- **Pan left / Pan right** — horizontal camera drift
- **Ken Burns** — zoom + diagonal pan
- **Orbit** — subtle circular drift
- **Dolly in** — strong push toward subject
- **Gentle sway** — soft back-and-forth motion

Plus duration (2-12s), intensity slider, aspect ratio (16:9 / 9:16 / 1:1), vignette and film grain effects.

## Other features

- Drag-and-drop image upload (PNG / JPG / WebP)
- Live render progress
- One-click video download (MP4 where supported, falls back to WebM)
- Local gallery: videos persisted in IndexedDB, metadata in localStorage

## Run locally

Prerequisites: Node.js 20+

```bash
npm install
npm run dev
```

Open http://localhost:3000.

No `.env` file needed. No API keys to configure.

## How it works

`src/services/motionRenderer.ts` runs a 30 FPS canvas loop, applying eased transforms per frame, then captures the canvas stream with `MediaRecorder` and returns a single video Blob. Optional vignette and film grain are composited on top.

Gallery storage: video Blobs live in IndexedDB (`codigo-animate` DB, `videos` store); metadata in `localStorage` under `codigo-animate:gallery`.
