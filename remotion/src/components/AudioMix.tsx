import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {
  ENABLE_MUSIC,
  ENABLE_SFX,
  MUSIC,
  NARRATION,
  SCENES,
  secToFrames,
  SFX,
  WHOOSH_FILE,
} from '../timeline';

/**
 * Full audio mix:
 *  - 8 narration blocks at full level, placed at exact start times.
 *  - tension drone looped underneath at ~0.12 with 4s in/out fades.
 *  - SFX: sub-bass booms + whooshes on dip-to-black cuts.
 * Everything except narration is optional via flags in timeline.ts.
 */
export const AudioMix: React.FC = () => {
  const {durationInFrames} = useVideoConfig();

  const fadeInFrames = secToFrames(MUSIC.fadeInSec);
  const fadeOutFrames = secToFrames(MUSIC.fadeOutSec);

  return (
    <>
      {/* Narration */}
      {NARRATION.map((block, i) => {
        const from = secToFrames(block.startSec);
        const dur = Math.max(1, secToFrames(block.endSec - block.startSec));
        return (
          <Sequence key={`narr-${i}`} from={from} durationInFrames={dur} name={block.file}>
            <Audio src={staticFile(block.file)} />
          </Sequence>
        );
      })}

      {/* Tension music bed, looped + ducked with fades */}
      {ENABLE_MUSIC ? (
        <Audio
          src={staticFile(MUSIC.file)}
          loop
          volume={(f) => {
            const fadeIn = f < fadeInFrames ? f / fadeInFrames : 1;
            const fadeOut =
              f > durationInFrames - fadeOutFrames
                ? Math.max(0, (durationInFrames - f) / fadeOutFrames)
                : 1;
            return MUSIC.volume * Math.min(fadeIn, fadeOut);
          }}
        />
      ) : null}

      {/* One-shot SFX booms */}
      {ENABLE_SFX
        ? SFX.map((s, i) => (
            <Sequence
              key={`sfx-${i}`}
              from={secToFrames(s.atSec)}
              durationInFrames={secToFrames(2)}
              name={`sfx-${i}`}
            >
              <Audio src={staticFile(s.file)} volume={s.volume} />
            </Sequence>
          ))
        : null}

      {/* Whoosh on every dip-to-black cut (placed slightly before the cut) */}
      {ENABLE_SFX
        ? SCENES.filter((sc) => sc.transition === 'dip').map((sc, i) => {
            const at = Math.max(0, secToFrames(sc.startSec - 0.25));
            return (
              <Sequence
                key={`whoosh-${i}`}
                from={at}
                durationInFrames={secToFrames(1.2)}
                name={`whoosh-${i}`}
              >
                <Audio src={staticFile(WHOOSH_FILE)} volume={0.5} />
              </Sequence>
            );
          })
        : null}
    </>
  );
};
