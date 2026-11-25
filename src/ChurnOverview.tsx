import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {fontFamily} from './Promo';
import {Scene, clamp, lerp, prog} from './lib/motion';
import {ACCENT, ALARM, BG, CHURN, Cap, Dots, INK, Loc, MUTED, STAY, Stat, useData} from './ChurnJourney';

// Customer Churn Prediction, project overview (site clip, silent, 1920x1080 @30, 39.5 s). Script: products/churn-prediction-script-v3.md.
// Every number: products/churn-prediction.md (verified 2026-11-25). Dots = real held-out scores of the saved Random Forest.
// Reading budget: >= 0.4 s per word, one idea revealed at a time, >= 1.3 s fully visible before each scene fades out.

export const CHURN_OVERVIEW_FRAMES = 1185;
const FADE = 30; // scene cross-fade (frames); scenes overlap by exactly this much
const SWITCH = [225, 435, 705, 930]; // stepper changes in the middle of each cross-fade

const T = {
  he: {
    s1: 'חיזוי נטישת לקוחות', s1c: 'פרויקט גמר · קורס אנליסט נתונים · הטכניון', s1b: 'המטרה: לזהות לקוח שעומד לעזוב, לפני שהוא עוזב', feat: 'מאפיינים', steps: ['הבעיה', 'הנתונים', 'המודל', 'התוצאה', 'מסד נתונים'], cust: 'לקוחות חברת תקשורת', left: 'עזבו', dotsNote: 'כל נקודה: לקוח מקבוצת הבדיקה (1,409)',
    s2: 'מה מנבא נטישה?', s2sub: 'שיעור הנטישה בכל קבוצה', pairs: [['חוזה חודשי', 42.7, 'חוזה דו-שנתי', 2.8], ['ותק עד שנה', 47.4, 'ותק מעל שנה', 17.1], ['תשלום בצ׳ק אלקטרוני', 45.3, 'תשלום אוטומטי', 16.0]] as [string, number, string, number][],
    prep: 'הכנת הנתונים', chips: ['ניקוי ערכים חסרים', 'קידוד קטגוריות', 'נרמול מספרים'], cols: 'עמודות', models: '61 הגדרות · 3 משפחות מודלים', fams: ['KNN', 'עץ החלטה', 'יער אקראי'], base: 'ניחוש ללא מודל 73.5%', axis: 'דיוק בבדיקה · תחילת הציר: 70%', win: 'יער אקראי ניצח · 200 עצים', badge: 'ניצח',
    s4: 'התוצאה על לקוחות שלא נראו', acc: 'דיוק', of: 'מתוך', found: 'נוטשים זוהו', alarms: 'התראות שווא', s4b: 'מעל ניחוש ללא מודל: 73.5%',
    s5: 'ובשלב ב׳: מסד נתונים', m: ['25,000 רשומות\nנטענו ל-MongoDB', 'תיקון שדה\nבסכמה', '24,218 רשומות\nקיבלו ציון', 'ייצוא\nCSV'], close: 'לדעת מי עומד לעזוב, לפני שהוא עוזב', foot: 'מערך נתונים ציבורי מהקורס',
  },
  en: {
    s1: 'Customer churn prediction', s1c: 'Final project · Data Analyst course · Technion', s1b: 'Goal: spot a customer about to leave, before they do', feat: 'features', steps: ['Problem', 'Data', 'Model', 'Result', 'Database'], cust: 'telecom customers', left: 'churned', dotsNote: 'Each dot: a test-set customer (1,409)',
    s2: 'What predicts churn?', s2sub: 'Churn rate in each group', pairs: [['Month-to-month', 42.7, 'Two-year contract', 2.8], ['Tenure up to 1 year', 47.4, 'Tenure over 1 year', 17.1], ['Electronic check', 45.3, 'Automatic payment', 16.0]] as [string, number, string, number][],
    prep: 'Preparing the data', chips: ['Fix missing values', 'Encode categories', 'Scale numbers'], cols: 'columns', models: '61 configurations · 3 model families', fams: ['KNN', 'Decision tree', 'Random forest'], base: 'No-model guess 73.5%', axis: 'Test accuracy · axis starts at 70%', win: 'Random forest wins · 200 trees', badge: 'Winner',
    s4: 'Results on customers it never saw', acc: 'accuracy', of: 'of', found: 'churners found', alarms: 'false alarms', s4b: 'Above guessing without a model: 73.5%',
    s5: 'Part B: a database', m: ['25,000 records\nloaded into MongoDB', 'Schema field\nfixed', '24,218 complete\nrecords scored', 'CSV\nexport'], close: 'Know who is about to leave, before they do', foot: 'Public dataset from the course',
  },
};

