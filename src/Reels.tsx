import React from 'react';
import {AbsoluteFill, Img, getInputProps, interpolateColors, staticFile, useCurrentFrame} from 'remotion';

/** Poster stills (no overlay text) are rendered with --props='{"poster":true}'. */
const POSTER = !!(getInputProps() as {poster?: boolean}).poster;
import {Background, Monitor, Phone, Sheen, Shot, SHOT_H, SHOT_W, fontFamily} from './Promo';
import {Highlight, lerp, prog} from './lib/motion';

/**
 * Vertical reels for Instagram/Facebook (1080x1920 @30, 15 s). Real Tori screenshots (demo data, "Studio Alon")
 * or motion graphics with the product's real labels. Claims: products/tori.md "Verified claims" only.
 * Reel 1: customer books without app/password. Reel 2: owner's day at a glance. Reel 3: reminder + waitlist.
 */
const ACCENT = '#4fd1bb', BG = '#050d0e';
export const REEL_FRAMES = 450;
const BAD = '#ff7a8a', AMBER = '#ffc15e';

const HookText: React.FC<{f: number; lines: [string, boolean][]; size?: number}> = ({f, lines, size = 120}) => {
  if (POSTER) return null;
  const out = prog(f, 58, 76);
  if (f > 78) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out, filter: `blur(${out * 10}px)`}}>
      <div style={{textAlign: 'center', width: 960}}>
        {lines.map(([t, acc], i) => {
          const u = prog(f, 2 + i * 5, 14 + i * 5);
          return <div key={t} style={{direction: 'rtl', fontFamily, fontWeight: 800, fontSize: size, lineHeight: 1.18, color: acc ? ACCENT : '#f2fffc', opacity: u, transform: `translateY(${(1 - u) * 40}px)`, textShadow: acc ? `0 0 60px ${ACCENT}99` : 'none'}}>{t}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{f: number; t: string; a: number; b: number}> = ({f, t, a, b}) => {
  if (POSTER) return null;
  const o = Math.min(prog(f, a, a + 12), 1 - prog(f, b - 12, b));
  if (o <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1650, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)`}}>
      <div style={{direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 56, lineHeight: 1.15, color: '#eafaf6', padding: '16px 42px', borderRadius: 999, background: 'rgba(5,16,17,.7)', border: `1.5px solid ${ACCENT}66`, boxShadow: `0 0 50px ${ACCENT}33`, maxWidth: 1000}}>{t}</div>
    </div>
  );
};

const DemoTag: React.FC<{f: number; a: number; b: number}> = ({f, a, b}) => {
  if (POSTER) return null;
  const o = Math.min(prog(f, a, a + 14), 1 - prog(f, b - 14, b));
  return o > 0.001 ? <div style={{position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o * 0.85}}><div style={{direction: 'rtl', fontFamily, fontWeight: 600, fontSize: 32, color: '#b9d8d3', padding: '8px 26px', borderRadius: 999, background: 'rgba(255,255,255,.08)'}}>נתוני דמו</div></div> : null;
};

const EndCard: React.FC<{f: number; line: string}> = ({f, line}) => {
  if (POSTER) return null;
  const u = prog(f, 372, 408);
  if (u <= 0.001) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: u}}>
      <div style={{position: 'absolute', width: 1300, height: 1300, borderRadius: 999, background: `radial-gradient(circle, ${ACCENT}${Math.round(90 * u).toString(16).padStart(2, '0')}, transparent 60%)`, transform: `scale(${1 + 0.05 * Math.sin(f / 14)})`}} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - u) * 24}px) scale(${lerp(0.94, 1, u) + (f - 372) * 0.0004})`}}>
        <Img src={staticFile('logo-icon.png')} style={{width: 400, height: 'auto', filter: `drop-shadow(0 0 36px ${ACCENT}cc)`}} />
        <div style={{marginTop: 22, fontFamily, fontWeight: 700, fontSize: 124, letterSpacing: 32, color: '#f2fffc', textShadow: `0 0 44px ${ACCENT}`, paddingLeft: 32}}>TORI</div>
        <div style={{marginTop: 14, direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 60, color: ACCENT}}>{line}</div>
      </div>
    </AbsoluteFill>
  );
};

