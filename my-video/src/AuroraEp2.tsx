import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Loop,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ============================================================
// ASSETS
// ------------------------------------------------------------
// CLIPES (já no repo, em my-video/public/):
//   lina_intro.mp4, lina_correndo.mp4, lina_bento.mp4, lina_vitoria.mp4
//
// IMAGENS DE REFERÊNCIA (já no repo, em my-video/public/):
//   aurora7_scene1.png                — Lina + Bento na praça dourada
//   aurora7_scene4_tower_run.png      — Lina + Bento correndo, drones
//   aurora7_scene5_truth_room.png     — Lina + Bento sob a cúpula dourada
//   aurora7_character_lina_sheet.png  — folha de poses da Lina
//   aurora7_character_bento_sheet.png — folha de poses do Bento
// ============================================================

const CLIPS_READY = true;
const HAS_REF_IMAGES = true;
const HAS_NARRATION_AUDIO = false; // vira true depois de pushar narration_ep2.mp3

const NARRATION_AUDIO = 'narration_ep2.mp3';
const CLIP_PLAYBACK = 0.5; // câmera lenta cinematográfica

// Clipes da Lina. loopFrames = duração no timeline (30fps) já com o
// playbackRate aplicado, para o <Loop> repetir sem corte.
const CLIPS = {
  intro: {file: 'lina_intro.mp4', loopFrames: 600},
  correndo: {file: 'lina_correndo.mp4', loopFrames: 302},
  bento: {file: 'lina_bento.mp4', loopFrames: 302},
  vitoria: {file: 'lina_vitoria.mp4', loopFrames: 302},
} as const;

const IMAGES = {
  city_plaza: 'aurora7_scene1.png',
  tower_run: 'aurora7_scene4_tower_run.png',
  truth_room: 'aurora7_scene5_truth_room.png',
  lina_sheet: 'aurora7_character_lina_sheet.png',
  bento_sheet: 'aurora7_character_bento_sheet.png',
} as const;

type ClipName = keyof typeof CLIPS;
type ImageName = keyof typeof IMAGES;
type Shot =
  | {kind: 'clip'; clip: ClipName}
  | {kind: 'image'; image: ImageName; fit?: 'cover' | 'contain'};

// ============================================================
// Paleta
// ============================================================
const GOLD = '#FFD700';
const CYAN = '#00E5FF';
const WHITE = '#FFFFFF';
const RED = '#FF4444';
const BLACK = '#000000';
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const COVER: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

