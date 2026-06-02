import React from 'react';
import {AbsoluteFill} from 'remotion';
import {
  TransitionSeries,
  linearTiming,
  type TransitionPresentation,
} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {KenBurnsImage} from './components/KenBurnsImage';
import {ColorGrade} from './components/ColorGrade';
import {FilmGrain} from './components/FilmGrain';
import {Letterbox} from './components/Letterbox';
import {Captions} from './components/Captions';
import {AudioMix} from './components/AudioMix';
import {dipToBlack} from './components/dipToBlack';
import {CINEMATIC_EASE} from './lib/easing';
import {
  CROSSFADE_FRAMES,
  DIP_FRAMES,
  SCENES,
  secToFrames,
} from './timeline';

/** Frames of the transition that comes INTO scene index i (0 = none). */
const transIntoFrames = (i: number): number => {
  if (i === 0) return 0;
  return SCENES[i].transition === 'dip' ? DIP_FRAMES : CROSSFADE_FRAMES;
};

/**
 * The visual track is a TransitionSeries. To keep total length EXACTLY equal
 * to the audio timeline while crossfades overlap, each scene's sequence is
 * padded by half of each adjacent transition. Then:
 *   total = Σ seqDur - Σ transitions = Σ slot = full duration.
 */
const buildSequenceDurations = (): number[] => {
  return SCENES.map((sc, i) => {
    const startF = secToFrames(sc.startSec);
    const endF = secToFrames(sc.endSec);
    const slot = endF - startF;
    const inHalf = transIntoFrames(i) / 2;
    const outHalf = i < SCENES.length - 1 ? transIntoFrames(i + 1) / 2 : 0;
    return slot + inHalf + outHalf;
  });
};

const VisualTrack: React.FC = () => {
  const seqDurations = buildSequenceDurations();

  return (
    <TransitionSeries>
      {SCENES.map((scene, i) => {
        const seqDur = seqDurations[i];
        const els: React.ReactNode[] = [];

        // Transition INTO this scene (skip before the first scene).
        if (i > 0) {
          const isDip = scene.transition === 'dip';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const presentation = (isDip ? dipToBlack() : fade()) as TransitionPresentation<any>;
          els.push(
            <TransitionSeries.Transition
              key={`t-${scene.id}`}
              timing={linearTiming({
                durationInFrames: isDip ? DIP_FRAMES : CROSSFADE_FRAMES,
                easing: CINEMATIC_EASE,
              })}
              presentation={presentation}
            />
          );
        }

        els.push(
          <TransitionSeries.Sequence key={scene.id} durationInFrames={seqDur}>
            <KenBurnsImage
              src={`imagens/${scene.image}.png`}
              kenBurns={scene.kenBurns}
              durationInFrames={seqDur}
            />
          </TransitionSeries.Sequence>
        );

        return els;
      })}
    </TransitionSeries>
  );
};

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {/* Footage + transitions */}
      <VisualTrack />

      {/* Look */}
      <ColorGrade />
      <FilmGrain opacity={0.06} />
      <Letterbox enabled barHeight={38} />

      {/* Captions on top of the grade */}
      <Captions />

      {/* Sound */}
      <AudioMix />
    </AbsoluteFill>
  );
};
