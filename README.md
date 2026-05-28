# Códigø Animate

Turn any static image into a short cinematic video — like Runway, powered by Google Veo (Gemini API).

## Features

- Drag-and-drop image upload
- Free-form motion prompt + one-tap presets (zoom, pan, parallax, orbit, cinematic, wind, dolly)
- Aspect ratio (16:9 / 9:16 / 1:1) and Veo model selector (Veo 3.1 preview / Veo 3.0 stable)
- Live render status with operation polling
- MP4 download
- Local gallery (IndexedDB) with re-playable history

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to a key with Veo access
3. Start the dev server: `npm run dev`
4. Open http://localhost:3000

## How it works

`src/services/veoService.ts` calls `ai.models.generateVideos` with the uploaded image (base64) and prompt, polls the long-running operation until `done`, then downloads the rendered MP4 from the operation's video URI.

Generated videos are persisted as Blobs in IndexedDB; metadata (prompt, thumbnail, settings) lives in `localStorage` under `codigo-animate:gallery`.
