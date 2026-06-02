import {Easing} from 'remotion';

/**
 * The one easing curve used for ALL Ken Burns motion and transitions:
 * slow-in / slow-out. This is the difference between "calm documentary"
 * and "shaky slideshow". Never use linear for camera moves.
 */
export const CINEMATIC_EASE = Easing.bezier(0.33, 0, 0.2, 1);
