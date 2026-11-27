import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {Fade, prog, lerp} from './lib/motion';
import {fontFamily} from './Promo';

// AI Agent System (n8n engineering system) — site video, 30 s, 1920x1080 @30, silent, he. Script: products/ai-agent-system-script-v3.md
const W = 1920, H = 1080;
const BG = '#07090f', ACCENT = '#8fa8ff', GOOD = '#5fd49a', AMBER = '#ffc15e', BAD = '#ff7a8a', MUTE = '#a3acc4', TEXT = '#eef2ff';

const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const CAPS = [
  {t: 'בקשה אחת, צוות מתמחים', a: 125, b: 300}, {t: 'נכשל? מאבחנים, מתקנים, בודקים שוב', a: 335, b: 505},
  {t: 'הסוכן לא שופט את עצמו', a: 545, b: 695}, {t: 'שיפור עצמי, בניסוי ובתוך גבולות', a: 735, b: 845},
];
const panel = (col: string, glow = 0): React.CSSProperties => ({borderRadius: 30, padding: '30px 36px', background: 'linear-gradient(160deg, rgba(20,26,44,.96), rgba(10,13,24,.96))', border: `2px solid ${col}66`, boxShadow: glow ? `0 0 ${glow}px ${col}44` : '0 24px 60px rgba(0,0,0,.5)'});
const Chip: React.FC<{id: string; u: number; col?: string; dim?: number; size?: number}> = ({id, u, col = ACCENT, dim = 0, size = 30}) => (
  <div style={{direction: 'ltr', fontFamily: MONO, fontWeight: 600, fontSize: size, color: interpolateColors(dim, [0, 1], [TEXT, MUTE + '77']), padding: '16px 26px', borderRadius: 16, border: `2px solid ${interpolateColors(dim, [0, 1], [col + '99', col + '22'])}`, background: `${col}${dim > 0.5 ? '06' : '14'}`, display: 'flex', alignItems: 'center', gap: 14, opacity: u, transform: `translateY(${(1 - u) * 30}px)`, filter: `blur(${(1 - u) * 6}px)`}}>
    <span style={{width: 12, height: 12, borderRadius: 99, background: col, opacity: 1 - dim * 0.7, boxShadow: dim < 0.5 ? `0 0 14px ${col}` : 'none'}} />{id}
  </div>
);
const Tag: React.FC<{t: string; col?: string}> = ({t, col = AMBER}) => <div style={{fontFamily, fontWeight: 700, fontSize: 24, color: col, border: `2px solid ${col}88`, borderRadius: 99, padding: '4px 18px'}}>{t}</div>;

