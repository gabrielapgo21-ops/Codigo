import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {parseSrt, type Caption} from '../lib/parseSrt';
import {CAPTION_OFFSET_SEC, CAPTIONS_SRT, secToFrames} from '../timeline';

const GOLD = '#E8B23A';

/** One caption: fades + rises in over ~9 frames, with word-by-word gold highlight. */
const CaptionCard: React.FC<{cue: Caption}> = ({cue}) => {
  const frame = useCurrentFrame();
  const durFrames = Math.max(1, secToFrames(cue.endSec - cue.startSec));

  const opacity = interpolate(frame, [0, 9], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rise = interpolate(frame, [0, 9], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Distribute words across the cue weighted by length for the gold sweep.
  const words = cue.text.split(/\s+/);
  const weights = words.map((w) => Math.max(1, w.length));
  const totalW = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  const wordStartFrac = weights.map((w) => {
    const start = acc / totalW;
    acc += w;
    return start;
  });
  const progress = frame / durFrames;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 96,
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          textAlign: 'center',
          opacity,
          transform: `translateY(${rise}px)`,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: 800,
          fontSize: 52,
          lineHeight: 1.18,
          color: '#fff',
          letterSpacing: 0.3,
          // thick black outline (double technique for crisp edges)
          WebkitTextStroke: '2.5px #000',
          paintOrder: 'stroke fill',
          textShadow:
            '0 3px 10px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.95)',
        }}
      >
        {words.map((w, i) => {
          const active = progress >= wordStartFrac[i];
          return (
            <span key={i} style={{color: active ? GOLD : '#fff', transition: 'none'}}>
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading captions SRT'));
  const [cues, setCues] = useState<Caption[]>([]);

  useEffect(() => {
    fetch(staticFile(CAPTIONS_SRT))
      .then((res) => res.text())
      .then((txt) => {
        setCues(parseSrt(txt));
        continueRender(handle);
      })
      .catch((err) => {
        // Missing captions shouldn't kill the render — just log and continue.
        // eslint-disable-next-line no-console
        console.warn('Captions not loaded:', err);
        continueRender(handle);
      });
  }, [handle]);

  return (
    <AbsoluteFill>
      {cues.map((cue, i) => {
        const from = secToFrames(cue.startSec + CAPTION_OFFSET_SEC);
        const dur = Math.max(1, secToFrames(cue.endSec - cue.startSec));
        if (from < 0) return null;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`cap-${cue.index}`}>
            <CaptionCard cue={cue} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
