import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {Fade, lerp, prog} from './lib/motion';
import {fontFamily} from './Promo';

// "AI Agent System" - benchmark site clip, 30 s, 1920x1080 @30, silent, Hebrew RTL, dark mode.
// Motion graphics only (no screenshots, no AI-drawn UI). Every label comes from the verified claims V1-V11
// in products/agent-system-bench.md. No numbers, no outcome claims.

export const BENCH_FRAMES = 900;
const W = 1920;
const H = 1080;
const BG = '#070a14';
const ACC = '#8aa4ff';
const OK = '#5ee6a8';
const AMB = '#ffc15e';
const TXT = '#eef2ff';
const SUB = '#b9c3e6';

// scene windows (frames); each scene cross-fades over 24 frames into the next
const S = [0, 120, 255, 420, 570, 735, BENCH_FRAMES];

const Scene: React.FC<{i: number; f: number; children: React.ReactNode}> = ({i, f, children}) => {
  const last = i === S.length - 2;
  const a = i === 0 ? -30 : S[i];
  const b = i === 0 ? 0 : S[i] + 24;
  return (
    <Fade f={f} a={a} b={b} c={last ? 99999 : S[i + 1]} d={last ? 100000 : S[i + 1] + 24}>
      {children}
    </Fade>
  );
};

const Background: React.FC<{f: number}> = ({f}) => {
  const orb = (cx: number, cy: number, r: number, col: string, ph: number, sp: number) => {
    const x = cx + Math.sin(f * sp + ph) * 140;
    const y = cy + Math.cos(f * sp * 0.8 + ph) * 90;
    return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999, background: `radial-gradient(circle, ${col}33, transparent 68%)`}} />;
  };
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${BG}, #0b1022 60%, #060814)`}}>
      {orb(480, 300, 520, ACC, 0, 0.012)}
      {orb(1500, 800, 560, OK, 2, 0.01)}
      {orb(1000, 540, 420, '#a07cff', 4, 0.008)}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{f: number; a: number; b: number; text: string}> = ({f, a, b, text}) => {
  const i = prog(f, a, a + 18), o = prog(f, b - 18, b);
  if (f < a || f > b) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 92, display: 'flex', justifyContent: 'center', opacity: i * (1 - o), transform: `translateY(${(1 - i) * 14}px)`}}>
      <div style={{direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 54, lineHeight: 1.15, color: TXT, padding: '16px 44px', borderRadius: 999, background: 'rgba(7,10,22,.78)', border: `1.5px solid ${ACC}77`, boxShadow: `0 0 40px ${ACC}33`}}>{text}</div>
    </div>
  );
};

const Rise: React.FC<{f: number; t0: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, t0, dur = 28, children, style}) => {
  const u = prog(f, t0, t0 + dur);
  return <div style={{opacity: u, transform: `translateY(${(1 - u) * 34}px) scale(${lerp(0.97, 1, u)})`, filter: `blur(${(1 - u) * 6}px)`, ...style}}>{children}</div>;
};

