import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CINEMATIC_EASE} from '../lib/easing';
import type {KenBurns} from '../timeline';

/**
 * Buttery-smooth Ken Burns.
 *
 * Why this looks good (and the old ffmpeg zoompan did not):
 *  - Every single frame moves (30/60fps), no 4fps stepping.
 *  - Motion is a sub-pixel CSS transform on the GPU (scale + translate3d),
 *    NOT a per-frame pixel crop.
 *  - Eased with a slow-in/slow-out bezier, never linear.
 *  - Subtle: scale drifts ~1.0 -> 1.06 only.
 *  - The image is pre-scaled (OVERSCAN) larger than the frame so the zoom
 *    and pan never reveal an edge.
 */

const OVERSCAN = 1.08; // image rendered 8% larger than frame -> safety margin
const DRIFT_PX = 46; // total pan travel toward the subject (subtle)

export const KenBurnsImage: React.FC<{
  src: string;
  kenBurns: KenBurns;
  /** Scene length in frames. Pass explicitly — inside a TransitionSeries the
   *  composition duration is not the scene duration. */
  durationInFrames?: number;
}> = ({src, kenBurns, durationInFrames: durProp}) => {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  const durationInFrames = durProp ?? config.durationInFrames;

  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {
    easing: CINEMATIC_EASE,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const zoom = kenBurns.zoom ?? 1.06;
  const zoomFactor =
    kenBurns.direction === 'in'
      ? interpolate(progress, [0, 1], [1, zoom])
      : interpolate(progress, [0, 1], [zoom, 1]);

  const scale = OVERSCAN * zoomFactor;

  // Drift through center toward the subject anchor (stays inside the overscan margin).
  const tx = interpolate(progress, [0, 1], [-kenBurns.anchorX * DRIFT_PX, kenBurns.anchorX * DRIFT_PX]);
  const ty = interpolate(progress, [0, 1], [-kenBurns.anchorY * DRIFT_PX, kenBurns.anchorY * DRIFT_PX]);

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      />
    </AbsoluteFill>
  );
};
