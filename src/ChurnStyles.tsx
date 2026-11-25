import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {fontFamily} from './Promo';
import {Data, useData} from './ChurnJourney';

// Art-direction study for the churn clip: the SAME "result" frame in three directions (A/B/C), real numbers only.
// Sources: Engineering-OS docs (premium motion/design systems, experience routing: three directions before building),
// UI UX Pro Max style data (Swiss Modernism 2.0, Predictive Analytics, Bento Box Grid), OpenMontage style playbooks (palette discipline, min hold times).
// Numbers: products/churn-prediction.md. Scores: public/churn/test.json (held-out test set of the saved Random Forest).

const T = {
  title: 'התוצאה על לקוחות שלא נראו', acc: 'דיוק', base: 'ניחוש ללא מודל: 73.5%', of: 'מתוך', found: 'נוטשים זוהו', alarms: 'התראות שווא', stayed: 'נשארו', left: 'עזבו בפועל', thr: 'סף 0.5', dist: 'ציון הסיכון שהמודל נתן ל-1,409 לקוחות הבדיקה', demo: '',
};
const fmt = (n: number) => n.toLocaleString('en-US');

const Num: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => <span style={{direction: 'ltr', unicodeBidi: 'isolate', ...style}}>{children}</span>;

/** Smoothed score density for churners and stayers, normalised so both curves are comparable in height. */
export const useDensity = (d: Data | null, bins = 50) => useMemo(() => {
  if (!d) return null;
  const h = (cls: number) => {
    const a = new Array(bins).fill(0);
    d.p.forEach((p, i) => { if (d.y[i] === cls) a[Math.min(bins - 1, Math.floor(p * bins))]++; });
    const s = a.map((_, i) => (a[Math.max(0, i - 1)] + 2 * a[i] + a[Math.min(bins - 1, i + 1)]) / 4);
    const m = Math.max(...s);
    return s.map((v) => v / m);
  };
  return {stay: h(0), churn: h(1)};
}, [d, bins]);

export const area = (v: number[], x0: number, w: number, y0: number, hgt: number) => {
  const step = w / (v.length - 1);
  const pts = v.map((val, i) => `${x0 + i * step},${y0 - val * hgt}`);
  return {line: `M${pts.join('L')}`, fill: `M${x0},${y0}L${pts.join('L')}L${x0 + w},${y0}Z`};
};

const Grid: React.FC<{d: Data; cols: number; lit: number; r: number; gap: number; on: string; off: string}> = ({lit, cols, r, gap, on, off}) => {
  const rows = Math.ceil(374 / cols);
  return (
    <svg width={cols * gap} height={rows * gap} style={{display: 'block'}}>
      {Array.from({length: 374}, (_, i) => <circle key={i} cx={(i % cols) * gap + gap / 2} cy={Math.floor(i / cols) * gap + gap / 2} r={r} fill={i < lit ? on : off} />)}
    </svg>
  );
};

