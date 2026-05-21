import React from 'react';
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  Loop,
  Sequence,
  OffthreadVideo,
  useCurrentFrame,
  interpolate,
  staticFile,
  CalculateMetadataFunction,
} from 'remotion';
import { getVideoMetadata } from '@remotion/media-utils';

const CROSSFADE = 30;
const BROLL_FADE = 20;
const BROLL_CROSSFADE = 25;
const FPS = 30;

export type AuroraLabsEp2Props = {
  d1: number;
  d2: number;
  d3: number;
};

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
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else if (fadeIn) {
    opacity = interpolate(frame, [0, CROSSFADE], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else if (fadeOut) {
    opacity = interpolate(
      frame,
      [durationInFrames - CROSSFADE, durationInFrames],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else {
    opacity = 1;
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ width: '100%', height: '100%', filter: 'contrast(1.08) saturate(1.15) brightness(1.02)' }}>
        <OffthreadVideo src={src} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else if (!isFirst) {
    // last clip: fade in only (outer overlay handles exit)
    clipOpacity = interpolate(frame, [0, BROLL_CROSSFADE], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else if (!isLast) {
    // first clip: fade out only (outer overlay handles entrance)
    clipOpacity = interpolate(
      frame,
      [durationInFrames - BROLL_CROSSFADE, durationInFrames],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  } else {
    clipOpacity = 1;
  }

  // Ken Burns scale for images: 1.0 → 1.15 over slot duration
  const scale = segment.type === 'image'
    ? interpolate(frame, [0, durationInFrames], [1, 1.15], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <AbsoluteFill style={{ opacity: clipOpacity, overflow: 'hidden' }}>
      {segment.type === 'video' ? (
        <Loop durationInFrames={segment.loopDurationInFrames ?? durationInFrames}>
          <OffthreadVideo src={segment.src} muted style={coverStyle} />
        </Loop>
      ) : (
        <Img
          src={segment.src}
          style={{
            ...coverStyle,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
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
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
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
      {/* ── Talking-head layer ── */}

      {/* V1: visual fades out over 30f, audio cuts dry at frame d1-CROSSFADE */}
      <Sequence from={0} durationInFrames={d1}>
        <VideoSegment
          src={staticFile('Lina_fala_ato1_ato2_ato3.mp4')}
          durationInFrames={d1}
          fadeIn={false}
          fadeOut={true}
        />
        <Html5Audio src={staticFile('Lina_fala_ato1_ato2_ato3.mp4')} trimAfter={d1 - CROSSFADE} />
      </Sequence>

      {/* V2: visual crossfades both ends, audio starts dry when V1 audio cuts */}
      <Sequence from={v2Start} durationInFrames={d2}>
        <VideoSegment
          src={staticFile('Lina_fala_ato456.mp4')}
          durationInFrames={d2}
          fadeIn={true}
          fadeOut={true}
        />
        <Sequence from={0} durationInFrames={d2 - CROSSFADE}>
          <Html5Audio src={staticFile('Lina_fala_ato456.mp4')} />
        </Sequence>
      </Sequence>

      {/* V3: visual fades in over 30f, audio starts dry when V2 audio cuts */}
      <Sequence from={v3Start} durationInFrames={d3}>
        <VideoSegment
          src={staticFile('Lina_fala_ato7.mp4')}
          durationInFrames={d3}
          fadeIn={true}
          fadeOut={false}
        />
        <Html5Audio src={staticFile('Lina_fala_ato7.mp4')} />
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
    </AbsoluteFill>
  );
};
