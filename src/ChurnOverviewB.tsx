import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {fontFamily} from './Promo';
import {Scene, lerp, prog} from './lib/motion';
import {Dots, Loc, useData} from './ChurnJourney';
import {T as T0, CHURN_OVERVIEW_FRAMES} from './ChurnOverview';
import {area, useDensity} from './ChurnStyles';

// Churn overview, art direction B ("model visualisation"): deep indigo field, one amber accent, no cards,
// hairlines + area charts, the real test-set score distribution as the hero of the result scene.
// Same copy, numbers and timings as ChurnOverview (products/churn-prediction.md, verified 2026-11-25).
// Threshold 0.5 on test.json: 193 churners caught, 98 false alarms, accuracy 80.2% (recomputed).

const INK = '#ECEBFF', MUTE = '#8F8DB8', AMB = '#FFB020', BLU = '#6C8CFF', VIO = '#8B5CF6', RED = '#FF6B81', RULE = 'rgba(255,255,255,.14)';
const FADE = 30;
const SWITCH = [225, 435, 705, 930];

const X = {
  he: {dist: 'ציון הסיכון שהמודל נתן לכל לקוח בקבוצת הבדיקה', stayed: 'נשארו', score: 'ציון סיכון', thr: 'סף 0.5'},
  en: {dist: 'The risk score the model gave each test-set customer', stayed: 'stayed', score: 'Risk score', thr: 'threshold 0.5'},
};

const Num: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{children}</span>;

const Fig: React.FC<{v: React.ReactNode; label: string; color?: string; size?: number; w?: number}> = ({v, label, color = INK, size = 110, w = 300}) => (
  <div style={{width: w}}>
    <div style={{fontSize: size, fontWeight: 800, lineHeight: 1, color, letterSpacing: -2}}>{v}</div>
    <div style={{fontSize: 34, fontWeight: 600, color: MUTE, marginTop: 10}}>{label}</div>
  </div>
);

/** Thin gradient bar on a hairline track, value at the end of the bar. */
const Bar: React.FC<{he: boolean; label: string; frac: number; color: string; W: number; on: number; val: string; h?: number; labW?: number; labSize?: number}> = ({he, label, frac, color, W, on, val, h = 30, labW = 440, labSize = 42}) => {
  const end = Math.max(6, frac * W * on);
  const side = he ? 'right' : 'left';
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 30, direction: he ? 'rtl' : 'ltr', fontFamily, height: h + 40, opacity: Math.min(1, on * 3)}}>
      <div style={{width: labW, fontSize: labSize, fontWeight: 600, color: INK}}>{label}</div>
      <div style={{position: 'relative', width: W + 220, height: h}}>
        <div style={{position: 'absolute', top: 0, [side]: 0, width: end, height: h, borderRadius: h / 2, background: `linear-gradient(${he ? 270 : 90}deg, ${color}, ${color}aa)`}} />
        <div style={{position: 'absolute', top: -12, [side]: end + 20, height: h + 24, display: 'flex', alignItems: 'center', fontSize: 56, fontWeight: 800, color, direction: 'ltr', opacity: on}}>{val}</div>
      </div>
    </div>
  );
};