// ---------- scene 1: hook ----------
const Hook: React.FC<{f: number}> = ({f}) => {
  const drift = lerp(1, 1.08, Math.min(1, Math.max(0, f / 150)));
  const q = prog(f, 52, 80);
  const stamp = prog(f, 40, 70);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${drift})`}}>
      <div style={{direction: 'rtl', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44, marginTop: -60}}>
        <Rise f={f} t0={4}>
          <div style={{fontFamily, fontWeight: 700, fontSize: 128, color: TXT, padding: '26px 76px', borderRadius: 80, border: `4px solid ${interpolateColors(stamp, [0, 1], [OK, AMB])}`, background: 'rgba(94,230,168,.08)'}}>
            ״סיימתי ✓״
          </div>
        </Rise>
        <div style={{fontFamily, fontWeight: 700, fontSize: 104, color: SUB, opacity: q, transform: `translateY(${(1 - q) * 30}px)`}}>
          ומי מוכיח?
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- scene 2: one request = one run ----------
const RunScene: React.FC<{f: number}> = ({f}) => {
  const L = f - S[1];
  const line = prog(L, 40, 100);
  const steps = [0, 1, 2, 3, 4, 5, 6];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Rise f={L} t0={0} style={{position: 'absolute', top: 96, width: W, textAlign: 'center', direction: 'rtl'}}>
        <div style={{fontFamily, fontWeight: 700, fontSize: 92, color: TXT, letterSpacing: 1}}>AI Agent System</div>
        <div style={{fontFamily, fontWeight: 700, fontSize: 46, color: SUB, marginTop: 6}}>צוות סוכנים להנדסת תוכנה</div>
      </Rise>
      <div style={{display: 'flex', alignItems: 'center', gap: 0, direction: 'rtl', marginTop: 90}}>
        <Rise f={L} t0={14}>
          <div style={{fontFamily, fontWeight: 700, fontSize: 56, color: TXT, background: 'rgba(138,164,255,.14)', border: `3px solid ${ACC}`, borderRadius: 36, padding: '34px 44px', textAlign: 'center', lineHeight: 1.25}}>
            בקשה<br />אחת
          </div>
        </Rise>
        <div style={{width: 260, height: 6, background: 'rgba(138,164,255,.2)', borderRadius: 6, position: 'relative'}}>
          <div style={{position: 'absolute', right: 0, top: 0, height: 6, width: `${line * 100}%`, background: ACC, borderRadius: 6, boxShadow: `0 0 18px ${ACC}`}} />
        </div>
        <Rise f={L} t0={44}>
          <div style={{width: 840, borderRadius: 48, border: `3px solid ${OK}99`, background: 'rgba(94,230,168,.07)', padding: '30px 40px', direction: 'rtl'}}>
            <div style={{fontFamily, fontWeight: 700, fontSize: 58, color: OK, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span>ריצה אחת</span>
              <span style={{fontSize: 40, color: SUB, fontWeight: 400, border: `2px solid ${SUB}66`, borderRadius: 30, padding: '4px 22px'}}>מזהה ריצה אחד</span>
            </div>
            <div style={{display: 'flex', gap: 18, marginTop: 30, direction: 'rtl'}}>
              {steps.map((s) => {
                const u = prog(L, 70 + s * 9, 92 + s * 9);
                return <div key={s} style={{flex: 1, height: 18, borderRadius: 10, background: interpolateColors(u, [0, 1], ['rgba(185,195,230,.15)', OK]), boxShadow: u > 0.6 ? `0 0 14px ${OK}88` : undefined}} />;
              })}
            </div>
            <div style={{fontFamily, fontWeight: 400, fontSize: 40, color: SUB, marginTop: 22}}>הרבה צעדים פנימיים</div>
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

// ---------- scene 3: the team ----------
const ROLES = ['מתזמר', 'מתכנן', 'פיתוח', 'תיקון', 'בדיקות CI', 'אבטחה', 'חוקר כשלים', 'מאמת'];
const Team: React.FC<{f: number}> = ({f}) => {
  const L = f - S[2];
  const focus = prog(L, 92, 124);
  const isKey = (r: string) => r === 'חוקר כשלים' || r === 'מאמת';
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{marginTop: -110, direction: 'rtl', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 380px)', gap: 26, direction: 'rtl'}}>
          {ROLES.map((r, i) => {
            const u = prog(L, 6 + i * 7, 30 + i * 7);
            const key = isKey(r);
            const dim = key ? 1 : lerp(1, 0.5, focus);
            return (
              <div key={r} style={{opacity: u * dim, transform: `translateY(${(1 - u) * 36}px) scale(${key ? lerp(1, 1.06, focus) : 1})`, fontFamily, fontWeight: 700, fontSize: 52, textAlign: 'center', color: TXT, padding: '30px 10px', borderRadius: 30, background: key && focus > 0.5 ? 'rgba(138,164,255,.2)' : 'rgba(255,255,255,.06)', border: `2.5px solid ${key ? interpolateColors(focus, [0, 1], [`${ACC}55`, ACC]) : `${ACC}55`}`}}>
                {r}
              </div>
            );
          })}
        </div>
        <div style={{height: 150, position: 'relative', width: 1640}}>
          <Rise f={L} t0={118} style={{position: 'absolute', right: 0, top: 0, direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 50, color: AMB}}>
            חוקר כשלים שואל: למה זה נכשל?
          </Rise>
          <Rise f={L} t0={134} style={{position: 'absolute', right: 0, top: 76, direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 50, color: OK}}>
            מאמת שואל: האם זה הוכח?
          </Rise>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- scene 4: the failure loop ----------
const LOOP = ['הרצה', 'בדיקה', 'אבחון', 'תיקון', 'הרצה חוזרת', 'אימות'];
const Loop: React.FC<{f: number}> = ({f}) => {
  const L = f - S[3];
  const cx = (i: number) => 1650 - i * 276; // RTL: first step at the right
  const active = prog(L, 16, 120) * 5; // 0..5 travelling
  const back = prog(L, 100, 140);
  const drift = lerp(1, 1.06, Math.min(1, L / 150));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${drift})`}}>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={cx(0)} y1={470} x2={cx(5)} y2={470} stroke={`${ACC}44`} strokeWidth={6} />
        <line x1={cx(0)} y1={470} x2={lerp(cx(0), cx(5), active / 5)} y2={470} stroke={ACC} strokeWidth={6} />
        <path d={`M ${cx(3)} 395 C ${cx(3)} 250, ${cx(1)} 250, ${cx(1)} 395`} fill="none" stroke={AMB} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={-(L * 1.2)} opacity={back} />
      </svg>
      {LOOP.map((t, i) => {
        const u = prog(L, 4 + i * 5, 26 + i * 5);
        const hit = prog(active, i - 0.4, i + 0.1);
        const col = interpolateColors(hit, [0, 1], ['rgba(255,255,255,.07)', i === 5 ? 'rgba(94,230,168,.28)' : 'rgba(138,164,255,.28)']);
        return (
          <div key={t} style={{position: 'absolute', left: cx(i) - 120, top: 400, width: 240, opacity: u, transform: `translateY(${(1 - u) * 30}px)`}}>
            <div style={{height: 140, borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(${col}, ${col}), #0c1226`, border: `2.5px solid ${i === 5 && hit > 0.5 ? OK : `${ACC}88`}`, fontFamily, fontWeight: 700, fontSize: i === 4 ? 40 : 48, color: TXT, textAlign: 'center', direction: 'rtl', lineHeight: 1.1}}>{t}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: cx(2) - 190, top: 205, width: 380, textAlign: 'center', fontFamily, fontWeight: 700, fontSize: 40, color: AMB, direction: 'rtl', opacity: back}}>עד שמוכח</div>
    </AbsoluteFill>
  );
};

// ---------- scene 5: evidence over claims ----------
const RUNGS = [
  {t: 'ראיות הרצה ובדיקות', w: 1180, c: OK},
  {t: 'לוגים ותוצרי CI', w: 980, c: '#7ad9c1'},
  {t: 'פלט כלי סריקה', w: 780, c: ACC},
  {t: 'פרשנות של סוכן', w: 580, c: '#7b84a8'},
];
const Evidence: React.FC<{f: number}> = ({f}) => {
  const L = f - S[4];
  const proven = prog(L, 96, 128);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{marginTop: -130, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
        <div style={{direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 60, color: TXT, display: 'flex', alignItems: 'center', gap: 26}}>
          <span style={{padding: '8px 36px', borderRadius: 50, border: `3px solid ${interpolateColors(proven, [0, 1], [AMB, OK])}`, color: interpolateColors(proven, [0, 1], [AMB, OK])}}>
            {proven < 0.5 ? '״סיימתי״ · ממתין להוכחה' : '״סיימתי״ · הוכח ✓'}
          </span>
        </div>
        {RUNGS.map((r, i) => {
          const u = prog(L, 10 + i * 14, 40 + i * 14);
          const lit = i === 0 ? proven : 0;
          return (
            <div key={r.t} style={{width: 1180, display: 'flex', justifyContent: 'flex-start', direction: 'rtl', opacity: u}}>
              <div style={{width: r.w * u, height: 104, borderRadius: 26, display: 'flex', alignItems: 'center', padding: '0 34px', fontFamily, fontWeight: 700, fontSize: 48, color: i === 3 ? SUB : '#06101a', background: i === 3 ? 'rgba(123,132,168,.28)' : r.c, boxShadow: lit > 0.1 ? `0 0 ${50 * lit}px ${OK}aa` : undefined, whiteSpace: 'nowrap', overflow: 'hidden', border: i === 3 ? `2px dashed ${SUB}88` : undefined}}>
                {r.t}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- scene 6: outro ----------
const CHIPS = ['רץ רק לפי בקשה', 'עוצר ושואל כשחסר אישור', 'שיפור עצמי: בארגז חול, מול בדיקה נפרדת'];
const Outro: React.FC<{f: number}> = ({f}) => {
  const L = f - S[5];
  const glow = 0.5 + 0.5 * Math.sin(L / 18);
  const drift = lerp(1, 1.08, Math.min(1, L / 165));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${drift})`}}>
      <div style={{marginTop: -50, direction: 'rtl', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
        <Rise f={L} t0={4}>
          <div style={{fontFamily, fontWeight: 700, fontSize: 132, color: TXT, textShadow: `0 0 ${40 + 30 * glow}px ${ACC}88`}}>AI Agent System</div>
        </Rise>
        <Rise f={L} t0={20}>
          <div style={{fontFamily, fontWeight: 700, fontSize: 64, color: OK}}>הוכחה לפני הצהרה</div>
        </Rise>
        <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 14, alignItems: 'center'}}>
          {CHIPS.map((c, i) => (
            <Rise key={c} f={L} t0={44 + i * 22}>
              <div style={{fontFamily, fontWeight: 700, fontSize: 46, color: TXT, padding: '12px 40px', borderRadius: 50, background: 'rgba(138,164,255,.12)', border: `2px solid ${ACC}77`, direction: 'rtl'}}>{c}</div>
            </Rise>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const AgentSystemBench: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{fontFamily, background: BG}}>
      <Background f={f} />
      <Scene i={0} f={f}><Hook f={f} /></Scene>
      <Scene i={1} f={f}><RunScene f={f} /></Scene>
      <Scene i={2} f={f}><Team f={f} /></Scene>
      <Scene i={3} f={f}><Loop f={f} /></Scene>
      <Scene i={4} f={f}><Evidence f={f} /></Scene>
      <Scene i={5} f={f}><Outro f={f} /></Scene>
      <Caption f={f} a={150} b={250} text="בקשה אחת, ריצה אחת" />
      <Caption f={f} a={285} b={335} text="צוות של מומחים נפרדים" />
      <Caption f={f} a={340} b={415} text="כל אחד שואל שאלה אחרת" />
      <Caption f={f} a={450} b={565} text="הרצה, אבחון, תיקון, ושוב הרצה" />
      <Caption f={f} a={600} b={730} text="דיווח של סוכן הוא לא הוכחה" />
    </AbsoluteFill>
  );
};