const Frame: React.FC<{children: (f: number) => React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const fadeIn = 1 - prog(f, 0, 8), fadeOut = prog(f, 436, 450);
  return (
    <AbsoluteFill style={{fontFamily}}>
      <Background accent={ACCENT} bg={BG} f={f * 1.3} />
      {children(f)}
      <AbsoluteFill style={{background: BG, opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};

const PH = 1360;
const phoneDims = (h: number) => {const b = h * 0.016, sh = h - 2 * b; return {sh, sw: (sh * SHOT_W) / SHOT_H};};

// ---------- Reel 1: customer books, no app ----------
const R1_SCREENS = ['m-services.png', 'm-date.png', 'm-time.png', 'm-confirm.png'];
const R1_T = [66, 150, 234, 318]; // start frame of each screen (first starts with the phone)
export const ToriReelBook: React.FC = () => (
  <Frame>{(f) => {
    const phoneIn = prog(f, 54, 96), out = prog(f, 360, 384);
    const {sw, sh} = phoneDims(PH);
    const sel = (i: number) => (i === 0 ? 1 - prog(f, R1_T[1] - 8, R1_T[1] + 14) : prog(f, R1_T[i] - 8, R1_T[i] + 14) * (i < 3 ? 1 - prog(f, R1_T[i + 1] - 8, R1_T[i + 1] + 14) : 1));
    const pts: [number, number][] = [[0.48, 0.33], [0.63, 0.39], [0.5, 0.4977]];
    return (
      <>
        <HookText f={f} lines={[["הלקוח רוצה תור.", false], ["בלי אפליקציה.", true], ["בלי סיסמה.", true]]} size={118} />
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: phoneIn * (1 - out), transform: `translateY(${-90 + (1 - phoneIn) * 120 + Math.sin(f / 22) * 6}px) scale(${lerp(0.92, 1, phoneIn)})`, filter: `blur(${(1 - phoneIn) * 10 + out * 10}px)`}}>
          <Phone h={PH} accent={ACCENT} glow={1 + 0.4 * Math.sin(Math.PI * prog(f, 318, 350))}>
            {R1_SCREENS.map((s, i) => <Shot key={s} src={s} opacity={sel(i)} style={{transform: `translateX(${(1 - sel(i)) * (i === 0 ? 0 : -40)}px)`}} />)}
            {pts.map((p, i) => <Highlight key={i} f={f} t0={R1_T[i] + 24 - 14 + 6} to={[sw * p[0], sh * p[1]]} size={sw * 0.05} accent={ACCENT} />)}
            <Sheen f={f * 1.5} />
          </Phone>
        </AbsoluteFill>
        <DemoTag f={f} a={70} b={366} />
        <Caption f={f} t="בוחרים שירות" a={72} b={146} />
        <Caption f={f} t="בוחרים יום" a={156} b={230} />
        <Caption f={f} t="רואים רק שעות פנויות" a={240} b={314} />
        <Caption f={f} t="והתור מאושר מיד" a={324} b={372} />
        <EndCard f={f} line="דף הזמנות לכל עסק" />
      </>
    );
  }}</Frame>
);

// ---------- Reel 2: owner's day at a glance ----------
export const ToriReelOwner: React.FC = () => (
  <Frame>{(f) => {
    const aIn = prog(f, 54, 90), aOut = prog(f, 200, 232);
    const bIn = prog(f, 196, 236), bOut = prog(f, 352, 384);
    const zoom = lerp(1, 1.5, prog(f, 250, 330));
    const monH = 1000;
    return (
      <>
        <HookText f={f} lines={[["כמה תורים", false], ["יש לך היום?", false], ["מבט אחד ביומן.", true]]} size={120} />
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: aIn * (1 - aOut), transform: `translateY(${-90 + (1 - aIn) * 120 + Math.sin(f / 22) * 6}px) scale(${lerp(0.92, 1, aIn) * lerp(1, 0.97, aOut)})`, filter: `blur(${(1 - aIn) * 10 + aOut * 10}px)`}}>
          <Phone h={PH} accent={ACCENT}>
            <Shot src="m-owner.png" style={{transform: `scale(${lerp(1, 1.04, prog(f, 60, 200))})`, transformOrigin: 'top center'}} />
            <Sheen f={f * 1.5} />
          </Phone>
        </AbsoluteFill>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: bIn * (1 - bOut), perspective: 2400}}>
          <div style={{transform: `translateY(${-110 + (1 - bIn) * 100}px) rotateX(3deg) scale(${lerp(0.94, 1, bIn)})`}}>
            <Monitor w={monH} accent={ACCENT}>
              <Shot src="d-week.png" style={{transform: `scale(${zoom})`, transformOrigin: '88% 70%', filter: 'brightness(1.25) contrast(1.05)'}} />
              <Sheen f={f} strength={0.8} />
            </Monitor>
          </div>
        </AbsoluteFill>
        <DemoTag f={f} a={70} b={380} />
        <Caption f={f} t="תורים, תפוסה ושעות פנויות" a={76} b={196} />
        <Caption f={f} t="יומן יומי, שבועי וחודשי" a={216} b={372} />
        <EndCard f={f} line="ניהול יומן ותורים" />
      </>
    );
  }}</Frame>
);