/** A: Swiss / editorial, dark. One accent, hard grid, hairlines, no cards or glow. */
export const ChurnStyleA: React.FC = () => {
  const d = useData();
  if (!d) return <AbsoluteFill style={{background: '#0B0B0C'}} />;
  const INK = '#F2F2EE', MUTE = '#8A8A86', ACC = '#FFB020', RULE = 'rgba(255,255,255,.18)';
  return (
    <AbsoluteFill style={{background: '#0B0B0C', fontFamily, direction: 'rtl', color: INK}}>
      <div style={{position: 'absolute', top: 70, right: 110, left: 110, display: 'flex', justifyContent: 'space-between', borderBottom: `1.5px solid ${RULE}`, paddingBottom: 18, fontSize: 30, fontWeight: 600, color: MUTE, letterSpacing: 1}}>
        <span>{T.title}</span><span><Num>04 / 05</Num></span>
      </div>
      <div style={{position: 'absolute', top: 118, right: 110, left: 110, display: 'flex', alignItems: 'baseline', gap: 36, fontSize: 56, fontWeight: 700}}>{T.acc}<span style={{fontSize: 34, fontWeight: 500, color: MUTE}}>{T.base}</span></div>
      <div style={{position: 'absolute', top: 190, right: 110, fontSize: 400, fontWeight: 800, lineHeight: 1, letterSpacing: -12, color: INK}}><Num>80.2<span style={{color: ACC}}>%</span></Num></div>
      <div style={{position: 'absolute', top: 640, right: 110, left: 110, borderTop: `1.5px solid ${RULE}`, display: 'flex'}}>
        {[[<><Num>193</Num> <span style={{fontSize: 40, color: MUTE}}>{T.of} <Num>374</Num></span></>, T.found, ACC], [<Num key="a">98</Num>, T.alarms, INK], [<Num key="b">0.84</Num>, 'AUC', INK]].map((c, i) => (
          <div key={i} style={{flex: i === 0 ? 1.5 : 1, paddingTop: 26, paddingInlineEnd: 30, borderInlineStart: i ? `1.5px solid ${RULE}` : 'none', paddingInlineStart: i ? 36 : 0}}>
            <div style={{fontSize: 110, fontWeight: 800, lineHeight: 1, color: c[2] as string}}>{c[0]}</div>
            <div style={{fontSize: 36, fontWeight: 600, color: MUTE, marginTop: 12}}>{c[1]}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 70, left: 110}}><Grid d={d} cols={34} lit={193} r={4.5} gap={13} on={ACC} off="#2A2A2C" /></div>
    </AbsoluteFill>
  );
};

/** B: predictive-analytics look. The model's real risk scores for the test set, churners vs stayers, with the decision threshold. */
export const ChurnStyleB: React.FC = () => {
  const d = useData();
  const den = useDensity(d);
  if (!d || !den) return <AbsoluteFill style={{background: '#0B0B1A'}} />;
  const INK = '#ECEBFF', MUTE = '#8F8DB8', CHURN = '#FFB020', STAY = '#6C8CFF', VIO = '#8B5CF6';
  const X0 = 150, W = 1020, Y0 = 760, H = 380;
  const a = area(den.stay, X0, W, Y0, H), b = area(den.churn, X0, W, Y0, H);
  const tx = X0 + W * 0.5;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(1400px 900px at 30% 30%, #17143A 0%, #0B0B1A 70%)', fontFamily, direction: 'rtl', color: INK}}>
      <div style={{position: 'absolute', top: 64, right: 110, fontSize: 52, fontWeight: 700}}>{T.title}</div>
      <div style={{position: 'absolute', top: 132, right: 110, fontSize: 30, color: MUTE, fontWeight: 500}}>{T.dist}</div>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, direction: 'ltr'}}>
        <defs>
          <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={STAY} stopOpacity=".55" /><stop offset="1" stopColor={STAY} stopOpacity="0" /></linearGradient>
          <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={CHURN} stopOpacity=".6" /><stop offset="1" stopColor={CHURN} stopOpacity="0" /></linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => <line key={t} x1={X0 + W * t} x2={X0 + W * t} y1={Y0 - H - 20} y2={Y0} stroke="rgba(255,255,255,.07)" />)}
        <path d={a.fill} fill="url(#gs)" /><path d={a.line} stroke={STAY} strokeWidth={4} fill="none" />
        <path d={b.fill} fill="url(#gc)" /><path d={b.line} stroke={CHURN} strokeWidth={4} fill="none" />
        <line x1={tx} x2={tx} y1={Y0 - H - 40} y2={Y0 + 10} stroke={VIO} strokeWidth={4} strokeDasharray="10 10" />
        <rect x={tx - 62} y={Y0 - H - 84} width={124} height={42} rx={21} fill={VIO} />
        <text x={tx} y={Y0 - H - 54} textAnchor="middle" fill="#fff" fontSize={26} fontWeight={700} fontFamily={fontFamily}>0.5</text>
        {[0, 0.5, 1].map((t) => <text key={t} x={X0 + W * t} y={Y0 + 46} textAnchor="middle" fill={MUTE} fontSize={28} fontFamily={fontFamily}>{t === 0 ? '0' : t === 1 ? '1' : '0.5'}</text>)}
      </svg>
      <div style={{position: 'absolute', top: 300, left: 190, fontSize: 36, fontWeight: 700, color: STAY}}>{T.stayed}</div>
      <div style={{position: 'absolute', top: 600, left: 700, fontSize: 36, fontWeight: 700, color: CHURN}}>{T.left}</div>
      <div style={{position: 'absolute', top: 200, right: 110, width: 600, textAlign: 'right'}}>
        <div style={{fontSize: 230, fontWeight: 800, lineHeight: 1, color: INK}}><Num>80.2<span style={{color: VIO}}>%</span></Num></div>
        <div style={{fontSize: 52, fontWeight: 700}}>{T.acc}</div>
        <div style={{fontSize: 32, color: MUTE, marginTop: 8}}>{T.base}</div>
        <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 18}}>
          {[[<><Num>193</Num> {T.of} <Num>374</Num></>, T.found, CHURN], [<Num key="1">98</Num>, T.alarms, '#FF6B81'], [<Num key="2">0.84</Num>, 'AUC', STAY]].map((c, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 22}}><span style={{fontSize: 64, fontWeight: 800, whiteSpace: 'nowrap', color: c[2] as string}}>{c[0]}</span><span style={{fontSize: 32, color: MUTE, fontWeight: 600}}>{c[1]}</span></div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** C: bento grid, dark. Modular tiles of different sizes, one hero number. */
export const ChurnStyleC: React.FC = () => {
  const d = useData();
  if (!d) return <AbsoluteFill style={{background: '#0A0C12'}} />;
  const INK = '#EEF2FA', MUTE = '#8A94AB', ACC = '#FFB020', BLUE = '#7DD3FC';
  const tile: React.CSSProperties = {position: 'absolute', borderRadius: 32, background: '#12161F', border: '1.5px solid rgba(255,255,255,.06)', overflow: 'hidden', padding: 34, boxSizing: 'border-box'};
  const lab: React.CSSProperties = {fontSize: 32, fontWeight: 600, color: MUTE};
  return (
    <AbsoluteFill style={{background: '#0A0C12', fontFamily, direction: 'rtl', color: INK}}>
      <div style={{position: 'absolute', top: 46, right: 90, fontSize: 46, fontWeight: 700}}>{T.title}</div>
      <div style={{...tile, top: 130, right: 90, width: 760, height: 520, background: 'linear-gradient(160deg,#2A1E06,#12161F 70%)', border: `1.5px solid ${ACC}44`}}>
        <div style={lab}>{T.acc}</div>
        <div style={{fontSize: 210, fontWeight: 800, lineHeight: 1.15, color: ACC}}><Num>80.2%</Num></div>
        <div style={{...lab, fontSize: 34}}>{T.base}</div>
      </div>
      <div style={{...tile, top: 130, right: 874, width: 600, height: 520}}>
        <div style={lab}><Num style={{color: ACC, fontWeight: 800}}>193</Num> {T.of} <Num>374</Num> {T.found}</div>
        <div style={{marginTop: 26}}><Grid d={d} cols={22} lit={193} r={9} gap={24} on={ACC} off="#2B3242" /></div>
      </div>
      <div style={{...tile, top: 130, right: 1498, width: 332, height: 250}}>
        <div style={{fontSize: 110, fontWeight: 800, color: '#FF6B81', lineHeight: 1}}><Num>98</Num></div><div style={{...lab, marginTop: 8}}>{T.alarms}</div>
      </div>
      <div style={{...tile, top: 404, right: 1498, width: 332, height: 246}}>
        <div style={{fontSize: 110, fontWeight: 800, lineHeight: 1}}><Num>0.84</Num></div><div style={{...lab, marginTop: 8}}>AUC</div>
      </div>
      <div style={{...tile, top: 676, right: 90, width: 1740, height: 220, display: 'flex', alignItems: 'center', gap: 60}}>
        <div style={{...lab, width: 300, fontSize: 36}}>{T.acc}</div>
        <div style={{flex: 1}}>
          {[['80.2%', 80.2, ACC, 'יער אקראי'], ['73.5%', 73.5, BLUE, 'ללא מודל']].map(([v, p, c, l]) => (
            <div key={l as string} style={{display: 'flex', alignItems: 'center', gap: 22, marginBlock: 10}}>
              <div style={{width: 200, fontSize: 32, fontWeight: 600}}>{l}</div>
              <div style={{height: 44, width: `${((p as number) / 100) * 1000}px`, borderRadius: 14, background: c as string}} />
              <div style={{fontSize: 40, fontWeight: 800, color: c as string}}><Num>{v}</Num></div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