// ============================================================
// Helpers
// ============================================================

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const sampleKeyframes = (
  frame: number,
  kf: ReadonlyArray<readonly [number, number]>
): number => {
  if (frame <= kf[0][0]) return kf[0][1];
  for (let i = 0; i < kf.length - 1; i++) {
    const [f0, v0] = kf[i];
    const [f1, v1] = kf[i + 1];
    if (frame <= f1) {
      return interpolate(frame, [f0, f1], [v0, v1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
  }
  return kf[kf.length - 1][1];
};

// Realce de palavras-chave nas legendas.
const GOLD_WORDS = new Set([
  'aurora',
  'sol',
  'luz',
  'labs',
  'curiosidade',
  'coragem',
]);
const CYAN_WORDS = new Set([
  'claude',
  'remotion',
  'rws',
  'outlier',
  'onefome',
  'welocalize',
  'runway',
  'ia',
  'inteligência',
  'artificial',
  'bento',
]);
const RED_WORDS = new Set([
  'erro',
  'errei',
  'escuro',
  'escuridão',
  'apagou',
  'apaga',
  'desistir',
  'r$600',
]);

const wordColor = (raw: string): string | null => {
  const w = raw.toLowerCase().replace(/[.,!?;:—"'()…]/g, '');
  if (GOLD_WORDS.has(w)) return GOLD;
  if (CYAN_WORDS.has(w)) return CYAN;
  if (RED_WORDS.has(w)) return RED;
  return null;
};

const HighlightedText: React.FC<{text: string}> = ({text}) => {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => {
        const color = wordColor(word);
        return (
          <span
            key={i}
            style={{
              color: color ?? WHITE,
              fontWeight: color ? 'bold' : 'normal',
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </>
  );
};

// ============================================================
// Cidade de Aurora — fallback procedural (se CLIPS_READY for false)
// ============================================================

const BUILDINGS: ReadonlyArray<{x: number; w: number; h: number}> = [
  {x: -30, w: 170, h: 300},
  {x: 150, w: 120, h: 440},
  {x: 285, w: 140, h: 230},
  {x: 435, w: 105, h: 360},
  {x: 550, w: 175, h: 510},
  {x: 735, w: 120, h: 280},
  {x: 865, w: 150, h: 410},
  {x: 1025, w: 135, h: 560},
  {x: 1170, w: 110, h: 300},
  {x: 1290, w: 165, h: 470},
  {x: 1465, w: 120, h: 240},
  {x: 1595, w: 145, h: 400},
  {x: 1750, w: 130, h: 330},
  {x: 1890, w: 130, h: 270},
];

const CityBackground: React.FC<{brightness: number}> = ({brightness}) => {
  const b = clamp01(brightness);
  return (
    <AbsoluteFill style={{backgroundColor: '#05060a'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 18%, #FFB23E 0%, #7a4a10 35%, transparent 70%)',
          opacity: b * 0.8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 70,
          width: 260,
          height: 260,
          marginLeft: -130,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, #FFF6D0 0%, #FFD700 35%, #FF9D2E 60%, transparent 75%)',
          opacity: Math.min(1, b * 1.2),
          transform: `scale(${0.2 + b})`,
        }}
      />
      {BUILDINGS.map((bld, i) => {
        const cols = Math.max(1, Math.floor(bld.w / 38));
        const rows = Math.max(1, Math.floor(bld.h / 52));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: bld.x,
              bottom: 0,
              width: bld.w,
              height: bld.h,
              backgroundColor: '#0a0a13',
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              padding: 10,
              gap: 12,
              boxSizing: 'border-box',
            }}
          >
            {Array.from({length: cols * rows}).map((_, j) => {
              const lit = (i * 7 + j * 13) % 5 !== 0;
              return (
                <div
                  key={j}
                  style={{
                    width: 14,
                    height: 20,
                    backgroundColor: GOLD,
                    opacity: (0.06 + b * 0.9) * (lit ? 1 : 0.25),
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================
// Uma "tomada" — clipe em loop ou imagem, com Ken Burns
// ============================================================

const ShotView: React.FC<{
  shot: Shot;
  progress: number;
  filter: string;
}> = ({shot, progress, filter}) => {
  const scale = 1.05 + progress * 0.1;
  const driftX = progress * -26;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translateX(${driftX}px)`,
        filter,
      }}
    >
      {shot.kind === 'clip' ? (
        <Loop durationInFrames={CLIPS[shot.clip].loopFrames}>
          <OffthreadVideo
            src={staticFile(CLIPS[shot.clip].file)}
            playbackRate={CLIP_PLAYBACK}
            muted
            style={COVER}
          />
        </Loop>
      ) : shot.fit === 'contain' ? (
        <AbsoluteFill
          style={{
            backgroundColor: '#070708',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Img
            src={staticFile(IMAGES[shot.image])}
            style={{maxWidth: '92%', maxHeight: '92%', objectFit: 'contain'}}
          />
        </AbsoluteFill>
      ) : (
        <Img src={staticFile(IMAGES[shot.image])} style={COVER} />
      )}
    </AbsoluteFill>
  );
};

// ============================================================
// Fundo do ato — sequência de tomadas com crossfade
// ============================================================

const SHOT_FADE = 16;

const ActBackground: React.FC<{act: ActConfig}> = ({act}) => {
  const frame = useCurrentFrame();
  const b = sampleKeyframes(frame, act.brightness);

  if (!CLIPS_READY) {
    return <CityBackground brightness={b} />;
  }

  const shots: Shot[] = HAS_REF_IMAGES
    ? act.shots
    : [{kind: 'clip', clip: act.clip}];
  const slot = act.durationInFrames / shots.length;

  const filterBrightness = 0.32 + b * 0.9;
  const filterSaturate = 0.85 + b * 0.5;
  const filter = `brightness(${filterBrightness.toFixed(
    3
  )}) saturate(${filterSaturate.toFixed(3)})`;

  // Escuridão — entra quando o brilho cai (apagão do Ato 4 / início do 5)
  const darkness = clamp01((0.34 - b) / 0.34);

  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      {shots.map((shot, i) => {
        const s = i * slot;
        const e = (i + 1) * slot;
        const isFirst = i === 0;
        const isLast = i === shots.length - 1;

        let opacity: number;
        if (shots.length === 1) {
          opacity = 1;
        } else if (isFirst) {
          opacity = interpolate(
            frame,
            [e - SHOT_FADE, e + SHOT_FADE],
            [1, 0],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
        } else if (isLast) {
          opacity = interpolate(
            frame,
            [s - SHOT_FADE, s + SHOT_FADE],
            [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
        } else {
          opacity = interpolate(
            frame,
            [s - SHOT_FADE, s + SHOT_FADE, e - SHOT_FADE, e + SHOT_FADE],
            [0, 1, 1, 0],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
        }
        if (opacity <= 0.001) return null;

        const progress = interpolate(frame, [s, e], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <AbsoluteFill key={i} style={{opacity}}>
            <ShotView shot={shot} progress={progress} filter={filter} />
          </AbsoluteFill>
        );
      })}

      {/* Escuridão da história */}
      <AbsoluteFill
        style={{backgroundColor: BLACK, opacity: darkness}}
      />

      {/* Gradiente inferior — legibilidade das legendas */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to bottom, transparent 48%, #000000e6 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================
// Frente do ato — legendas, rótulo, flash, fades
// ============================================================

const ActForeground: React.FC<{act: ActConfig}> = ({act}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = act.durationInFrames;

  const labelOpacity = interpolate(
    frame,
    [0, 20, 95, 125],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const slot = dur / act.lines.length;

  const fadeIn = interpolate(frame, [0, 15], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [dur - 22, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const blackOpacity = Math.max(fadeIn, fadeOut);

  const flash =
    act.flashFrame !== undefined
      ? interpolate(
          frame,
          [act.flashFrame - 8, act.flashFrame, act.flashFrame + 24],
          [0, 0.75, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        )
      : 0;

  return (
    <AbsoluteFill style={{fontFamily: FONT}}>
      <div
        style={{
          position: 'absolute',
          top: 50,
          width: '100%',
          textAlign: 'center',
          color: CYAN,
          fontSize: 18,
          textTransform: 'uppercase',
          letterSpacing: '8px',
          opacity: labelOpacity,
          textShadow: '0 2px 12px #000000',
        }}
      >
        {act.label}
      </div>

      {act.lines.map((line, i) => {
        const start = i * slot;
        const end = start + slot;
        const opacity = interpolate(
          frame,
          [start, start + 14, end - 14, end],
          [0, 1, 1, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        );
        if (opacity <= 0.001) return null;
        const rise = spring({
          frame: Math.max(0, frame - start),
          fps,
          config: {damping: 200},
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: 84,
              left: '50%',
              width: 1440,
              marginLeft: -720,
              opacity,
              transform: `translateY(${(1 - rise) * 26}px)`,
            }}
          >
            <div
              style={{
                backgroundColor: '#000000bb',
                border: '1px solid #ffffff1f',
                borderRadius: 14,
                padding: '22px 36px',
                textAlign: 'center',
                fontSize: 36,
                lineHeight: 1.4,
                color: WHITE,
                textShadow: '0 2px 10px #000000',
              }}
            >
              <HighlightedText text={line} />
            </div>
          </div>
        );
      })}

      {flash > 0 && (
        <AbsoluteFill
          style={{backgroundColor: WHITE, opacity: flash, pointerEvents: 'none'}}
        />
      )}

      <AbsoluteFill
        style={{
          backgroundColor: BLACK,
          opacity: blackOpacity,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================
// Tipos / roteiro — Aurora 7, Ep 2: "O Apagão"
// ============================================================

type ActConfig = {
  id: string;
  label: string;
  durationInFrames: number;
  brightness: ReadonlyArray<readonly [number, number]>;
  lines: string[];
  clip: ClipName;
  shots: Shot[];
  flashFrame?: number;
};

const ACTS: ActConfig[] = [
  {
    id: 'ato1',
    label: 'Ato 1 — A Abertura',
    durationInFrames: 2700,
    brightness: [
      [0, 0.82],
      [2700, 0.9],
    ],
    clip: 'intro',
    shots: [
      {kind: 'image', image: 'city_plaza'},
      {kind: 'clip', clip: 'intro'},
    ],
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
    label: 'Ato 2 — O Início de Tudo',
    durationInFrames: 3600,
    brightness: [
      [0, 0.35],
      [3600, 0.42],
    ],
    clip: 'intro',
    shots: [
      {kind: 'clip', clip: 'intro'},
      {kind: 'image', image: 'city_plaza'},
    ],
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
    label: 'Ato 3 — A Primeira Luz',
    durationInFrames: 2700,
    brightness: [
      [0, 0.4],
      [2700, 0.78],
    ],
    clip: 'intro',
    shots: [
      {kind: 'clip', clip: 'intro'},
      {kind: 'image', image: 'city_plaza'},
    ],
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
    label: 'Ato 4 — O Erro dos R$600',
    durationInFrames: 2700,
    brightness: [
      [0, 0.9],
      [1380, 0.96],
      [1520, 0.0],
      [2700, 0.0],
    ],
    flashFrame: 1500,
    clip: 'correndo',
    shots: [
      {kind: 'image', image: 'tower_run'},
      {kind: 'clip', clip: 'correndo'},
    ],
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
    label: 'Ato 5 — A Virada',
    durationInFrames: 2700,
    brightness: [
      [0, 0.0],
      [500, 0.08],
      [900, 0.22],
      [2700, 0.64],
    ],
    clip: 'bento',
    shots: [
      {kind: 'image', image: 'truth_room'},
      {kind: 'clip', clip: 'bento'},
    ],
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
    label: 'Ato 6 — O Nascimento do Canal',
    durationInFrames: 1800,
    brightness: [
      [0, 0.6],
      [1800, 1.0],
    ],
    clip: 'vitoria',
    shots: [
      {kind: 'clip', clip: 'vitoria'},
      {kind: 'image', image: 'lina_sheet', fit: 'contain'},
      {kind: 'image', image: 'bento_sheet', fit: 'contain'},
    ],
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
    label: 'Ato 7 — CTA Final',
    durationInFrames: 1800,
    brightness: [
      [0, 1.0],
      [1800, 1.0],
    ],
    clip: 'vitoria',
    shots: [
      {kind: 'clip', clip: 'vitoria'},
      {kind: 'image', image: 'city_plaza'},
    ],
    lines: [
      'Nos próximos episódios vou te mostrar exatamente como fiz tudo isso.',
      'As ferramentas que usei. Os erros que cometi. E como você pode fazer também.',
      'Porque o sol de Aurora 7 brilha pra todo mundo.',
      'Se inscreve. A série continua.',
      'Eu sou a Lina. E o sol... nunca mais vai apagar.',
    ],
  },
];

// ============================================================
// COMPOSIÇÃO PRINCIPAL — Aurora 7 Ep 2 (10 minutos)
// ============================================================

export const AuroraEp2: React.FC = () => {
  let cursor = 0;
  const starts = ACTS.map((act) => {
    const s = cursor;
    cursor += act.durationInFrames;
    return s;
  });

  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      {ACTS.map((act, i) => (
        <Sequence
          key={act.id}
          from={starts[i]}
          durationInFrames={act.durationInFrames}
        >
          <ActBackground act={act} />
          <ActForeground act={act} />
        </Sequence>
      ))}

      {HAS_NARRATION_AUDIO && <Audio src={staticFile(NARRATION_AUDIO)} />}
    </AbsoluteFill>
  );
};
