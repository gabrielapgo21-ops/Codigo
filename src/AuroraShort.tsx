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
  Easing,
} from 'remotion';

// ── Short vertical 1080x1920 · 30fps · 1200 frames (40s) ─────────────────────

const GOLD = '#FFD700';
const CYAN = '#36E3FF';
const RED = '#FF5C5C';
const WHITE = '#FFFFFF';
const FONT = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const EASE = Easing.inOut(Easing.ease);

const CLIP = (name: string) => staticFile(`images/Aurora Labs/${name}`);

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ── Mídia: vídeo (loop, câmera lenta, recorte vertical) ──────────────────────

const VClip: React.FC<{src: string; loopFrames: number}> = ({
  src,
  loopFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 360], [1.12, 1.22], {
    ...clamp,
    easing: EASE,
  });
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`}}>
      <Loop durationInFrames={loopFrames}>
        <OffthreadVideo
          src={src}
          playbackRate={0.65}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </Loop>
    </AbsoluteFill>
  );
};

const VImage: React.FC<{src: string}> = ({src}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 360], [1.04, 1.2], {
    ...clamp,
    easing: EASE,
  });
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`}}>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

// ── Legenda cinética ─────────────────────────────────────────────────────────

type Seg = {t: string; c?: string};
type CardT = {start: number; segs: Seg[]; size?: number; dim?: boolean};

const Card: React.FC<{card: CardT; end: number}> = ({card, end}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {start, segs, size = 66, dim = false} = card;

  const opacity = interpolate(
    frame,
    [start, start + 10, end - 10, end],
    [0, 1, 1, 0],
    {...clamp, easing: EASE}
  );
  if (opacity <= 0.001) return null;

  const words: {w: string; c: string}[] = [];
  segs.forEach((s) => {
    s.t.split(' ').forEach((w) => {
      if (w.length) words.push({w, c: s.c ?? WHITE});
    });
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 470,
        left: 60,
        width: 960,
        opacity,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '6px 16px',
      }}
    >
      {words.map((word, i) => {
        const p = spring({
          frame: frame - start - i * 3,
          fps,
          config: {damping: 200},
        });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: size,
              lineHeight: 1.18,
              color: word.c,
              opacity: dim ? 0.72 * p : p,
              transform: `translateY(${(1 - p) * 26}px) scale(${0.86 + p * 0.14})`,
              textShadow:
                '0 4px 18px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.95)',
              fontStyle: dim ? 'italic' : 'normal',
            }}
          >
            {word.w}
          </span>
        );
      })}
    </div>
  );
};

// ── Bloco (beat): mídia + escurecimento + gradiente + legendas ───────────────

const Beat: React.FC<{
  durationInFrames: number;
  media: React.ReactNode;
  cards: CardT[];
  darkFrom: number;
  darkTo: number;
}> = ({durationInFrames, media, cards, darkFrom, darkTo}) => {
  const frame = useCurrentFrame();

  const dark = interpolate(
    frame,
    [0, durationInFrames],
    [darkFrom, darkTo],
    clamp
  );
  const beatOp = interpolate(
    frame,
    [0, 14, durationInFrames - 14, durationInFrames],
    [0, 1, 1, 0],
    {...clamp, easing: EASE}
  );

  return (
    <AbsoluteFill style={{opacity: beatOp}}>
      {media}
      <AbsoluteFill style={{backgroundColor: '#05060a', opacity: dark}} />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 28%, transparent 42%, rgba(0,0,0,0.92) 90%)',
        }}
      />
      {cards.map((card, i) => (
        <Card
          key={i}
          card={card}
          end={i < cards.length - 1 ? cards[i + 1].start : durationInFrames}
        />
      ))}
    </AbsoluteFill>
  );
};

// ── Composição ───────────────────────────────────────────────────────────────

