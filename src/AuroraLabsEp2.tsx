import React from 'react';
import {
  AbsoluteFill,
  Img,
  Loop,
  Sequence,
  OffthreadVideo,
  useCurrentFrame,
  interpolate,
  staticFile,
  Easing,
  CalculateMetadataFunction,
} from 'remotion';
import { getVideoMetadata } from '@remotion/media-utils';

const CROSSFADE = 30;
const BROLL_FADE = 26;
const BROLL_CROSSFADE = 32;
const FPS = 30;

// Easing suave (S-curve) usado em todas as transições.
const EASE = Easing.inOut(Easing.ease);

// Nitidez: filtro de realce aplicado às imagens e vídeos.
const SHARPEN = true;
const GRADE = 'contrast(1.06) saturate(1.12) brightness(1.02)';
const LOOK = SHARPEN ? `url(#auroraSharpen) ${GRADE}` : GRADE;

export type AuroraLabsEp2Props = {
  d1: number;
  d2: number;
  d3: number;
};

// ─── Definição do filtro de nitidez (SVG) ────────────────────────────────────

const SharpenDef: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
    <defs>
      {/* unsharp mask leve — realça sem deixar "crocante" */}
      <filter id="auroraSharpen" x="0" y="0" width="100%" height="100%">
        <feConvolveMatrix
          order="3"
          preserveAlpha="true"
          kernelMatrix="0 -0.2 0  -0.2 1.8 -0.2  0 -0.2 0"
        />
      </filter>
    </defs>
  </svg>
);

// ─── Legendas em inglês ──────────────────────────────────────────────────────

const SUB_FADE = 8;

const SUBTITLE_FONT =
  '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Distribui as falas dentro do segmento proporcionalmente ao tamanho do texto.
