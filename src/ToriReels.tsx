import React from 'react';
import {AbsoluteFill, interpolateColors, staticFile, Img, useCurrentFrame} from 'remotion';
import {Background, Phone, Shot, Sheen, fontFamily} from './Promo';
import {lerp, prog} from './lib/motion';

/**
 * Three vertical Tori reels (1080x1920 @30, 450 frames = 15 s). Daily batch 2026-11-29.
 * Every label comes from products/tori.md verified claims / messages/he.json. Invented numbers are labelled "נתוני דמו".
 * Silent here; music (CC0 library) is muxed in the final encode.
 */
const ACCENT = '#4fd1bb', BG = '#050d0e';
const BAD = '#ff7a8a', AMBER = '#ffc15e';
export const REEL_FRAMES = 450;

const card: React.CSSProperties = {direction: 'rtl', borderRadius: 38, padding: '34px 42px', background: 'linear-gradient(135deg, rgba(10,32,34,.94), rgba(5,16,18,.94))', boxShadow: '0 24px 60px rgba(0,0,0,.55)'};

// Hook text in the first ~2 s, then it lifts out.
const Hook: React.FC<{f: number; text: string; sub?: string; until?: number}> = ({f, text, sub, until = 78}) => {
  const i = prog(f, 0, 14), o = prog(f, until - 20, until);
  if (o >= 1) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: i * (1 - o), filter: `blur(${o * 10}px)`, transform: `translateY(${(1 - i) * 30 - o * 40}px)`}}>
      <div style={{direction: 'rtl', textAlign: 'center', width: 920, fontFamily, fontWeight: 700, fontSize: 104, lineHeight: 1.2, color: '#f2fffc', textShadow: '0 6px 40px rgba(0,0,0,.7)'}}>{text}</div>
      {sub ? <div style={{direction: 'rtl', marginTop: 34, fontFamily, fontWeight: 700, fontSize: 52, color: ACCENT}}>{sub}</div> : null}
    </AbsoluteFill>
  );
};

// Caption pill above Instagram's bottom UI zone.
const Cap: React.FC<{f: number; a: number; b: number; text: string}> = ({f, a, b, text}) => {
  const u = prog(f, a, a + 18) * (1 - prog(f, b - 18, b));
  if (u <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 400, display: 'flex', justifyContent: 'center', opacity: u, transform: `translateY(${(1 - u) * 24}px)`}}>
      <div style={{direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 58, color: '#f2fffc', padding: '20px 44px', borderRadius: 999, background: 'rgba(5,13,14,.82)', border: `2px solid ${ACCENT}88`, maxWidth: 960, textAlign: 'center', lineHeight: 1.25}}>{text}</div>
    </div>
  );
};

const EndCard: React.FC<{f: number; a: number; line: string}> = ({f, a, line}) => {
  const u = prog(f, a, a + 26);
  if (u <= 0.001) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: u, background: `rgba(5,13,14,${0.88 * u})`}}>
      <div style={{transform: `translateY(${(1 - u) * 30}px)`, textAlign: 'center', direction: 'rtl'}}>
        <div style={{fontFamily, fontWeight: 700, fontSize: 150, letterSpacing: 10, color: ACCENT, textShadow: `0 0 60px ${ACCENT}66`}}>TORI</div>
        <div style={{fontFamily, fontWeight: 700, fontSize: 60, color: '#f2fffc', marginTop: 8}}>ניהול יומן ותורים</div>
        <div style={{fontFamily, fontWeight: 700, fontSize: 84, color: '#f2fffc', marginTop: 70, lineHeight: 1.2, width: 900}}>{line}</div>
        <div style={{fontFamily, fontWeight: 400, fontSize: 48, color: '#9fc2bd', marginTop: 56}}>הקישור בביו</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Reel 1: booking, from the customer's phone (real screens) ----------------
