// Gera a narração (voz Google TTS pt-BR) por fala, mede cada uma e emite:
//   - public/narration_ep2.mp3  (áudio contínuo, com pausas exatas)
//   - src/narrationTiming.ts    (duração de cada ato + timing de cada legenda)
// Rode com: node scripts/build-narration.mjs
import {execFileSync} from 'child_process';
import {writeFileSync, mkdirSync, rmSync, statSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TMP = join(ROOT, 'out', 'narr_tmp');
const FPS = 30;
const SR = 44100; // sample rate dos wavs intermediários
const GAP_LINE = 11; // pausa entre falas (frames)
const GAP_ACT = 46; // pausa entre atos (frames)
const LEAD_IN = 16; // silêncio inicial (frames)
const TAIL = 32; // silêncio final (frames)

const ACTS = [
  {
    id: 'ato1',
    lines: [
      'Olá. Eu sou a Lina. E há duas semanas eu não sabia nada sobre IA.',
      'Gastei R$600 numa ferramenta que não funcionou. Fiquei no escuro.',
      'Mas como Aurora 7 apaga... eu não desisto até encontrar uma nova luz.',
      'E foi aí que tudo mudou. Foi quando esse canal surgiu. Foi quando o sol de Aurora brilhou.',
      'Vou contar pra vocês essa história. Como tudo começou.',
    ],
  },
  {
    id: 'ato2',
    lines: [
      'Tudo começou num dia comum. Sem planos grandes. Sem grandes ideias.',
      'Eu estava perdida. Sem saber o que fazer. Precisava de uma renda extra.',
      'Então abri o computador. E comecei a pesquisar.',
      'Foi aí que encontrei canais falando sobre como ganhar dinheiro treinando inteligência artificial.',
      'Plataformas como RWS, Outlier, Onefome, Welocalize.',
      'Empresas que pagam pessoas comuns para ensinar máquinas a pensar.',
      'Espera. Empresas pagam pra você... conversar com IA? Avaliar respostas? Ensinar robôs?',
      'Eu não precisava saber programar. Não precisava de diploma. Precisava só de curiosidade.',
      'E curiosidade... eu tinha de sobra.',
    ],
  },
  {
    id: 'ato3',
    lines: [
      'Me cadastrei em todas. RWS. Outlier. Onefome. Welocalize.',
      'Comecei a fazer tarefas simples. Avaliar textos. Corrigir respostas de IA. Classificar imagens.',
      'E algo estranho aconteceu.',
      'Eu comecei a entender como a inteligência artificial funciona por dentro.',
      'Não como especialista. Como aprendiz. Como alguém que estava vendo a máquina respirar.',
      'Em Aurora 7, quando você descobre algo novo... o sol brilha um pouco mais.',
      'E o meu sol estava começando a despertar.',
    ],
  },
  {
    id: 'ato4',
    lines: [
      'Mas aí... eu fiz o erro clássico de quem está animado demais.',
      'Achei que sabia tudo. Que estava pronta.',
      'Vi uma ferramenta chamada Runway. Disseram que dava pra criar vídeos animados com IA.',
      'Comprei o plano. R$600. Sem pensar duas vezes.',
      'Tentei. Errei. Tentei de novo. Errei de novo.',
      'A ferramenta era boa. O problema era eu — não sabia ainda como usar.',
      'Em Aurora 7... o sol apagou.',
      'E eu fiquei no escuro. Com R$600 a menos. E zero resultado.',
      'Aquele momento em que você pensa: talvez não seja pra mim.',
      'Talvez eu não seja boa o suficiente.',
      'Talvez eu devesse desistir.',
    ],
  },
  {
    id: 'ato5',
    lines: [
      'Mas sabe o que é engraçado sobre o escuro?',
      'Ele passa.',
      'Resolvi tentar uma última vez. Mas diferente.',
      'Em vez de gastar dinheiro... fui aprender primeiro.',
      'Encontrei o Claude. Uma IA que não só respondia perguntas — me ensinava a pensar.',
      'Perguntei tudo. Como criar vídeos. Como usar o Remotion. Como animar personagens.',
      'E o Claude... respondeu tudo.',
      'Em Aurora 7... o sol não volta de repente.',
      'Ele volta devagar. Uma luz de cada vez.',
      'E cada coisa que eu aprendia... era mais uma luz acendendo.',
    ],
  },
  {
    id: 'ato6',
    lines: [
      'Foi aí que nasceu a Aurora Labs.',
      'Não como um canal de especialistas.',
      'Como um diário de uma aprendiz.',
      'Eu não sei tudo. Longe disso.',
      'Mas sei que qualquer pessoa — com curiosidade e coragem — consegue construir algo incrível com IA.',
      'Você não precisa saber programar.',
      'Você precisa querer aprender.',
    ],
  },
  {
    id: 'ato7',
    lines: [
      'Nos próximos episódios vou te mostrar exatamente como fiz tudo isso.',
      'As ferramentas que usei. Os erros que cometi. E como você pode fazer também.',
      'Porque o sol de Aurora 7 brilha pra todo mundo.',
      'Se inscreve. A série continua.',
      'Eu sou a Lina. E o sol... nunca mais vai apagar.',
    ],
  },
];

// Texto exibido -> texto falado (a voz lê melhor assim)
const toSpoken = (s) =>
  s.replace(/R\$600/g, 'seiscentos reais').replace(/—/g, ', ');

const ff = (args) =>
  execFileSync('npx', ['remotion', 'ffmpeg', ...args], {
    stdio: ['ignore', 'ignore', 'inherit'],
  });

const sleep = (ms) => execFileSync('sleep', [String(ms / 1000)]);

// Baixa uma fala da voz Google TTS (pt-BR) com retry.
const fetchTTS = (text, outMp3) => {
  const url =
    'https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=pt-BR' +
    '&client=tw-ob&total=1&idx=0' +
    `&textlen=${text.length}&q=${encodeURIComponent(text)}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      execFileSync('curl', [
        '-s', '-m', '25', '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        url, '-o', outMp3,
      ]);
      if (statSync(outMp3).size > 1200) return;
    } catch (e) {
      /* retry */
    }
    sleep(900 * attempt);
  }
  throw new Error('Falha ao baixar TTS: ' + text);
};

rmSync(TMP, {recursive: true, force: true});
mkdirSync(TMP, {recursive: true});

// 1. TTS por fala + mede duração
const segs = []; // {actId, display, segFrames, wav}
let gi = 0;
for (const act of ACTS) {
  act.lines.forEach((display, i) => {
    const mp3 = join(TMP, `l${gi}.mp3`);
    const rawWav = join(TMP, `r${gi}.wav`);
    fetchTTS(toSpoken(display), mp3);
    // mp3 -> wav cru (SR mono) para medir e padronizar
    ff(['-y', '-i', mp3, '-ar', String(SR), '-ac', '1', '-c:a', 'pcm_s16le', rawWav]);
    const seconds = (statSync(rawWav).size - 44) / (SR * 2);
    const audioFrames = Math.ceil(seconds * FPS);
    const isLastOfAct = i === act.lines.length - 1;
    const segFrames = audioFrames + (isLastOfAct ? GAP_ACT : GAP_LINE);
    const segWav = join(TMP, `s${gi}.wav`);
    ff(['-y', '-i', rawWav, '-af', 'apad', '-t', (segFrames / FPS).toFixed(4), segWav]);
    segs.push({actId: act.id, display, segFrames, wav: segWav});
    process.stdout.write('.');
    gi++;
    sleep(350);
  });
}
process.stdout.write('\n');

// 2. silêncios de borda
const leadWav = join(TMP, 'lead.wav');
const tailWav = join(TMP, 'tail.wav');
ff(['-y', '-f', 'lavfi', '-i', `anullsrc=r=${SR}:cl=mono`,
  '-t', (LEAD_IN / FPS).toFixed(4), '-c:a', 'pcm_s16le', leadWav]);
ff(['-y', '-f', 'lavfi', '-i', `anullsrc=r=${SR}:cl=mono`,
  '-t', (TAIL / FPS).toFixed(4), '-c:a', 'pcm_s16le', tailWav]);

// 3. concatena tudo -> mp3
const listPath = join(TMP, 'list.txt');
writeFileSync(
  listPath,
  [leadWav, ...segs.map((s) => s.wav), tailWav].map((p) => `file '${p}'`).join('\n')
);
const outMp3 = join(ROOT, 'public', 'narration_ep2.mp3');
ff(['-y', '-f', 'concat', '-safe', '0', '-i', listPath,
  '-c:a', 'libmp3lame', '-b:a', '160k', '-ar', String(SR), outMp3]);

// 4. timing por ato (frames locais ao ato)
const timingActs = [];
let segIdx = 0;
let total = 0;
for (let a = 0; a < ACTS.length; a++) {
  const act = ACTS[a];
  let local = a === 0 ? LEAD_IN : 0;
  const lines = [];
  for (let i = 0; i < act.lines.length; i++) {
    const seg = segs[segIdx++];
    lines.push({display: seg.display, start: local, end: local + seg.segFrames});
    local += seg.segFrames;
  }
  let durationInFrames = local;
  if (a === ACTS.length - 1) durationInFrames += TAIL;
  timingActs.push({id: act.id, durationInFrames, lines});
  total += durationInFrames;
}

// 5. emite narrationTiming.ts
writeFileSync(
  join(ROOT, 'src', 'narrationTiming.ts'),
  `// GERADO por scripts/build-narration.mjs — não editar à mão.
export type NarrationLine = {display: string; start: number; end: number};
export type NarrationAct = {
  id: string;
  durationInFrames: number;
  lines: NarrationLine[];
};

export const NARRATION_ACTS: NarrationAct[] = ${JSON.stringify(timingActs, null, 2)};

export const NARRATION_TOTAL = ${total};
`
);

console.log('Narração gerada (voz Google TTS pt-BR).');
for (const t of timingActs) {
  console.log(
    `  ${t.id}: ${t.durationInFrames}f (${(t.durationInFrames / FPS).toFixed(1)}s), ${t.lines.length} falas`
  );
}
console.log(
  `  TOTAL: ${total}f = ${Math.floor(total / FPS / 60)}m${Math.round((total / FPS) % 60)}s`
);
console.log(`  ato4 "o sol apagou" -> frame local ${timingActs[3].lines[6].start}`);
