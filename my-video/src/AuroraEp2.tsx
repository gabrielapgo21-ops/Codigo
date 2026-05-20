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
import {NARRATION_ACTS, NarrationLine} from './narrationTiming';

// ============================================================
// ASSETS — tudo em my-video/public/
//   Clipes:  lina_intro / lina_correndo / lina_bento / lina_vitoria .mp4
//   Imagens: aurora7_scene1 / _scene4_tower_run / _scene5_truth_room
//            aurora7_character_lina_sheet / _bento_sheet .png
//   Áudio:   narration_ep2.mp3  (gerado por scripts/build-narration.mjs)
// ============================================================

const NARRATION_FILE = 'narration_ep2.mp3';
const CLIP_PLAYBACK = 0.5; // câmera lenta cinematográfica

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

type KF = ReadonlyArray<readonly [number, number]>;

const sampleKeyframes = (frame: number, kf: KF): number => {
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
  'aurora', 'sol', 'luz', 'labs', 'curiosidade', 'coragem',
]);
const CYAN_WORDS = new Set([
  'claude', 'remotion', 'rws', 'outlier', 'onefome', 'welocalize',
  'runway', 'ia', 'inteligência', 'artificial', 'bento',
]);
const RED_WORDS = new Set([
  'erro', 'errei', 'escuro', 'escuridão', 'apagou', 'apaga',
  'desistir', 'r$600',
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
            style={{color: color ?? WHITE, fontWeight: color ? 'bold' : 'normal'}}
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
// Cidade de Aurora — fallback procedural
// ============================================================

const BUILDINGS: ReadonlyArray<{x: number; w: number; h: number}> = [
  {x: -30, w: 170, h: 300}, {x: 150, w: 120, h: 440}, {x: 285, w: 140, h: 230},
  {x: 435, w: 105, h: 360}, {x: 550, w: 175, h: 510}, {x: 735, w: 120, h: 280},
  {x: 865, w: 150, h: 410}, {x: 1025, w: 135, h: 560}, {x: 1170, w: 110, h: 300},
  {x: 1290, w: 165, h: 470}, {x: 1465, w: 120, h: 240}, {x: 1595, w: 145, h: 400},
  {x: 1750, w: 130, h: 330}, {x: 1890, w: 130, h: 270},
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
          position: 'absolute', left: '50%', top: 70, width: 260, height: 260,
          marginLeft: -130, borderRadius: '50%',
          background:
            'radial-gradient(circle, #FFF6D0 0%, #FFD700 35%, #FF9D2E 60%, transparent 75%)',
          opacity: Math.min(1, b * 1.2), transform: `scale(${0.2 + b})`,
        }}
      />
      {BUILDINGS.map((bld, i) => {
        const cols = Math.max(1, Math.floor(bld.w / 38));
        const rows = Math.max(1, Math.floor(bld.h / 52));
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: bld.x, bottom: 0, width: bld.w,
              height: bld.h, backgroundColor: '#0a0a13', display: 'flex',
              flexWrap: 'wrap', alignContent: 'flex-start', padding: 10,
              gap: 12, boxSizing: 'border-box',
            }}
          >
            {Array.from({length: cols * rows}).map((_, j) => {
              const lit = (i * 7 + j * 13) % 5 !== 0;
              return (
                <div
                  key={j}
                  style={{
                    width: 14, height: 20, backgroundColor: GOLD,
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

const ShotView: React.FC<{shot: Shot; progress: number; filter: string}> = ({
  shot,
  progress,
  filter,
}) => {
  const scale = 1.05 + progress * 0.1;
  const driftX = progress * -26;
  return (
    <AbsoluteFill
      style={{transform: `scale(${scale}) translateX(${driftX}px)`, filter}}
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
// Atos — config visual estática (duração/legendas vêm da narração)
// ============================================================

type StageAct = {
  id: string;
  label: string;
  shots: Shot[];
  brightness: (dur: number, lines: NarrationLine[]) => KF;
  flashFrame?: (dur: number, lines: NarrationLine[]) => number;
};

type ResolvedAct = StageAct & {
  durationInFrames: number;
  lines: NarrationLine[];
};

const STAGE: StageAct[] = [
  {
    id: 'ato1',
    label: 'Ato 1 — A Abertura',
    shots: [
      {kind: 'image', image: 'city_plaza'},
      {kind: 'clip', clip: 'intro'},
    ],
    brightness: (d) => [
      [0, 0.82],
      [d, 0.9],
    ],
  },
  {
    id: 'ato2',
    label: 'Ato 2 — O Início de Tudo',
    shots: [
      {kind: 'clip', clip: 'intro'},
      {kind: 'image', image: 'city_plaza'},
    ],
    brightness: (d) => [
      [0, 0.35],
      [d, 0.42],
    ],
  },
  {
    id: 'ato3',
    label: 'Ato 3 — A Primeira Luz',
    shots: [
      {kind: 'clip', clip: 'intro'},
      {kind: 'image', image: 'city_plaza'},
    ],
    brightness: (d) => [
      [0, 0.4],
      [d, 0.78],
    ],
  },
  {
    id: 'ato4',
    label: 'Ato 4 — O Erro dos R$600',
    shots: [
      {kind: 'image', image: 'tower_run'},
      {kind: 'clip', clip: 'correndo'},
    ],
    // O apagão acontece exatamente na fala "o sol apagou" (índice 12).
    brightness: (d, lines) => {
      const bo = lines[12] ? lines[12].start : Math.round(d * 0.6);
      return [
        [0, 0.9],
        [Math.max(1, bo - 30), 0.95],
        [bo + 10, 0.0],
        [d, 0.0],
      ];
    },
    flashFrame: (d, lines) => (lines[12] ? lines[12].start + 4 : Math.round(d * 0.6)),
  },
  {
    id: 'ato5',
    label: 'Ato 5 — A Virada',
    shots: [
      {kind: 'image', image: 'truth_room'},
      {kind: 'clip', clip: 'bento'},
    ],
    brightness: (d) => [
      [0, 0.0],
      [Math.round(d * 0.16), 0.07],
      [Math.round(d * 0.34), 0.22],
      [d, 0.62],
    ],
  },
  {
    id: 'ato6',
    label: 'Ato 6 — O Nascimento do Canal',
    shots: [
      {kind: 'clip', clip: 'vitoria'},
      {kind: 'image', image: 'lina_sheet', fit: 'contain'},
      {kind: 'image', image: 'bento_sheet', fit: 'contain'},
    ],
    brightness: (d) => [
      [0, 0.6],
      [d, 1.0],
    ],
  },
  {
    id: 'ato7',
    label: 'Ato 7 — CTA Final',
    shots: [
      {kind: 'clip', clip: 'vitoria'},
      {kind: 'image', image: 'city_plaza'},
    ],
    brightness: (d) => [
      [0, 1.0],
      [d, 1.0],
    ],
  },
];

const ACTS: ResolvedAct[] = STAGE.map((stage) => {
  const narration = NARRATION_ACTS.find((a) => a.id === stage.id);
  if (!narration) {
    throw new Error(`Sem narração para o ato ${stage.id}`);
  }
  return {
    ...stage,
    durationInFrames: narration.durationInFrames,
    lines: narration.lines,
  };
});

// ============================================================
// Fundo do ato — tomadas com crossfade
// ============================================================

const SHOT_FADE = 16;

const ActBackground: React.FC<{act: ResolvedAct}> = ({act}) => {
  const frame = useCurrentFrame();
  const b = sampleKeyframes(frame, act.brightness(act.durationInFrames, act.lines));

  const shots = act.shots;
  const slot = act.durationInFrames / shots.length;

  const filterBrightness = 0.32 + b * 0.9;
  const filterSaturate = 0.85 + b * 0.5;
  const filter = `brightness(${filterBrightness.toFixed(3)}) saturate(${filterSaturate.toFixed(3)})`;
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
          opacity = interpolate(frame, [e - SHOT_FADE, e + SHOT_FADE], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
        } else if (isLast) {
          opacity = interpolate(frame, [s - SHOT_FADE, s + SHOT_FADE], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
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

      <AbsoluteFill style={{backgroundColor: BLACK, opacity: darkness}} />
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
// Frente do ato — legendas sincronizadas, rótulo, flash, fades
// ============================================================

const ActForeground: React.FC<{act: ResolvedAct}> = ({act}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = act.durationInFrames;

  const labelOpacity = interpolate(
    frame,
    [0, 20, 95, 125],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const fadeIn = interpolate(frame, [0, 15], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [dur - 22, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const blackOpacity = Math.max(fadeIn, fadeOut);

  const flashAt = act.flashFrame
    ? act.flashFrame(dur, act.lines)
    : null;
  const flash =
    flashAt !== null
      ? interpolate(
          frame,
          [flashAt - 8, flashAt, flashAt + 24],
          [0, 0.75, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        )
      : 0;

  return (
    <AbsoluteFill style={{fontFamily: FONT}}>
      <div
        style={{
          position: 'absolute', top: 50, width: '100%', textAlign: 'center',
          color: CYAN, fontSize: 18, textTransform: 'uppercase',
          letterSpacing: '8px', opacity: labelOpacity,
          textShadow: '0 2px 12px #000000',
        }}
      >
        {act.label}
      </div>

      {act.lines.map((line, i) => {
        const {start, end} = line;
        const opacity = interpolate(
          frame,
          [start, start + 12, end - 12, end],
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
              position: 'absolute', bottom: 84, left: '50%', width: 1440,
              marginLeft: -720, opacity,
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
              <HighlightedText text={line.display} />
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
// COMPOSIÇÃO PRINCIPAL — Aurora 7 Ep 2 (sincronizada à narração)
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

      <Audio src={staticFile(NARRATION_FILE)} />
    </AbsoluteFill>
  );
};
