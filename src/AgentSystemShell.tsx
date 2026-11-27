import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene, lerp, prog} from './lib/motion';
import {fontFamily} from './Promo';

// AI Agent System: 30 s silent site clip (he, 16:9, 1920x1080 @30). Script: products/ai-agent-system-shell-script-v1.md
// Every label comes from the product's own spec (see products/ai-agent-system-shell.md "Verified claims").
const ACC = '#8fa8ff', GOOD = '#7fe0b8', WARN = '#ffc15e', INK = '#eef2ff', DIM = '#b4bddf';
const W = 1920, H = 1080;

const Bg: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: '#070b14', overflow: 'hidden'}}>
    {[0, 1, 2].map((i) => {
      const a = f / 140 + i * 2.1;
      return (
        <div key={i} style={{position: 'absolute', left: W * (0.2 + 0.3 * i) + Math.sin(a) * 160 - 500, top: H * (0.3 + 0.2 * (i % 2)) + Math.cos(a * 0.8) * 110 - 500, width: 1000, height: 1000, borderRadius: 999, background: `radial-gradient(circle, ${i === 1 ? '#8fa8ff' : '#5b6fd6'}2e, transparent 65%)`}} />
      );
    })}
    <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(143,168,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(143,168,255,.05) 1px, transparent 1px)', backgroundSize: '96px 96px', backgroundPosition: `${f * 0.4}px ${f * 0.25}px`}} />
  </AbsoluteFill>
);

const Cap: React.FC<{text: string; lf: number; a?: number}> = ({text, lf, a = 18}) => {
  const t = prog(lf, a, a + 20);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 86, display: 'flex', justifyContent: 'center', opacity: t, transform: `translateY(${(1 - t) * 18}px)`}}>
      <div style={{direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 62, lineHeight: 1.15, color: INK, padding: '20px 54px', borderRadius: 999, background: 'rgba(7,11,20,.78)', border: `2px solid ${ACC}66`, boxShadow: `0 0 50px ${ACC}33`}}>{text}</div>
    </div>
  );
};

