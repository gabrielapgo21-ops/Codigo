import React from 'react';
import { Composition } from 'remotion';
import { AuroraLabsEp1PT, AuroraLabsEp1EN } from './AuroraLabsEp1';
import { AuroraLabsEp2PT, calculateAuroraEp2Metadata, type AuroraLabsEp2Props } from './AuroraLabsEp2';
import { AuroraShortPT } from './AuroraShort';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AuroraLabsEp1PT"
        component={AuroraLabsEp1PT}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AuroraLabsEp1EN"
        component={AuroraLabsEp1EN}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AuroraLabsEp2PT"
        component={AuroraLabsEp2PT}
        durationInFrames={100}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ d1: 0, d2: 0, d3: 0 } satisfies AuroraLabsEp2Props}
        calculateMetadata={calculateAuroraEp2Metadata}
      />
      <Composition
        id="AuroraShortPT"
        component={AuroraShortPT}
        durationInFrames={1200}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
