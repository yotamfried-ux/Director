import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {fontFamily} from './Promo';
import {Scene, lerp, prog} from './lib/motion';
import {ACCENT, ALARM, BG, CHURN, Cap, Dots, INK, Loc, MUTED, Stat, useData} from './ChurnJourney';

// Customer Churn Prediction, project overview (site clip, silent, 1920x1080 @30, 30 s). Script: products/churn-prediction-script-v1.md.
// Every number: products/churn-prediction.md (verified 2026-11-25). Dots = real held-out scores of the saved Random Forest.

const T = {
  he: {
    s1: 'חיזוי נטישת לקוחות', s1c: 'פרויקט גמר · קורס אנליסט נתונים · הטכניון', s1b: 'המטרה: לזהות מי מלקוחות חברת התקשורת עומד לעזוב, לפני שהוא עוזב', feat: 'מאפיינים', steps: ['הבעיה', 'הנתונים', 'המודל', 'התוצאה', 'מסד נתונים'], cust: 'לקוחות במערך', left: 'עזבו', dotsNote: 'כל נקודה: לקוח מקבוצת הבדיקה (1,409)',
    s2: 'מה מנבא נטישה?', s2b: 'חוזה חודשי, לקוחות חדשים, תשלום בצ׳ק', pairs: [['חוזה חודשי', 42.7, 'חוזה דו-שנתי', 2.8], ['ותק עד שנה', 47.4, 'ותק מעל שנה', 17.1], ['תשלום בצ׳ק אלקטרוני', 45.3, 'תשלום אוטומטי', 16.0]] as [string, number, string, number][],
    s3a: 'הכנת הנתונים', chips: ['ניקוי ערכים חסרים', 'קידוד קטגוריות', 'נרמול מספרים'], cols: 'עמודות', s3b: '61 הגדרות · 3 משפחות מודלים', fams: ['KNN', 'עץ החלטה', 'יער אקראי'], base: 'ניחוש ללא מודל 73.5%', s3c: 'יער אקראי ניצח (200 עצים)', testacc: 'דיוק בבדיקה',
    s4: 'התוצאה על לקוחות שלא נראו', acc: 'דיוק', of: 'מתוך', found: 'נוטשים זוהו', alarms: 'התראות שווא', s4b: 'מעל ניחוש ללא מודל: 73.5%',
    s5: 'ובשלב ב׳: מסד נתונים', m: ['25,000 רשומות\nנטענו ל-MongoDB', 'תיקון שדה בסכמה', '24,218 רשומות קיבלו ציון', 'ייצוא CSV'], end: '', s1b2: 'לדעת מי עומד לעזוב, לפני שהוא עוזב', foot: 'מערך נתונים ציבורי מהקורס',
  },
  en: {
    s1: 'Customer churn prediction', s1c: 'Final project · Data Analyst course · Technion', s1b: 'Goal: find which telecom customers are about to leave, before they do', feat: 'features', steps: ['Problem', 'Data', 'Model', 'Result', 'Database'], cust: 'customers', left: 'churned', dotsNote: 'Each dot: a test-set customer (1,409)',
    s2: 'What predicts churn?', s2b: 'Monthly contracts, new customers, paying by check', pairs: [['Month-to-month', 42.7, 'Two-year contract', 2.8], ['Tenure up to 1 year', 47.4, 'Tenure over 1 year', 17.1], ['Electronic check', 45.3, 'Automatic payment', 16.0]] as [string, number, string, number][],
    s3a: 'Preparing the data', chips: ['Fix missing values', 'Encode categories', 'Scale numbers'], cols: 'columns', s3b: '61 configurations · 3 model families', fams: ['KNN', 'Decision tree', 'Random forest'], base: 'No-model guess 73.5%', s3c: 'Random forest wins (200 trees)', testacc: 'test accuracy',
    s4: 'Results on customers it never saw', acc: 'accuracy', of: 'of', found: 'churners found', alarms: 'false alarms', s4b: 'Above guessing without a model: 73.5%',
    s5: 'Part B: a database', m: ['25,000 records\nloaded into MongoDB', 'Schema field fixed', '24,218 complete records scored', 'CSV export'], end: '', s1b2: 'Know who is about to leave, before they do', foot: 'Public dataset from the course',
  },
};

const Row: React.FC<{loc: Loc; label: string; pct: number; color: string; w: number; on: number; max?: number; barH?: number; labW?: number; val?: string}> = ({loc, label, pct, color, w, on, max = 50, barH = 76, labW = 420, val}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 24, direction: loc === 'he' ? 'rtl' : 'ltr', fontFamily, height: barH + 16}}>
    <div style={{width: labW, fontSize: 40, fontWeight: 600, color: INK}}>{label}</div>
    <div style={{width: Math.max(8, (pct / max) * w * on), height: barH, borderRadius: 14, background: color, boxShadow: `0 0 28px ${color}55`}} />
    <div style={{fontSize: 48, fontWeight: 800, color, opacity: on, direction: 'ltr'}}>{val ?? `${pct.toFixed(1)}%`}</div>
  </div>
);

