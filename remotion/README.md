# VideoBilionario — Cinematic Remotion build

A production-grade [Remotion](https://remotion.dev) project that assembles a
~5-minute (307.6s / 9228-frame) mystery/finance video at **1920×1080, 30 fps**
from a set of images, 8 narration blocks, captions, a tension music bed and SFX.

Everything is driven by a single config file: **`src/timeline.ts`**. Swap an
image, re-time a scene, retarget a Ken Burns move, or toggle music/SFX from
there and the whole video follows.

---

## Quick start

```bash
cd remotion
npm install

# Generate placeholder media so it runs before your real assets arrive
# (labeled images, silent narration of the exact durations, drone, SFX, sample SRT)
npm run placeholders

# Open Remotion Studio (live preview / scrubbing)
npm run dev
```

Studio runs at http://localhost:3000 — open the **VideoBilionario** composition.

## Render the final master

```bash
npx remotion render VideoBilionario out/VIDEO01_REMOTION.mp4 --codec=h264 --crf=18
```

Output: `out/VIDEO01_REMOTION.mp4` — H.264, **yuv420p**, **CRF 18** (set in
`remotion.config.ts`). Also available as `npm run render`.

> **Headless Chrome note.** Remotion normally auto-downloads a Chrome Headless
> Shell on first render. If your environment blocks that download (or has no
> system Chrome), point Remotion at an existing headless shell:
> ```bash
> npx remotion render VideoBilionario out/VIDEO01_REMOTION.mp4 \
>   --codec=h264 --crf=18 \
>   --browser-executable=/path/to/chrome-headless-shell
> ```
> A full (non-headless) Chrome will fail with *"Old Headless mode has been
> removed"* — use the **headless shell** binary specifically.

---

## Replacing the placeholders with your real assets

Drop your real files into `public/` using these exact names/paths:

```
public/
  audio/
    00_hook.mp3  01_bloco1.mp3  02_bloco2.mp3  02b_produto1.mp3
    03_bloco3.mp3  03b_produto2.mp3  04_bloco4.mp3  05_cta.mp3
  imagens/
    cena_extra_carro_dirigindo.png  cena02_mansao.png  cena03_jato_documentos.png
    cena04_cctv_entrada.png  cena04b_cctv_investigacao.png  cena05_carro_abandonado.png
    cena06_quatro_passos.png  cena07_novo_passaporte.png  cena08_multidao.png
    cena09_gaiola_ouro.png  cena10_cafe_praia.png  cena11_endscreen.png
  music/tension.mp3          # optional — set ENABLE_MUSIC=false to disable
  sfx/boom.mp3  sfx/whoosh.mp3   # optional — set ENABLE_SFX=false to disable
  LEGENDAS_EN.srt            # your real captions (already synced to narration)
```

Images are used at 16:9; they're rendered with an 8% overscan so the Ken Burns
zoom/pan never reveals an edge. Re-render and you're done — no code changes.

> The 8 narration files are placed back-to-back at their exact start times so
> the voice timeline stays sample-accurate (preferred over the single combined
> `NARRACAO_COMPLETA.m4a`).

---

## How it's structured

```
src/
  index.ts            registerRoot
  Root.tsx            <Composition id="VideoBilionario" ...>
  timeline.ts         ⭐ single source of truth (scenes, audio, music, SFX, timing)
  Video.tsx           assembles visuals + grade + grain + letterbox + captions + audio
  lib/
    easing.ts         the one cinematic bezier used everywhere
    parseSrt.ts       dependency-free SRT parser
  components/
    KenBurnsImage.tsx smooth sub-pixel GPU Ken Burns
    dipToBlack.tsx    custom @remotion/transitions presentation
    ColorGrade.tsx    cold-shadow / warm-highlight grade + vignette
    FilmGrain.tsx     animated low-opacity grain
    Letterbox.tsx     subtle cinematic bars
    Captions.tsx      SRT captions: fade+rise, gold word highlight
    AudioMix.tsx      narration + ducked looped music + SFX
scripts/
  gen-placeholders.mjs  labeled placeholder images
  gen-audio.mjs         placeholder audio + SFX + sample SRT (via bundled ffmpeg)
```

### The Ken Burns fix (vs. the old jittery ffmpeg `zoompan`)
- Renders at 30 fps so **every frame moves** — no 4 fps stepping.
- Motion is a **sub-pixel CSS `transform: scale()/translate3d()`** on the GPU,
  not a per-frame pixel crop.
- **Subtle**: scale drifts only ~`1.0 → 1.06` (max 1.08).
- **Eased** with `Easing.bezier(0.33, 0, 0.2, 1)` (slow-in/slow-out), never linear.
- **Varied** per scene: alternating slow zoom-in / zoom-out and per-subject pan
  anchors (configured in `timeline.ts`).
- Image pre-scaled to **108%** so the move never reveals an edge.

### Transitions
0.6s crossfades between most scenes, **dip-to-black** at the major beats
(end of hook, identity reveal, "the method", the lesson) via a custom
`@remotion/transitions` presentation. A whoosh SFX is auto-placed on every dip.
Scene durations are padded by half of each adjacent transition so the visual
track stays **exactly** 9228 frames despite the crossfade overlaps.

### Audio mix
- Narration at full level, 8 blocks at exact start times.
- `tension.mp3` looped under everything at **0.12** (~−18 dB) with 4s in/out fades.
- Sub-bass **boom** at 0:30.5 and 2:09; **whoosh** on each dip-to-black.

Tune any of this in `src/timeline.ts` (`MUSIC`, `SFX`, `ENABLE_MUSIC`, `ENABLE_SFX`).

---

## Editing cheat-sheet (all in `src/timeline.ts`)

| I want to… | Change |
|---|---|
| Swap an image | the `image` field of a `SCENES[]` entry (filename in `public/imagens`) |
| Re-time a scene | its `startSec` / `endSec` |
| Change a camera move | the scene's `kenBurns` (`direction`, `anchorX/Y`, `zoom`) |
| Make a cut dip-to-black | set that scene's `transition: 'dip'` |
| Nudge caption sync | `CAPTION_OFFSET_SEC` |
| Turn off music / SFX | `ENABLE_MUSIC` / `ENABLE_SFX` |
| Change crossfade length | `CROSSFADE_FRAMES` / `DIP_FRAMES` |

## Scripts
| Script | Does |
|---|---|
| `npm run dev` | Remotion Studio |
| `npm run render` | render the final `out/VIDEO01_REMOTION.mp4` (CRF 18) |
| `npm run render:proof` | fast half-res proof render |
| `npm run placeholders` | regenerate placeholder media |
| `npm run lint` | `tsc --noEmit` typecheck |
