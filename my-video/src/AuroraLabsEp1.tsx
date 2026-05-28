import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';

// ============================================================
// IMAGE URLS — substitui pelos teus links públicos antes de renderizar.
// Se ficarem como placeholder, mostra um aviso visual em vez da imagem.
// ============================================================
const AURORA_IMAGES = {
  scene1: 'REPLACE_WITH_URL_aurora7_scene1',
  scene2: 'REPLACE_WITH_URL_aurora7_scene2_blackout',
  scene3: 'REPLACE_WITH_URL_aurora7_scene3_message',
  scene4: 'REPLACE_WITH_URL_aurora7_scene4_tower_run',
};

type Lang = 'PT' | 'EN';
type Props = {lang: Lang};

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const GOLD = '#FFD700';
const CYAN = '#00E5FF';
const WHITE = '#FFFFFF';
const BLACK = '#000000';

// ============================================================
// Helpers
// ============================================================

const useSpringIn = (startFrame: number, damping = 18) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localFrame = Math.max(0, frame - startFrame);
  return spring({frame: localFrame, fps, config: {damping}});
};

const useFade = (startFrame: number, durationFrames = 20) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
};

const useFadeOut = (startFrame: number, durationFrames = 15) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
};

const FadeToBlack: React.FC<{from: number; to: number}> = ({from, to}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLACK,
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

const ImageOrPlaceholder: React.FC<{
  src: string;
  label: string;
  style?: React.CSSProperties;
}> = ({src, label, style}) => {
  const isPlaceholder = src.startsWith('REPLACE_WITH_URL');
  if (isPlaceholder) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#444',
          fontSize: 32,
          fontFamily: FONT,
          letterSpacing: 4,
          textTransform: 'uppercase',
          ...style,
        }}
      >
        [ {label} — set image URL ]
      </div>
    );
  }
  return (
    <Img
      src={src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
    />
  );
};

// ============================================================
// SCENE 1 — Hook (frames 0..180 — local space)
// ============================================================

const Scene1: React.FC<Props> = ({lang}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const lines =
    lang === 'PT'
      ? [
          {
            text: 'Há duas semanas',
            start: 0,
            style: {
              color: WHITE,
              fontSize: 28,
              textTransform: 'uppercase' as const,
              letterSpacing: '6px',
            },
          },
          {
            text: 'eu não sabia nada sobre IA.',
            start: 30,
            style: {
              color: 'rgba(255,255,255,0.7)',
              fontSize: 22,
              fontStyle: 'italic' as const,
            },
          },
          {
            text: 'Hoje tenho uma série animada.',
            start: 90,
            style: {color: WHITE, fontSize: 26},
          },
          {
            text: 'Um canal.',
            start: 120,
            style: {color: WHITE, fontSize: 26},
          },
          {
            text: 'E uma história que preciso te contar.',
            start: 150,
            style: {
              color: GOLD,
              fontSize: 32,
              fontWeight: 'bold' as const,
              textShadow: '0 0 40px #FFD70088',
            },
          },
        ]
      : [
          {
            text: 'Two weeks ago',
            start: 0,
            style: {
              color: WHITE,
              fontSize: 28,
              textTransform: 'uppercase' as const,
              letterSpacing: '6px',
            },
          },
          {
            text: 'I knew nothing about AI.',
            start: 30,
            style: {
              color: 'rgba(255,255,255,0.7)',
              fontSize: 22,
              fontStyle: 'italic' as const,
            },
          },
          {
            text: 'Today I have an animated series.',
            start: 90,
            style: {color: WHITE, fontSize: 26},
          },
          {
            text: 'A channel.',
            start: 120,
            style: {color: WHITE, fontSize: 26},
          },
          {
            text: 'And a story I need to tell you.',
            start: 150,
            style: {
              color: GOLD,
              fontSize: 32,
              fontWeight: 'bold' as const,
              textShadow: '0 0 40px #FFD70088',
            },
          },
        ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLACK,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 24,
        fontFamily: FONT,
      }}
    >
      {lines.map((line, i) => {
        const localFrame = Math.max(0, frame - line.start);
        const progress = spring({
          frame: localFrame,
          fps,
          config: {damping: 18},
        });
        return (
          <div
            key={i}
            style={{
              ...line.style,
              opacity: progress,
              transform: `translateY(${(1 - progress) * 20}px)`,
            }}
          >
            {line.text}
          </div>
        );
      })}
      <FadeToBlack from={165} to={180} />
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2 — O Início (absolute 180..480 → local 0..300)
// Title fade 0–20, tags at 40/75/110/145, text at 180+, fade 285–300
// ============================================================

