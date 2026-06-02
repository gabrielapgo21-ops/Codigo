/**
 * Generates labeled 1920x1080 placeholder PNGs for every scene image so the
 * project renders end-to-end before the real artwork arrives.
 * Replace the files in public/imagens with your real 16:9 PNGs (same names).
 *
 *   node scripts/gen-placeholders.mjs
 */
import {createCanvas} from '@napi-rs/canvas';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'imagens');
mkdirSync(OUT, {recursive: true});

const W = 1920;
const H = 1080;

// [filename, title, subtitle, [c1, c2]]
const SCENES = [
  ['cena_extra_carro_dirigindo', 'CAR DRIVING', 'Scene 01 · The hook', ['#0b2545', '#13315c']],
  ['cena02_mansao', 'THE MANSION', 'Scene 02', ['#1d2d44', '#3e5c76']],
  ['cena03_jato_documentos', 'JET · DOCUMENTS', 'Scene 03', ['#11151c', '#2a3d45']],
  ['cena04_cctv_entrada', 'CCTV · ENTRANCE', 'Scene 04', ['#14110f', '#3a2f1c']],
  ['cena04b_cctv_investigacao', 'CCTV · INVESTIGATION', 'Scene 05', ['#0f1115', '#2c2f3a']],
  ['cena05_carro_abandonado', 'ABANDONED CAR', 'Scene 06 · Product I', ['#1a1410', '#4a3520']],
  ['cena06_quatro_passos', 'THE FOUR STEPS', 'Scene 07 · The method', ['#102218', '#23503a']],
  ['cena07_novo_passaporte', 'NEW PASSPORT', 'Scene 08 / 10', ['#1b1209', '#5a3d1a']],
  ['cena08_multidao', 'THE CROWD', 'Scene 09', ['#0d1b2a', '#415a77']],
  ['cena09_gaiola_ouro', 'GOLDEN CAGE', 'Scene 11 · The lesson', ['#241a05', '#7a5a16']],
  ['cena10_cafe_praia', 'BEACH CAFE', 'Scene 12 · Payoff', ['#06263a', '#1b7a8a']],
  ['cena11_endscreen', 'CTA · END SCREEN', 'Scene 13', ['#0a0a0a', '#2a2a2a']],
];

for (const [name, title, subtitle, [c1, c2]] of SCENES) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // diagonal gradient
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // subtle grid / vignette feel
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= W; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 120) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // center crosshair to make Ken Burns motion visible
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, H / 2);
  ctx.lineTo(W / 2 + 40, H / 2);
  ctx.moveTo(W / 2, H / 2 - 40);
  ctx.lineTo(W / 2, H / 2 + 40);
  ctx.stroke();

  // title
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 96px Arial';
  ctx.fillText(title, W / 2, H / 2 - 10);

  ctx.fillStyle = '#E8B23A';
  ctx.font = '600 44px Arial';
  ctx.fillText(subtitle, W / 2, H / 2 + 70);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '500 32px Arial';
  ctx.fillText('PLACEHOLDER — replace with real artwork', W / 2, H - 70);

  writeFileSync(join(OUT, `${name}.png`), canvas.toBuffer('image/png'));
  console.log('wrote', `${name}.png`);
}

console.log('Done: placeholder images in public/imagens');