const Box: React.FC<{x: number; y: number; w: number; h: number; t: number; color?: string; children: React.ReactNode; dim?: number}> = ({x, y, w, h, t, color = ACC, children, dim = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: t * dim, transform: `translateY(${(1 - t) * 24}px)`, borderRadius: 26, background: 'linear-gradient(135deg, rgba(20,28,52,.96), rgba(10,15,30,.96))', border: `2px solid ${color}88`, boxShadow: `0 18px 50px rgba(0,0,0,.5), 0 0 30px ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', fontFamily, color: INK}}>{children}</div>
);

// Scene 1: one request = one RUN
const S1: React.FC<{lf: number}> = ({lf}) => {
  const tT = prog(lf, 6, 30), sT = prog(lf, 24, 48);
  const items = [{t: 'בקשה', c: ACC}, {t: 'RUN אחד', c: GOOD}, {t: 'דוח עם ראיות', c: ACC}];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', fontFamily, fontWeight: 700, fontSize: 150, letterSpacing: -2, color: INK, direction: 'ltr', opacity: tT, transform: `translateY(${(1 - tT) * 20}px)`}}>AI Agent System</div>
      <div style={{position: 'absolute', top: 340, left: 0, right: 0, textAlign: 'center', fontFamily, fontWeight: 400, fontSize: 58, color: DIM, direction: 'rtl', opacity: sT}}>מערכת סוכנים להנדסת תוכנה</div>
      {items.map((it, i) => {
        const t = prog(lf, 50 + i * 16, 78 + i * 16);
        const x = 1920 / 2 + (1 - i) * 520;
        const arrow = i < 2 ? prog(lf, 66 + i * 16, 90 + i * 16) : 0;
        return (
          <React.Fragment key={i}>
            <Box x={x - 210} y={500} w={420} h={170} t={t} color={it.c}><span style={{fontSize: 56, fontWeight: 700}}>{it.t}</span></Box>
            {i < 2 && <div style={{position: 'absolute', left: x - 310, top: 540, width: 100, textAlign: 'center', fontFamily, fontSize: 80, color: ACC, opacity: arrow, transform: `translateX(${(1 - arrow) * 20}px)`}}>←</div>}
          </React.Fragment>
        );
      })}
      <Cap text="בקשה אחת. ריצה אחת." lf={lf} a={70} />
    </AbsoluteFill>
  );
};

// Scene 2: fifteen separate specialists (names as in the spec)
const ROLES = ['Orchestrator', 'Profiler', 'Planner', 'Development', 'Investigator', 'Repair', 'CI/Test', 'Web Testing', 'Mobile Testing', 'API', 'Data/DB', 'Security', 'Verifier', 'Memory', 'Reporter'];
const S2: React.FC<{lf: number}> = ({lf}) => (
  <AbsoluteFill>
    {ROLES.map((r, i) => {
      const col = i % 5, row = Math.floor(i / 5);
      const t = prog(lf, 8 + i * 5, 34 + i * 5);
      const ver = r === 'Verifier';
      const glow = ver ? prog(lf, 120, 150) : 0;
      return (
        <Box key={r} x={1920 / 2 + (2 - col) * 350 - 160 - 0} y={190 + row * 190} w={320} h={130} t={t} color={ver && glow > 0.5 ? GOOD : ACC}>
          <span style={{fontSize: 40, fontWeight: 700, direction: 'ltr', color: ver && glow > 0.5 ? GOOD : INK}}>{r}</span>
        </Box>
      );
    })}
    <div style={{position: 'absolute', top: 770, left: 0, right: 0, textAlign: 'center', fontFamily, fontSize: 48, color: DIM, direction: "rtl", opacity: prog(lf, 90, 112)}}>המאגר נקבע בכל בקשה, ומופעלים רק המומחים הנדרשים</div>
    <Cap text="15 תפקידים נפרדים, כל אחד מתמחה" lf={lf} a={26} />
  </AbsoluteFill>
);

// Scene 3: mandatory failure loop
const STEPS = ['הרצה', 'בדיקה', 'אבחון', 'תיקון', 'הרצה חוזרת', 'אימות'];
const S3: React.FC<{lf: number}> = ({lf}) => {
  const cx = 960, cy = 440, R = 270;
  const active = Math.min(5, Math.floor(Math.max(0, lf - 30) / 22));
  const sweep = prog(lf, 30, 162);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={`${ACC}33`} strokeWidth={4} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={ACC} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * R * sweep * 0.83} ${2 * Math.PI * R}`} transform={`rotate(-90 ${cx} ${cy})`} opacity={0.8} />
      </svg>
      {STEPS.map((s, i) => {
        const ang = ((-90 + i * 60) * Math.PI) / 180;
        const x = cx + R * Math.cos(ang), y = cy + R * Math.sin(ang);
        const t = prog(lf, 6 + i * 6, 30 + i * 6);
        const on = i <= active && lf > 30;
        const last = i === 5;
        const c = last && on ? GOOD : on ? ACC : DIM;
        return <Box key={s} x={x - 130} y={y - 52} w={260} h={104} t={t} color={c}><span style={{fontSize: 44, fontWeight: 700, color: on ? INK : DIM}}>{s}</span></Box>;
      })}
      <div style={{position: 'absolute', left: cx - 200, top: cy - 50, width: 400, textAlign: 'center', fontFamily, fontWeight: 700, fontSize: 46, color: INK, direction: 'rtl', opacity: prog(lf, 20, 44)}}>לולאה חובה</div>
      <Cap text="נכשל? בודקים, מתקנים ומריצים שוב" lf={lf} a={30} />
    </AbsoluteFill>
  );
};