export const ChurnOverview: React.FC<{locale: Loc}> = ({locale}) => {
  const d = useData();
  const f = useCurrentFrame();
  const t = T[locale];
  const rtl = locale === 'he' ? 'rtl' : 'ltr';
  if (!d) return <AbsoluteFill style={{background: BG}} />;
  const active = f < 204 ? 0 : f < 384 ? 1 : f < 624 ? 2 : f < 804 ? 3 : 4;
  return (
    <AbsoluteFill style={{background: `radial-gradient(1400px 800px at 50% 40%, #121A33 0%, ${BG} 70%)`}}>
      {/* 1 background */}
      <Scene from={0} dur={216} fadeIn={false}>{(lf) => {
        const he = locale === 'he';
        const box: React.CSSProperties = {position: 'absolute', top: 0, [he ? 'right' : 'left']: 110, width: 900, direction: rtl, textAlign: he ? 'right' : 'left', fontFamily};
        const o = (a: number, b: number) => prog(lf, a, b);
        return (
          <>
            <Dots d={d} s={0} n={null} r={5} gap={15} cx={he ? 560 : 1360} cy={500} lit={prog(lf, 70, 110)} />
            <Cap text={t.dotsNote} y={760} size={26} loc={locale} color={MUTED} op={o(40, 66)} />
            <div style={{...box, top: 130, fontSize: 88, fontWeight: 800, color: INK, opacity: o(4, 28), lineHeight: 1.1}}>{t.s1}</div>
            <div style={{...box, top: 262, fontSize: 44, fontWeight: 600, color: ACCENT, opacity: o(14, 38)}}>{t.s1c}</div>
            <div style={{...box, top: 360, fontSize: 52, fontWeight: 700, color: INK, opacity: o(30, 58), lineHeight: 1.25}}>{t.s1b}</div>
            <div style={{...box, top: 580, display: 'flex', gap: 24, opacity: o(54, 84)}}>
              <Stat v="7,043" label={t.cust} color={INK} loc={locale} w={290} />
              <Stat v="19" label={t.feat} color={INK} loc={locale} w={250} />
              <Stat v="26.5%" label={t.left} color={CHURN} loc={locale} w={250} />
            </div>
            <div style={{...box, top: 800, display: 'flex', gap: 16, opacity: o(78, 108)}}>
              {['Python', 'scikit-learn', 'pandas', 'MongoDB'].map((c) => <div key={c} style={{padding: '10px 26px', borderRadius: 999, border: `2px solid ${ACCENT}66`, background: 'rgba(125,211,252,.08)', fontSize: 32, fontWeight: 600, color: INK, direction: 'ltr'}}>{c}</div>)}
            </div>
          </>
        );
      }}</Scene>

      {/* 2 drivers */}
      <Scene from={192} dur={204}>{(lf) => (
        <>
          <Cap text={t.s2} y={50} size={72} loc={locale} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
            {t.pairs.map((p, i) => {
              const a = prog(lf, 22 + i * 26, 56 + i * 26), b = prog(lf, 34 + i * 26, 68 + i * 26);
              return (
                <div key={i} style={{padding: '14px 36px', borderRadius: 24, background: 'rgba(255,255,255,.035)'}}>
                  <Row loc={locale} label={p[0]} pct={p[1]} color={CHURN} w={900} on={a} />
                  <Row loc={locale} label={p[2]} pct={p[3]} color={ACCENT} w={900} on={b} />
                </div>);
            })}
          </div>
          <Cap text={t.s2b} y={880} size={46} loc={locale} color={MUTED} op={prog(lf, 100, 128)} />
        </>
      )}</Scene>

      {/* 3 prep + models */}
      <Scene from={372} dur={264}>{(lf) => {
        const a = 1 - prog(lf, 84, 108), b = prog(lf, 92, 118);
        const accs = [78.4, 79.2, 80.2];
        return (
          <>
            <div style={{position: 'absolute', inset: 0, opacity: a}}>
              <Cap text={t.s3a} y={70} size={72} loc={locale} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', gap: 36, direction: rtl, fontFamily}}>
                {t.chips.map((c, i) => {
                  const o = prog(lf, 12 + i * 14, 36 + i * 14);
                  return <div key={i} style={{padding: '30px 44px', borderRadius: 26, background: 'rgba(255,255,255,.05)', border: `2px solid ${ACCENT}66`, fontSize: 44, fontWeight: 700, color: INK, opacity: o, transform: `translateY(${(1 - o) * 20}px)`}}>{c}</div>;
                })}
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 60, direction: rtl, opacity: prog(lf, 52, 78), fontFamily}}>
                <Stat v="19" label={t.cols} color={INK} loc={locale} w={300} />
                <div style={{fontSize: 90, color: ACCENT, transform: locale === 'he' ? 'scaleX(-1)' : 'none'}}>→</div>
                <Stat v="46" label={t.cols} color={CHURN} loc={locale} w={300} />
              </div>
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: b}}>
              <Cap text={t.s3b} y={70} size={64} loc={locale} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center'}}>
                <div style={{position: 'relative', paddingTop: 20}}>
                  {t.fams.map((f, i) => (
                    <Row key={i} loc={locale} label={f} pct={accs[i]} max={100} w={1000} barH={80} labW={300} color={i === 2 ? CHURN : ACCENT} on={prog(lf, 112 + i * 14, 146 + i * 14)} />
                  ))}
                  <div style={{position: 'absolute', top: 0, bottom: 0, [locale === 'he' ? 'right' : 'left']: 324 + 735, width: 0, borderLeft: `3px dashed ${ALARM}`, opacity: prog(lf, 152, 176), height: 330}} />
                  <div style={{position: 'absolute', top: 350, [locale === 'he' ? 'right' : 'left']: 324 + 735, transform: `translateX(${locale === 'he' ? '50%' : '-50%'})`, whiteSpace: 'nowrap', fontFamily, fontSize: 36, color: ALARM, opacity: prog(lf, 156, 180), direction: rtl}}>{t.base}</div>
                </div>
              </div>
              <Cap text={t.s3c} y={800} size={52} loc={locale} color={CHURN} op={prog(lf, 182, 212)} />
              <Cap text={t.testacc} y={880} size={32} loc={locale} color={MUTED} op={prog(lf, 182, 212)} />
            </div>
          </>
        );
      }}</Scene>

      {/* 4 result */}
      <Scene from={612} dur={192}>{(lf) => {
        const v = 80.2 * prog(lf, 14, 66);
        return (
          <>
            <Cap text={t.s4} y={60} size={64} loc={locale} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily, direction: 'ltr'}}>
              <span style={{fontSize: 270, fontWeight: 800, color: CHURN, lineHeight: 1}}>{v.toFixed(1)}%</span>
              <div style={{fontSize: 56, fontWeight: 700, color: INK, direction: rtl, marginTop: 6}}>{t.acc}</div>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 610, display: 'flex', justifyContent: 'center', gap: 90, direction: rtl, opacity: prog(lf, 56, 84)}}>
              <Stat v={193} sub={`${t.of} 374`} label={t.found} color={CHURN} loc={locale} w={470} />
              <Stat v={98} label={t.alarms} color={ALARM} loc={locale} w={340} />
              <Stat v="0.84" label="AUC" color={INK} loc={locale} w={260} />
            </div>
            <Cap text={t.s4b} y={868} size={44} loc={locale} color={MUTED} op={prog(lf, 90, 118)} />
          </>
        );
      }}</Scene>

      {/* 5 database + close */}
      <Scene from={780} dur={210} fadeOut={false}>{(lf) => {
        const u = ((lf - 50) % 56) / 56;
        return (
          <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + lf * 0.0005})`}}>
            <Cap text={t.s5} y={90} size={68} loc={locale} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, direction: rtl, fontFamily}}>
              {t.m.map((s, i) => {
                const on = prog(lf, 10 + i * 16, 34 + i * 16);
                return (<React.Fragment key={i}>
                  <div style={{width: 380, minHeight: 190, whiteSpace: 'pre-line', padding: '28px 20px', borderRadius: 24, background: 'rgba(255,255,255,.05)', border: `2px solid ${i === 2 ? CHURN + 'aa' : ACCENT + '55'}`, color: INK, fontSize: 38, fontWeight: 700, lineHeight: 1.25, textAlign: 'center', opacity: on, transform: `translateY(${(1 - on) * 24}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{s}</div>
                  {i < 3 ? <div style={{fontSize: 56, color: ACCENT, opacity: on, transform: locale === 'he' ? 'scaleX(-1)' : 'none'}}>→</div> : null}
                </React.Fragment>);
              })}
            </div>
            <div style={{position: 'absolute', left: 120, right: 120, top: 330 + 190 + 58, height: 2, background: 'rgba(125,211,252,.25)', opacity: prog(lf, 30, 60)}} />
            {lf >= 50 ? <div style={{position: 'absolute', left: (locale === 'he' ? lerp(1800, 120, u) : lerp(120, 1800, u)) - 16, top: 330 + 190 + 44, width: 32, height: 32, borderRadius: 999, background: CHURN, boxShadow: `0 0 36px ${CHURN}`, opacity: Math.sin(u * Math.PI) * 0.9}} /> : null}
            <Cap text={t.s1b2} y={640} size={72} loc={locale} color={CHURN} op={prog(lf, 70, 104)} />
          </div>
        );
      }}</Scene>

      <div style={{position: 'absolute', left: 0, right: 0, bottom: 52, display: 'flex', justifyContent: 'center', gap: 14, direction: rtl, fontFamily}}>
        {t.steps.map((st, i) => <div key={i} style={{padding: '6px 22px', borderRadius: 999, fontSize: 28, fontWeight: 700, color: i === active ? BG : MUTED, background: i === active ? ACCENT : 'rgba(255,255,255,.05)', border: `1.5px solid ${i <= active ? ACCENT : 'rgba(255,255,255,.12)'}`, opacity: i <= active ? 1 : 0.6}}>{st}</div>)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontFamily, fontSize: 24, color: MUTED, opacity: 0.8, direction: rtl}}>{t.foot}</div>
    </AbsoluteFill>
  );
};
