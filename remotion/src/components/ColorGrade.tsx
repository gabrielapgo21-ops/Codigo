import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Cinematic color grade overlay: cold blue shadows, warm gold highlights,
 * and a gentle vignette. Pure CSS blend layers — cheap and consistent.
 * Sits above the footage, below captions.
 */
export const ColorGrade: React.FC = () => {
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* Cold shadows */}
      <AbsoluteFill
        style={{
          backgroundColor: '#0a1c33',
          mixBlendMode: 'multiply',
          opacity: 0.22,
        }}
      />
      {/* Warm gold highlights */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 120% at 50% 35%, rgba(232,178,58,0.28) 0%, rgba(232,178,58,0.0) 55%)',
          mixBlendMode: 'soft-light',
          opacity: 0.9,
        }}
      />
      {/* Teal/orange split-tone for the "premium thriller" look */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(0deg, rgba(7,40,55,0.35) 0%, rgba(0,0,0,0) 45%, rgba(60,40,10,0.25) 100%)',
          mixBlendMode: 'soft-light',
          opacity: 0.8,
        }}
      />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(110% 110% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