const Scene2: React.FC<Props> = ({lang}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleOpacity = useFade(0, 20);

  const title =
    lang === 'PT' ? 'Como tudo começou' : 'How it all started';

  const tags = ['RWS', 'Outlier', 'Micro1', 'Welocalize'];
  const tagStarts = [40, 75, 110, 145];

  const bodyLines =
    lang === 'PT'
      ? [
          {
            text: 'Plataformas que treinam inteligência artificial.',
            italic: false,
          },
          {text: 'Fiquei curiosa.', italic: false},
          {text: 'Muito curiosa.', italic: false},
          {
            text: 'Curiosidade, descobri, é perigosa.',
            italic: true,
          },
        ]
      : [
          {
            text: 'Platforms that train artificial intelligence.',
            italic: false,
          },
          {text: 'I got curious.', italic: false},
          {text: 'Very curious.', italic: false},
          {
            text: 'Curiosity, I found out, is dangerous.',
            italic: true,
          },
        ];

  const bodyBaseFrame = 180;
  const bodyInterval = 25;

  return (
    <AbsoluteFill
      style={{backgroundColor: BLACK, fontFamily: FONT}}
    >
      <div
        style={{
          position: 'absolute',
          top: 80,
          width: '100%',
          textAlign: 'center',
          color: CYAN,
          fontSize: 16,
          textTransform: 'uppercase',
          letterSpacing: '8px',
          opacity: titleOpacity,
        }}
      >
        {title}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 200,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        {tags.map((tag, i) => {
          const localFrame = Math.max(0, frame - tagStarts[i]);
          const progress = spring({
            frame: localFrame,
            fps,
            config: {damping: 15},
          });
          return (
            <div
              key={tag}
              style={{
                backgroundColor: '#111111',
                border: `1px solid ${CYAN}`,
                borderRadius: 20,
                padding: '10px 20px',
                color: CYAN,
                fontSize: 14,
                fontWeight: 'bold',
                opacity: progress,
                transform: `scale(${0.6 + progress * 0.4}) translateY(${(1 - progress) * 10}px)`,
              }}
            >
              {tag}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 360,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {bodyLines.map((line, i) => {
          const start = bodyBaseFrame + i * bodyInterval;
          const localFrame = Math.max(0, frame - start);
          const progress = spring({
            frame: localFrame,
            fps,
            config: {damping: 18},
          });
          return (
            <div
              key={i}
              style={{
                color: WHITE,
                fontSize: 22,
                fontStyle: line.italic ? 'italic' : 'normal',
                opacity: progress,
                transform: `translateY(${(1 - progress) * 16}px)`,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      <FadeToBlack from={285} to={300} />
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3 — O Erro (absolute 480..750 → local 0..270)
// Dollar icon at 0, first text at 30, more text at 90,
// glitch at 210, scale-out 230, final line 230, fade 255–270
// ============================================================

const Scene3: React.FC<Props> = ({lang}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Dollar icon spring (in at 0, glitch 210–225, scale-out 230–250)
  const iconScaleIn = spring({frame, fps, config: {damping: 14}});
  const glitchX = interpolate(
    frame,
    [210, 213, 216, 219, 222, 225],
    [0, -8, 8, -6, 6, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const scaleOut = interpolate(frame, [230, 250], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const iconScale = iconScaleIn * scaleOut;

  // First red headline (frame 30)
  const headlineText =
    lang === 'PT'
      ? 'Meu primeiro erro custou R$600.'
      : 'My first mistake cost me $120.';
  const headlineProgress = useSpringIn(30, 18);

  // Body lines starting at frame 90
  const bodyLines =
    lang === 'PT'
      ? [
          'Runway. A ferramenta parecia perfeita.',
          'Gastei. Tentei. Não funcionou.',
          'Frustração total.',
        ]
      : [
          'Runway. It looked perfect.',
          "I spent it all. It didn't work.",
          'Complete frustration.',
        ];
  const bodyBase = 90;
  const bodyInterval = 20;

  // Final defiant line (frame 230)
  const finalText =
    lang === 'PT' ? 'Mas eu não parei.' : "But I didn't stop.";
  const finalLocal = Math.max(0, frame - 230);
  const finalProgress = spring({
    frame: finalLocal,
    fps,
    config: {damping: 16},
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at center, #1a0000 0%, #000000 70%)',
        fontFamily: FONT,
      }}
    >
      {/* Dollar sign icon */}
      <div
        style={{
          position: 'absolute',
          top: 220,
          left: '50%',
          width: 100,
          height: 100,
          transform: `translateX(calc(-50% + ${glitchX}px)) scale(${iconScale})`,
        }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#FF4444"
            strokeWidth="3"
            fill="none"
          />
          <line
            x1="50"
            y1="22"
            x2="50"
            y2="78"
            stroke="#FF4444"
            strokeWidth="3"
          />
          <path
            d="M 35 38 Q 50 32 65 38"
            stroke="#FF4444"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 35 62 Q 50 68 65 62"
            stroke="#FF4444"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>

      {/* Red headline */}
      <div
        style={{
          position: 'absolute',
          top: 360,
          width: '100%',
          textAlign: 'center',
          color: '#FF4444',
          fontSize: 36,
          fontWeight: 'bold',
          opacity: headlineProgress,
          transform: `translateY(${(1 - headlineProgress) * 20}px)`,
        }}
      >
        {headlineText}
      </div>

      {/* Body lines */}
      <div
        style={{
          position: 'absolute',
          top: 460,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {bodyLines.map((text, i) => {
          const start = bodyBase + i * bodyInterval;
          const opacity = interpolate(
            frame,
            [start, start + 20],
            [0, 0.7],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );
          return (
            <div
              key={i}
              style={{
                color: WHITE,
                fontSize: 20,
                opacity,
              }}
            >
              {text}
            </div>
          );
        })}
      </div>

      {/* Final defiant line */}
      <div
        style={{
          position: 'absolute',
          top: 680,
          width: '100%',
          textAlign: 'center',
          color: WHITE,
          fontSize: 32,
          fontWeight: 'bold',
          opacity: finalProgress,
          transform: `translateY(${(1 - finalProgress) * 40}px)`,
        }}
      >
        {finalText}
      </div>

      <FadeToBlack from={255} to={270} />
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4 — Momento UAU (absolute 750..1020 → local 0..270)
// Terminal at 0, typewriter from 10, terminal fade out 120,
// bloom 140, text 150, fade 255–270
// ============================================================

const Scene4: React.FC<Props> = ({lang}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Terminal opacity: visible 0–120, fade out 120–140
  const terminalFadeIn = useFade(0, 10);
  const terminalFadeOut = useFadeOut(120, 20);
  const terminalOpacity = terminalFadeIn * terminalFadeOut;

  // Typewriter: 3 lines, each animates after previous done
  const terminalLines = ['> claude code', '> running...', '> ✓ success'];
  // Each char = 2 frames. Starts at frame 10.
  const lineLengths = terminalLines.map((l) => l.length);
  const lineStarts: number[] = [];
  let acc = 10;
  for (const len of lineLengths) {
    lineStarts.push(acc);
    acc += len * 2 + 6; // small gap between lines
  }

  // Bloom circle: r 0→300, opacity 0→0.15, starts frame 140
  const bloomR = interpolate(frame, [140, 230], [0, 300], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  });
  const bloomOpacity = interpolate(frame, [140, 230], [0, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Text at 150, second line 30 frames later
  const lines =
    lang === 'PT'
      ? [
          {
            text: 'Quando funcionou pela primeira vez...',
            size: 28,
            bold: false,
            color: WHITE,
            start: 150,
          },
          {
            text: '...entendi tudo.',
            size: 36,
            bold: true,
            color: GOLD,
            start: 180,
          },
        ]
      : [
          {
            text: 'When it worked for the first time...',
            size: 28,
            bold: false,
            color: WHITE,
            start: 150,
          },
          {
            text: '...I understood everything.',
            size: 36,
            bold: true,
            color: GOLD,
            start: 180,
          },
        ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLACK,
        fontFamily: FONT,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Bloom circle (behind text) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: bloomR * 2,
          height: bloomR * 2,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, #FFD700 0%, transparent 70%)',
          opacity: bloomOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* Terminal box */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 400,
          height: 200,
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#0a0a0a',
          border: '1px solid #333',
          borderRadius: 8,
          opacity: terminalOpacity,
          padding: 20,
          fontFamily: 'monospace',
          color: '#00FF88',
          fontSize: 14,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {terminalLines.map((line, i) => {
          const start = lineStarts[i];
          const chars = Math.floor(
            interpolate(frame, [start, start + line.length * 2], [0, line.length], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          );
          return <div key={i}>{line.substring(0, chars)}</div>;
        })}
      </div>

      {/* Text lines */}
      <div
        style={{
          position: 'absolute',
          top: '60%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {lines.map((line, i) => {
          const localFrame = Math.max(0, frame - line.start);
          const progress = spring({
            frame: localFrame,
            fps,
            config: {damping: 18},
          });
          return (
            <div
              key={i}
              style={{
                color: line.color,
                fontSize: line.size,
                fontWeight: line.bold ? 'bold' : 'normal',
                opacity: progress,
                transform: `translateY(${(1 - progress) * 20}px)`,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      <FadeToBlack from={255} to={270} />
    </AbsoluteFill>
  );
};

// ============================================================
// Reusable Ken Burns image scene (5A–5D share the structure)
// ============================================================

type KenBurnsProps = {
  src: string;
  label: string;
  scaleFrom: number;
  scaleTo: number;
  durationFrames: number;
  panX?: [number, number];
  filter: string;
  children?: React.ReactNode;
  fadeOutFrom: number;
  fadeOutTo: number;
};

const KenBurnsScene: React.FC<KenBurnsProps> = ({
  src,
  label,
  scaleFrom,
  scaleTo,
  durationFrames,
  panX,
  filter,
  children,
  fadeOutFrom,
  fadeOutTo,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationFrames], [scaleFrom, scaleTo], {
    easing: Easing.bezier(0.42, 0, 0.58, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const translateX = panX
    ? interpolate(frame, [0, durationFrames], panX, {
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <AbsoluteFill style={{backgroundColor: BLACK, fontFamily: FONT}}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translateX(${translateX}px)`,
          filter,
        }}
      >
        <ImageOrPlaceholder src={src} label={label} />
      </AbsoluteFill>
      {children}
      <FadeToBlack from={fadeOutFrom} to={fadeOutTo} />
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5A — Aurora 7 Image 1 (1020..1260 → local 0..240)
// Text at 30, fade 225–240
// ============================================================

const Scene5A: React.FC<Props> = ({lang}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const lines =
    lang === 'PT'
      ? ['Criei uma cidade.', 'Futurista. Perfeita. Dourada.', 'Onde o sol nunca apaga.']
      : ['I created a city.', 'Futuristic. Perfect. Golden.', 'Where the sun never turns off.'];

  const base = 30;
  const interval = 20;

  return (
    <KenBurnsScene
      src={AURORA_IMAGES.scene1}
      label="aurora7_scene1"
      scaleFrom={1.0}
      scaleTo={1.08}
      durationFrames={240}
      filter="saturate(1.2) brightness(1.05)"
      fadeOutFrom={225}
      fadeOutTo={240}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {lines.map((text, i) => {
          const start = base + i * interval;
          const localFrame = Math.max(0, frame - start);
          const progress = spring({
            frame: localFrame,
            fps,
            config: {damping: 20},
          });
          return (
            <div
              key={i}
              style={{
                backgroundColor: '#00000088',
                borderRadius: 8,
                padding: '12px 20px',
                color: WHITE,
                fontSize: 24,
                opacity: progress,
                transform: `translateY(${(1 - progress) * 12}px)`,
              }}
            >
              {text}
            </div>
          );
        })}
      </div>
    </KenBurnsScene>
  );
};

// ============================================================
// SCENE 5B — Aurora 7 Image 2 (1260..1500 → local 0..240)
// Single big line at 90, fades in then out after 40 frames, fade 225–240
// ============================================================

const Scene5B: React.FC<Props> = ({lang}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const text = lang === 'PT' ? 'Até que apaga.' : 'Until it turns off.';

  const localFrame = Math.max(0, frame - 90);
  const springProgress = spring({
    frame: localFrame,
    fps,
    config: {damping: 12},
  });
  const scale = 0.8 + springProgress * 0.2;
  // Opacity: enters with spring then fades after 40 frames
  const enterOpacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(localFrame, [40, 100], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = enterOpacity * exitOpacity;

  return (
    <KenBurnsScene
      src={AURORA_IMAGES.scene2}
      label="aurora7_scene2_blackout"
      scaleFrom={1.0}
      scaleTo={1.06}
      durationFrames={240}
      filter="saturate(0.4) brightness(0.6) hue-rotate(200deg)"
      fadeOutFrom={225}
      fadeOutTo={240}
    >
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            color: WHITE,
            fontSize: 52,
            fontWeight: 'bold',
            opacity,
            transform: `scale(${scale})`,
            textShadow: '0 0 30px #ffffff44',
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </KenBurnsScene>
  );
};

// ============================================================
// SCENE 5C — Aurora 7 Image 3 (1500..1800 → local 0..300)
// Text at 60, interval 30. Names "Lina", "Bento", "Rafael" in cyan bold
// Fade 285–300
// ============================================================

const Scene5C: React.FC<Props> = ({lang}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Lines split into segments so we can color specific words.
  type Segment = {text: string; cyan?: boolean};
  const lines: Segment[][] =
    lang === 'PT'
      ? [
          [{text: 'Aurora 7 é minha história.'}],
          [{text: 'Lina', cyan: true}, {text: ' sou eu —'}],
          [{text: 'aprendiz encantada pela tecnologia.'}],
          [{text: 'Bento', cyan: true}, {text: ' é o '}, {text: 'Rafael', cyan: true}, {text: ','}],
          [{text: 'que despertou o que estava adormecido em mim.'}],
        ]
      : [
          [{text: 'Aurora 7 is my story.'}],
          [{text: 'Lina', cyan: true}, {text: ' is me —'}],
          [{text: 'a learner enchanted by technology.'}],
          [{text: 'Bento', cyan: true}, {text: ' is '}, {text: 'Rafael', cyan: true}, {text: ','}],
          [{text: 'who awakened what was asleep inside me.'}],
        ];

  const base = 60;
  const interval = 30;

  return (
    <KenBurnsScene
      src={AURORA_IMAGES.scene3}
      label="aurora7_scene3_message"
      scaleFrom={1.02}
      scaleTo={1.08}
      durationFrames={300}
      panX={[0, -30]}
      filter="saturate(0.8) brightness(0.75)"
      fadeOutFrom={285}
      fadeOutTo={300}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 140,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {lines.map((segments, i) => {
          const start = base + i * interval;
          const opacity = interpolate(
            frame,
            [start, start + 25],
            [0, 1],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );
          return (
            <div
              key={i}
              style={{
                color: WHITE,
                fontSize: 22,
                opacity,
                backgroundColor: '#00000088',
                borderRadius: 6,
                padding: '8px 18px',
              }}
            >
              {segments.map((seg, j) => (
                <span
                  key={j}
                  style={{
                    color: seg.cyan ? CYAN : WHITE,
                    fontWeight: seg.cyan ? 'bold' : 'normal',
                  }}
                >
                  {seg.text}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </KenBurnsScene>
  );
};

// ============================================================
// SCENE 5D — Aurora 7 Image 4 (1800..2040 → local 0..240)
// Text at 60, interval 25. Last line gold bold. Fade 225–240
// ============================================================

const Scene5D: React.FC<Props> = ({lang}) => {
  const frame = useCurrentFrame();

  const lines =
    lang === 'PT'
      ? [
          'O sol da história é a tecnologia.',
          'Sem ela, nada funciona.',
          'Sem ela, eu não estaria aqui.',
        ]
      : [
          'The sun in the story is technology.',
          'Without it, nothing works.',
          "Without it, I wouldn't be here.",
        ];

  const base = 60;
  const interval = 25;

  return (
    <KenBurnsScene
      src={AURORA_IMAGES.scene4}
      label="aurora7_scene4_tower_run"
      scaleFrom={1.0}
      scaleTo={1.1}
      durationFrames={240}
      filter="saturate(1.3) brightness(0.85) hue-rotate(340deg)"
      fadeOutFrom={225}
      fadeOutTo={240}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 140,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {lines.map((text, i) => {
          const start = base + i * interval;
          const opacity = interpolate(
            frame,
            [start, start + 25],
            [0, 1],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );
          const isLast = i === lines.length - 1;
          return (
            <div
              key={i}
              style={{
                color: isLast ? GOLD : WHITE,
                fontSize: 22,
                fontWeight: isLast ? 'bold' : 'normal',
                opacity,
                backgroundColor: '#00000088',
                borderRadius: 6,
                padding: '8px 18px',
              }}
            >
              {text}
            </div>
          );
        })}
      </div>
    </KenBurnsScene>
  );
};

// ============================================================
// SCENE 6 — O Canal (2040..2400 → local 0..360)
// Logo letter-by-letter at 0, text at 120 interval 25, fade 345–360
// ============================================================

const Scene6: React.FC<Props> = ({lang}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const logoText = 'AURORA LABS';
  const letterInterval = 5;

  type Segment = {text: string; color?: string; bold?: boolean; size?: number};
  const lines: Segment[][] =
    lang === 'PT'
      ? [
          [{text: 'Aurora Labs nasceu pra isso.'}],
          [{text: ''}],
          [{text: 'Mostrar que '}, {text: 'qualquer pessoa', color: CYAN, bold: true}],
          [{text: 'com '}, {text: 'curiosidade e coragem', color: GOLD, bold: true}],
          [{text: 'consegue construir algo incrível com IA.'}],
          [{text: ''}],
          [{text: 'Você não precisa saber programar.'}],
          [{text: 'Você precisa querer aprender.', bold: true, size: 26}],
        ]
      : [
          [{text: 'Aurora Labs was born for this.'}],
          [{text: ''}],
          [{text: 'To show that '}, {text: 'anyone', color: CYAN, bold: true}],
          [{text: 'with '}, {text: 'curiosity and courage', color: GOLD, bold: true}],
          [{text: 'can build something incredible with AI.'}],
          [{text: ''}],
          [{text: "You don't need to know how to code."}],
          [{text: 'You need to want to learn.', bold: true, size: 26}],
        ];

  const textBase = 120;
  const textInterval = 25;

  return (
    <AbsoluteFill style={{backgroundColor: BLACK, fontFamily: FONT}}>
      {/* Logo letter by letter */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          width: '100%',
          textAlign: 'center',
          color: GOLD,
          fontSize: 72,
          fontWeight: 'bold',
          letterSpacing: '16px',
          textShadow: '0 0 60px #FFD70088',
        }}
      >
        {logoText.split('').map((char, i) => {
          const start = i * letterInterval;
          const localFrame = Math.max(0, frame - start);
          const progress = spring({
            frame: localFrame,
            fps,
            config: {damping: 15},
          });
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: progress,
                transform: `translateY(${(1 - progress) * 30}px) scale(${0.5 + progress * 0.5})`,
              }}
            >
              {char === ' ' ? ' ' : char}
            </span>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 360,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {lines.map((segments, i) => {
          const start = textBase + i * textInterval;
          const localFrame = Math.max(0, frame - start);
          const progress = spring({
            frame: localFrame,
            fps,
            config: {damping: 18},
          });
          const isLast = i === lines.length - 1;
          return (
            <div
              key={i}
              style={{
                minHeight: 22,
                opacity: progress,
                transform: `translateY(${(1 - progress) * 12}px)`,
                fontSize: isLast ? 26 : 22,
                color: isLast ? WHITE : 'rgba(255,255,255,0.8)',
                fontWeight: isLast ? 'bold' : 'normal',
              }}
            >
              {segments.map((seg, j) => (
                <span
                  key={j}
                  style={{
                    color: seg.color ?? 'inherit',
                    fontWeight: seg.bold ? 'bold' : 'inherit',
                    fontSize: seg.size ?? 'inherit',
                  }}
                >
                  {seg.text}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      <FadeToBlack from={345} to={360} />
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 7 — CTA Final (2400..2700 → local 0..300)
// Text at 0 interval 40, logo at 120, subscribe at 160, fade out 240+60
// ============================================================

const Scene7: React.FC<Props> = ({lang}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const topLines =
    lang === 'PT'
      ? [
          {
            text: 'Próximo vídeo:',
            color: 'rgba(255,255,255,0.6)',
            size: 18,
            uppercase: true,
            letterSpacing: '4px',
            bold: false,
          },
          {
            text: 'Como fazer isso em 3 horas — do zero.',
            color: WHITE,
            size: 36,
            uppercase: false,
            letterSpacing: '0px',
            bold: true,
          },
        ]
      : [
          {
            text: 'Next video:',
            color: 'rgba(255,255,255,0.6)',
            size: 18,
            uppercase: true,
            letterSpacing: '4px',
            bold: false,
          },
          {
            text: 'How to do this in 3 hours — from scratch.',
            color: WHITE,
            size: 36,
            uppercase: false,
            letterSpacing: '0px',
            bold: true,
          },
        ];

  const topInterval = 40;

  // Logo (40px) at frame 120
  const logoLocal = Math.max(0, frame - 120);
  const logoProgress = spring({
    frame: logoLocal,
    fps,
    config: {damping: 15},
  });

  // Subscribe line at 160
  const subscribeText =
    lang === 'PT'
      ? 'Se inscreve. A série começa em breve.'
      : 'Subscribe. The series starts soon.';
  const subscribeOpacity = interpolate(
    frame,
    [160, 190],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  // Global fade out 240 → 300
  const globalOpacity = interpolate(frame, [240, 300], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: BLACK, fontFamily: FONT}}>
      <div style={{opacity: globalOpacity, width: '100%', height: '100%', position: 'relative'}}>
        {/* Top text lines */}
        <div
          style={{
            position: 'absolute',
            top: 240,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          {topLines.map((line, i) => {
            const start = i * topInterval;
            const localFrame = Math.max(0, frame - start);
            const progress = spring({
              frame: localFrame,
              fps,
              config: {damping: 18},
            });
            return (
              <div
                key={i}
                style={{
                  color: line.color,
                  fontSize: line.size,
                  fontWeight: line.bold ? 'bold' : 'normal',
                  textTransform: line.uppercase ? 'uppercase' : 'none',
                  letterSpacing: line.letterSpacing,
                  opacity: progress,
                  transform: `translateY(${(1 - progress) * 20}px)`,
                  textAlign: 'center',
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>

        {/* Logo */}
        <div
          style={{
            position: 'absolute',
            top: '60%',
            width: '100%',
            textAlign: 'center',
            color: GOLD,
            fontSize: 40,
            fontWeight: 'bold',
            letterSpacing: '10px',
            textShadow: '0 0 40px #FFD70088',
            opacity: logoProgress,
            transform: `scale(${0.6 + logoProgress * 0.4})`,
          }}
        >
          AURORA LABS
        </div>

        {/* Subscribe line */}
        <div
          style={{
            position: 'absolute',
            top: '72%',
            width: '100%',
            textAlign: 'center',
            color: CYAN,
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: '4px',
            opacity: subscribeOpacity,
          }}
        >
          {subscribeText}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION
// ============================================================

export const AuroraLabsEp1: React.FC<Props> = ({lang}) => {
  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      <Sequence from={0} durationInFrames={180}>
        <Scene1 lang={lang} />
      </Sequence>
      <Sequence from={180} durationInFrames={300}>
        <Scene2 lang={lang} />
      </Sequence>
      <Sequence from={480} durationInFrames={270}>
        <Scene3 lang={lang} />
      </Sequence>
      <Sequence from={750} durationInFrames={270}>
        <Scene4 lang={lang} />
      </Sequence>
      <Sequence from={1020} durationInFrames={240}>
        <Scene5A lang={lang} />
      </Sequence>
      <Sequence from={1260} durationInFrames={240}>
        <Scene5B lang={lang} />
      </Sequence>
      <Sequence from={1500} durationInFrames={300}>
        <Scene5C lang={lang} />
      </Sequence>
      <Sequence from={1800} durationInFrames={240}>
        <Scene5D lang={lang} />
      </Sequence>
      <Sequence from={2040} durationInFrames={360}>
        <Scene6 lang={lang} />
      </Sequence>
      <Sequence from={2400} durationInFrames={300}>
        <Scene7 lang={lang} />
      </Sequence>
    </AbsoluteFill>
  );
};