const SCREENS = ['m-services.png', 'm-date.png', 'm-time.png', 'm-confirm.png'];
export const ToriReelBooking: React.FC = () => {
  const f = useCurrentFrame();
  const phoneIn = prog(f, 56, 100), phoneOut = prog(f, 376, 400);
  const t = (a: number) => prog(f, a, a + 24);
  const idx = [0, t(150), t(215), t(280)];
  const bubbles = ['מתי אתם פנויים?', 'ומחר אחרי הצהריים?', 'אולי בחמישי?', 'רגע, אני בודק...'];
  return (
    <AbsoluteFill>
      <Background accent={ACCENT} bg={BG} f={f} />
      {/* pain: messages piling up */}
      <AbsoluteFill style={{opacity: 1 - prog(f, 40, 80)}}>
        {bubbles.map((b, i) => {
          const u = prog(f, 4 + i * 10, 20 + i * 10);
          return <div key={b} style={{position: 'absolute', top: 250 + i * 118, [i % 2 ? 'left' : 'right']: 70, direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 46, color: '#cfe9e5', background: 'rgba(255,255,255,.1)', borderRadius: 40, padding: '18px 38px', opacity: u * 0.8, transform: `translateY(${(1 - u) * 40}px)`}}>{b}</div>;
        })}
      </AbsoluteFill>
      <Hook f={f} text="כמה הודעות שלחתם הבוקר כדי לקבוע תור?" />
      {/* phone with the real booking flow */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: phoneIn * (1 - phoneOut), transform: `translateY(${(1 - phoneIn) * 120 - phoneOut * 60}px) scale(${lerp(0.94, 1.0, phoneIn) + f * 0.00012})`, filter: `blur(${(1 - phoneIn) * 10 + phoneOut * 10}px)`}}>
        <div style={{marginTop: -120}}>
          <Phone h={1250} accent={ACCENT}>
            {SCREENS.map((s, i) => (
              <Shot key={s} src={s} opacity={i === 0 ? 1 - idx[1] : i === 3 ? idx[3] : i === 1 ? idx[1] * (1 - idx[2]) : idx[2] * (1 - idx[3])} style={{transform: `translateX(${(1 - (i === 0 ? 1 : idx[i])) * 40}px)`}} />
            ))}
            <Sheen f={f} strength={0.4} />
          </Phone>
        </div>
      </AbsoluteFill>
      <Cap f={f} a={92} b={190} text="הלקוח בוחר שירות מהנייד" />
      <Cap f={f} a={196} b={290} text="רואה רק שעות פנויות" />
      <Cap f={f} a={296} b={384} text="והתור מאושר מיד" />
      <EndCard f={f} a={398} line="פחות הודעות. יותר תורים." />
    </AbsoluteFill>
  );
};