const HOOK_ROLES = ['Planner', 'Development Agent', 'Repair Agent', 'CI/Test Agent', 'Security Agent', 'Verifier'];
const Hook: React.FC<{f: number}> = ({f}) => {
  const t = prog(f, 4, 30), s = prog(f, 20, 46);
  return (
    <AbsoluteFill style={{alignItems: 'center', direction: 'rtl'}}>
      <div style={{marginTop: 140, textAlign: 'center', opacity: t, transform: `translateY(${(1 - t) * 24}px)`}}>
        <div style={{direction: 'ltr', fontFamily, fontWeight: 900, fontSize: 150, color: TEXT, lineHeight: 1.05}}>AI Agent System</div>
        <div style={{fontFamily, fontWeight: 700, fontSize: 66, color: ACCENT, marginTop: 14, opacity: s}}>צוות סוכנים שמפתח תוכנה</div>
      </div>
      <div style={{position: 'absolute', top: 600, left: 0, right: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 520px)', gap: 24, justifyContent: 'center'}}>
        {HOOK_ROLES.map((id, i) => <Chip key={id} id={id} u={prog(f, 40 + i * 6, 64 + i * 6)} col={id === 'Verifier' ? GOOD : ACCENT} />)}
      </div>
    </AbsoluteFill>
  );
};

const SPECS: {id: string; hot: boolean}[] = [
  {id: 'Planner', hot: true}, {id: 'Development Agent', hot: true}, {id: 'Web Testing Agent', hot: true},
  {id: 'Mobile Testing Agent', hot: false}, {id: 'Data/DB Agent', hot: false}, {id: 'Verifier', hot: true},
];
const Run: React.FC<{f: number}> = ({f}) => {
  const L = f - 96;
  const a = prog(L, 24, 54), b = prog(L, 56, 86), c = prog(L, 104, 134);
  return (
    <AbsoluteFill style={{alignItems: 'center', direction: 'rtl'}}>
      <div style={{marginTop: 210, display: 'flex', alignItems: 'center', gap: 36, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
        <div style={{...panel(AMBER), width: 440}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div style={{fontFamily, fontWeight: 800, fontSize: 36, color: TEXT}}>בקשה</div><Tag t="דוגמה" /></div>
          <div style={{fontFamily, fontWeight: 600, fontSize: 32, color: '#c7cde0', marginTop: 16, lineHeight: 1.3}}>לתקן באג ולהוסיף בדיקה באתר</div>
        </div>
        <div style={{...panel(ACCENT, 30), width: 360, opacity: b, textAlign: 'center'}}>
          <div style={{direction: 'ltr', fontFamily: MONO, fontWeight: 800, fontSize: 40, color: ACCENT}}>1 RUN</div>
          <div style={{fontFamily, fontWeight: 600, fontSize: 28, color: MUTE, marginTop: 10}}>מזהה ריצה אחד</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          {SPECS.map((sp, i) => <Chip key={sp.id} id={sp.id} size={27} col={sp.hot ? GOOD : MUTE} dim={sp.hot ? 0 : c} u={prog(L, 70 + i * 6, 96 + i * 6)} />)}
        </div>
      </div>
      <div style={{marginTop: 44, fontFamily, fontWeight: 600, fontSize: 30, color: MUTE, opacity: c}}>רק המתמחים הרלוונטיים לפרויקט נכנסים לעבודה</div>
    </AbsoluteFill>
  );
};

const STEPS = ['run', 'inspect', 'diagnose', 'fix', 'rerun', 'verify'];
const Loop: React.FC<{f: number}> = ({f}) => {
  const L = f - 300;
  const inn = prog(L, 20, 56), d = prog(L, 104, 140);
  const idx = Math.min(5, Math.max(0, Math.floor((L - 40) / 18)));
  return (
    <AbsoluteFill style={{alignItems: 'center', direction: 'rtl'}}>
      <div style={{marginTop: 210, display: 'flex', gap: 14, direction: 'ltr', opacity: inn, transform: `translateY(${(1 - inn) * 30}px)`}}>
        {STEPS.map((st, i) => {
          const on = L > 40 + i * 18 ? 1 : 0;
          const cur = i === idx && L > 40 && L < 40 + 6 * 18 + 20 ? 1 : 0;
          const col = st === 'verify' ? GOOD : ACCENT;
          return <div key={st} style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 32, padding: '16px 26px', borderRadius: 16, color: on ? TEXT : MUTE, border: `2px solid ${on ? col : MUTE + '44'}`, background: `${col}${cur ? '30' : on ? '14' : '05'}`, boxShadow: cur ? `0 0 30px ${col}77` : 'none'}}>{st}</div>
            {i < 5 && <div style={{fontSize: 34, color: on ? ACCENT : MUTE + '55'}}>→</div>}
          </div>;
        })}
      </div>
      <div style={{marginTop: 70, display: 'flex', gap: 40, opacity: d, transform: `translateY(${(1 - d) * 30}px)`}}>
        <div style={{...panel(ACCENT), width: 560}}>
          <div style={{direction: 'ltr', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: ACCENT}}>Failure Investigator</div>
          <div style={{fontFamily, fontWeight: 800, fontSize: 44, color: TEXT, marginTop: 12}}>למה זה נכשל?</div>
        </div>
        <div style={{...panel(GOOD, 24), width: 560}}>
          <div style={{direction: 'ltr', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: GOOD}}>Verifier</div>
          <div style={{fontFamily, fontWeight: 800, fontSize: 44, color: TEXT, marginTop: 12}}>האם ההצלחה הוכחה?</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LADDER = ['Runtime / test evidence', 'CI jobs, artifacts, logs', 'Deterministic scanner output', 'Agent interpretation'];
const Evidence: React.FC<{f: number}> = ({f}) => {
  const L = f - 510;
  const inn = prog(L, 20, 56), ev = prog(L, 96, 126);
  const col = interpolateColors(ev, [0, 1], [AMBER, GOOD]);
  const lab = (o: number, a: string, b: string) => <div style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: o}}><div style={{direction: 'ltr', fontFamily: MONO, fontWeight: 800, fontSize: 50}}>{a}</div><div style={{fontFamily, fontWeight: 600, fontSize: 28, color: '#aab3cc', marginTop: 6}}>{b}</div></div>;
  return (
    <AbsoluteFill style={{alignItems: 'center', direction: 'rtl'}}>
      <div style={{marginTop: 190, display: 'flex', gap: 50, alignItems: 'center', opacity: inn, transform: `translateY(${(1 - inn) * 30}px)`}}>
        <div style={{...panel(col, 20 + 40 * ev), width: 700}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div style={{fontFamily, fontWeight: 800, fontSize: 36, color: TEXT}}>הסוכן מדווח: "בוצע"</div><Tag t="דוגמה" /></div>
          <div style={{position: 'relative', height: 120, marginTop: 24, color: col}}>{lab(1 - ev, 'UNCONFIRMED', 'טענה של סוכן אינה הוכחה')}{lab(ev, 'COMPLETE', 'יש הוכחה מכנית: בדיקה שעברה')}</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{fontFamily, fontWeight: 700, fontSize: 28, color: MUTE, marginBottom: 2}}>סדר האמון</div>
          {LADDER.map((l, i) => <div key={l} style={{direction: 'ltr', fontFamily: MONO, fontWeight: 600, fontSize: 26, padding: '12px 24px', borderRadius: 12, width: 520, color: i === 3 ? MUTE : TEXT, border: `2px solid ${i === 3 ? MUTE + '44' : GOOD + (['cc', '99', '66'][i] ?? '66')}`, background: `${GOOD}${['22', '16', '0c', '04'][i]}`, opacity: prog(L, 28 + i * 8, 56 + i * 8)}}>{i + 1}. {l}</div>)}
          <div style={{display: 'flex', gap: 12, direction: 'ltr', opacity: prog(L, 120, 150)}}>
            {['BLOCKED', 'NEEDS_USER_ACTION'].map(x => <div key={x} style={{fontFamily: MONO, fontWeight: 600, fontSize: 24, padding: '8px 18px', borderRadius: 10, border: `2px solid ${AMBER}88`, color: AMBER}}>{x}</div>)}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LIMITS: {k: string; v: string; col: string}[] = [
  {k: 'SANDBOX_ONLY', v: 'סביבת ניסוי בלבד', col: GOOD}, {k: '$0', v: 'בלי הוצאה נוספת', col: GOOD},
  {k: 'auto_merge = false', v: 'אין מיזוג אוטומטי', col: GOOD}, {k: 'production_write = false', v: 'אין כתיבה לייצור', col: GOOD},
  {k: 'Kill Switch', v: 'עצירה בלחיצה', col: AMBER},
];
const Limits: React.FC<{f: number}> = ({f}) => {
  const L = f - 700;
  return (
    <AbsoluteFill style={{alignItems: 'center', direction: 'rtl'}}>
      <div style={{marginTop: 150, display: 'flex', flexDirection: 'column', gap: 14}}>
        {LIMITS.map((x, i) => {
          const u = prog(L, 24 + i * 14, 54 + i * 14);
          return <div key={x.k} style={{...panel(x.col), padding: '16px 34px', width: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: u, transform: `translateY(${(1 - u) * 30}px)`}}>
            <div style={{fontFamily, fontWeight: 700, fontSize: 36, color: TEXT}}>{x.v}</div>
            <div style={{direction: 'ltr', fontFamily: MONO, fontWeight: 700, fontSize: 32, color: x.col}}>{x.k}</div>
          </div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{f: number}> = ({f}) => {
  const L = f - 850, o = prog(L, 0, 24);
  return (
    <AbsoluteFill style={{opacity: o, alignItems: 'center', justifyContent: 'center', direction: 'rtl'}}>
      <div style={{textAlign: 'center', marginTop: -40}}>
        <div style={{direction: 'ltr', fontFamily, fontWeight: 900, fontSize: 160, color: TEXT}}>AI Agent System</div>
        <div style={{fontFamily, fontWeight: 700, fontSize: 56, color: ACCENT, marginTop: 8}}>ניסויים בתהליכי עבודה עם בינה מלאכותית</div>
      </div>
    </AbsoluteFill>
  );
};

export const AgentSystemSite: React.FC = () => {
  const f = useCurrentFrame();
  const cap = CAPS.find(c => f >= c.a && f <= c.b);
  const capO = cap ? prog(f, cap.a, cap.a + 14) * (1 - prog(f, cap.b - 14, cap.b)) : 0;
  const drift = 1 + 0.03 * (0.5 - 0.5 * Math.cos(f / 140));
  return (
    <AbsoluteFill style={{background: `radial-gradient(1200px 700px at 50% 0%, #121a30 0%, ${BG} 62%)`, fontFamily}}>
      <AbsoluteFill style={{transform: `scale(${drift})`, transformOrigin: '50% 45%'}}>
        <Fade f={f} a={-1} b={0} c={96} d={126}><Hook f={f} /></Fade>
        <Fade f={f} a={96} b={130} c={300} d={330}><Run f={f} /></Fade>
        <Fade f={f} a={300} b={334} c={510} d={540}><Loop f={f} /></Fade>
        <Fade f={f} a={510} b={544} c={700} d={730}><Evidence f={f} /></Fade>
        <Fade f={f} a={700} b={734} c={836} d={866}><Limits f={f} /></Fade>
        {f >= 848 && <Outro f={f} />}
      </AbsoluteFill>
      {cap && <div style={{position: 'absolute', left: 0, right: 0, bottom: 110, display: 'flex', justifyContent: 'center', opacity: capO, transform: `translateY(${(1 - capO) * 12}px)`}}>
        <div style={{direction: 'rtl', fontFamily, fontWeight: 800, fontSize: 58, color: TEXT, padding: '16px 44px', borderRadius: 999, background: 'rgba(7,9,15,.72)', border: `2px solid ${ACCENT}44`, maxWidth: W - 160, textAlign: 'center'}}>{cap.t}</div>
      </div>}
    </AbsoluteFill>
  );
};
