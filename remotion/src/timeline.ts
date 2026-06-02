/**
 * timeline.ts — the single source of truth for the whole video.
 *
 * Swap an image, re-time a scene, toggle music/SFX, or change a Ken Burns
 * move from here and everything downstream (visuals, audio, captions,
 * transitions, render duration) follows automatically.
 *
 * All times are in SECONDS. Frame math is derived from FPS.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Total video length in seconds — exactly the sum of the audio blocks. */
export const DURATION_SECONDS = 307.6;

export const secToFrames = (s: number) => Math.round(s * FPS);

// ---------------------------------------------------------------------------
// VISUAL SCENES (image cuts). Durations are derived from start/end.
// ---------------------------------------------------------------------------

export type KenBurns = {
  /** 'in' = slow push-in, 'out' = slow pull-out. */
  direction: 'in' | 'out';
  /** Pan anchor, normalized -1..1. (0,0) = center. Positive x = right, positive y = down. */
  anchorX: number;
  anchorY: number;
  /** Max scale reached during the move (subtle: 1.06, hard max 1.08). */
  zoom?: number;
};

export type Scene = {
  id: string;
  /** Basename in public/imagens (without extension). */
  image: string;
  startSec: number;
  endSec: number;
  kenBurns: KenBurns;
  /** Transition INTO this scene from the previous one. */
  transition: 'crossfade' | 'dip';
};

const Z = 1.06; // default subtle zoom target

export const SCENES: Scene[] = [
  // #1 — hook
  {id: 's1', image: 'cena_extra_carro_dirigindo', startSec: 0.0, endSec: 30.7,
    transition: 'crossfade', kenBurns: {direction: 'in', anchorX: 0.0, anchorY: 0.18, zoom: Z}},
  // #2 — mansion reveal (pull out)
  {id: 's2', image: 'cena02_mansao', startSec: 30.7, endSec: 53.55,
    transition: 'dip', kenBurns: {direction: 'out', anchorX: 0.0, anchorY: -0.05, zoom: Z}},
  // #3 — jet + documents
  {id: 's3', image: 'cena03_jato_documentos', startSec: 53.55, endSec: 76.4,
    transition: 'crossfade', kenBurns: {direction: 'in', anchorX: -0.2, anchorY: 0.1, zoom: Z}},
  // #4 — CCTV entrance
  {id: 's4', image: 'cena04_cctv_entrada', startSec: 76.4, endSec: 104.95,
    transition: 'crossfade', kenBurns: {direction: 'in', anchorX: 0.12, anchorY: -0.08, zoom: Z}},
  // #5 — CCTV investigation
  {id: 's5', image: 'cena04b_cctv_investigacao', startSec: 104.95, endSec: 133.5,
    transition: 'crossfade', kenBurns: {direction: 'out', anchorX: -0.1, anchorY: 0.0, zoom: Z}},
  // #6 — abandoned car (product 1 beat)
  {id: 's6', image: 'cena05_carro_abandonado', startSec: 133.5, endSec: 145.9,
    transition: 'dip', kenBurns: {direction: 'in', anchorX: 0.0, anchorY: 0.12, zoom: 1.05}},
  // #7 — four steps (method begins)
  {id: 's7', image: 'cena06_quatro_passos', startSec: 145.9, endSec: 169.9,
    transition: 'dip', kenBurns: {direction: 'out', anchorX: 0.0, anchorY: 0.0, zoom: Z}},
  // #8 — new passport
  {id: 's8', image: 'cena07_novo_passaporte', startSec: 169.9, endSec: 193.9,
    transition: 'crossfade', kenBurns: {direction: 'in', anchorX: 0.16, anchorY: 0.14, zoom: Z}},
  // #9 — crowd
  {id: 's9', image: 'cena08_multidao', startSec: 193.9, endSec: 217.9,
    transition: 'crossfade', kenBurns: {direction: 'in', anchorX: 0.0, anchorY: 0.0, zoom: Z}},
  // #10 — passport again (product 2 beat)
  {id: 's10', image: 'cena07_novo_passaporte', startSec: 217.9, endSec: 227.5,
    transition: 'crossfade', kenBurns: {direction: 'in', anchorX: -0.16, anchorY: 0.1, zoom: 1.07}},
  // #11 — golden cage (lesson)
  {id: 's11', image: 'cena09_gaiola_ouro', startSec: 227.5, endSec: 258.7,
    transition: 'dip', kenBurns: {direction: 'in', anchorX: 0.1, anchorY: 0.0, zoom: Z}},
  // #12 — beach cafe (calm payoff)
  {id: 's12', image: 'cena10_cafe_praia', startSec: 258.7, endSec: 289.9,
    transition: 'crossfade', kenBurns: {direction: 'out', anchorX: 0.0, anchorY: 0.0, zoom: Z}},
  // #13 — endscreen / CTA
  {id: 's13', image: 'cena11_endscreen', startSec: 289.9, endSec: 307.6,
    transition: 'crossfade', kenBurns: {direction: 'in', anchorX: 0.0, anchorY: 0.0, zoom: 1.05}},
];

// ---------------------------------------------------------------------------
// NARRATION AUDIO BLOCKS — laid back-to-back at exact start times so the
// voice timeline is sample-accurate (independent of visual transitions).
// ---------------------------------------------------------------------------

export type AudioBlock = {file: string; startSec: number; endSec: number};

export const NARRATION: AudioBlock[] = [
  {file: 'audio/00_hook.mp3', startSec: 0.0, endSec: 30.7},
  {file: 'audio/01_bloco1.mp3', startSec: 30.7, endSec: 76.4},
  {file: 'audio/02_bloco2.mp3', startSec: 76.4, endSec: 133.5},
  {file: 'audio/02b_produto1.mp3', startSec: 133.5, endSec: 145.9},
  {file: 'audio/03_bloco3.mp3', startSec: 145.9, endSec: 217.9},
  {file: 'audio/03b_produto2.mp3', startSec: 217.9, endSec: 227.5},
  {file: 'audio/04_bloco4.mp3', startSec: 227.5, endSec: 289.9},
  {file: 'audio/05_cta.mp3', startSec: 289.9, endSec: 307.6},
];

// ---------------------------------------------------------------------------
// MUSIC + SFX (all optional — flip the flags off if you remove the files).
// ---------------------------------------------------------------------------

export const ENABLE_MUSIC = true;
export const ENABLE_SFX = true;

export const MUSIC = {
  file: 'music/tension.mp3',
  volume: 0.12, // ~ -18 dB under narration
  fadeInSec: 4,
  fadeOutSec: 4,
};

export type Sfx = {file: string; atSec: number; volume: number};

export const SFX: Sfx[] = [
  {file: 'sfx/boom.mp3', atSec: 30.5, volume: 0.6}, // end of hook
  {file: 'sfx/boom.mp3', atSec: 129.0, volume: 0.6}, // identity reveal ~2:09
];

/** A whoosh is auto-placed on every dip-to-black transition (see Video.tsx). */
export const WHOOSH_FILE = 'sfx/whoosh.mp3';

// ---------------------------------------------------------------------------
// TRANSITION TIMING
// ---------------------------------------------------------------------------

export const CROSSFADE_FRAMES = secToFrames(0.6); // 18
export const DIP_FRAMES = secToFrames(0.8); // 24

// ---------------------------------------------------------------------------
// CAPTIONS
// ---------------------------------------------------------------------------

export const CAPTIONS_SRT = 'LEGENDAS_EN.srt';
/** Shift every caption by N seconds if you ever need to nudge sync (+later / -earlier). */
export const CAPTION_OFFSET_SEC = 0;
