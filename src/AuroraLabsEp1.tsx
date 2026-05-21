import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile, Audio } from 'remotion';

function fadeOUT(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
}

const Cena1 = ({ lang }: { lang: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const linesPT = [
    { text: 'Ha duas semanas', color: '#FFFFFF', fontSize: 64, delay: 0 },
    { text: 'eu nao sabia nada sobre IA.', color: 'rgba(255,255,255,0.7)', fontSize: 34, delay: 50 },
    { text: 'Hoje tenho uma serie animada.', color: '#FFFFFF', fontSize: 60, delay: 140 },
    { text: 'Um canal.', color: '#FFFFFF', fontSize: 60, delay: 190 },
    { text: 'E uma historia que preciso te contar.', color: '#FFD700', fontSize: 68, delay: 240 },
  ];
  const linesEN = [
    { text: 'Two weeks ago', color: '#FFFFFF', fontSize: 64, delay: 0 },
    { text: 'I knew nothing about AI.', color: 'rgba(255,255,255,0.7)', fontSize: 34, delay: 50 },
    { text: 'Today I have an animated series.', color: '#FFFFFF', fontSize: 60, delay: 140 },
    { text: 'A channel.', color: '#FFFFFF', fontSize: 60, delay: 190 },
    { text: 'And a story I need to tell you.', color: '#FFD700', fontSize: 68, delay: 240 },
  ];
  const lines = lang === 'PT' ? linesPT : linesEN;
  const fadeOut = fadeOUT(frame, 165, 180);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20, opacity: fadeOut, padding: '0 60px' }}>
      {lines.map((line, i) => {
        const s = spring({ frame: Math.max(0, frame - line.delay), fps, config: { damping: 18 } });
        return (
          <div key={i} style={{ color: line.color, fontSize: line.fontSize, fontFamily: 'system-ui', opacity: s, transform: 'translateY(' + interpolate(s, [0, 1], [20, 0]) + 'px)', textAlign: 'center', fontWeight: i === 4 ? 700 : 400 }}>
            {line.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Cena2 = ({ lang }: { lang: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - 180;
  if (lf < 0 || lf > 300) return null;
  const tags = ['RWS', 'Outlier', 'Micro1', 'Welocalize'];
  const tagDelays = [40, 75, 110, 145];
  const linesPT = ['Plataformas que treinam inteligencia artificial.', 'Fiquei curiosa.', 'Muito curiosa.', 'Curiosidade, descobri, e perigosa.'];
  const linesEN = ['Platforms that train artificial intelligence.', 'I got curious.', 'Very curious.', 'Curiosity, I found out, is dangerous.'];
  const lines = lang === 'PT' ? linesPT : linesEN;
  const bodyDelays = [180, 220, 260, 300];
  const titleOp = interpolate(lf, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(lf, [280, 300], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', opacity: fadeOut }}>
      <div style={{ position: 'absolute', top: 80, width: '100%', textAlign: 'center', color: '#00E5FF', fontSize: 64, textTransform: 'uppercase', letterSpacing: 8, fontFamily: 'system-ui', opacity: titleOp }}>
        {lang === 'PT' ? 'Como tudo comecou' : 'How it all started'}
      </div>
      <div style={{ position: 'absolute', top: 180, width: '100%', display: 'flex', justifyContent: 'center', gap: 16 }}>
        {tags.map((tag, i) => {
          const s = spring({ frame: Math.max(0, lf - tagDelays[i]), fps, config: { damping: 15 } });
          return <div key={tag} style={{ opacity: s, transform: 'translateY(' + interpolate(s,[0,1],[30,0]) + 'px)', background: '#111', border: '1px solid #00E5FF', borderRadius: 20, padding: '10px 20px', color: '#00E5FF', fontSize: 42, fontWeight: 700, fontFamily: 'system-ui' }}>{tag}</div>;
        })}
      </div>
      <div style={{ position: 'absolute', top: 340, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {lines.map((line, i) => {
          const s = spring({ frame: Math.max(0, lf - bodyDelays[i]), fps, config: { damping: 18 } });
          return <div key={i} style={{ color: '#fff', fontSize: 62, fontFamily: 'system-ui', fontStyle: i === 3 ? 'italic' : 'normal', opacity: s, transform: 'translateY(' + interpolate(s,[0,1],[20,0]) + 'px)' }}>{line}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};


const Cena3 = ({ lang }: { lang: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - 480;
  if (lf < 0 || lf > 270) return null;
  const iconScale = spring({ frame: Math.max(0, lf), fps, config: { damping: 18 } });
  const glitchX = lf > 210 && lf < 225 ? Math.sin(lf * 3.7) * 8 : 0;
  const iconScaleOut = interpolate(lf, [225, 245], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const mainOp = interpolate(lf, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const finalS = spring({ frame: Math.max(0, lf - 230), fps, config: { damping: 18 } });
  const fadeOut = interpolate(lf, [255, 270], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bodyDelays = [90, 130, 170];
  const linesPT = ['Runway. A ferramenta parecia perfeita.', 'Gastei. Tentei. Nao funcionou.', 'Frustracao total.'];
  const linesEN = ['Runway. It looked perfect.', 'I spent it all. It did not work.', 'Complete frustration.'];
  const bodyLines = lang === 'PT' ? linesPT : linesEN;
  const mainText = lang === 'PT' ? 'Meu primeiro erro custou R$600.' : 'My first mistake cost me $120.';
  const finalText = lang === 'PT' ? 'Mas eu nao parei.' : "But I didn't stop.";
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, #1a0000 0%, #000000 100%)', opacity: fadeOut }}>
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translate(-50%, 0) scale(' + (iconScale * iconScaleOut) + ') translateX(' + glitchX + 'px)' }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" stroke="#FF4444" strokeWidth="3" fill="none" />
          <line x1="50" y1="18" x2="50" y2="82" stroke="#FF4444" strokeWidth="3" />
          <line x1="30" y1="36" x2="70" y2="36" stroke="#FF4444" strokeWidth="3" />
          <line x1="30" y1="50" x2="70" y2="50" stroke="#FF4444" strokeWidth="3" />
          <text x="50" y="57" textAnchor="middle" fill="#FF4444" fontSize="18" fontFamily="system-ui" fontWeight="bold">R$</text>
        </svg>
      </div>
      <div style={{ position: 'absolute', top: '38%', width: '100%', textAlign: 'center', opacity: mainOp }}>
        <div style={{ color: '#FF4444', fontSize: 64, fontWeight: 700, fontFamily: 'system-ui' }}>{mainText}</div>
      </div>
      <div style={{ position: 'absolute', top: '55%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {bodyLines.map((line, i) => {
          const op = interpolate(lf, [bodyDelays[i], bodyDelays[i] + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return <div key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 62, fontFamily: 'system-ui', opacity: op }}>{line}</div>;
        })}
      </div>
      <div style={{ position: 'absolute', bottom: '14%', width: '100%', textAlign: 'center', color: '#fff', fontSize: 68, fontWeight: 700, fontFamily: 'system-ui', opacity: finalS, transform: 'translateY(' + interpolate(finalS, [0, 1], [40, 0]) + 'px)' }}>
        {finalText}
      </div>
    </AbsoluteFill>
  );
};


const Cena4 = ({ lang }: { lang: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - 750;
  if (lf < 0 || lf > 270) return null;
  const terminalOp = interpolate(lf, [120, 140], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const l1 = '> claude code'.substring(0, Math.floor(interpolate(lf, [10, 40], [0, 13], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));
  const l2 = '> running...'.substring(0, Math.floor(interpolate(lf, [45, 75], [0, 12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));
  const l3 = '> sucesso!'.substring(0, Math.floor(interpolate(lf, [80, 110], [0, 10], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));
  const bloomSize = interpolate(lf, [140, 210], [0, 300], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bloomOp = interpolate(lf, [140, 210], [0, 0.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const t1S = spring({ frame: Math.max(0, lf - 150), fps, config: { damping: 18 } });
  const t2S = spring({ frame: Math.max(0, lf - 180), fps, config: { damping: 18 } });
  const fadeOut = interpolate(lf, [255, 270], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const text1 = lang === 'PT' ? 'Quando funcionou pela primeira vez...' : 'When it worked for the first time...';
  const text2 = lang === 'PT' ? '...entendi tudo.' : '...I understood everything.';
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', opacity: fadeOut }}>
      {lf < 145 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, minHeight: 160, background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, padding: 24, opacity: terminalOp }}>
          <div style={{ color: '#00FF88', fontSize: 42, fontFamily: 'monospace', marginBottom: 8 }}>{l1}</div>
          <div style={{ color: '#00FF88', fontSize: 42, fontFamily: 'monospace', marginBottom: 8 }}>{l2}</div>
          <div style={{ color: '#00FF88', fontSize: 42, fontFamily: 'monospace' }}>{l3}</div>
        </div>
      )}
      {lf >= 140 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: bloomSize * 2, height: bloomSize * 2, borderRadius: '50%', background: 'radial-gradient(circle, #FFD700, transparent)', opacity: bloomOp, pointerEvents: 'none' }} />
      )}
      <div style={{ position: 'absolute', top: '42%', width: '100%', textAlign: 'center', padding: '0 60px' }}>
        <div style={{ color: '#fff', fontSize: 64, fontFamily: 'system-ui', opacity: t1S, transform: 'translateY(' + interpolate(t1S, [0, 1], [20, 0]) + 'px)', marginBottom: 16 }}>{text1}</div>
        <div style={{ color: '#FFD700', fontSize: 64, fontWeight: 700, fontFamily: 'system-ui', opacity: t2S, transform: 'translateY(' + interpolate(t2S, [0, 1], [20, 0]) + 'px)', textShadow: '0 0 20px #FFD70077' }}>{text2}</div>
      </div>
    </AbsoluteFill>
  );
};


const Cena5 = ({ lang }: { lang: string }) => {
  const frame = useCurrentFrame();
  useVideoConfig();
  const lf = frame - 1020;
  if (lf < 0 || lf > 1020) return null;

  const subIdx = Math.min(3, Math.floor(lf / 240));
  const subLf = lf % 240;

  const images = ['aurora7_scene1.png', 'aurora7_scene2_blackout.png', 'aurora7_scene3_message.png', 'aurora7_scene4_tower_run.png'];
  const filters = [
    'saturate(1.2) brightness(1.05)',
    'saturate(0.4) brightness(0.6) hue-rotate(200deg)',
    'saturate(0.8) brightness(0.75)',
    'saturate(1.3) brightness(0.85) hue-rotate(340deg)',
  ];
  const scaleFrom = [1.0, 1.0, 1.02, 1.0];
  const scaleTo = [1.08, 1.06, 1.08, 1.1];

  const linesPT = [
    ['Criei uma cidade.', 'Futurista. Perfeita. Dourada.', 'Onde o sol nunca apaga.'],
    ['Ate que apaga.'],
    ['Aurora 7 e minha historia.', 'Lina sou eu.', 'aprendiz encantada pela tecnologia.'],
    ['O sol da historia e a tecnologia.', 'Sem ela, eu nao estaria aqui.'],
  ];
  const linesEN = [
    ['I created a city.', 'Futuristic. Perfect. Golden.', 'Where the sun never turns off.'],
    ['Until it turns off.'],
    ['Aurora 7 is my story.', 'Lina is me.', 'a learner enchanted by technology.'],
    ['The sun in the story is technology.', 'Without it, I would not be here.'],
  ];

  const lines = lang === 'PT' ? linesPT[subIdx] : linesEN[subIdx];
  const scale = interpolate(subLf, [0, 240], [scaleFrom[subIdx], scaleTo[subIdx]], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sceneOp = interpolate(subLf, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * interpolate(subLf, [220, 240], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const textOp = interpolate(subLf, [40, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const isBig = subIdx === 1;

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>
      <AbsoluteFill>
        <img
          src={staticFile(images[subIdx])}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(' + scale + ')', filter: filters[subIdx] }}
        />
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: isBig ? '45%' : 100, width: '100%', textAlign: 'center', padding: '0 60px', opacity: textOp }}>
        <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '12px 28px', display: 'inline-block' }}>
          {lines.map((line, i) => (
            <div key={i} style={{ color: i === lines.length - 1 && subIdx !== 1 ? '#FFD700' : '#fff', fontSize: isBig ? 52 : 36, fontWeight: isBig || i === lines.length - 1 ? 700 : 400, fontFamily: 'system-ui', marginBottom: 8, textShadow: isBig ? '0 0 30px #ffffff44' : 'none' }}>{line}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};


const Cena6 = ({ lang }: { lang: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - 2040;
  if (lf < 0 || lf > 360) return null;
  const logoText = 'AURORA LABS';
  const letters = logoText.split('');
  const fadeOut = interpolate(lf, [340, 360], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dividerW = interpolate(lf, [120, 200], [0, 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const linesPT = ['Aurora Labs nasceu pra isso.', 'Mostrar que qualquer pessoa', 'com curiosidade e coragem', 'consegue construir algo incrivel com IA.', 'Voce nao precisa saber programar.', 'Voce precisa querer aprender.'];
  const linesEN = ['Aurora Labs was born for this.', 'To show that anyone', 'with curiosity and courage', 'can build something incredible with AI.', 'You do not need to know how to code.', 'You need to want to learn.'];
  const lines = lang === 'PT' ? linesPT : linesEN;
  const lineDelays = [120, 170, 220, 270, 330, 390];
  const cyanIdx = lang === 'PT' ? 1 : 1;
  const goldIdx = lang === 'PT' ? 2 : 2;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', opacity: fadeOut }}>
      <div style={{ position: 'absolute', top: 60, width: '100%', display: 'flex', justifyContent: 'center' }}>
        {letters.map((letter, i) => {
          const s = spring({ frame: Math.max(0, lf - i * 5), fps, config: { damping: 15 } });
          return (
            <span key={i} style={{ color: '#FFD700', fontSize: 90, fontWeight: 900, fontFamily: 'system-ui', textShadow: '0 0 30px #FFD70099', opacity: s, display: 'inline-block', transform: 'translateY(' + interpolate(s, [0, 1], [20, 0]) + 'px)' }}>
              {letter === ' ' ? '  ' : letter}
            </span>
          );
        })}
      </div>
      <div style={{ position: 'absolute', top: 158, left: '50%', transform: 'translateX(-50%)', width: dividerW, height: 1, background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }} />
      <div style={{ position: 'absolute', top: 180, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '0 60px' }}>
        {lines.map((line, i) => {
          const op = interpolate(lf, [lineDelays[i], lineDelays[i] + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{ color: i === cyanIdx ? '#00E5FF' : i === goldIdx ? '#FFD700' : i === lines.length - 1 ? '#fff' : 'rgba(255,255,255,0.85)', fontSize: i === lines.length - 1 ? 88 : 88, fontWeight: i === lines.length - 1 ? 700 : 400, fontFamily: 'system-ui', opacity: op, textAlign: 'center' }}>
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};


const Cena7 = ({ lang }: { lang: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - 2400;
  if (lf < 0 || lf > 300) return null;
  const s1 = spring({ frame: Math.max(0, lf), fps, config: { damping: 18 } });
  const s2 = spring({ frame: Math.max(0, lf - 40), fps, config: { damping: 18 } });
  const logoS = spring({ frame: Math.max(0, lf - 120), fps, config: { damping: 18 } });
  const subOp = interpolate(lf, [160, 190], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const allOut = interpolate(lf, [240, 300], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const blink = Math.round(lf / 15) % 2 === 0 ? 0.8 : 0;
  const line1 = lang === 'PT' ? 'Proximo video:' : 'Next video:';
  const line2 = lang === 'PT' ? 'Como fazer isso em 3 horas — do zero.' : 'How to do this in 3 hours — from scratch.';
  const sub = lang === 'PT' ? 'Se inscreve. A serie comeca em breve.' : 'Subscribe. The series starts soon.';
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, opacity: allOut, padding: '0 60px' }}>
      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 64, textTransform: 'uppercase', letterSpacing: 5, fontFamily: 'system-ui', opacity: s1 }}>
        {line1}
      </div>
      <div style={{ color: '#fff', fontSize: 64, fontWeight: 700, fontFamily: 'system-ui', textAlign: 'center', opacity: s2, transform: 'translateY(' + interpolate(s2, [0, 1], [20, 0]) + 'px)' }}>
        {line2}
      </div>
      <div style={{ marginTop: 28, opacity: logoS, transform: 'scale(' + (0.8 + logoS * 0.2) + ')' }}>
        <div style={{ color: '#FFD700', fontSize: 40, fontWeight: 900, fontFamily: 'system-ui', letterSpacing: 8, textShadow: '0 0 20px #FFD70066', textAlign: 'center' }}>
          AURORA LABS
        </div>
      </div>
      <div style={{ color: '#00E5FF', fontSize: 64, textTransform: 'uppercase', letterSpacing: 4, fontFamily: 'system-ui', opacity: subOp }}>
        {sub}
      </div>
      <div style={{ width: 2, height: 18, background: '#00E5FF', opacity: blink, marginTop: 8 }} />
    </AbsoluteFill>
  );
};

export const AuroraLabsEp1PT = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <Audio src={staticFile("leberch-chase-254539.mp3")} volume={0.4} />
      <Cena1 lang="PT" />
      <Cena2 lang="PT" />
      <Cena3 lang="PT" />
      <Cena4 lang="PT" />
      <Cena5 lang="PT" />
      <Cena6 lang="PT" />
      <Cena7 lang="PT" />
    </AbsoluteFill>
  );
};

export const AuroraLabsEp1EN = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <Audio src={staticFile("leberch-chase-254539.mp3")} volume={0.4} />
      <Cena1 lang="EN" />
      <Cena2 lang="EN" />
      <Cena3 lang="EN" />
      <Cena4 lang="EN" />
      <Cena5 lang="EN" />
      <Cena6 lang="EN" />
      <Cena7 lang="EN" />
    </AbsoluteFill>
  );
};
