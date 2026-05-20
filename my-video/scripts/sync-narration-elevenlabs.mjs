// Monta a narração a partir dos 7 arquivos de áudio do ElevenLabs
// (public/narration_ato1.mp3 ... ato7.mp3) e emite:
//   - public/narration_ep2.mp3  (áudio contínuo dos 7 atos)
//   - src/narrationTiming.ts    (timing de cada legenda)
// As legendas são distribuídas dentro de cada ato proporcionalmente ao
// tamanho de cada fala (mesmo texto -> proporção de tempo semelhante).
// Rode com: node scripts/sync-narration-elevenlabs.mjs
import {execFileSync} from 'child_process';
import {writeFileSync, mkdirSync, rmSync, statSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TMP = join(ROOT, 'out', 'sync_tmp');
const FPS = 30;
const SR = 44100;
const LEAD = 12; // silêncio inicial (frames)
const ACT_GAP = 26; // silêncio entre atos (frames)
const TAIL = 28; // silêncio final (frames)

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
      'Plataformas como RWS, Outlier, Oneforma, Welocalize.',
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
      'RWS. Outlier. Oneforma. Welocalize.',
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

const ff = (args) =>
  execFileSync('ffmpeg', args, {
    stdio: ['ignore', 'ignore', 'inherit'],
  });

rmSync(TMP, {recursive: true, force: true});
mkdirSync(TMP, {recursive: true});

// 1. converte cada ato para wav padronizado e mede a duração
const actWavs = [];
const actFrames = [];
for (let a = 0; a < ACTS.length; a++) {
  const src = join(ROOT, 'public', `narration_ato${a + 1}.mp3`);
  const wav = join(TMP, `act${a + 1}.wav`);
  ff(['-y', '-i', src, '-ar', String(SR), '-ac', '1', '-c:a', 'pcm_s16le', wav]);
  const seconds = (statSync(wav).size - 44) / (SR * 2);
  actWavs.push(wav);
  actFrames.push(Math.round(seconds * FPS));
}

// 2. silêncios
const mkSilence = (frames, name) => {
  const p = join(TMP, name);
  ff(['-y', '-f', 'lavfi', '-i', `anullsrc=r=${SR}:cl=mono`,
    '-t', (frames / FPS).toFixed(4), '-c:a', 'pcm_s16le', p]);
  return p;
};
const leadWav = mkSilence(LEAD, 'lead.wav');
const gapWav = mkSilence(ACT_GAP, 'gap.wav');
const tailWav = mkSilence(TAIL, 'tail.wav');

// 3. concatena -> narration_ep2.mp3
const order = [leadWav];
actWavs.forEach((w, i) => {
  order.push(w);
  order.push(i === actWavs.length - 1 ? tailWav : gapWav);
});
const listPath = join(TMP, 'list.txt');
writeFileSync(listPath, order.map((p) => `file '${p}'`).join('\n'));
// duração total (frames) -> usada para o fade-out final
const totalFrames =
  LEAD +
  actFrames.reduce((x, y) => x + y, 0) +
  ACT_GAP * (ACTS.length - 1) +
  TAIL;
const totalSec = totalFrames / FPS;
// loudnorm: volume parelho entre os 7 atos; afade: entradas/saídas suaves
ff(['-y', '-f', 'concat', '-safe', '0', '-i', listPath,
  '-af',
  `loudnorm=I=-16:TP=-1.5:LRA=11,` +
    `afade=t=in:st=0:d=0.5,` +
    `afade=t=out:st=${(totalSec - 1.1).toFixed(2)}:d=1.0`,
  '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', String(SR),
  join(ROOT, 'public', 'narration_ep2.mp3')]);

// 4. timing: distribui as legendas dentro de cada ato por peso (nº de caracteres)
const timingActs = [];
let total = 0;
for (let a = 0; a < ACTS.length; a++) {
  const act = ACTS[a];
  const speech = actFrames[a];
  const offset = a === 0 ? LEAD : 0;
  const weights = act.lines.map((l) => l.length);
  const sumW = weights.reduce((x, y) => x + y, 0);
  const lines = [];
  let cum = 0;
  for (let i = 0; i < act.lines.length; i++) {
    const start = offset + Math.round(cum);
    cum += (weights[i] / sumW) * speech;
    const end =
      i === act.lines.length - 1
        ? offset + speech
        : offset + Math.round(cum);
    lines.push({display: act.lines[i], start, end});
  }
  const durationInFrames =
    offset + speech + (a === ACTS.length - 1 ? TAIL : ACT_GAP);
  timingActs.push({id: act.id, durationInFrames, lines});
  total += durationInFrames;
}

writeFileSync(
  join(ROOT, 'src', 'narrationTiming.ts'),
  `// GERADO por scripts/sync-narration-elevenlabs.mjs — não editar à mão.
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

console.log('Narração ElevenLabs (voz Keren) montada.');
for (let a = 0; a < timingActs.length; a++) {
  const t = timingActs[a];
  console.log(
    `  ${t.id}: fala ${(actFrames[a] / FPS).toFixed(1)}s, bloco ${t.durationInFrames}f`
  );
}
console.log(
  `  TOTAL: ${total}f = ${Math.floor(total / FPS / 60)}m${Math.round((total / FPS) % 60)}s`
);