export const AuroraShortPT: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {/* Música de fundo — mesma trilha do AuroraLabsEp1 */}
      <Audio
        src={staticFile('leberch-chase-254539.mp3')}
        volume={(f) =>
          interpolate(f, [0, 24, 1130, 1200], [0, 0.7, 0.7, 0], clamp)
        }
      />
      {/* A — Gancho (0-180) */}
      <Sequence from={0} durationInFrames={180}>
        <Beat
          durationInFrames={180}
          darkFrom={0.34}
          darkTo={0.28}
          media={<VClip src={CLIP('lina_surpresa.mp4')} loopFrames={460} />}
          cards={[
            {start: 8, segs: [{t: 'Two weeks ago'}]},
            {
              start: 78,
              segs: [
                {t: 'I knew '},
                {t: 'NOTHING', c: GOLD},
                {t: ' about AI.'},
              ],
              size: 74,
            },
          ]}
        />
      </Sequence>

      {/* B — A queda (180-510) */}
      <Sequence from={180} durationInFrames={330}>
        <Beat
          durationInFrames={330}
          darkFrom={0.32}
          darkTo={0.78}
          media={<VImage src={staticFile('aurora7_scene2_blackout.png')} />}
          cards={[
            {
              start: 10,
              segs: [
                {t: 'I spent '},
                {t: 'R$600', c: RED},
                {t: ' on an AI tool.'},
              ],
            },
            {start: 108, segs: [{t: "It didn't work."}], size: 78},
            {
              start: 182,
              segs: [
                {t: 'I was left broke.'},
                {t: ' And in the '},
                {t: 'dark', c: RED},
                {t: '.'},
              ],
            },
            {
              start: 258,
              segs: [{t: '"Maybe this isn\'t for me..."'}],
              size: 58,
              dim: true,
            },
          ]}
        />
      </Sequence>

      {/* C — A virada (510-870) */}
      <Sequence from={510} durationInFrames={360}>
        <Beat
          durationInFrames={360}
          darkFrom={0.72}
          darkTo={0.24}
          media={<VClip src={CLIP('lina_bento.mp4')} loopFrames={232} />}
          cards={[
            {
              start: 10,
              segs: [
                {t: 'But the dark always '},
                {t: 'passes', c: GOLD},
                {t: '.'},
              ],
            },
            {
              start: 100,
              segs: [
                {t: 'Instead of spending, I went to '},
                {t: 'LEARN', c: CYAN},
                {t: '.'},
              ],
            },
            {
              start: 192,
              segs: [{t: 'I found '}, {t: 'Claude', c: CYAN}, {t: '.'}],
              size: 78,
            },
            {
              start: 270,
              segs: [
                {t: 'Each thing I learned,'},
                {t: ' a '},
                {t: 'light', c: GOLD},
                {t: ' turning on.'},
              ],
            },
          ]}
        />
      </Sequence>

      {/* D — A vitória (870-1080) */}
      <Sequence from={870} durationInFrames={210}>
        <Beat
          durationInFrames={210}
          darkFrom={0.26}
          darkTo={0.2}
          media={<VClip src={CLIP('lina_vitoria.mp4')} loopFrames={232} />}
          cards={[
            {
              start: 10,
              segs: [
                {t: 'Today I have an '},
                {t: 'animated series', c: GOLD},
                {t: '.'},
              ],
            },
            {start: 92, segs: [{t: 'Made with AI. From scratch.'}]},
            {
              start: 150,
              segs: [
                {t: 'You just need to '},
                {t: 'want to learn', c: GOLD},
                {t: '.'},
              ],
            },
          ]}
        />
      </Sequence>

      {/* E — CTA (1080-1200) */}
      <Sequence from={1080} durationInFrames={120}>
        <Beat
          durationInFrames={120}
          darkFrom={0.24}
          darkTo={0.32}
          media={<VClip src={CLIP('lina_falando.mp4')} loopFrames={232} />}
          cards={[
            {start: 6, segs: [{t: "I'm Lina."}], size: 70},
            {
              start: 52,
              segs: [
                {t: 'And my sun will never '},
                {t: 'go out', c: GOLD},
                {t: ' again.'},
              ],
            },
          ]}
        />
        <CtaTag />
      </Sequence>
    </AbsoluteFill>
  );
};

// Selo fixo do canal na cena final.
const CtaTag: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 70, fps, config: {damping: 200}});
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 230,
        width: '100%',
        textAlign: 'center',
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          color: GOLD,
          fontSize: 50,
          fontWeight: 800,
          letterSpacing: 6,
          textShadow: '0 0 30px rgba(255,215,0,0.5), 0 3px 10px #000',
        }}
      >
        AURORA LABS
      </div>
      <div
        style={{
          color: WHITE,
          fontSize: 28,
          fontWeight: 600,
          marginTop: 8,
          letterSpacing: 2,
          textShadow: '0 2px 8px #000',
        }}
      >
        Subscribe · the series has begun ☀️
      </div>
    </div>
  );
};
