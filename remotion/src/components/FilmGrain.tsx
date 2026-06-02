import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/**
 * Very light animated film grain. An SVG feTurbulence noise tile whose seed
 * advances over time so the grain shimmers instead of sitting static.
 * Kept at low opacity + overlay blend so it reads as texture, not noise.
 */
export const FilmGrain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
  const frame = useCurrentFrame();
  // Cycle through a small set of seeds so frames can still be cached.
  const seed = frame % 8;

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}' stitchTiles='stitch'/>
      <feColorMatrix type='saturate' values='0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: url,
        backgroundSize: '220px 220px',
        backgroundRepeat: 'repeat',
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};
