import {Composition} from 'remotion';
import {AuroraLabsEp1} from './AuroraLabsEp1';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AuroraLabsEp1PT"
        component={AuroraLabsEp1}
        durationInFrames={5400}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{lang: 'PT' as const}}
      />
      <Composition
        id="AuroraLabsEp1EN"
        component={AuroraLabsEp1}
        durationInFrames={5400}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{lang: 'EN' as const}}
      />
    </>
  );
};