const glass: React.CSSProperties = {borderRadius: 30, background: 'linear-gradient(180deg, rgba(255,255,255,.075), rgba(255,255,255,.03))', border: '1.5px solid rgba(255,255,255,.11)', boxShadow: '0 24px 70px rgba(0,0,0,.38)'};

/** Horizontal bar on a track: label, bar anchored at the reading start, value glued to the bar end. */
const Row: React.FC<{loc: Loc; label: string; frac: number; color: string; W: number; on: number; barH?: number; labW?: number; val: string; labSize?: number; glow?: boolean}> = ({loc, label, frac, color, W, on, barH = 56, labW = 440, val, labSize = 42, glow}) => {
  const he = loc === 'he';
  const end = Math.max(6, frac * W * on);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 28, direction: he ? 'rtl' : 'ltr', fontFamily, height: barH + 22, opacity: Math.min(1, on * 3)}}>
      <div style={{width: labW, fontSize: labSize, fontWeight: 600, color: INK}}>{label}</div>
      <div style={{position: 'relative', width: W + 200, height: barH}}>
        <div style={{position: 'absolute', top: 0, [he ? 'right' : 'left']: 0, width: end, height: barH, borderRadius: 16, background: `linear-gradient(${he ? 270 : 90}deg, ${color}, ${color}cc)`, boxShadow: glow ? `0 0 34px ${color}77` : `0 0 18px ${color}33`}} />
        <div style={{position: 'absolute', top: 0, [he ? 'right' : 'left']: end + 18, height: barH, display: 'flex', alignItems: 'center', fontSize: 54, fontWeight: 800, color, direction: 'ltr', opacity: on}}>{val}</div>
      </div>
    </div>
  );
};

const Icon: React.FC<{k: number; c: string}> = ({k, c}) => (
  <svg width={70} height={70} viewBox="0 0 64 64" fill="none" stroke={c} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
    {k === 0 ? (<><ellipse cx={32} cy={14} rx={20} ry={7} /><path d="M12 14v36c0 4 9 7 20 7s20-3 20-7V14" /><path d="M12 32c0 4 9 7 20 7s20-3 20-7" /></>) : null}
    {k === 1 ? (<><circle cx={32} cy={32} r={22} /><path d="M21 33l8 8 15-17" /></>) : null}
    {k === 2 ? (<><path d="M16 50V36M32 50V16M48 50V28M8 56H56" /></>) : null}
    {k === 3 ? (<><path d="M16 8h22l12 12v36H16z" /><path d="M38 8v12h12" /><path d="M24 34h20M24 44h20" /></>) : null}
  </svg>
);

/** 374 churners of the test set: 193 found (lit) and 181 missed (dim). */
const ChurnerGrid: React.FC<{lit: number}> = ({lit}) => {
  const COLS = 22, ROWS = 17, G = 28;
  return (
    <svg width={COLS * G} height={ROWS * G} style={{display: 'block'}}>
      {Array.from({length: COLS * ROWS}, (_, i) => {
        const a = clamp(lit - i, 0, 1);
        const x = (i % COLS) * G + G / 2, y = Math.floor(i / COLS) * G + G / 2;
        return <circle key={i} cx={x} cy={y} r={10 + a * 1.5} fill={a > 0 ? CHURN : STAY} opacity={0.55 + a * 0.45} style={a > 0.5 ? {filter: `drop-shadow(0 0 6px ${CHURN}aa)`} : undefined} />;
      })}
    </svg>
  );
};

const Num: React.FC<{v: string | number}> = ({v}) => <span style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{v}</span>;

