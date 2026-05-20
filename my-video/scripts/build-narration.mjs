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
const SR = 44100;
const GAP_LINE = 11; // pausa entre falas (frames)
const GAP_ACT = 46; // pausa entre atos (frames)
const LEAD_IN = 16; // silêncio inicial (frames)
const TAIL = 32; // silêncio final (frames)

const ACTS = [
  {
    id: 'ato1',
    lines: [
      'Olá. Eu sou a Lina.',
      'E há duas semanas, eu não sabia absolutamente nada sobre inteligência artificial.',
      'Nada. Zero.',
      'Eu gastei seiscentos reais numa ferramenta que não funcionou.',
      'Fiquei sem dinheiro. E fiquei no escuro.',
      'Mas tem uma coisa sobre Aurora 7, a minha cidade: quando o sol apaga, ele sempre volta.',
      'E eu não desisto até encontrar uma nova luz.',
      'Foi aí que tudo mudou. Foi quando esse canal nasceu.',
      'Foi quando o sol de Aurora brilhou de novo.',
      'Senta aí. Eu vou te contar essa história desde o começo.',
    ],
  },
  {
    id: 'ato2',
    lines: [
      'Tudo começou num dia comum. Sem planos grandes. Sem grandes ideias.',
      'Eu só sabia de uma coisa: eu estava perdida.',
      'Sem saber o que fazer da vida. Precisando de uma renda extra.',
      'As contas chegavam. E eu não tinha resposta.',
      'Então, num fim de tarde qualquer, eu abri o computador.',
      'E comecei a pesquisar. Sem nem saber o que procurava.',
      'Foi aí que encontrei vídeos falando sobre treinar inteligência artificial.',
      'Pessoas comuns. Ganhando dinheiro. Ensinando máquinas a pensar.',
      'Plataformas como RWS, Outlier, Onefome, Welocalize.',
      'Empresas de verdade, que pagam gente de verdade pra melhorar a IA.',
      'Eu parei. E reli aquilo três vezes.',
      'Espera. Empresas pagam pra você conversar com uma IA?',
      'Pra avaliar respostas? Pra corrigir robôs? Pra ensinar uma máquina?',
      'Eu não precisava saber programar. Não precisava de diploma.',
      'Eu só precisava de uma coisa: curiosidade.',
      'E curiosidade... isso eu sempre tive de sobra.',
    ],
  },
  {
    id: 'ato3',
    lines: [
      'Naquela mesma noite, me cadastrei em todas elas.',
      'RWS. Outlier. Onefome. Welocalize.',
      'No começo, as tarefas eram simples.',
      'Avaliar textos. Comparar respostas. Corrigir o que a IA errava.',
      'Classificar imagens. Marcar o que estava certo e o que estava errado.',
      'Eu fazia, e recebia. Pouco, mas recebia.',
      'E aí algo estranho começou a acontecer.',
      'Sem perceber, eu estava aprendendo como a inteligência artificial pensa por dentro.',
      'Não como uma especialista. Eu não era.',
      'Mas como uma aprendiz. Como alguém vendo a máquina respirar pela primeira vez.',
      'Em Aurora 7, quando você descobre algo novo, o sol brilha um pouco mais forte.',
      'E, devagarinho, o meu sol estava começando a despertar.',
      'Eu ainda não sabia. Mas aquilo era só o começo.',
    ],
  },
  {
    id: 'ato4',
    lines: [
      'Mas aí eu cometi o erro clássico de quem fica animado demais.',
      'Em poucas semanas, eu achei que já sabia tudo.',
      'Achei que estava pronta pra qualquer coisa.',
      'Foi quando eu vi uma ferramenta chamada Runway.',
      'Diziam que dava pra criar vídeos animados com inteligência artificial.',
      'Vídeos como os que eu sonhava em fazer.',
      'Eu nem pensei duas vezes. Comprei o plano na hora.',
      'Seiscentos reais. De uma vez só.',
      'E aí eu tentei. E errei.',
      'Tentei de novo. Errei de novo.',
      'A ferramenta era boa. O problema... era eu.',
      'Eu ainda não sabia usar. Não tinha a base.',
      'Em Aurora 7, naquele dia, o sol apagou.',
      'A cidade inteira ficou no escuro.',
      'E eu fiquei ali. Sem os seiscentos reais. E sem nenhum resultado.',
      'Você conhece aquele momento? Aquele pensamento que aperta o peito?',
      'Talvez isso não seja pra mim. Talvez eu não seja boa o suficiente.',
      'Talvez... eu devesse simplesmente desistir.',
    ],
  },
  {
    id: 'ato5',
    lines: [
      'Mas deixa eu te contar uma coisa engraçada sobre o escuro.',
      'O escuro passa. Ele sempre passa.',
      'Depois de alguns dias parada, eu resolvi tentar uma última vez.',
      'Mas dessa vez, diferente.',
      'Em vez de sair gastando dinheiro, eu fui aprender primeiro.',
      'E foi aí que eu encontrei o Claude.',
      'Uma inteligência artificial que não só respondia as minhas perguntas.',
      'Ela me ensinava a pensar. Me explicava o porquê.',
      'Eu perguntei tudo. Sem vergonha de não saber.',
      'Como criar um vídeo do zero. Como usar o Remotion.',
      'Como animar um personagem. Como dar vida a uma cena.',
      'E o Claude respondia. Com paciência. Quantas vezes fosse preciso.',
      'Em Aurora 7, o sol não volta de repente.',
      'Ele não acende a cidade toda de uma vez.',
      'Ele volta devagar. Uma luz de cada vez.',
      'E cada coisinha que eu aprendia... era mais uma janela acendendo.',
      'Aos poucos, a minha cidade estava voltando a brilhar.',
    ],
  },
  {
    id: 'ato6',
    lines: [
      'E foi exatamente aí que nasceu a Aurora Labs.',
      'Não como o canal de uma especialista. Porque eu não sou.',
      'Mas como o diário de uma aprendiz.',
      'Um lugar pra mostrar o caminho de verdade. Com os erros e tudo.',
      'Eu não sei tudo. Longe, muito longe disso.',
      'Mas tem uma coisa que eu aprendi e tenho certeza:',
      'Qualquer pessoa, com curiosidade e com coragem,',
      'consegue construir algo incrível usando inteligência artificial.',
      'Você não precisa ser gênio. Não precisa de diploma.',
      'Você não precisa nem saber programar.',
      'Você só precisa de uma coisa: querer aprender.',
      'O resto, a gente descobre junto. Uma luz de cada vez.',
    ],
  },
  {
    id: 'ato7',
    lines: [
      'Nos próximos episódios, eu vou te mostrar exatamente como eu fiz tudo isso.',
      'As ferramentas que usei. Os erros que cometi, pra você não repetir.',
      'E o passo a passo pra você criar também.',
      'Porque o sol de Aurora 7 não brilha só pra mim.',
      'Ele brilha pra todo mundo que tem coragem de tentar.',
      'Se essa história falou com você, se inscreve no canal.',
      'A série está só começando.',
      'Eu sou a Lina. E o meu sol... o meu sol nunca mais vai apagar.',
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
const segs = [];
let gi = 0;
for (const act of ACTS) {
  act.lines.forEach((display, i) => {
    const mp3 = join(TMP, `l${gi}.mp3`);
    const rawWav = join(TMP, `r${gi}.wav`);
    fetchTTS(toSpoken(display), mp3);
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
const a4 = timingActs[3];
const idx = a4.lines.findIndex((l) => l.display.includes('o sol apagou'));
console.log(`  ato4 "o sol apagou" -> índice ${idx}, frame local ${a4.lines[idx].start}`);
