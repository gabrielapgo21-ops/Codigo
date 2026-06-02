import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {DURATION_SECONDS, FPS, HEIGHT, secToFrames, WIDTH} from './timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VideoBilionario"
      component={Video}
      durationInFrames={secToFrames(DURATION_SECONDS)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