export const ChurnOverview: React.FC<{locale: Loc}> = ({locale}) => {
  const d = useData();
  const f = useCurrentFrame();
  const t = T[locale];
  const he = locale === 'he';
  const rtl = he ? 'rtl' : 'ltr';
  if (!d) return <AbsoluteFill style={{background: BG}} />;
  const active = f < SWITCH[0] ? 0 : f < SWITCH[1] ? 1 : f < SWITCH[2] ? 2 : f < SWITCH[3] ? 3 : 4;
  const anchor = he ? 'right' : 'left';
  return (
    <AbsoluteFill style={{background: `radial-gradient(1500px 900px at 50% 38%, #141D3A 0%, ${BG} 72%)`}}>
      {/* 1 background: what the project is */}
      <Scene from={0} dur={240} fadeIn={false} fade={FADE}>{(lf) => {
        const box: React.CSSProperties = {position: 'absolute', top: 0, [anchor]: 100, width: 940, direction: rtl, textAlign: he ? 'right' : 'left', fontFamily};
        const o = (a: number, b: number) => prog(lf, a, b);
        const slide = (a: number, b: number) => `translateY(${(1 - o(a, b)) * 18}px)`;
        return (
          <>
            <Dots d={d} s={0} n={null} r={6} gap={16} cx={he ? 480 : 1440} cy={470} lit={prog(lf, 56, 120)} />
            <div style={{position: 'absolute', top: 730, left: (he ? 480 : 1440) - 384, width: 768, textAlign: 'center', direction: rtl, fontFamily, fontSize: 30, fontWeight: 600, color: MUTED, opacity: o(40, 70)}}>{t.dotsNote}</div>
            <div style={{...box, top: he ? 112 : 130, fontSize: he ? 104 : 70, fontWeight: 800, whiteSpace: 'nowrap', color: INK, opacity: o(6, 36), transform: slide(6, 36), lineHeight: 1.1}}>{t.s1}</div>
            <div style={{...box, top: 246, fontSize: 46, fontWeight: 600, color: ACCENT, opacity: o(26, 56), transform: slide(26, 56)}}>{t.s1c}</div>
            <div style={{...box, top: 338, fontSize: 58, fontWeight: 700, color: INK, opacity: o(56, 92), transform: slide(56, 92), lineHeight: 1.25}}>{t.s1b}</div>
            <div style={{...box, top: 556, display: 'flex', gap: 20, opacity: o(104, 138), transform: slide(104, 138)}}>
              <Stat v="7,043" label={t.cust} color={INK} loc={locale} w={360} />
              <Stat v="19" label={t.feat} color={INK} loc={locale} w={240} />
              <Stat v="26.5%" label={t.left} color={CHURN} loc={locale} w={250} />
            </div>
            <div style={{...box, top: 770, display: 'flex', gap: 16, opacity: o(146, 176), transform: slide(146, 176)}}>
              {['Python', 'scikit-learn', 'pandas', 'MongoDB'].map((c) => <div key={c} style={{padding: '12px 30px', borderRadius: 999, border: `2px solid ${ACCENT}77`, background: 'rgba(125,211,252,.09)', fontSize: 36, fontWeight: 600, color: INK, direction: 'ltr'}}>{c}</div>)}
            </div>
          </>
        );
      }}</Scene>

      {/* 2 drivers of churn, one group at a time */}
      <Scene from={210} dur={240} fade={FADE}>{(lf) => (
        <>
          <Cap text={t.s2} y={52} size={80} loc={locale} op={prog(lf, 4, 34)} />
          <Cap text={t.s2sub} y={158} size={42} loc={locale} color={MUTED} op={prog(lf, 24, 54)} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 244, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
            {t.pairs.map((p, i) => {
              const s = 44 + i * 44;
              const c = prog(lf, s, s + 22), a = prog(lf, s + 4, s + 36), b = prog(lf, s + 18, s + 50);
              return (
                <div key={i} style={{...glass, padding: '16px 52px', opacity: c, transform: `translateY(${(1 - c) * 22}px)`}}>
                  <Row loc={locale} label={p[0]} frac={p[1] / 50} color={CHURN} W={640} on={a} val={`${p[1].toFixed(1)}%`} glow />
                  <Row loc={locale} label={p[2]} frac={p[3] / 50} color={ACCENT} W={640} on={b} val={`${p[3].toFixed(1)}%`} />
                </div>);
            })}
          </div>
        </>
      )}</Scene>

      {/* 3 what we did: prepare the data, compare models (one screen, revealed top to bottom) */}
      <Scene from={420} dur={300} fade={FADE}>{(lf) => {
        const W = 880, labW = 300, base = (73.5 - 70) / 12;
        const accs = [78.4, 79.2, 80.2];
        const x = (frac: number) => labW + 28 + frac * W; // distance from the reading-start edge of the chart
        const hdr = (txt: string, y: number, a: number) => <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', direction: rtl, fontFamily, fontSize: 46, fontWeight: 700, color: ACCENT, opacity: prog(lf, a, a + 28)}}>{txt}</div>;
        return (
          <>
            {hdr(t.prep, 48, 4)}
            <div style={{position: 'absolute', left: 0, right: 0, top: 122, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, direction: rtl, fontFamily}}>
              {t.chips.map((c, i) => {
                const o = prog(lf, 10 + i * 12, 40 + i * 12);
                return <div key={i} style={{...glass, borderRadius: 26, padding: '22px 36px', fontSize: 40, fontWeight: 700, color: INK, opacity: o, transform: `translateY(${(1 - o) * 18}px)`, border: `2px solid ${ACCENT}66`}}>{c}</div>;
              })}
              <div style={{display: 'flex', alignItems: 'center', gap: 22, marginInlineStart: 36, opacity: prog(lf, 48, 80)}}>
                <Stat v="19" label={t.cols} color={INK} loc={locale} w={170} />
                <div style={{fontSize: 64, color: ACCENT, transform: he ? 'scaleX(-1)' : 'none'}}>→</div>
                <Stat v="46" label={t.cols} color={CHURN} loc={locale} w={170} />
              </div>
            </div>
            {hdr(t.models, 274, 84)}
            <div style={{position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center'}}>
              <div style={{position: 'relative', direction: rtl}}>
                {t.fams.map((fm, i) => (
                  <Row key={i} loc={locale} label={fm} frac={(accs[i] - 70) / 12} W={W} labW={labW} barH={58} labSize={44} glow={i === 2} color={i === 2 ? CHURN : ACCENT} on={prog(lf, 104 + i * 18, 140 + i * 18)} val={`${accs[i].toFixed(1)}%`} />
                ))}
                <div style={{position: 'absolute', top: -28, height: 3 * 80 + 34, [anchor]: x(base) - 1.5, width: 0, borderLeft: `3px dashed ${ALARM}`, opacity: prog(lf, 164, 190)}} />
                <div style={{position: 'absolute', top: -70, [anchor]: x(base), transform: `translateX(${he ? '50%' : '-50%'})`, whiteSpace: 'nowrap', fontSize: 34, fontWeight: 600, color: ALARM, opacity: prog(lf, 168, 194), direction: rtl}}>{t.base}</div>
                {[70, 75, 80].map((tk) => (
                  <div key={tk} style={{position: 'absolute', top: 3 * 80 + 14, [anchor]: x((tk - 70) / 12), transform: `translateX(${he ? '50%' : '-50%'})`, fontSize: 32, color: MUTED, opacity: prog(lf, 110, 140), direction: 'ltr'}}>{tk}%</div>
                ))}
                <div style={{position: 'absolute', top: 3 * 80 + 62, left: 0, right: 0, textAlign: 'center', fontSize: 32, color: MUTED, opacity: prog(lf, 110, 140), direction: rtl}}>{t.axis}</div>
              </div>
            </div>
            <Cap text={t.win} y={800} size={56} loc={locale} color={CHURN} op={prog(lf, 196, 228)} />
          </>
        );
      }}</Scene>

      {/* 4 result */}
      <Scene from={690} dur={255} fade={FADE}>{(lf) => {
        const v = 80.2 * prog(lf, 22, 90);
        const lit = 193 * prog(lf, 88, 160);
        const card = prog(lf, 44, 80);
        return (
          <>
            <Cap text={t.s4} y={52} size={68} loc={locale} op={prog(lf, 4, 34)} />
            <div style={{position: 'absolute', top: 150, [anchor]: 90, width: 860, textAlign: 'center', fontFamily, direction: 'ltr', opacity: prog(lf, 16, 46)}}>
              <span style={{fontSize: 260, fontWeight: 800, color: CHURN, lineHeight: 1, textShadow: `0 0 60px ${CHURN}44`}}>{v.toFixed(1)}%</span>
              <div style={{fontSize: 58, fontWeight: 700, color: INK, direction: rtl, marginTop: 4}}>{t.acc}</div>
              <div style={{fontSize: 44, fontWeight: 600, color: MUTED, direction: rtl, marginTop: 18, opacity: prog(lf, 98, 128)}}>{t.s4b}</div>
            </div>
            <div style={{position: 'absolute', top: 676, [anchor]: 90, width: 860, display: 'flex', justifyContent: 'center', gap: 70, direction: rtl, opacity: prog(lf, 150, 184), transform: `translateY(${(1 - prog(lf, 150, 184)) * 16}px)`}}>
              <Stat v={98} label={t.alarms} color={ALARM} loc={locale} w={330} />
              <Stat v="0.84" label="AUC" color={INK} loc={locale} w={260} />
            </div>
            <div style={{...glass, position: 'absolute', top: 172, [he ? 'left' : 'right']: 90, padding: 42, opacity: card, transform: `translateY(${(1 - card) * 22}px)`}}>
              <ChurnerGrid lit={lit} />
            </div>
            <div style={{position: 'absolute', top: 764, [he ? 'left' : 'right']: 90, width: 22 * 28 + 84, textAlign: 'center', fontFamily, fontSize: 46, fontWeight: 700, color: INK, direction: rtl, opacity: prog(lf, 112, 146)}}>
              <span style={{color: CHURN}}><Num v={193} /></span> {t.of} <Num v={374} /> {t.found}
            </div>
          </>
        );
      }}</Scene>

      {/* 5 database + close */}
      <Scene from={915} dur={270} fadeOut={false} fade={FADE}>{(lf) => {
        const u = ((lf - 60) % 66) / 66;
        const CW = 340, CH = 230, AR = 64, rowTop = 270;
        return (
          <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + lf * 0.0004})`}}>
            <Cap text={t.s5} y={70} size={72} loc={locale} op={prog(lf, 4, 34)} />
            <div style={{position: 'absolute', left: 0, right: 0, top: rowTop, display: 'flex', justifyContent: 'center', alignItems: 'center', direction: rtl, fontFamily}}>
              {t.m.map((s, i) => {
                const on = prog(lf, 24 + i * 30, 54 + i * 30);
                const hot = i === 2;
                return (<React.Fragment key={i}>
                  <div style={{...glass, width: CW, height: CH, border: `2px solid ${hot ? CHURN + 'bb' : ACCENT + '55'}`, boxShadow: hot ? `0 0 50px ${CHURN}33, 0 24px 70px rgba(0,0,0,.38)` : glass.boxShadow, opacity: on, transform: `translateY(${(1 - on) * 26}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
                    <Icon k={i} c={hot ? CHURN : ACCENT} />
                    <div style={{whiteSpace: 'pre-line', color: INK, fontSize: 36, fontWeight: 700, lineHeight: 1.25, textAlign: 'center'}}>{s}</div>
                  </div>
                  {i < 3 ? <div style={{width: AR, textAlign: 'center', fontSize: 52, color: ACCENT, opacity: on, transform: he ? 'scaleX(-1)' : 'none'}}>→</div> : null}
                </React.Fragment>);
              })}
            </div>
            <div style={{position: 'absolute', left: 150, right: 150, top: rowTop + CH + 56, height: 2, background: 'rgba(125,211,252,.28)', opacity: prog(lf, 60, 100)}} />
            {lf >= 60 ? <div style={{position: 'absolute', left: (he ? lerp(1770, 150, u) : lerp(150, 1770, u)) - 16, top: rowTop + CH + 41, width: 32, height: 32, borderRadius: 999, background: CHURN, boxShadow: `0 0 36px ${CHURN}`, opacity: Math.sin(u * Math.PI) * 0.95}} /> : null}
            <Cap text={t.close} y={650} size={78} loc={locale} color={CHURN} op={prog(lf, 150, 190)} />
          </div>
        );
      }}</Scene>

      {/* persistent progress: five steps + a continuous line */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 82, display: 'flex', justifyContent: 'center', gap: 16, direction: rtl, fontFamily}}>
        {t.steps.map((st, i) => <div key={i} style={{padding: '8px 28px', borderRadius: 999, fontSize: 32, fontWeight: 700, color: i === active ? BG : i < active ? INK : MUTED, background: i === active ? ACCENT : 'rgba(255,255,255,.05)', border: `1.5px solid ${i <= active ? ACCENT : 'rgba(255,255,255,.14)'}`, opacity: i <= active ? 1 : 0.7}}>{st}</div>)}
      </div>
      <div style={{position: 'absolute', left: 360, right: 360, bottom: 64, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.09)', direction: rtl}}>
        <div style={{position: 'absolute', top: 0, bottom: 0, [anchor]: 0, width: `${(f / (CHURN_OVERVIEW_FRAMES - 1)) * 100}%`, borderRadius: 4, background: ACCENT}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center', fontFamily, fontSize: 28, color: MUTED, opacity: 0.85, direction: rtl}}>{t.foot}</div>
    </AbsoluteFill>
  );
};
