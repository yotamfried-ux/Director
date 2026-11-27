import React from 'react';
import {AbsoluteFill, Img, interpolate, interpolateColors, staticFile, useCurrentFrame} from 'remotion';
import {Background, Phone, Sheen, Shot, SHOT_H, SHOT_W, fontFamily} from './Promo';
import {Fade, Highlight, lerp, prog} from './lib/motion';

/**
 * Three vertical Tori reels (1080x1920, 30 fps, 15 s each). Silent masters; music is muxed at encode time.
 * Labels come from Tori's own UI strings (messages/he.json); invented numbers are marked "נתוני דמו".
 * Hook in the first 2 s, no cursor (soft highlight only), no hard cuts.
 */
export const REEL_FRAMES = 450;
const ACCENT = '#4fd1bb', BG = '#050d0e', BAD = '#ff7a8a', AMBER = '#ffc15e';
const card: React.CSSProperties = {direction: 'rtl', borderRadius: 38, padding: '34px 42px', background: 'linear-gradient(135deg, rgba(10,32,34,.94), rgba(5,16,18,.94))', boxShadow: '0 24px 60px rgba(0,0,0,.55)', border: `2px solid ${ACCENT}66`};

const Hook: React.FC<{f: number; l1: string; l2: string; until?: number}> = ({f, l1, l2, until = 72}) => {
  const a = prog(f, 2, 16), b = prog(f, 14, 28), o = prog(f, until - 14, until);
  if (f > until) return null;
  const line = (t: string, u: number, c: string, glow: boolean) => (
    <div style={{direction: 'rtl', fontFamily, fontWeight: 800, fontSize: 108, lineHeight: 1.2, color: c, opacity: u, transform: `translateY(${(1 - u) * 40}px)`, textShadow: glow ? `0 0 60px ${ACCENT}99` : 'none'}}>{t}</div>
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - o, filter: `blur(${o * 10}px)`}}>
      <div style={{textAlign: 'center', padding: '0 50px'}}>{line(l1, a, '#f2fffc', false)}{line(l2, b, ACCENT, true)}</div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{f: number; text: string; a: number; b: number}> = ({f, text, a, b}) => {
  const o = interpolate(f, [a, a + 12, b - 12, b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1920 - 400, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 12}px)`}}>
      <div style={{direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 54, lineHeight: 1.15, color: '#f2fffc', padding: '14px 38px', borderRadius: 999, background: 'rgba(4,14,15,.82)', border: `2px solid ${ACCENT}88`, boxShadow: `0 0 40px ${ACCENT}44`, maxWidth: 1000, textAlign: 'center'}}>{text}</div>
    </div>
  );
};

const Outro: React.FC<{f: number; start: number; line: string}> = ({f, start, line}) => {
  const u = prog(f, start, start + 26);
  if (u <= 0.001) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', width: 1300, height: 1300, borderRadius: 999, background: `radial-gradient(circle, ${ACCENT}${Math.round(100 * u).toString(16).padStart(2, '0')}, transparent 60%)`}} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: u, transform: `translateY(${(1 - u) * 24}px)`}}>
        <Img src={staticFile('logo-icon.png')} style={{width: 380, height: 'auto', filter: `drop-shadow(0 0 36px ${ACCENT}cc)`}} />
        <div style={{marginTop: 22, fontFamily, fontWeight: 700, fontSize: 124, letterSpacing: 32, color: '#f2fffc', textShadow: `0 0 44px ${ACCENT}`, paddingLeft: 32}}>TORI</div>
        <div style={{marginTop: 14, direction: 'rtl', fontFamily, fontWeight: 700, fontSize: 56, color: ACCENT}}>{line}</div>
        <div style={{marginTop: 18, fontFamily, fontWeight: 500, fontSize: 40, color: '#9fc2bd', letterSpacing: 1}}>turim.d2ryf.com</div>
      </div>
    </AbsoluteFill>
  );
};

const Shell: React.FC<{children: (f: number) => React.ReactNode; outroStart: number}> = ({children, outroStart}) => {
  const f = useCurrentFrame();
  const fin = 1 - prog(f, 0, 6);
  const fout = prog(f, REEL_FRAMES - 14, REEL_FRAMES);
  void outroStart;
  return (
    <AbsoluteFill style={{fontFamily}}>
      <Background accent={ACCENT} bg={BG} f={f * 1.3} />
      {children(f)}
      <AbsoluteFill style={{background: BG, opacity: Math.max(fin, fout)}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Reel 1: personal link instead of a phone call
export const ReelMoveLink: React.FC = () => (
  <Shell outroStart={346}>{(f) => {
    const sw = (1180 * 0.968 * SHOT_W) / SHOT_H;
    const inn = prog(f, 62, 96);
    const press = prog(f, 190, 214);
    const toggleK = prog(f, 255, 285);
    return (
      <>
        <Hook f={f} l1="לקוח מתקשר להזיז תור?" l2="באמצע העבודה?" />
        <Fade f={f} a={64} b={98} c={226} d={258}>
          <div style={{position: 'absolute', left: '50%', top: 150, transform: `translateX(-50%) translateY(${(1 - inn) * 60}px) scale(${lerp(0.94, 1, inn)})`}}>
            <Phone h={1180} accent={ACCENT} glow={1}>
              <Shot src="m-confirm.png" />
              <Highlight f={f} t0={170} to={[sw * 0.5, 1180 * 0.9 * 0.968]} size={sw * 0.05} accent={ACCENT} />
              <Sheen f={f * 1.5} />
            </Phone>
          </div>
          <div style={{position: 'absolute', left: 60, right: 60, top: 1260, opacity: prog(f, 150, 180), transform: `translateY(${(1 - prog(f, 150, 180)) * 50}px)`}}>
            <div style={{...card, transform: `scale(${1 - 0.03 * (press - prog(f, 214, 232))})`}}>
              <div style={{fontFamily, fontWeight: 800, fontSize: 40, color: ACCENT}}>קישור אישי בכל אישור</div>
              <div style={{fontFamily, fontWeight: 600, fontSize: 46, lineHeight: 1.3, color: '#e6f6f3', marginTop: 10}}>ביטול או שינוי בקישור האישי, בלי להתקשר</div>
            </div>
          </div>
        </Fade>
        <Fade f={f} a={236} b={266} c={330} d={362}>
          <div style={{position: 'absolute', left: 60, right: 60, top: 560}}>
            <div style={{...card, padding: '40px 44px'}}>
              <div style={{fontFamily, fontWeight: 800, fontSize: 44, color: ACCENT}}>אתם קובעים את הכללים</div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 26}}>
                <div style={{fontFamily, fontWeight: 600, fontSize: 40, lineHeight: 1.25, color: '#e6f6f3', maxWidth: 560}}>ביטול ושינוי מועד עד (שעות לפני התור)</div>
                <div style={{fontFamily, fontWeight: 800, fontSize: 96, color: interpolateColors(toggleK, [0, 1], ['#9fc2bd', '#f2fffc']), fontVariantNumeric: 'tabular-nums'}}>24</div>
              </div>
              <div style={{fontFamily, fontWeight: 500, fontSize: 30, color: '#6f908b', marginTop: 10}}>נתוני דמו</div>
            </div>
            <div style={{...card, marginTop: 30, opacity: prog(f, 268, 296), transform: `translateY(${(1 - prog(f, 268, 296)) * 40}px)`}}>
              <div style={{fontFamily, fontWeight: 600, fontSize: 44, lineHeight: 1.3, color: '#e6f6f3'}}>הלקוח מסדר את זה בעצמו, עד המועד שהגדרתם</div>
            </div>
          </div>
        </Fade>
        <Caption f={f} text="הלקוח מסדר לבד, בלי שיחה" a={110} b={226} />
        <Caption f={f} text="ואתם קובעים עד מתי" a={252} b={332} />
        <Outro f={f} start={346} line="פחות הודעות. יותר תורים." />
      </>
    );
  }}</Shell>
);

// ---------------------------------------------------------------- Reel 2: waitlist fills the cancelled slot, reminder confirms arrival
export const ReelWaitlist: React.FC = () => (
  <Shell outroStart={346}>{(f) => {
    const s2 = prog(f, 150, 176), s3 = prog(f, 196, 222);
    const col = s3 > 0 ? interpolateColors(s3, [0, 1], [AMBER, ACCENT]) : interpolateColors(s2, [0, 1], [BAD, AMBER]);
    const conf = prog(f, 300, 326);
    const press = prog(f, 292, 304) - prog(f, 308, 322);
    return (
      <>
        <Hook f={f} l1="תור התבטל?" l2="המקום לא יישאר ריק" />
        <Fade f={f} a={70} b={104} c={236} d={268}>
          <div style={{position: 'absolute', left: 60, right: 60, top: 520}}>
            <div style={{...card, padding: '44px 48px'}}>
              <div style={{fontFamily, fontWeight: 800, fontSize: 52, color: ACCENT}}>רשימת המתנה</div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28}}>
                <div style={{fontFamily, fontWeight: 800, fontSize: 120, color: '#f2fffc', fontVariantNumeric: 'tabular-nums'}}>10:30</div>
                <div style={{position: 'relative', fontFamily, fontWeight: 800, fontSize: 46, borderRadius: 999, minWidth: 380, height: 104, color: col, border: `2px solid ${col}`, background: col + '22', boxShadow: `0 0 34px ${col}55`}}>
                  {([['בוטל', 1 - s2], ['הוצע לממתין', s2 * (1 - s3)], ['נקבע', s3]] as [string, number][]).map(([t, o]) => <span key={t} style={{position: 'absolute', left: 0, right: 0, top: '50%', textAlign: 'center', opacity: o, transform: `translateY(calc(-50% + ${(1 - o) * 8}px))`}}>{t}</span>)}
                </div>
              </div>
              <div style={{fontFamily, fontWeight: 500, fontSize: 30, color: '#6f908b', marginTop: 14}}>נתוני דמו</div>
            </div>
            <div style={{...card, marginTop: 34, opacity: prog(f, 118, 146), transform: `translateY(${(1 - prog(f, 118, 146)) * 40}px)`}}>
              <div style={{fontFamily, fontWeight: 600, fontSize: 46, lineHeight: 1.3, color: '#e6f6f3'}}>המועד מוצע אוטומטית לממתין הראשון, בהצעה במייל</div>
            </div>
          </div>
        </Fade>
        <Fade f={f} a={252} b={286} c={336} d={366}>
          <div style={{position: 'absolute', left: 60, right: 60, top: 600}}>
            <div style={{...card, padding: '44px 48px'}}>
              <div style={{fontFamily, fontWeight: 800, fontSize: 52, color: ACCENT}}>תזכורת אוטומטית</div>
              <div style={{fontFamily, fontWeight: 600, fontSize: 56, lineHeight: 1.3, color: '#e6f6f3', background: 'rgba(255,255,255,.06)', borderRadius: 28, padding: '24px 30px', marginTop: 24}}>תזכורת: מחר ב-10:30</div>
              <div style={{position: 'relative', marginTop: 28, fontFamily, fontWeight: 800, fontSize: 50, textAlign: 'center', padding: '26px 30px', borderRadius: 999, border: `2px solid ${ACCENT}`, color: interpolateColors(conf, [0, 1], [ACCENT, '#04100f']), background: interpolateColors(conf, [0, 1], [ACCENT + '00', ACCENT + 'ff']), transform: `scale(${1 - 0.06 * press})`, boxShadow: `0 0 ${50 * conf}px ${ACCENT}88`}}>
                <span style={{opacity: 1 - conf}}>אישור הגעה</span>
                <span style={{opacity: conf, position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)'}}>הגעה אושרה ✓</span>
              </div>
              <div style={{fontFamily, fontWeight: 500, fontSize: 30, color: '#6f908b', marginTop: 14}}>נתוני דמו</div>
            </div>
          </div>
        </Fade>
        <Caption f={f} text="המועד מוצע לממתין הראשון" a={112} b={236} />
        <Caption f={f} text="והלקוח מאשר הגעה בלחיצה" a={266} b={338} />
        <Outro f={f} start={348} line="פחות הודעות. יותר תורים." />
      </>
    );
  }}</Shell>
);

// ---------------------------------------------------------------- Reel 3: the real booking flow + owner calendar
export const ReelBookingFlow: React.FC = () => (
  <Shell outroStart={346}>{(f) => {
    const H = 1230;
    const sh = H - 2 * H * 0.016, sw = (sh * SHOT_W) / SHOT_H;
    const monIn = prog(f, 232, 268);
    const swap = (a: number) => ({opacity: prog(f, a, a + 20), transform: `translateX(${(1 - prog(f, a, a + 20)) * -50}px)`});
    return (
      <>
        <Hook f={f} l1="לקבוע תור" l2="בלי להתקשר." />
        <Fade f={f} a={60} b={92} c={222} d={256}>
          <div style={{position: 'absolute', left: '50%', top: 130, transform: 'translateX(-50%)'}}>
            <Phone h={H} accent={ACCENT} glow={1 + 0.4 * Math.sin(Math.PI * prog(f, 160, 190))}>
              <Shot src="m-services.png" />
              <Shot src="m-date.png" style={swap(96)} />
              <Shot src="m-time.png" style={swap(142)} />
              <Shot src="m-confirm.png" style={{opacity: prog(f, 188, 208), transform: `scale(${lerp(1.04, 1, prog(f, 188, 208))})`}} />
              {[[80, 0.55, 0.33], [126, 0.63, 0.4], [172, 0.5, 0.5]].map(([t0, x, y]) => <Highlight key={t0} f={f} t0={t0 - 18} to={[sw * x, sh * y]} size={sw * 0.045} accent={ACCENT} />)}
              <Sheen f={f * 1.5} />
            </Phone>
          </div>
        </Fade>
        <Fade f={f} a={236} b={270} c={334} d={366}>
          <div style={{position: 'absolute', left: 40, right: 40, top: 640, transform: `translateY(${(1 - monIn) * 50}px)`}}>
            <div style={{borderRadius: 30, overflow: 'hidden', border: `2px solid ${ACCENT}88`, boxShadow: `0 0 70px ${ACCENT}44, 0 30px 80px rgba(0,0,0,.6)`, width: 1000, height: 562, position: 'relative'}}>
              <Shot src="d-week.png" style={{filter: 'brightness(1.15)'}} />
              <Sheen f={f * 1.5} strength={0.6} />
            </div>
            <div style={{...card, marginTop: 36, opacity: prog(f, 280, 306)}}>
              <div style={{fontFamily, fontWeight: 600, fontSize: 46, lineHeight: 1.3, color: '#e6f6f3'}}>יומן שבועי עם תפוסה ושעות פנויות</div>
              <div style={{fontFamily, fontWeight: 500, fontSize: 30, color: '#6f908b', marginTop: 10}}>נתוני דמו</div>
            </div>
          </div>
        </Fade>
        <Caption f={f} text="הלקוח רואה רק שעות פנויות" a={108} b={216} />
        <Caption f={f} text="ובצד העסק, התור כבר ביומן" a={270} b={338} />
        <Outro f={f} start={348} line="ניהול יומן ותורים" />
      </>
    );
  }}</Shell>
);
