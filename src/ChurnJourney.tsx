import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from './Promo';
import {Scene, clamp, lerp, prog} from './lib/motion';

// Customer Churn Prediction: "the journey of one customer" (site clip, silent, 1920x1080 @30, ~29 s).
// Data: held-out test set (1,409 customers, 374 churners) scored by the project's saved Random Forest pipeline,
// reproduced 2026-11-25 (80.2% acc, AUC 0.84, 193/374 caught at threshold 0.5). Source of truth: products/churn-prediction.md.
// Order of the 1,409 points is a fixed random shuffle; no identifiers are included.

const BG = '#0B1020';
const STAY = '#33405C';
const CHURN = '#FFB020';
const ALARM = '#FF6B81';
const INK = '#EAF1FF';
const MUTED = '#8FA0C4';
const ACCENT = '#7DD3FC';
const COLS = 49;
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`; };

type Data = {p: number[]; y: number[]; ex: number};
const useData = (): Data | null => {
  const [d, setD] = useState<Data | null>(null);
  const [h] = useState(() => delayRender('churn data'));
  useEffect(() => {
    fetch(staticFile('churn/test.json')).then((r) => r.json()).then((j) => { setD(j); continueRender(h); }).catch((e) => { console.error(e); continueRender(h); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return d;
};

type Loc = 'he' | 'en';
const T = {
  he: {
    h1a: 'מודל שמנחש תמיד "אף אחד לא עוזב"', sub: 'חיזוי נטישת לקוחות', acc: 'דיוק', miss: 'נוטשים נתפסו', of: 'מתוך',
    h2: 'לפני המודל: ניקוי הנתונים', h2b: 'ללקוחות חדשים אין חיוב מצטבר. 11 שורות כאלה מתוקנות לאפס',
    h3: 'לקוח אחד מהמערך', tenure: 'ותק (חודשים)', contract: 'חוזה', month: 'חודשי', internet: 'אינטרנט', fiber: 'סיב אופטי', support: 'תמיכה טכנית', none: 'אין', pay: 'תשלום', echeck: 'צ׳ק אלקטרוני', monthly: 'חיוב חודשי',
    h4: '61 הגדרות של 3 משפחות מודלים, כולן נבחנות באותה צורה', fam1: 'KNN', fam2: 'עץ החלטה', fam3: 'יער אקראי', cv: 'ולידציה צולבת, 5 חלקים', win: 'יער אקראי · 200 עצים · עומק 10', winacc: 'דיוק 80.4% בולידציה',
    h5: '1,409 לקוחות שהמודל לא ראה, מדורגים לפי סיכון', caught: 'נוטשים נתפסו', alarms: 'התראות שווא', called: 'לקוחות לטיפול', thr: 'סף',
    h6: 'הסף הוא החלטה עסקית: יותר שיחות, יותר נתפסים', cust: 'הלקוח מהדוגמה', risk: 'סיכון 76%\nואכן עזב',
    h7: 'אותו תהליך, על נתונים ממסד נתונים', m1: '25,000 רשומות נטענו ל-MongoDB', m2: 'שדה בסכמה לא תקינה תוקן', m3: '24,218 רשומות שלמות קיבלו ציון', m4: 'ייצוא CSV',
    end1: 'לדעת מי עומד לעזוב,', end2: 'לפני שהוא עוזב', end3: 'פרויקט גמר · קורס אנליסט נתונים · הטכניון',
    foot: 'מערך נתונים ציבורי מהקורס',
  },
  en: {
    h1a: 'A model that always says "nobody leaves"', sub: 'Customer churn prediction', acc: 'accuracy', miss: 'churners caught', of: 'of',
    h2: 'Before the model: cleaning the data', h2b: 'Brand-new customers have no total charges yet. 11 such rows are fixed to zero',
    h3: 'One customer from the dataset', tenure: 'Tenure (months)', contract: 'Contract', month: 'Month-to-month', internet: 'Internet', fiber: 'Fiber optic', support: 'Tech support', none: 'None', pay: 'Payment', echeck: 'Electronic check', monthly: 'Monthly charge',
    h4: '61 configurations from 3 model families, all tested the same way', fam1: 'KNN', fam2: 'Decision tree', fam3: 'Random forest', cv: 'Cross-validation, 5 folds', win: 'Random forest · 200 trees · depth 10', winacc: '80.4% cross-validated accuracy',
    h5: '1,409 customers the model never saw, ranked by risk', caught: 'churners caught', alarms: 'false alarms', called: 'customers to contact', thr: 'threshold',
    h6: 'The threshold is a business choice: more calls, more caught', cust: 'The example customer', risk: '76% risk\nand did leave',
    h7: 'Same process, on data from a database', m1: '25,000 records loaded into MongoDB', m2: 'Malformed schema field fixed', m3: '24,218 complete records scored', m4: 'CSV export',
    end1: 'Know who is about to leave,', end2: 'before they do', end3: 'Final project · Data Analyst course · Technion',
    foot: 'Public dataset from the course',
  },
};

const Dots: React.FC<{d: Data; s: number; n: number | null; r: number; gap: number; cx: number; cy: number; lit?: number; missRing?: number; exP?: number}> = ({d, s, n, r, gap, cx, cy, lit = 0, missRing = 0, exP = 0}) => {
  const order = useMemo(() => d.p.map((p, i) => [p, i] as const).sort((a, b) => b[0] - a[0]).map((x) => x[1]), [d]);
  const rank = useMemo(() => { const m = new Array(d.p.length); order.forEach((idx, k) => { m[idx] = k; }); return m as number[]; }, [d, order]);
  const rows = Math.ceil(d.p.length / COLS);
  const x0 = cx - ((COLS - 1) * gap) / 2, y0 = cy - ((rows - 1) * gap) / 2;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      {d.p.map((_, i) => {
        const a = [i % COLS, Math.floor(i / COLS)], k = rank[i], b = [k % COLS, Math.floor(k / COLS)];
        const x = x0 + lerp(a[0], b[0], s) * gap, y = y0 + lerp(a[1], b[1], s) * gap;
        const churn = d.y[i] === 1;
        const called = n !== null && k < n;
        let fill = STAY, stroke = 'none', op = 0.9;
        if (n === null) { if (churn) { fill = mix(STAY, CHURN, lit); op = 0.9 + 0.1 * lit; if (missRing > 0.01) { stroke = ALARM; } } }
        else if (called) { fill = churn ? CHURN : ALARM; op = 1; }
        else if (churn) { fill = 'none'; stroke = CHURN; op = 0.85; }
        const isEx = i === d.ex && exP > 0.01;
        return (<React.Fragment key={i}>
          {isEx ? <circle cx={x} cy={y} r={r + 4 + exP * 16} fill="none" stroke={INK} strokeWidth={3} opacity={exP} /> : null}
          <circle cx={x} cy={y} r={isEx ? r * (1 + exP * 0.8) : r} fill={fill} stroke={stroke} strokeWidth={2} opacity={op} />
        </React.Fragment>);
      })}
    </svg>
  );
};

const Cap: React.FC<{text: string; y: number; size?: number; loc: Loc; color?: string; op?: number}> = ({text, y, size = 54, loc, color = INK, op = 1}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', direction: loc === 'he' ? 'rtl' : 'ltr', fontFamily, fontWeight: 700, fontSize: size, color, opacity: op, letterSpacing: loc === 'he' ? 0 : -0.5}}>{text}</div>
);

const Stat: React.FC<{v: string | number; label: string; color: string; loc: Loc; w?: number; sub?: string}> = ({v, label, color, loc, w = 400, sub}) => (
  <div style={{width: w, textAlign: 'center', direction: loc === 'he' ? 'rtl' : 'ltr', fontFamily}}>
    <div style={{fontSize: 96, fontWeight: 800, color, lineHeight: 1}}><span style={{direction: 'ltr', unicodeBidi: 'isolate'}}>{v}</span>{sub ? <span style={{fontSize: 44, color: MUTED, fontWeight: 600, direction: loc === 'he' ? 'rtl' : 'ltr', unicodeBidi: 'isolate'}}> {sub}</span> : null}</div>
    <div style={{fontSize: 34, fontWeight: 600, color: MUTED, marginTop: 10}}>{label}</div>
  </div>
);

export const ChurnJourney: React.FC<{locale: Loc}> = ({locale}) => {
  const d = useData();
  const f = useCurrentFrame();
  const t = T[locale];
  if (!d) return <AbsoluteFill style={{background: BG}} />;
  const N = d.p.length;
  const sortedY = d.p.map((p, i) => [p, d.y[i]] as const).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
  const cum: number[] = [0]; sortedY.forEach((y) => cum.push(cum[cum.length - 1] + y));
  const nAt = (thr: number) => d.p.filter((p) => p >= thr).length;
  return (
    <AbsoluteFill style={{background: `radial-gradient(1400px 800px at 50% 40%, #121A33 0%, ${BG} 70%)`}}>
      {/* A: hook */}
      <Scene from={0} dur={180} fadeIn={false}>{(lf) => {
        const showMiss = prog(lf, 84, 112);
        return (<>
          <Dots d={d} s={0} n={null} r={7} gap={22} cx={960} cy={520} lit={prog(lf, 54, 84)} missRing={showMiss} />
          <Cap text={t.h1a} y={70} loc={locale} op={prog(lf, 6, 30)} />
          <Cap text={t.sub} y={134} size={34} loc={locale} color={ACCENT} op={prog(lf, 14, 38)} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', gap: 160, direction: locale === 'he' ? 'rtl' : 'ltr', opacity: prog(lf, 30, 56)}}>
            <Stat v="73.5%" label={t.acc} color={INK} loc={locale} w={380} />
            <div style={{opacity: showMiss}}><Stat v={`0`} sub={`${t.of} 374`} label={t.miss} color={ALARM} loc={locale} w={520} /></div>
          </div>
        </>);
      }}</Scene>

      {/* B: cleaning + one customer */}
      <Scene from={156} dur={174}>{(lf) => {
        const fix = prog(lf, 40, 62);
        const rows = [[27, 'One year', '1874.45'], [0, 'Two year', fix > 0.5 ? '0' : ''], [3, 'Month-to-month', '240.45']];
        const cardIn = prog(lf, 84, 112);
        return (<>
          <Cap text={lf < 84 ? t.h2 : t.h3} y={80} loc={locale} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 230, opacity: 1 - prog(lf, 76, 100), direction: 'ltr', fontFamily}}>
            <div style={{width: 1000, margin: '0 auto', fontSize: 38, color: INK}}>
              <div style={{display: 'flex', color: MUTED, fontSize: 30, padding: '0 28px 14px'}}><div style={{flex: 1}}>tenure</div><div style={{flex: 2}}>Contract</div><div style={{flex: 1.4}}>TotalCharges</div></div>
              {rows.map((r, i) => (
                <div key={i} style={{display: 'flex', padding: '22px 28px', borderRadius: 14, marginBottom: 10, background: i === 1 ? `rgba(255,176,32,${0.10 + 0.08 * (1 - fix)})` : 'rgba(255,255,255,.04)', border: i === 1 ? `2px solid ${CHURN}88` : '2px solid transparent'}}>
                  <div style={{flex: 1}}>{r[0]}</div><div style={{flex: 2}}>{r[1]}</div>
                  <div style={{flex: 1.4, color: i === 1 ? (fix > 0.5 ? ACCENT : ALARM) : INK}}>{i === 1 ? (fix > 0.5 ? '0' : (locale === 'he' ? '(ריק)' : '(blank)')) : r[2]}</div>
                </div>))}
            </div>
            <Cap text={t.h2b} y={470} size={38} loc={locale} color={MUTED} op={prog(lf, 22, 44)} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 230, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 24}px)`, direction: locale === 'he' ? 'rtl' : 'ltr', fontFamily}}>
            <div style={{width: 980, margin: '0 auto', padding: '36px 48px', borderRadius: 28, background: 'rgba(255,255,255,.05)', border: `2px solid ${ACCENT}55`, fontSize: 42, color: INK}}>
              {[[t.tenure, '3'], [t.contract, t.month], [t.internet, t.fiber], [t.support, t.none], [t.pay, t.echeck], [t.monthly, '89.45']].map((r, i) => (
                <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,.08)' : 'none', opacity: prog(lf, 92 + i * 6, 112 + i * 6)}}>
                  <span style={{color: MUTED}}>{r[0]}</span><span style={{fontWeight: 700, direction: 'ltr'}}>{r[1]}</span>
                </div>))}
            </div>
          </div>
        </>);
      }}</Scene>

      {/* C: 61 configurations -> winner */}
      <Scene from={306} dur={174}>{(lf) => {
        const fams = [[16, t.fam1, 0], [20, t.fam2, 1], [25, t.fam3, 2]] as const;
        const win = prog(lf, 92, 124);
        return (<>
          <Cap text={t.h4} y={80} loc={locale} size={50} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', gap: 120, direction: locale === 'he' ? 'rtl' : 'ltr'}}>
            {fams.map(([cnt, name, fi]) => (
              <div key={fi} style={{width: 420, textAlign: 'center', fontFamily}}>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', minHeight: 250, alignContent: 'flex-start'}}>
                  {Array.from({length: cnt}).map((_, k) => {
                    const on = prog(lf, 10 + fi * 10 + k * 1.6, 24 + fi * 10 + k * 1.6);
                    const isWin = fi === 2 && k === 15;
                    return <div key={k} style={{width: 34, height: 34, borderRadius: 999, background: isWin ? CHURN : ACCENT, opacity: isWin ? lerp(0.7 * on, 1, win) : on * lerp(0.7, 0.18, win), transform: `scale(${isWin ? lerp(on, 1.5, win) : on})`, boxShadow: isWin && win > 0.3 ? `0 0 28px ${CHURN}` : 'none'}} />;
                  })}
                </div>
                <div style={{fontSize: 40, fontWeight: 700, color: INK, marginTop: 18, opacity: prog(lf, 16 + fi * 10, 34 + fi * 10)}}>{name} <span style={{color: MUTED, fontWeight: 600}}>· {cnt}</span></div>
              </div>))}
          </div>
          <Cap text={t.cv} y={640} size={38} loc={locale} color={MUTED} op={prog(lf, 50, 74) * (1 - win * 0.0)} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', opacity: win, transform: `translateY(${(1 - win) * 20}px)`, direction: locale === 'he' ? 'rtl' : 'ltr', fontFamily}}>
            <div style={{display: 'inline-block', padding: '28px 56px', borderRadius: 28, background: 'rgba(255,176,32,.10)', border: `2px solid ${CHURN}99`}}>
              <div style={{fontSize: 56, fontWeight: 800, color: CHURN}}>{t.win}</div>
              <div style={{fontSize: 40, fontWeight: 600, color: INK, marginTop: 8}}>{t.winacc}</div>
            </div>
          </div>
        </>);
      }}</Scene>

      {/* D: held-out ranking + threshold */}
      <Scene from={456} dur={234}>{(lf) => {
        const s = prog(lf, 12, 62);
        const thr = lf < 128 ? 0.5 : lerp(0.5, 0.3, prog(lf, 128, 190));
        const calledN = lf < 66 ? null : nAt(thr);
        const caught = calledN === null ? 0 : cum[calledN];
        const falseN = calledN === null ? 0 : calledN - caught;
        const second = lf >= 124;
        return (<>
          <Dots d={d} s={s} n={calledN} r={6.5} gap={22} cx={960} cy={470} exP={prog(lf, 70, 92) * (1 - prog(lf, 116, 132))} />
          <Cap text={second ? t.h6 : t.h5} y={60} loc={locale} size={50} />
          {calledN !== null ? (
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', justifyContent: 'center', gap: 70, direction: locale === 'he' ? 'rtl' : 'ltr', opacity: prog(lf, 66, 86)}}>
              <Stat v={caught} sub={`${t.of} 374`} label={t.caught} color={CHURN} loc={locale} w={440} />
              <Stat v={falseN} label={t.alarms} color={ALARM} loc={locale} w={340} />
              <Stat v={thr.toFixed(2)} label={t.thr} color={INK} loc={locale} w={260} />
            </div>) : null}
          {lf >= 76 && lf < 128 ? (
            <div style={{position: 'absolute', right: locale === 'he' ? undefined : 50, left: locale === 'he' ? 50 : undefined, top: 300, width: 330, boxSizing: 'border-box', whiteSpace: 'pre-line', padding: '28px 30px', borderRadius: 22, background: 'rgba(11,16,32,.88)', border: `2px solid ${CHURN}99`, opacity: prog(lf, 76, 96) * (1 - prog(lf, 112, 128)), direction: locale === 'he' ? 'rtl' : 'ltr', fontFamily}}>
              <div style={{fontSize: 38, color: MUTED, fontWeight: 600}}>{t.cust}</div>
              <div style={{fontSize: 50, color: CHURN, fontWeight: 800, marginTop: 8}}>{t.risk}</div>
            </div>) : null}
        </>);
      }}</Scene>

      {/* E: database pipeline */}
      <Scene from={666} dur={150}>{(lf) => {
        const steps = [t.m1, t.m2, t.m3, t.m4];
        return (<>
          <Cap text={t.h7} y={110} loc={locale} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, direction: locale === 'he' ? 'rtl' : 'ltr', fontFamily}}>
            {steps.map((s, i) => {
              const on = prog(lf, 12 + i * 20, 36 + i * 20);
              return (<React.Fragment key={i}>
                <div style={{width: 340, minHeight: 190, padding: '30px 24px', borderRadius: 24, background: 'rgba(255,255,255,.05)', border: `2px solid ${i === 2 ? CHURN + 'aa' : ACCENT + '55'}`, color: INK, fontSize: 36, fontWeight: 700, lineHeight: 1.25, textAlign: 'center', opacity: on, transform: `translateY(${(1 - on) * 24}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{s}</div>
                {i < 3 ? <div style={{fontSize: 60, color: ACCENT, opacity: on, transform: locale === 'he' ? 'scaleX(-1)' : 'none'}}>→</div> : null}
              </React.Fragment>);
            })}
          </div>
          {lf >= 70 ? (() => {
            const u = ((lf - 70) % 56) / 56;
            const x = locale === 'he' ? lerp(1780, 140, u) : lerp(140, 1780, u);
            return <div style={{position: 'absolute', left: x - 16, top: 475 - 16 + 130, width: 32, height: 32, borderRadius: 999, background: CHURN, boxShadow: `0 0 36px ${CHURN}`, opacity: Math.sin(u * Math.PI) * 0.9}} />;
          })() : null}
        </>);
      }}</Scene>

      {/* F: close */}
      <Scene from={792} dur={96} fadeOut={false}>{(lf) => (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + lf * 0.0006})`}}>
          <div style={{position: 'absolute', inset: 0, opacity: 0.22 * prog(lf, 0, 40)}}>
            <Dots d={d} s={1} n={nAt(0.5)} r={6.5} gap={22} cx={960} cy={540} />
          </div>
          <Cap text={t.end1} y={380} size={92} loc={locale} op={prog(lf, 8, 34)} />
          <Cap text={t.end2} y={500} size={92} loc={locale} color={CHURN} op={prog(lf, 20, 46)} />
          <Cap text={t.end3} y={680} size={38} loc={locale} color={MUTED} op={prog(lf, 34, 58)} />
        </div>
      )}</Scene>

      <div style={{position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', fontFamily, fontSize: 24, color: MUTED, opacity: 0.8, direction: locale === 'he' ? 'rtl' : 'ltr'}}>{t.foot}</div>
    </AbsoluteFill>
  );
};
