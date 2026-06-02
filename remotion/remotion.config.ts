import {Config} from '@remotion/cli/config';

// H.264 MP4, yuv420p, CRF ~18 — broad-compatibility YouTube master.
Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(18);
Config.setChromiumOpenGlRenderer('angle');
// Keep concurrency conservative so long renders stay stable in CI/containers.
Config.setConcurrency(4);