// ---------------- Reel 2: cancellation -> waitlist offer, plus arrival confirmation (motion graphics, real labels) ----------------
export const ToriReelWaitlist: React.FC = () => {
  const f = useCurrentFrame();
  const L = f - 70;
  const cardIn = (i: number) => prog(L, 10 + i * 70, 44 + i * 70);
  const s2 = prog(L, 92, 118), s3 = prog(L, 150, 176);
  const statusCol = s3 > 0 ? interpolateColors(s3, [0, 1], [AMBER, ACCENT]) : interpolateColors(s2, [0, 1], [BAD, AMBER]);
  const press = prog(L, 224, 232) - prog(L, 238, 252);
  const confirmed = prog(L, 232, 256);
  const wrap = (i: number): React.CSSProperties => {
    const u = cardIn(i);
    return {...card, position: 'relative', opacity: u, transform: `translateY(${(1 - u) * 80}px) scale(${lerp(0.96, 1, u)})`, filter: `blur(${(1 - u) * 6}px)`, border: `2px solid ${ACCENT}88`};
  };
  const out = prog(f, 376, 400);
  return (
    <AbsoluteFill>
      <Background accent={ACCENT} bg={BG} f={f} />
      <Hook f={f} text="תור התבטל? המשבצת לא הולכת לאיבוד" />
      <AbsoluteFill style={{alignItems: 'center', opacity: (1 - out) * prog(f, 60, 90), filter: `blur(${out * 10}px)`}}>
        <div style={{position: 'absolute', top: 330, width: 940, display: 'flex', flexDirection: 'column', gap: 46}}>
          <div style={wrap(0)}>
            <div style={{fontFamily, fontWeight: 700, fontSize: 48, color: ACCENT}}>רשימת המתנה</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18}}>
              <div style={{fontFamily, fontWeight: 700, fontSize: 96, color: '#f2fffc', fontVariantNumeric: 'tabular-nums'}}>10:30</div>
              <div style={{position: 'relative', fontFamily, fontWeight: 700, fontSize: 46, borderRadius: 999, minWidth: 340, height: 96, color: statusCol, border: `2px solid ${statusCol}`, background: statusCol + '22', boxShadow: `0 0 36px ${statusCol}55`}}>
                {([['בוטל', 1 - s2], ['הוצע לממתין', s2 * (1 - s3)], ['נקבע', s3]] as [string, number][]).map(([tx, o]) => (
                  <span key={tx} style={{position: 'absolute', left: 0, right: 0, top: '50%', textAlign: 'center', opacity: o, transform: `translateY(calc(-50% + ${(1 - o) * 8}px))`}}>{tx}</span>
                ))}
              </div>
            </div>
            <div style={{fontFamily, fontWeight: 400, fontSize: 40, lineHeight: 1.35, color: '#b4d3ce', marginTop: 20}}>הצעה אוטומטית במייל לממתין הראשון, עם זמן מוגדר לאישור</div>
          </div>
          <div style={wrap(1)}>
            <div style={{fontFamily, fontWeight: 700, fontSize: 48, color: ACCENT}}>תזכורת אוטומטית</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 22, marginTop: 20}}>
              <div style={{fontFamily, fontWeight: 700, fontSize: 40, lineHeight: 1.3, color: '#e6f6f3', background: 'rgba(255,255,255,.07)', borderRadius: 28, padding: '22px 28px', flex: 1}}>תזכורת: מחר ב-10:30</div>
              <div style={{position: 'relative', fontFamily, fontWeight: 700, fontSize: 40, padding: '24px 30px', borderRadius: 999, whiteSpace: 'nowrap', minWidth: 290, textAlign: 'center', color: interpolateColors(confirmed, [0, 1], [ACCENT, '#04100f']), background: interpolateColors(confirmed, [0, 1], [ACCENT + '00', ACCENT + 'ff']), border: `2px solid ${ACCENT}`, transform: `scale(${1 - 0.07 * press})`, boxShadow: `0 0 ${46 * confirmed}px ${ACCENT}88`}}>
                <span style={{opacity: 1 - confirmed, display: 'inline-block'}}>אישור הגעה</span>
                <span style={{opacity: confirmed, position: 'absolute', left: 0, right: 0, top: '50%', transform: `translateY(-50%) scale(${lerp(0.9, 1, confirmed)})`}}>הגעה אושרה ✓</span>
              </div>
            </div>
            <div style={{fontFamily, fontWeight: 400, fontSize: 36, color: '#b4d3ce', marginTop: 18}}>אישור הגעה בלחיצה אחת</div>
          </div>
          <div style={{fontFamily, fontWeight: 400, fontSize: 32, color: '#8fb1ac', textAlign: 'center', opacity: cardIn(1)}}>נתוני דמו</div>
        </div>
      </AbsoluteFill>
      <Cap f={f} a={150} b={292} text="התור התפנה? הממתין הראשון מקבל הצעה" />
      <Cap f={f} a={298} b={384} text="ולקוחות מאשרים הגעה בלחיצה" />
      <EndCard f={f} a={398} line="פחות הודעות. יותר תורים." />
    </AbsoluteFill>
  );
};