// ---------- Reel 3: reminder + waitlist ----------
const card: React.CSSProperties = {direction: 'rtl', borderRadius: 38, padding: '34px 42px', background: 'linear-gradient(135deg, rgba(10,32,34,.94), rgba(5,16,18,.94))', boxShadow: '0 24px 60px rgba(0,0,0,.55)'};
export const ToriReelWaitlist: React.FC = () => (
  <Frame>{(f) => {
    const g = prog(f, 56, 92), gOut = prog(f, 300, 330);
    const L = f - 56;
    const cardIn = (i: number) => prog(L, 10 + i * 70, 44 + i * 70);
    const confirmed = prog(L, 40, 66), press = prog(L, 34, 42) - prog(L, 46, 58);
    const s2 = prog(L, 118, 142), s3 = prog(L, 160, 184);
    const sc = s3 > 0 ? interpolateColors(s3, [0, 1], [AMBER, ACCENT]) : interpolateColors(s2, [0, 1], [BAD, AMBER]);
    const pIn = prog(f, 320, 356), pOut = prog(f, 392, 412);
    const wrap = (i: number): React.CSSProperties => {const u = cardIn(i); return {...card, opacity: u, transform: `translateY(${(1 - u) * 70}px) scale(${lerp(0.96, 1, u)})`, filter: `blur(${(1 - u) * 6}px)`, border: `2px solid ${ACCENT}${Math.round(70 + 110 * Math.sin(Math.PI * prog(L, 10 + i * 70, 90 + i * 70))).toString(16).padStart(2, '0')}`};};
    const title = (t: string) => <div style={{fontFamily, fontWeight: 800, fontSize: 46, color: ACCENT, marginBottom: 8}}>{t}</div>;
    const {sw, sh} = phoneDims(1100);
    return (
      <>
        <HookText f={f} lines={[["ביטלו לך", false], ["ברגע האחרון?", false], ["הממתין הבא", true], ["מקבל הצעה.", true]]} size={112} />
        <AbsoluteFill style={{alignItems: 'center', opacity: g * (1 - gOut), filter: `blur(${(1 - g) * 8 + gOut * 8}px)`}}>
          <div style={{position: 'absolute', top: 560, width: 960, display: 'flex', flexDirection: 'column', gap: 46, transform: 'scale(1.1)', transformOrigin: 'top center'}}>
            <div style={wrap(0)}>
              {title('תזכורת אוטומטית')}
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginTop: 14}}>
                <div style={{fontFamily, fontWeight: 600, fontSize: 42, color: '#e6f6f3', background: 'rgba(255,255,255,.06)', borderRadius: 28, padding: '22px 28px', flex: 1}}>תזכורת: מחר ב-10:30</div>
                <div style={{position: 'relative', fontFamily, fontWeight: 800, fontSize: 38, padding: '22px 30px', borderRadius: 999, whiteSpace: 'nowrap', minWidth: 250, textAlign: 'center', color: interpolateColors(confirmed, [0, 1], [ACCENT, '#04100f']), background: interpolateColors(confirmed, [0, 1], [ACCENT + '00', ACCENT + 'ff']), border: `2px solid ${ACCENT}`, transform: `scale(${1 - 0.07 * press})`, boxShadow: `0 0 ${46 * confirmed}px ${ACCENT}88`}}>
                  <span style={{opacity: 1 - confirmed, display: 'inline-block'}}>אישור הגעה</span>
                  <span style={{opacity: confirmed, position: 'absolute', left: 0, right: 0, top: '50%', transform: `translateY(-50%) scale(${lerp(0.9, 1, confirmed)})`}}>הגעה אושרה ✓</span>
                </div>
              </div>
            </div>
            <div style={wrap(1)}>
              {title('רשימת המתנה')}
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14}}>
                <div style={{fontFamily, fontWeight: 800, fontSize: 64, color: '#f2fffc', fontVariantNumeric: 'tabular-nums'}}>10:30</div>
                <div style={{position: 'relative', fontFamily, fontWeight: 800, fontSize: 40, borderRadius: 999, minWidth: 290, height: 80, color: sc, border: `2px solid ${sc}`, background: sc + '22', boxShadow: `0 0 30px ${sc}55`}}>
                  {([['בוטל', 1 - s2], ['הוצע לממתין', s2 * (1 - s3)], ['נקבע', s3]] as [string, number][]).map(([t, o]) => <span key={t} style={{position: 'absolute', left: 0, right: 0, top: '50%', textAlign: 'center', opacity: o, transform: `translateY(calc(-50% + ${(1 - o) * 8}px))`}}>{t}</span>)}
                </div>
              </div>
              <div style={{fontFamily, fontWeight: 500, fontSize: 36, color: '#9fc2bd', marginTop: 12}}>המועד מוצע אוטומטית לממתין הראשון</div>
            </div>
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: pIn * (1 - pOut), transform: `translateY(${-60 + (1 - pIn) * 100}px) scale(${lerp(0.94, 1, pIn)})`, filter: `blur(${(1 - pIn) * 10 + pOut * 10}px)`}}>
          <Phone h={1100} accent={ACCENT}>
            <Shot src="m-date.png" />
            <Highlight f={f} t0={340} to={[sw * 0.5, sh * 0.545]} size={sw * 0.06} accent={ACCENT} />
            <Sheen f={f * 1.5} />
          </Phone>
        </AbsoluteFill>
        <DemoTag f={f} a={72} b={412} />
        <Caption f={f} t="תזכורת יום לפני, אישור בלחיצה" a={96} b={190} />
        <Caption f={f} t="מתפנה מקום? הצעה לממתין" a={196} b={300} />
        <Caption f={f} t="הלקוח מצטרף לרשימה בעצמו" a={326} b={398} />
        <EndCard f={f} line="ניהול יומן ותורים" />
      </>
    );
  }}</Frame>
);