const Step: React.FC<{i: number; hot?: boolean; on: number; label: string; he: boolean}> = ({i, hot, on, label, he}) => {
  const c = hot ? AMB : BLU;
  return (
    <div style={{width: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: on, transform: `translateY(${(1 - on) * 22}px)`, fontFamily, direction: he ? 'rtl' : 'ltr'}}>
      <div style={{width: 92, height: 92, borderRadius: 999, border: `3px solid ${c}`, boxShadow: hot ? `0 0 40px ${AMB}55` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,11,26,.9)'}}>
        <svg width={50} height={50} viewBox="0 0 64 64" fill="none" stroke={c} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
          {i === 0 ? (<><ellipse cx={32} cy={14} rx={20} ry={7} /><path d="M12 14v36c0 4 9 7 20 7s20-3 20-7V14" /><path d="M12 32c0 4 9 7 20 7s20-3 20-7" /></>) : null}
          {i === 1 ? (<><circle cx={32} cy={32} r={22} /><path d="M21 33l8 8 15-17" /></>) : null}
          {i === 2 ? (<path d="M16 50V36M32 50V16M48 50V28M8 56H56" />) : null}
          {i === 3 ? (<><path d="M16 8h22l12 12v36H16z" /><path d="M38 8v12h12" /><path d="M24 34h20M24 44h20" /></>) : null}
        </svg>
      </div>
      <div style={{whiteSpace: 'pre-line', textAlign: 'center', fontSize: 40, fontWeight: 700, lineHeight: 1.25, color: hot ? AMB : INK}}>{label}</div>
    </div>
  );
};

export const ChurnOverviewB: React.FC<{locale: Loc}> = ({locale}) => {
  const d = useData();
  const den = useDensity(d);
  const f = useCurrentFrame();
  const t = T0[locale], x = X[locale];
  const he = locale === 'he';
  const rtl = he ? 'rtl' : 'ltr';
  const anchor = he ? 'right' : 'left';
  const bg = <AbsoluteFill style={{background: 'radial-gradient(1500px 950px at 30% 28%, #17143A 0%, #0B0B1A 72%)'}} />;
  if (!d || !den) return bg;
  const active = f < SWITCH[0] ? 0 : f < SWITCH[1] ? 1 : f < SWITCH[2] ? 2 : f < SWITCH[3] ? 3 : 4;
  const cap = (txt: string, y: number, size: number, op: number, color = INK, extra: React.CSSProperties = {}) => (
    <div style={{position: 'absolute', top: y, [anchor]: 110, left: he ? undefined : 110, right: he ? 110 : undefined, direction: rtl, textAlign: he ? 'right' : 'left', fontFamily, fontSize: size, fontWeight: 700, color, opacity: op, transform: `translateY(${(1 - op) * 16}px)`, ...extra}}>{txt}</div>
  );
  return (
    <AbsoluteFill style={{background: '#0B0B1A'}}>
      {bg}

      {/* 1 background */}
      <Scene from={0} dur={240} fadeIn={false} fade={FADE}>{(lf) => {
        const o = (a: number, b: number) => prog(lf, a, b);
        const col: React.CSSProperties = {position: 'absolute', [anchor]: 110, width: 900, direction: rtl, textAlign: he ? 'right' : 'left', fontFamily};
        const up = (a: number, b: number) => `translateY(${(1 - o(a, b)) * 18}px)`;
        return (
          <>
            <Dots d={d} s={0} n={null} r={6} gap={16} cx={he ? 480 : 1440} cy={470} lit={prog(lf, 56, 120)} />
            <div style={{position: 'absolute', top: 730, left: (he ? 480 : 1440) - 384, width: 768, textAlign: 'center', direction: rtl, fontFamily, fontSize: 30, fontWeight: 600, color: MUTE, opacity: o(40, 70)}}>{t.dotsNote}</div>
            <div style={{...col, top: he ? 130 : 150, fontSize: he ? 112 : 72, fontWeight: 800, whiteSpace: 'nowrap', color: INK, opacity: o(6, 36), transform: up(6, 36), lineHeight: 1.1, letterSpacing: -2}}>{t.s1}</div>
            <div style={{...col, top: 272, fontSize: he ? 44 : 38, fontWeight: 600, color: VIO, whiteSpace: 'nowrap', opacity: o(26, 56), transform: up(26, 56)}}>{t.s1c}</div>
            <div style={{...col, top: 372, fontSize: 58, fontWeight: 700, color: INK, opacity: o(56, 92), transform: up(56, 92), lineHeight: 1.25}}>{t.s1b}</div>
            <div style={{...col, top: 600, display: 'flex', gap: 40, opacity: o(104, 138), transform: up(104, 138), borderTop: `1.5px solid ${RULE}`, paddingTop: 34}}>
              <Fig v="7,043" label={t.cust} w={330} />
              <Fig v="19" label={t.feat} w={200} />
              <Fig v="26.5%" label={t.left} color={AMB} w={230} />
            </div>
          </>
        );
      }}</Scene>

      {/* 2 drivers, one pair at a time */}
      <Scene from={210} dur={240} fade={FADE}>{(lf) => (
        <>
          {cap(t.s2, 56, 84, prog(lf, 4, 34))}
          {cap(t.s2sub, 168, 40, prog(lf, 24, 54), MUTE, {fontWeight: 500})}
          <div style={{position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {t.pairs.map((p, i) => {
              const s = 44 + i * 44;
              const c = prog(lf, s, s + 22), a = prog(lf, s + 4, s + 36), b = prog(lf, s + 18, s + 50);
              return (
                <div key={i} style={{padding: '14px 0', opacity: c, borderTop: i ? `1.5px solid ${RULE}` : 'none', marginTop: i ? 12 : 0}}>
                  <Bar he={he} label={p[0]} frac={p[1] / 50} color={AMB} W={640} on={a} val={`${p[1].toFixed(1)}%`} />
                  <Bar he={he} label={p[2]} frac={p[3] / 50} color={BLU} W={640} on={b} val={`${p[3].toFixed(1)}%`} />
                </div>);
            })}
          </div>
        </>
      )}</Scene>

      {/* 3 prepare data + compare models */}
      <Scene from={420} dur={300} fade={FADE}>{(lf) => {
        const W = 880, labW = 300, base = (73.5 - 70) / 12;
        const accs = [78.4, 79.2, 80.2];
        const px = (fr: number) => labW + 30 + fr * W;
        const hdr = (txt: string, y: number, a: number) => <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', direction: rtl, fontFamily, fontSize: 46, fontWeight: 700, color: VIO, opacity: prog(lf, a, a + 28)}}>{txt}</div>;
        return (
          <>
            {hdr(t.prep, 40, 4)}
            <div style={{position: 'absolute', left: 0, right: 0, top: 118, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, direction: rtl, fontFamily}}>
              {t.chips.map((c, i) => {
                const o = prog(lf, 10 + i * 12, 40 + i * 12);
                return <div key={i} style={{padding: '8px 4px', fontSize: 42, fontWeight: 700, color: INK, opacity: o, transform: `translateY(${(1 - o) * 16}px)`, borderBottom: `3px solid ${VIO}`, marginInline: 22}}>{c}</div>;
              })}
              <div style={{display: 'flex', alignItems: 'center', gap: 22, marginInlineStart: 30, opacity: prog(lf, 48, 80), transform: 'scale(0.74)'}}>
                <Fig v="19" label={t.cols} w={170} size={100} />
                <div style={{fontSize: 64, color: VIO, transform: he ? 'scaleX(-1)' : 'none'}}>→</div>
                <Fig v="46" label={t.cols} w={170} size={100} color={AMB} />
              </div>
            </div>
            {hdr(t.models, 276, 84)}
            <div style={{position: 'absolute', left: 0, right: 0, top: 338, textAlign: 'center', direction: rtl, fontFamily, opacity: prog(lf, 96, 126), fontSize: 32, fontWeight: 600, color: MUTE}}>{t.tool}</div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center'}}>
              <div style={{position: 'relative', direction: rtl, fontFamily}}>
                {t.fams.map((fm, i) => (
                  <Bar key={i} he={he} label={fm} frac={(accs[i] - 70) / 12} W={W} labW={labW} h={34} labSize={44} color={i === 2 ? AMB : BLU} on={prog(lf, 104 + i * 18, 140 + i * 18)} val={`${accs[i].toFixed(1)}%`} />
                ))}
                <div style={{position: 'absolute', top: -34, height: 3 * 74 + 44, [anchor]: px(base) - 1.5, width: 0, borderLeft: `3px dashed ${RED}`, opacity: prog(lf, 164, 190)}} />
                <div style={{position: 'absolute', top: -76, [anchor]: px(base), transform: `translateX(${he ? '50%' : '-50%'})`, whiteSpace: 'nowrap', fontSize: 34, fontWeight: 600, color: RED, opacity: prog(lf, 168, 194), direction: rtl}}>{t.base}</div>
                {[70, 75, 80].map((tk) => (
                  <div key={tk} style={{position: 'absolute', top: 3 * 74 + 20, [anchor]: px((tk - 70) / 12), transform: `translateX(${he ? '50%' : '-50%'})`, fontSize: 32, color: MUTE, opacity: prog(lf, 110, 140), direction: 'ltr'}}>{tk}%</div>
                ))}
                <div style={{position: 'absolute', top: 3 * 74 + 66, left: 0, right: 0, textAlign: 'center', fontSize: 32, color: MUTE, opacity: prog(lf, 110, 140), direction: rtl}}>{t.axis}</div>
              </div>
            </div>
            {cap(t.win, 836, 52, prog(lf, 196, 228), AMB, {left: 0, right: 0, textAlign: 'center'})}
          </>
        );
      }}</Scene>

      {/* 4 result: the real score distribution */}
      <Scene from={690} dur={255} fade={FADE}>{(lf) => {
        const W = 1020, H = 380, Y0 = 760, X0 = he ? 150 : 1920 - 150 - W;
        const a = area(den.stay, X0, W, Y0, H), b = area(den.churn, X0, W, Y0, H);
        const reveal = prog(lf, 30, 110);
        const thr = prog(lf, 112, 140);
        const v = 80.2 * prog(lf, 22, 90);
        const tx = X0 + W * 0.5;
        const dom = (op: number, c: string, gid: string) => ({op, c, gid});
        void dom;
        return (
          <>
            {cap(t.s4, 56, 62, prog(lf, 4, 34))}
            <div style={{position: 'absolute', top: 140, [anchor]: 110, direction: rtl, fontFamily, fontSize: 30, fontWeight: 500, color: MUTE, opacity: prog(lf, 20, 50), textAlign: he ? 'right' : 'left'}}>{x.dist}</div>
            <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
              <defs>
                <linearGradient id="gsB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={BLU} stopOpacity=".55" /><stop offset="1" stopColor={BLU} stopOpacity="0" /></linearGradient>
                <linearGradient id="gcB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={AMB} stopOpacity=".6" /><stop offset="1" stopColor={AMB} stopOpacity="0" /></linearGradient>
                <clipPath id="revB"><rect x={he ? X0 : X0} y={Y0 - H - 30} width={W * reveal} height={H + 60} /></clipPath>
              </defs>
              <g opacity={prog(lf, 24, 48)}>
                {[0, 0.25, 0.5, 0.75, 1].map((q) => <line key={q} x1={X0 + W * q} x2={X0 + W * q} y1={Y0 - H - 20} y2={Y0} stroke="rgba(255,255,255,.07)" />)}
                <line x1={X0} x2={X0 + W} y1={Y0} y2={Y0} stroke={RULE} />
                {[0, 0.5, 1].map((q) => <text key={q} x={X0 + W * q} y={Y0 + 46} textAnchor="middle" fill={MUTE} fontSize={28} fontFamily={fontFamily}>{q === 0 ? '0' : q === 1 ? '1' : '0.5'}</text>)}
                <text x={X0 + W / 2} y={Y0 + 92} textAnchor="middle" fill={MUTE} fontSize={30} fontFamily={fontFamily}>{x.score}</text>
              </g>
              <g clipPath="url(#revB)">
                <path d={a.fill} fill="url(#gsB)" /><path d={a.line} stroke={BLU} strokeWidth={4} fill="none" />
                <path d={b.fill} fill="url(#gcB)" /><path d={b.line} stroke={AMB} strokeWidth={4} fill="none" />
              </g>
              <g opacity={thr}>
                <line x1={tx} x2={tx} y1={Y0 - H - 40} y2={Y0 + 10} stroke={VIO} strokeWidth={4} strokeDasharray="10 10" />
                <rect x={tx - 62} y={Y0 - H - 84} width={124} height={42} rx={21} fill={VIO} />
                <text x={tx} y={Y0 - H - 54} textAnchor="middle" fill="#fff" fontSize={26} fontWeight={700} fontFamily={fontFamily}>0.5</text>
              </g>
              <g opacity={prog(lf, 50, 80)} fontFamily={fontFamily} fontSize={34} fontWeight={700}>
                <circle cx={X0 + 14} cy={Y0 - H - 96} r={9} fill={BLU} /><text x={X0 + 34} y={Y0 - H - 85} fill={BLU} direction="ltr">{x.stayed}</text>
                <circle cx={X0 + 214} cy={Y0 - H - 96} r={9} fill={AMB} /><text x={X0 + 234} y={Y0 - H - 85} fill={AMB}>{t.left}</text>
              </g>
            </svg>
            <div style={{position: 'absolute', top: 220, [anchor]: 110, width: 600, direction: rtl, textAlign: he ? 'right' : 'left', fontFamily}}>
              <div style={{opacity: prog(lf, 16, 46)}}>
                <div style={{fontSize: 220, fontWeight: 800, lineHeight: 1, color: INK, letterSpacing: -4}}><Num>{v.toFixed(1)}<span style={{color: VIO}}>%</span></Num></div>
                <div style={{fontSize: 52, fontWeight: 700}}>{t.acc}</div>
                <div style={{fontSize: 32, color: MUTE, marginTop: 8, opacity: prog(lf, 98, 128), fontWeight: 500}}>{t.s4b}</div>
              </div>
              <div style={{marginTop: 38, display: 'flex', flexDirection: 'column', gap: 18}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 22, opacity: prog(lf, 112, 146), transform: `translateY(${(1 - prog(lf, 112, 146)) * 14}px)`}}>
                  <span style={{fontSize: 60, fontWeight: 800, color: AMB, whiteSpace: 'nowrap'}}><Num>193</Num> {t.of} <Num>374</Num></span><span style={{fontSize: 32, color: MUTE, fontWeight: 600}}>{t.found}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 22, opacity: prog(lf, 150, 184), transform: `translateY(${(1 - prog(lf, 150, 184)) * 14}px)`}}>
                  <span style={{fontSize: 60, fontWeight: 800, color: RED}}><Num>98</Num></span><span style={{fontSize: 32, color: MUTE, fontWeight: 600}}>{t.alarms}</span>
                  <span style={{fontSize: 60, fontWeight: 800, color: BLU, marginInlineStart: 36}}><Num>0.84</Num></span><span style={{fontSize: 32, color: MUTE, fontWeight: 600}}>AUC</span>
                </div>
              </div>
            </div>
          </>
        );
      }}</Scene>

      {/* 5 database */}
      <Scene from={915} dur={270} fadeOut={false} fade={FADE}>{(lf) => {
        const u = ((lf - 60) % 66) / 66;
        const rowY = 330;
        return (
          <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + lf * 0.0004})`}}>
            {cap(t.s5, 70, 72, prog(lf, 4, 34))}
            <div style={{position: 'absolute', left: 150, right: 150, top: rowY + 46, height: 2, background: RULE, opacity: prog(lf, 20, 60)}} />
            {lf >= 60 ? <div style={{position: 'absolute', left: (he ? lerp(1770, 150, u) : lerp(150, 1770, u)) - 12, top: rowY + 34, width: 24, height: 24, borderRadius: 999, background: AMB, boxShadow: `0 0 30px ${AMB}`, opacity: Math.sin(u * Math.PI) * 0.95}} /> : null}
            <div style={{position: 'absolute', left: 0, right: 0, top: rowY, display: 'flex', justifyContent: 'center', direction: rtl}}>
              {t.m.map((s, i) => <Step key={i} i={i} hot={i === 2} he={he} on={prog(lf, 24 + i * 30, 54 + i * 30)} label={s} />)}
            </div>
            {cap(t.close, 700, 78, prog(lf, 150, 190), AMB, {left: 0, right: 0, textAlign: 'center'})}
          </div>
        );
      }}</Scene>

      {/* persistent progress */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 84, display: 'flex', justifyContent: 'center', gap: 56, direction: rtl, fontFamily}}>
        {t.steps.map((st, i) => <div key={i} style={{fontSize: 32, fontWeight: 700, color: i === active ? INK : MUTE, opacity: i === active ? 1 : i < active ? 0.8 : 0.5, paddingBottom: 8, borderBottom: `4px solid ${i === active ? VIO : 'transparent'}`}}>{st}</div>)}
      </div>
      <div style={{position: 'absolute', left: 360, right: 360, bottom: 66, height: 3, background: 'rgba(255,255,255,.09)', direction: rtl}}>
        <div style={{position: 'absolute', top: 0, bottom: 0, [anchor]: 0, width: `${(f / (CHURN_OVERVIEW_FRAMES - 1)) * 100}%`, background: VIO}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, textAlign: 'center', fontFamily, fontSize: 28, color: MUTE, opacity: 0.85, direction: rtl}}>{t.foot}</div>
    </AbsoluteFill>
  );
};