const Subtitles: React.FC<{
  durationInFrames: number;
  lines: string[];
}> = ({ durationInFrames, lines }) => {
  const frame = useCurrentFrame();

  const weights = lines.map((l) => Math.max(1, l.length));
  const totalW = weights.reduce((a, b) => a + b, 0);

  let cum = 0;
  const slots = lines.map((text, i) => {
    const start = Math.round((cum / totalW) * durationInFrames);
    cum += weights[i];
    const end =
      i === lines.length - 1
        ? durationInFrames
        : Math.round((cum / totalW) * durationInFrames);
    return { text, start, end };
  });

  return (
    <AbsoluteFill>
      {slots.map((s, i) => {
        const len = s.end - s.start;
        let opacity: number;
        if (len < 6) {
          opacity = frame >= s.start && frame < s.end ? 1 : 0;
        } else {
          const fade = Math.min(SUB_FADE, Math.floor(len / 2) - 1);
          opacity = interpolate(
            frame,
            [s.start, s.start + fade, s.end - fade, s.end],
            [0, 1, 1, 0],
            { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
        }
        if (opacity <= 0.001) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: 70,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              opacity,
            }}
          >
            <span
              style={{
                maxWidth: 1480,
                backgroundColor: 'rgba(0,0,0,0.72)',
                color: '#FFFFFF',
                fontFamily: SUBTITLE_FONT,
                fontSize: 42,
                fontWeight: 600,
                lineHeight: 1.32,
                textAlign: 'center',
                padding: '12px 28px',
                borderRadius: 10,
                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
              }}
            >
              {s.text}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Tradução em inglês — agrupada pelos 3 vídeos talking-head.
const SUBTITLES_V1: string[] = [
  // Ato 1
  "Hi. I'm Lina.",
  'And two weeks ago, I knew absolutely nothing about artificial intelligence.',
  'Nothing. Zero.',
  "I spent six hundred reais on a tool that didn't work.",
  'I was left broke. And I was left in the dark.',
  'But there is a thing about Aurora 7, my city: when the sun goes out, it always comes back.',
  "And I don't give up until I find a new light.",
  "That's when everything changed. That's when this channel was born.",
  "That's when Aurora's sun shone again.",
  "Sit back. I'm going to tell you this story from the beginning.",
  // Ato 2
  'It all started on an ordinary day. No big plans. No big ideas.',
  'I only knew one thing: I was lost.',
  'Not knowing what to do with my life. Needing some extra income.',
  'The bills kept coming. And I had no answer.',
  'So, one random evening, I opened my computer.',
  "And I started searching. Without even knowing what I was looking for.",
  "That's when I found videos about training artificial intelligence.",
  'Ordinary people. Earning money. Teaching machines to think.',
  'Platforms like RWS, Outlier, Oneforma, Welocalize.',
  'Real companies, that pay real people to improve AI.',
  'I stopped. And I read that three times.',
  'Wait. Companies pay you to talk to an AI?',
  'To rate answers? To correct robots? To teach a machine?',
  "I didn't need to know how to code. I didn't need a degree.",
  'I only needed one thing: curiosity.',
  'And curiosity... that I always had plenty of.',
  // Ato 3
  'That same night, I signed up for all of them.',
  'RWS. Outlier. Oneforma. Welocalize.',
  'At first, the tasks were simple.',
  'Rating texts. Comparing answers. Correcting what the AI got wrong.',
  'Classifying images. Marking what was right and what was wrong.',
  'I worked, and I got paid. Little, but I got paid.',
  'And then something strange started to happen.',
  'Without realizing it, I was learning how artificial intelligence thinks inside.',
  "Not as an expert. I wasn't one.",
  'But as a learner. Like someone watching the machine breathe for the first time.',
  'In Aurora 7, when you discover something new, the sun shines a little brighter.',
  'And, slowly, my sun was starting to wake up.',
  "I didn't know it yet. But that was just the beginning.",
];

const SUBTITLES_V2: string[] = [
  // Ato 4
  'But then I made the classic mistake of someone who gets too excited.',
  'In a few weeks, I thought I already knew everything.',
  'I thought I was ready for anything.',
  'That is when I saw a tool called Runway.',
  'They said you could create animated videos with artificial intelligence.',
  'Videos like the ones I dreamed of making.',
  "I didn't think twice. I bought the plan right away.",
  'Six hundred reais. All at once.',
  'And then I tried. And I failed.',
  'I tried again. I failed again.',
  'The tool was good. The problem... was me.',
  "I still didn't know how to use it. I didn't have the basics.",
  'In Aurora 7, that day, the sun went out.',
  'The whole city fell into darkness.',
  'And I sat there. Without the six hundred reais. And with no result.',
  'You know that moment? That thought that tightens your chest?',
  "Maybe this isn't for me. Maybe I'm not good enough.",
  'Maybe... I should just give up.',
  // Ato 5
  'But let me tell you something funny about the dark.',
  'The dark passes. It always passes.',
  'After a few days stuck, I decided to try one last time.',
  'But this time, differently.',
  'Instead of spending money, I went to learn first.',
  "And that's when I found Claude.",
  "An artificial intelligence that didn't just answer my questions.",
  'It taught me to think. It explained the why.',
  "I asked everything. Without being ashamed of not knowing.",
  'How to create a video from scratch. How to use Remotion.',
  'How to animate a character. How to bring a scene to life.',
  'And Claude answered. Patiently. As many times as needed.',
  "In Aurora 7, the sun doesn't come back all at once.",
  "It doesn't light the whole city at once.",
  'It comes back slowly. One light at a time.',
  'And every little thing I learned... was one more window lighting up.',
  'Slowly, my city was starting to shine again.',
  // Ato 6
  "And that's exactly when Aurora Labs was born.",
  "Not as an expert's channel. Because I'm not one.",
  "But as a learner's diary.",
  'A place to show the real path. With the mistakes and all.',
  "I don't know everything. Far, very far from it.",
  "But there's one thing I learned and I'm sure of:",
  'Anyone, with curiosity and courage,',
  'can build something incredible using artificial intelligence.',
  "You don't need to be a genius. You don't need a degree.",
  "You don't even need to know how to code.",
  'You only need one thing: to want to learn.',
  'The rest, we figure out together. One light at a time.',
];

const SUBTITLES_V3: string[] = [
  // Ato 7
  "In the next episodes, I'll show you exactly how I did all of this.",
  "The tools I used. The mistakes I made, so you don't repeat them.",
  'And the step by step for you to create too.',
  "Because Aurora 7's sun doesn't shine just for me.",
  'It shines for everyone who has the courage to try.',
  'If this story spoke to you, subscribe to the channel.',
  'The series is just beginning.',
  "I'm Lina. And my sun... my sun will never go out again.",
];

// ─── Talking-head segment ────────────────────────────────────────────────────

const VideoSegment: React.FC<{
  src: string;
  durationInFrames: number;
  fadeIn: boolean;
  fadeOut: boolean;
}> = ({ src, durationInFrames, fadeIn, fadeOut }) => {
  const frame = useCurrentFrame();

  let opacity: number;
  if (fadeIn && fadeOut) {
    opacity = interpolate(
      frame,
      [0, CROSSFADE, durationInFrames - CROSSFADE, durationInFrames],
      [0, 1, 1, 0],
      { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else if (fadeIn) {
    opacity = interpolate(frame, [0, CROSSFADE], [0, 1], {
      easing: EASE,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else if (fadeOut) {
    opacity = interpolate(
      frame,
      [durationInFrames - CROSSFADE, durationInFrames],
      [1, 0],
      { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else {
    opacity = 1;
  }

  // Áudio: o próprio vídeo carrega o som (fonte única — sem eco).
  // O volume faz crossfade nas mesmas regiões do crossfade visual.
  const volume = (f: number) => {
    let v = 1;
    if (fadeIn) {
      v = Math.min(
        v,
        interpolate(f, [0, CROSSFADE], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      );
    }
    if (fadeOut) {
      v = Math.min(
        v,
        interpolate(f, [durationInFrames - CROSSFADE, durationInFrames], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      );
    }
    return v;
  };

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ width: '100%', height: '100%', filter: LOOK }}>
        <OffthreadVideo
          src={src}
          volume={volume}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── B-roll overlay ──────────────────────────────────────────────────────────

type BRollSegment = {
  type: 'video' | 'image';
  src: string;
  durationInFrames: number;
  // for video: period of one loop iteration; defaults to durationInFrames
  loopDurationInFrames?: number;
};

const coverStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const BRollClip: React.FC<{
  segment: BRollSegment;
  isFirst: boolean;
  isLast: boolean;
}> = ({ segment, isFirst, isLast }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = segment;

  let clipOpacity: number;
  if (!isFirst && !isLast) {
    clipOpacity = interpolate(
      frame,
      [0, BROLL_CROSSFADE, durationInFrames - BROLL_CROSSFADE, durationInFrames],
      [0, 1, 1, 0],
      { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else if (!isFirst) {
    // last clip: fade in only (outer overlay handles exit)
    clipOpacity = interpolate(frame, [0, BROLL_CROSSFADE], [0, 1], {
      easing: EASE,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else if (!isLast) {
    // first clip: fade out only (outer overlay handles entrance)
    clipOpacity = interpolate(
      frame,
      [durationInFrames - BROLL_CROSSFADE, durationInFrames],
      [1, 0],
      { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else {
    clipOpacity = 1;
  }

  // Ken Burns scale for images: 1.0 → 1.15 over slot duration
  const scale =
    segment.type === 'image'
      ? interpolate(frame, [0, durationInFrames], [1, 1.15], {
          easing: EASE,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;

  return (
    <AbsoluteFill style={{ opacity: clipOpacity, overflow: 'hidden' }}>
      {segment.type === 'video' ? (
        <Loop durationInFrames={segment.loopDurationInFrames ?? durationInFrames}>
          <div style={{ width: '100%', height: '100%', filter: LOOK }}>
            <OffthreadVideo src={segment.src} muted style={coverStyle} />
          </div>
        </Loop>
      ) : (
        <Img
          src={segment.src}
          style={{
            ...coverStyle,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            filter: LOOK,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

const BRollOverlay: React.FC<{
  durationInFrames: number;
  segments: BRollSegment[];
}> = ({ durationInFrames, segments }) => {
  const frame = useCurrentFrame();

  const overlayOpacity = interpolate(
    frame,
    [0, BROLL_FADE, durationInFrames - BROLL_FADE, durationInFrames],
    [0, 1, 1, 0],
    { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Each segment starts BROLL_CROSSFADE frames before the previous one ends
  let cursor = 0;
  const segmentStarts: number[] = [];
  for (let i = 0; i < segments.length; i++) {
    segmentStarts.push(cursor);
    if (i < segments.length - 1) {
      cursor += segments[i].durationInFrames - BROLL_CROSSFADE;
    }
  }

  return (
    <AbsoluteFill style={{ opacity: overlayOpacity }}>
      {segments.map((seg, i) => (
        <Sequence
          key={i}
          from={segmentStarts[i]}
          durationInFrames={seg.durationInFrames}
        >
          <BRollClip
            segment={seg}
            isFirst={i === 0}
            isLast={i === segments.length - 1}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ─── Metadata ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-deprecated
export const calculateAuroraEp2Metadata: CalculateMetadataFunction<AuroraLabsEp2Props> =
  async () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const [m1, m2, m3] = await Promise.all([
      getVideoMetadata(staticFile('Lina_fala_ato1_ato2_ato3.mp4')),
      getVideoMetadata(staticFile('Lina_fala_ato456.mp4')),
      getVideoMetadata(staticFile('Lina_fala_ato7.mp4')),
    ]);

    const d1 = Math.round(m1.durationInSeconds * FPS);
    const d2 = Math.round(m2.durationInSeconds * FPS);
    const d3 = Math.round(m3.durationInSeconds * FPS);

    return {
      durationInFrames: 5010 + 6390, // hard stop at end of B-roll overlay (frame 11400)
      props: { d1, d2, d3 },
    };
  };

// ─── Main composition ────────────────────────────────────────────────────────

export const AuroraLabsEp2PT: React.FC<AuroraLabsEp2Props> = ({ d1, d2, d3 }) => {
  if (d1 === 0 || d2 === 0 || d3 === 0) {
    return <AbsoluteFill style={{ backgroundColor: '#000' }} />;
  }

  const v2Start = d1 - CROSSFADE;
  const v3Start = v2Start + d2 - CROSSFADE;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <SharpenDef />

      {/* ── Talking-head layer (cada vídeo carrega o próprio áudio) ── */}

      {/* V1 */}
      <Sequence from={0} durationInFrames={d1}>
        <VideoSegment
          src={staticFile('Lina_fala_ato1_ato2_ato3.mp4')}
          durationInFrames={d1}
          fadeIn={false}
          fadeOut={true}
        />
      </Sequence>

      {/* V2 */}
      <Sequence from={v2Start} durationInFrames={d2}>
        <VideoSegment
          src={staticFile('Lina_fala_ato456.mp4')}
          durationInFrames={d2}
          fadeIn={true}
          fadeOut={true}
        />
      </Sequence>

      {/* V3 */}
      <Sequence from={v3Start} durationInFrames={d3}>
        <VideoSegment
          src={staticFile('Lina_fala_ato7.mp4')}
          durationInFrames={d3}
          fadeIn={true}
          fadeOut={false}
        />
      </Sequence>

      {/* ── B-roll overlay layer (above talking-heads, no audio) ── */}

      {/* B-roll de abertura — cobre os primeiros 8s onde a Lina olha pra baixo */}
      <Sequence from={0} durationInFrames={240}>
        <AbsoluteFill style={{ backgroundColor: '#000' }} />
        <BRollOverlay
          durationInFrames={240}
          segments={[
            { type: 'image', src: staticFile('aurora7_scene1.png'), durationInFrames: 240 },
          ]}
        />
      </Sequence>

      {/*
        Starts at 02:47 (frame 5010) and covers to end of composition (11407 frames).
        Outer durationInFrames = 11407 - 5010 = 6397.
        Segments span 4500 frame-slots (4275 actual timeline after crossfades),
        covering through ~frame 9285. The final ~2122 frames let the talking-head
        show through naturally.
      */}
      <Sequence from={5010} durationInFrames={6390}>
        <AbsoluteFill style={{ backgroundColor: '#000' }} />
        <BRollOverlay
          durationInFrames={6390}
          segments={[
            { type: 'video', src: staticFile('lina_vitoria.mp4'),                          durationInFrames: 450,  loopDurationInFrames: 120 },
            { type: 'image', src: staticFile('ChatGPT_Image_22_36_21.png'),                durationInFrames: 690  },
            { type: 'video', src: staticFile('lina_surpresa.mp4'),                         durationInFrames: 300,  loopDurationInFrames: 120 },
            { type: 'image', src: staticFile('aurora7_scene4_tower_run.png'),              durationInFrames: 450  },
            { type: 'image', src: staticFile('aurora7_scene2_blackout.png'),               durationInFrames: 540  },
            { type: 'video', src: staticFile('Speak_lina_scene2.mp4'),                    durationInFrames: 600,  loopDurationInFrames: 120 },
            { type: 'video', src: staticFile('lina_correndo.mp4'),                         durationInFrames: 660,  loopDurationInFrames: 120 },
            { type: 'image', src: staticFile('aurora7_scene5b_open_horizon.png'),          durationInFrames: 450  },
            { type: 'image', src: staticFile('aurora7_scene3_message.png'),                durationInFrames: 360  },
            { type: 'image', src: staticFile('aurora7_scene1.png'),                        durationInFrames: 750  },
            { type: 'image', src: staticFile('aurora7_scene6b_other_city_signal.png'),     durationInFrames: 750  },
            { type: 'image', src: staticFile('aurora7_scene6_new_sky.png'),                durationInFrames: 390  },
          ]}
        />
      </Sequence>

      {/* ── Legendas em inglês (camada superior) ── */}
      <Sequence from={0} durationInFrames={d1 - CROSSFADE}>
        <Subtitles durationInFrames={d1 - CROSSFADE} lines={SUBTITLES_V1} />
      </Sequence>
      <Sequence from={v2Start} durationInFrames={d2 - CROSSFADE}>
        <Subtitles durationInFrames={d2 - CROSSFADE} lines={SUBTITLES_V2} />
      </Sequence>
      <Sequence from={v3Start} durationInFrames={d3}>
        <Subtitles durationInFrames={d3} lines={SUBTITLES_V3} />
      </Sequence>
    </AbsoluteFill>
  );
};
