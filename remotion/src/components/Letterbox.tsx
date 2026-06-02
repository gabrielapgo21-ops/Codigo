import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Subtle cinematic letterbox. Thin bars (not full 2.39:1) so it stays
 * YouTube-safe and doesn't crop the captions. Toggle via the `enabled` prop.
 */
export const Letterbox: React.FC<{barHeight?: number; enabled?: boolean}> = ({
  barHeight = 38,
  enabled = true,
}) => {
  if (!enabled) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: barHeight, backgroundColor: '#000'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: barHeight, backgroundColor: '#000'}} />
    </AbsoluteFill>
  );
};