// ---------------- Reel 3: owner view: real calendar screens + demo report ----------------
export const ToriReelOwner: React.FC = () => {
  const f = useCurrentFrame();
  // desktop week pan inside a window frame (real screenshot d-week.png, 1920x1080)
  const dIn = prog(f, 40, 80), dOut = prog(f, 176, 206);
  const pan = prog(f, 60, 190);
  const pIn = prog(f, 186, 220), pOut = prog(f, 300, 330);
  const rIn = prog(f, 316, 346), rOut = prog(f, 376, 400);
  const kpis: [string, number, (n: number) => string][] = [
    ['תורים', 128, (n) => String(Math.round(n))],
    ['הכנסות', 14200, (n) => '₪' + Math.round(n).toLocaleString('en-US')],
    ['אי-הגעות', 3, (n) => Math.round(n) + '%'],
    ['לקוחות חוזרים', 64, (n) => Math.round(n) + '%'],
  ];
  const R0 = f - 316;
  return (
    <AbsoluteFill>
      <Background accent={ACCENT} bg={BG} f={f} />
      <Hook f={f} text="כל היום שלכם, במבט אחד" until={70} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: dIn * (1 - dOut), filter: `blur(${(1 - dIn) * 10 + dOut * 10}px)`, transform: `scale(${lerp(0.96, 1, dIn)})`}}>
        <div style={{marginTop: -120, width: 980, height: 760, borderRadius: 34, overflow: 'hidden', border: `2px solid ${ACCENT}77`, boxShadow: `0 0 90px ${ACCENT}44, 0 30px 90px rgba(0,0,0,.6)`, position: 'relative', background: '#0b1213'}}>
          <Img src={staticFile('shots/d-week.png')} style={{position: 'absolute', width: 1500, height: 844, left: lerp(-520, 0, pan), top: 0}} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: pIn * (1 - pOut), filter: `blur(${(1 - pIn) * 10 + pOut * 10}px)`, transform: `translateY(${(1 - pIn) * 100}px)`}}>
        <div style={{marginTop: -120}}>
          <Phone h={1250} accent={ACCENT}>
            <Shot src="m-owner.png" />
            <Sheen f={f} strength={0.4} />
          </Phone>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', opacity: rIn * (1 - rOut), filter: `blur(${(1 - rIn) * 10 + rOut * 10}px)`}}>
        <div style={{position: 'absolute', top: 300, width: 940, direction: 'rtl', fontFamily}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{fontWeight: 700, fontSize: 80, color: '#f2fffc'}}>דוחות</div>
            <div style={{display: 'flex', gap: 12}}>{['7 ימים', '30 ימים', '90 ימים'].map((c, i) => <div key={c} style={{fontWeight: 700, fontSize: 32, padding: '10px 24px', borderRadius: 999, color: i === 1 ? '#04100f' : '#b4d3ce', background: i === 1 ? ACCENT : 'rgba(255,255,255,.1)'}}>{c}</div>)}</div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 34}}>
            {kpis.map(([label, v, fmt], i) => {
              const u = prog(R0, 6 + i * 8, 30 + i * 8), n = prog(R0, 14 + i * 8, 60 + i * 8);
              return (
                <div key={label} style={{...card, border: `2px solid ${ACCENT}66`, opacity: u, transform: `translateY(${(1 - u) * 40}px)`}}>
                  <div style={{fontWeight: 700, fontSize: 38, color: '#b4d3ce'}}>{label}</div>
                  <div style={{fontWeight: 700, fontSize: 92, color: '#f2fffc', fontVariantNumeric: 'tabular-nums', lineHeight: 1.15}}>{fmt(v * n)}</div>
                </div>
              );
            })}
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 34, opacity: prog(R0, 60, 84)}}>
            <div style={{fontWeight: 700, fontSize: 40, padding: '16px 34px', borderRadius: 999, border: `2px solid ${ACCENT}`, color: ACCENT}}>ייצוא ל-Excel</div>
            <div style={{fontWeight: 400, fontSize: 34, color: '#9fc2bd'}}>נתוני דמו</div>
          </div>
        </div>
      </AbsoluteFill>
      <Cap f={f} a={92} b={190} text="יומן יומי, שבועי וחודשי" />
      <Cap f={f} a={226} b={304} text="התורים וההכנסות בכיס" />
      <Cap f={f} a={348} b={384} text="דוחות וייצוא ל-Excel" />
      <EndCard f={f} a={398} line="פחות הודעות. יותר תורים." />
    </AbsoluteFill>
  );
};
