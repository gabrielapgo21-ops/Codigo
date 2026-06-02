import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';

/**
 * Custom @remotion/transitions presentation: dip-to-black.
 * The outgoing scene fades to transparent in the first half, the incoming
 * scene fades up in the second half. The black comes from the composition
 * background showing through — so we must NOT paint an opaque backdrop here.
 */
const DipPresentation: React.FC<
  TransitionPresentationComponentProps<Record<string, never>>
> = ({children, presentationDirection, presentationProgress}) => {
  const opacity =
    presentationDirection === 'exiting'
      ? interpolate(presentationProgress, [0, 0.5], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : interpolate(presentationProgress, [0.5, 1], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const dipToBlack = (): TransitionPresentation<Record<string, never>> => {
  return {component: DipPresentation, props: {}};
};
