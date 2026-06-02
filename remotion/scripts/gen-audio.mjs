/**
 * Generates placeholder audio (exact durations), a tension drone, SFX, and a
 * sample LEGENDAS_EN.srt — using Remotion's bundled ffmpeg, so no system
 * ffmpeg is required. Replace these with your real files later.
 *
 *   node scripts/gen-audio.mjs
 */
import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUB = join(__dirname, '..', 'public');
for (const d of ['audio', 'music', 'sfx']) mkdirSync(join(PUB, d), {recursive: true});

const ff = (args) => {
  const r = spawnSync('npx', ['remotion', 'ffmpeg', ...args, '-y'], {
    stdio: 'inherit',
    cwd: join(__dirname, '..'),
  });
  if (r.status !== 0) {
    throw new Error('ffmpeg failed: ' + args.join(' '));
  }
};

// --- Narration blocks (silent, exact durations) -----------------------------
const NARRATION = [
  ['00_hook', 30.7],
  ['01_bloco1', 45.7],
  ['02_bloco2', 57.1],
  ['02b_produto1', 12.4],
  ['03_bloco3', 72.0],
  ['03b_produto2', 9.6],
  ['04_bloco4', 62.4],
  ['05_cta', 17.7],
];
for (const [name, dur] of NARRATION) {
  ff([
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-t', String(dur), '-c:a', 'libmp3lame', '-q:a', '6',
    join(PUB, 'audio', `${name}.mp3`),
  ]);
}

// NOTE: Remotion's bundled ffmpeg ships with most filters disabled
// (no afade/tremolo/anoisesrc/highpass). We only use sine + volume here.
// All time-based fades (music in/out) are applied in code via <Audio volume>.

// --- Tension drone (low sine, ~60s; the code loops + ducks it) ---------------
ff([
  '-f', 'lavfi', '-i', 'sine=frequency=55:sample_rate=44100',
  '-t', '60', '-af', 'volume=0.4',
  '-c:a', 'libmp3lame', '-q:a', '6',
  join(PUB, 'music', 'tension.mp3'),
]);

// --- SFX: sub-bass boom ------------------------------------------------------
ff([
  '-f', 'lavfi', '-i', 'sine=frequency=62:sample_rate=44100',
  '-t', '1.4', '-af', 'volume=1.3',
  '-c:a', 'libmp3lame', '-q:a', '6',
  join(PUB, 'sfx', 'boom.mp3'),
]);

// --- SFX: whoosh (placeholder blip; swap for a real whoosh later) ------------
ff([
  '-f', 'lavfi', '-i', 'sine=frequency=300:sample_rate=44100',
  '-t', '0.5', '-af', 'volume=0.35',
  '-c:a', 'libmp3lame', '-q:a', '6',
  join(PUB, 'sfx', 'whoosh.mp3'),
]);

// --- Sample SRT (only used if you don't have the real LEGENDAS_EN.srt) -------
const TOTAL = 307.6;
const fmt = (s) => {
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(Math.floor(s % 60)).padStart(2, '0');
  const ms = String(Math.round((s % 1) * 1000)).padStart(3, '0');
  return `${hh}:${mm}:${ss},${ms}`;
};
const lines = [];
let i = 1;
for (let t = 0; t < TOTAL; t += 3.6) {
  const end = Math.min(t + 3.2, TOTAL);
  lines.push(String(i));
  lines.push(`${fmt(t)} --> ${fmt(end)}`);
  lines.push(`Sample caption line ${i} — replace with LEGENDAS_EN.srt`);
  lines.push('');
  i++;
}
writeFileSync(join(PUB, 'LEGENDAS_EN.srt'), lines.join('\n'), 'utf8');
console.log('Wrote sample public/LEGENDAS_EN.srt');

console.log('Done: placeholder audio + SFX + SRT generated.');
