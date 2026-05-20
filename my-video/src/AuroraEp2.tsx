import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ============================================================
// ASSET CONTRACT — coloca estes arquivos em my-video/public/
// e faz git push. Depois vira os flags abaixo para true.
// ============================================================
const EP2 = {
  // Vídeo talking-head da Lina (episódio inteiro, contínuo).
  linaVideo: 'lina_ep2.mp4',
  // Narração separada (opcional). Se usares, o áudio do vídeo é mutado.
  narrationAudio: 'narration_ep2.mp3',
};

// Vira para true DEPOIS de pushar my-video/public/lina_ep2.mp4
const HAS_LINA_VIDEO = false;
// Vira para true DEPOIS de pushar my-video/public/narration_ep2.mp3
const HAS_NARRATION_AUDIO = false;

// Caixa onde o vídeo da Lina aparece (a cidade fica em volta).
const VIDEO_BOX = {width: 1000, height: 760, top: 120};

// ============================================================
// Paleta
// ============================================================
const GOLD = '#FFD700';
const CYAN = '#00E5FF';
const WHITE = '#FFFFFF';
const RED = '#FF4444';
const BLACK = '#000000';
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// ============================================================
// Helpers
// ============================================================

// Amostra uma curva de keyframes [frame, valor].
const sampleKeyframes = (
  frame: number,
  kf: ReadonlyArray<readonly [number, number]>
): number => {
  if (frame <= kf[0][0]) return kf[0][1];
  for (let i = 0; i < kf.length - 1; i++) {
    const [f0, v0] = kf[i];
    const [f1, v1] = kf[i + 1];
    if (frame <= f1) {
      return interpolate(frame, [f0, f1], [v0, v1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
  }
  return kf[kf.length - 1][1];
};

// Realce de palavras-chave nas legendas.
const GOLD_WORDS = new Set([
  'aurora',
  'sol',
  'luz',
  'labs',
  'curiosidade',
  'coragem',
]);
const CYAN_WORDS = new Set([
  'claude',
  'remotion',
  'rws',
  'outlier',
  'onefome',
  'welocalize',
  'runway',
  'ia',
  'inteligência',
  'artificial',
]);
const RED_WORDS = new Set([
  'erro',
  'errei',
  'escuro',
  'escuridão',
  'apagou',
  'apaga',
  'desistir',
  'r$600',
]);

const wordColor = (raw: string): string | null => {
  const w = raw.toLowerCase().replace(/[.,!?;:—"'()…]/g, '');
  if (GOLD_WORDS.has(w)) return GOLD;
  if (CYAN_WORDS.has(w)) return CYAN;
  if (RED_WORDS.has(w)) return RED;
  return null;
};

const HighlightedText: React.FC<{text: string}> = ({text}) => {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => {
        const color = wordColor(word);
        return (
          <span
            key={i}
            style={{
              color: color ?? WHITE,
              fontWeight: color ? 'bold' : 'normal',
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </>
  );
};

// ============================================================
// Cidade de Aurora — render procedural (acende/apaga)
// ============================================================

const BUILDINGS: ReadonlyArray<{x: number; w: number; h: number}> = [
  {x: -30, w: 170, h: 300},
  {x: 150, w: 120, h: 440},
  {x: 285, w: 140, h: 230},
  {x: 435, w: 105, h: 360},
  {x: 550, w: 175, h: 510},
  {x: 735, w: 120, h: 280},
  {x: 865, w: 150, h: 410},
  {x: 1025, w: 135, h: 560},
  {x: 1170, w: 110, h: 300},
  {x: 1290, w: 165, h: 470},
  {x: 1465, w: 120, h: 240},
  {x: 1595, w: 145, h: 400},
  {x: 1750, w: 130, h: 330},
  {x: 1890, w: 130, h: 270},
];

const CityBackground: React.FC<{brightness: number}> = ({brightness}) => {
  const b = Math.max(0, Math.min(1, brightness));
  const sunScale = 0.2 + b * 1.0;
  const windowOpacity = 0.06 + b * 0.9;

  return (
    <AbsoluteFill style={{backgroundColor: '#05060a'}}>
      {/* Atmosfera dourada — opacidade segue o brilho */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 18%, #FFB23E 0%, #7a4a10 35%, transparent 70%)',
          opacity: b * 0.8,
        }}
      />

      {/* Sol */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 70,
          width: 260,
          height: 260,
          marginLeft: -130,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, #FFF6D0 0%, #FFD700 35%, #FF9D2E 60%, transparent 75%)',
          opacity: Math.min(1, b * 1.2),
          transform: `scale(${sunScale})`,
          filter: 'blur(2px)',
        }}
      />

      {/* Prédios */}
      {BUILDINGS.map((bld, i) => {
        const cols = Math.max(1, Math.floor(bld.w / 38));
        const rows = Math.max(1, Math.floor(bld.h / 52));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: bld.x,
              bottom: 0,
              width: bld.w,
              height: bld.h,
              backgroundColor: '#0a0a13',
              borderTop: '1px solid #15151f',
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              padding: 10,
              gap: 12,
              boxSizing: 'border-box',
            }}
          >
            {Array.from({length: cols * rows}).map((_, j) => {
              // Padrão determinístico de janelas acesas/apagadas.
              const lit = (i * 7 + j * 13) % 5 !== 0;
              return (
                <div
                  key={j}
                  style={{
                    width: 14,
                    height: 20,
                    backgroundColor: GOLD,
                    opacity: lit ? windowOpacity : windowOpacity * 0.25,
                  }}
                />
              );
            })}
          </div>
        );
      })}

      {/* Vinheta — escurece as bordas, mais forte quando a cidade apaga */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, transparent 40%, #000000 100%)',
          opacity: 0.35 + (1 - b) * 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================
// Palco da Lina — vídeo talking-head ou placeholder
// ============================================================

const LinaStage: React.FC = () => {
  const frame = useCurrentFrame();
  // Respiração sutil no enquadramento.
  const float = Math.sin(frame / 36) * 6;

  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: VIDEO_BOX.top,
          width: VIDEO_BOX.width,
          height: VIDEO_BOX.height,
          transform: `translateY(${float}px)`,
          borderRadius: 18,
          overflow: 'hidden',
          border: '1px solid #2a2a38',
          boxShadow: '0 0 80px #00000099, 0 0 40px #FFD70022',
          backgroundColor: '#0a0a12',
        }}
      >
        {HAS_LINA_VIDEO ? (
          <OffthreadVideo
            src={staticFile(EP2.linaVideo)}
            muted={HAS_NARRATION_AUDIO}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(160deg, #1c1c2b 0%, #14141f 60%, #0d0d16 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT,
            }}
          >
            {/* Silhueta simples da personagem */}
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                backgroundColor: '#2c2c40',
              }}
            />
            <div
              style={{
                width: 320,
                height: 200,
                marginTop: -10,
                borderRadius: '160px 160px 0 0',
                backgroundColor: '#2c2c40',
              }}
            />
            <div
              style={{
                marginTop: 28,
                color: '#5a5a72',
                fontSize: 22,
                letterSpacing: 2,
              }}
            >
              [ vídeo da Lina — public/{EP2.linaVideo} ]
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Tipos / config dos atos
// ============================================================

type ActConfig = {
  id: string;
  label: string;
  durationInFrames: number;
  brightness: ReadonlyArray<readonly [number, number]>;
  lines: string[];
  flashFrame?: number;
};

// ============================================================
// Fundo do ato (cidade) — lê o frame local e calcula o brilho
// ============================================================

const ActBackground: React.FC<{act: ActConfig}> = ({act}) => {
  const frame = useCurrentFrame();
  const brightness = sampleKeyframes(frame, act.brightness);
  return <CityBackground brightness={brightness} />;
};

// ============================================================
// Frente do ato — legendas, rótulo, flashes e fades
// ============================================================

const ActForeground: React.FC<{act: ActConfig}> = ({act}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = act.durationInFrames;

  // Rótulo do ato
  const labelOpacity = interpolate(
    frame,
    [0, 20, 90, 120],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  // Legendas — um slot igual por fala
  const slot = dur / act.lines.length;

  // Fade de entrada / saída (corte dramático entre atos)
  const fadeIn = interpolate(frame, [0, 15], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [dur - 22, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const blackOpacity = Math.max(fadeIn, fadeOut);

  // Flash branco no apagão (Ato 4)
  const flash =
    act.flashFrame !== undefined
      ? interpolate(
          frame,
          [act.flashFrame - 8, act.flashFrame, act.flashFrame + 24],
          [0, 0.75, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        )
      : 0;

  return (
    <AbsoluteFill style={{fontFamily: FONT}}>
      {/* Rótulo do ato */}
      <div
        style={{
          position: 'absolute',
          top: 44,
          width: '100%',
          textAlign: 'center',
          color: CYAN,
          fontSize: 18,
          textTransform: 'uppercase',
          letterSpacing: '8px',
          opacity: labelOpacity,
        }}
      >
        {act.label}
      </div>

      {/* Legendas */}
      {act.lines.map((line, i) => {
        const start = i * slot;
        const end = start + slot;
        const opacity = interpolate(
          frame,
          [start, start + 14, end - 14, end],
          [0, 1, 1, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
        );
        if (opacity <= 0.001) return null;
        const rise = spring({
          frame: Math.max(0, frame - start),
          fps,
          config: {damping: 200},
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: 70,
              left: '50%',
              width: 1400,
              marginLeft: -700,
              opacity,
              transform: `translateY(${(1 - rise) * 24}px)`,
            }}
          >
            <div
              style={{
                backgroundColor: '#000000bb',
                border: '1px solid #ffffff14',
                borderRadius: 14,
                padding: '20px 34px',
                textAlign: 'center',
                fontSize: 34,
                lineHeight: 1.4,
                color: WHITE,
              }}
            >
              <HighlightedText text={line} />
            </div>
          </div>
        );
      })}

      {/* Flash branco */}
      {flash > 0 && (
        <AbsoluteFill
          style={{backgroundColor: WHITE, opacity: flash, pointerEvents: 'none'}}
        />
      )}

      {/* Fade preto */}
      <AbsoluteFill
        style={{
          backgroundColor: BLACK,
          opacity: blackOpacity,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================================
// Roteiro — Aurora 7, Ep 2: "O Apagão"
// ============================================================

const ACTS: ActConfig[] = [
  {
    id: 'ato1',
    label: 'Ato 1 — A Abertura',
    durationInFrames: 2700,
    brightness: [
      [0, 0.82],
      [2700, 0.9],
    ],
    lines: [
      'Olá. Eu sou a Lina. E há duas semanas eu não sabia nada sobre IA.',
      'Gastei R$600 numa ferramenta que não funcionou. Fiquei no escuro.',
      'Mas como Aurora 7 apaga... eu não desisto até encontrar uma nova luz.',
      'E foi aí que tudo mudou. Foi quando esse canal surgiu. Foi quando o sol de Aurora brilhou.',
      'Vou contar pra vocês essa história. Como tudo começou.',
    ],
  },
  {
    id: 'ato2',
    label: 'Ato 2 — O Início de Tudo',
    durationInFrames: 3600,
    brightness: [
      [0, 0.35],
      [3600, 0.42],
    ],
    lines: [
      'Tudo começou num dia comum. Sem planos grandes. Sem grandes ideias.',
      'Eu estava perdida. Sem saber o que fazer. Precisava de uma renda extra.',
      'Então abri o computador. E comecei a pesquisar.',
      'Foi aí que encontrei canais falando sobre como ganhar dinheiro treinando inteligência artificial.',
      'Plataformas como RWS, Outlier, Onefome, Welocalize.',
      'Empresas que pagam pessoas comuns para ensinar máquinas a pensar.',
      'Espera. Empresas pagam pra você... conversar com IA? Avaliar respostas? Ensinar robôs?',
      'Eu não precisava saber programar. Não precisava de diploma. Precisava só de curiosidade.',
      'E curiosidade... eu tinha de sobra.',
    ],
  },
  {
    id: 'ato3',
    label: 'Ato 3 — A Primeira Luz',
    durationInFrames: 2700,
    brightness: [
      [0, 0.4],
      [2700, 0.74],
    ],
    lines: [
      'Me cadastrei em todas. RWS. Outlier. Onefome. Welocalize.',
      'Comecei a fazer tarefas simples. Avaliar textos. Corrigir respostas de IA. Classificar imagens.',
      'E algo estranho aconteceu.',
      'Eu comecei a entender como a inteligência artificial funciona por dentro.',
      'Não como especialista. Como aprendiz. Como alguém que estava vendo a máquina respirar.',
      'Em Aurora 7, quando você descobre algo novo... o sol brilha um pouco mais.',
      'E o meu sol estava começando a despertar.',
    ],
  },
  {
    id: 'ato4',
    label: 'Ato 4 — O Erro dos R$600',
    durationInFrames: 2700,
    brightness: [
      [0, 0.9],
      [1380, 0.96],
      [1520, 0.0],
      [2700, 0.0],
    ],
    flashFrame: 1500,
    lines: [
      'Mas aí... eu fiz o erro clássico de quem está animado demais.',
      'Achei que sabia tudo. Que estava pronta.',
      'Vi uma ferramenta chamada Runway. Disseram que dava pra criar vídeos animados com IA.',
      'Comprei o plano. R$600. Sem pensar duas vezes.',
      'Tentei. Errei. Tentei de novo. Errei de novo.',
      'A ferramenta era boa. O problema era eu — não sabia ainda como usar.',
      'Em Aurora 7... o sol apagou.',
      'E eu fiquei no escuro. Com R$600 a menos. E zero resultado.',
      'Aquele momento em que você pensa: talvez não seja pra mim.',
      'Talvez eu não seja boa o suficiente.',
      'Talvez eu devesse desistir.',
    ],
  },
  {
    id: 'ato5',
    label: 'Ato 5 — A Virada',
    durationInFrames: 2700,
    brightness: [
      [0, 0.0],
      [500, 0.05],
      [900, 0.14],
      [2700, 0.58],
    ],
    lines: [
      'Mas sabe o que é engraçado sobre o escuro?',
      'Ele passa.',
      'Resolvi tentar uma última vez. Mas diferente.',
      'Em vez de gastar dinheiro... fui aprender primeiro.',
      'Encontrei o Claude. Uma IA que não só respondia perguntas — me ensinava a pensar.',
      'Perguntei tudo. Como criar vídeos. Como usar o Remotion. Como animar personagens.',
      'E o Claude... respondeu tudo.',
      'Em Aurora 7... o sol não volta de repente.',
      'Ele volta devagar. Uma luz de cada vez.',
      'E cada coisa que eu aprendia... era mais uma luz acendendo.',
    ],
  },
  {
    id: 'ato6',
    label: 'Ato 6 — O Nascimento do Canal',
    durationInFrames: 1800,
    brightness: [
      [0, 0.58],
      [1800, 1.0],
    ],
    lines: [
      'Foi aí que nasceu a Aurora Labs.',
      'Não como um canal de especialistas.',
      'Como um diário de uma aprendiz.',
      'Eu não sei tudo. Longe disso.',
      'Mas sei que qualquer pessoa — com curiosidade e coragem — consegue construir algo incrível com IA.',
      'Você não precisa saber programar.',
      'Você precisa querer aprender.',
    ],
  },
  {
    id: 'ato7',
    label: 'Ato 7 — CTA Final',
    durationInFrames: 1800,
    brightness: [
      [0, 1.0],
      [1800, 1.0],
    ],
    lines: [
      'Nos próximos episódios vou te mostrar exatamente como fiz tudo isso.',
      'As ferramentas que usei. Os erros que cometi. E como você pode fazer também.',
      'Porque o sol de Aurora 7 brilha pra todo mundo.',
      'Se inscreve. A série continua.',
      'Eu sou a Lina. E o sol... nunca mais vai apagar.',
    ],
  },
];

// ============================================================
// COMPOSIÇÃO PRINCIPAL — Aurora 7 Ep 2 (10 minutos)
// ============================================================

export const AuroraEp2: React.FC = () => {
  // Frames de início acumulados para cada ato.
  let cursor = 0;
  const starts = ACTS.map((act) => {
    const s = cursor;
    cursor += act.durationInFrames;
    return s;
  });

  return (
    <AbsoluteFill style={{backgroundColor: BLACK}}>
      {/* Camada 1 — fundos (cidade) por ato */}
      {ACTS.map((act, i) => (
        <Sequence
          key={`bg-${act.id}`}
          from={starts[i]}
          durationInFrames={act.durationInFrames}
        >
          <ActBackground act={act} />
        </Sequence>
      ))}

      {/* Camada 2 — vídeo contínuo da Lina */}
      <LinaStage />

      {/* Camada 3 — legendas / rótulos / fades por ato */}
      {ACTS.map((act, i) => (
        <Sequence
          key={`fg-${act.id}`}
          from={starts[i]}
          durationInFrames={act.durationInFrames}
        >
          <ActForeground act={act} />
        </Sequence>
      ))}

      {/* Narração (opcional) */}
      {HAS_NARRATION_AUDIO && <Audio src={staticFile(EP2.narrationAudio)} />}
    </AbsoluteFill>
  );
};