// Scene 4: evidence decides (trust order from the spec)
const LAD = [
  {t: 'הרצה ובדיקות', c: GOOD},
  {t: 'CI: ג׳ובים ולוגים', c: ACC},
  {t: 'פלט של סורקים', c: ACC},
  {t: 'פרשנות הסוכן', c: WARN},
];
const S4: React.FC<{lf: number}> = ({lf}) => (
  <AbsoluteFill>
    <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', fontFamily, fontSize: 40, color: DIM, direction: 'rtl', opacity: prog(lf, 4, 24)}}>סדר האמון בראיות</div>
    {LAD.map((r, i) => {
      const t = prog(lf, 14 + i * 18, 42 + i * 18);
      const last = i === 3;
      const fade = last ? 1 - 0.45 * prog(lf, 100, 130) : 1;
      return (
        <Box key={r.t} x={1920 / 2 - 480} y={200 + i * 150} w={960} h={118} t={t} color={r.c} dim={fade}>
          <span style={{fontSize: 52, fontWeight: 700}}>{`${i + 1}. ${r.t}`}</span>
        </Box>
      );
    })}
    <div style={{position: 'absolute', top: 810, left: 0, right: 0, textAlign: 'center', fontFamily, fontSize: 42, color: WARN, direction: 'rtl', opacity: prog(lf, 100, 124)}}>המודל אינו שופט של עצמו</div>
    <Cap text="רק ראיות קובעות" lf={lf} a={34} />
  </AbsoluteFill>
);

// Scene 5: honest status and limits
const S5: React.FC<{lf: number}> = ({lf}) => {
  const items = [
    {t: 'עוצר ומעביר לאדם כשחסרה הרשאה', c: ACC},
    {t: 'שיפור עצמי: סנדבוקס בלבד', c: ACC},
    {t: 'עדיין לא מוכן לפרודקשן', c: WARN},
    {t: 'שיפור מאומת: עדיין לא הוכח', c: WARN},
  ];
  const sweep = prog(lf, 90, 200);
  return (
    <AbsoluteFill>
      {items.map((it, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const t = prog(lf, 10 + i * 22, 40 + i * 22);
        const x = 1920 / 2 + (col === 0 ? 20 : -20 - 800);
        return (
          <Box key={it.t} x={x} y={230 + row * 210} w={780} h={160} t={t} color={it.c}>
            <span style={{fontSize: 46, fontWeight: 700, textAlign: 'center', padding: '0 24px', lineHeight: 1.2}}>{it.t}</span>
          </Box>
        );
      })}
      <div style={{position: 'absolute', left: lerp(-300, 2100, sweep), top: 200, width: 220, height: 400, transform: 'skewX(-18deg)', background: 'linear-gradient(90deg, transparent, rgba(143,168,255,.10), transparent)', opacity: sweep > 0 && sweep < 1 ? 1 : 0}} />
      <div style={{position: 'absolute', top: 660, left: 0, right: 0, textAlign: 'center', fontFamily, fontWeight: 700, fontSize: 112, color: INK, direction: 'ltr', opacity: prog(lf, 100, 130)}}>AI Agent System</div>
      <Cap text="ניסוי בתהליכי עבודה עם בינה מלאכותית" lf={lf} a={64} />
    </AbsoluteFill>
  );
};

export const AgentSystemShell: React.FC = () => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 55) * 5;
  return (
    <AbsoluteFill style={{fontFamily}}>
      <Bg f={f} />
      <AbsoluteFill style={{transform: `translateY(${drift}px)`}}>
        <Scene from={0} dur={150} fadeIn={false}>{(lf) => <S1 lf={lf} />}</Scene>
        <Scene from={126} dur={198}>{(lf) => <S2 lf={lf} />}</Scene>
        <Scene from={300} dur={204}>{(lf) => <S3 lf={lf} />}</Scene>
        <Scene from={480} dur={204}>{(lf) => <S4 lf={lf} />}</Scene>
        <Scene from={660} dur={240} fade={30}>{(lf) => <S5 lf={lf} />}</Scene>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
