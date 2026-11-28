import React from 'react';
import {AbsoluteFill, Img, interpolate, interpolateColors, staticFile} from 'remotion';
import {Background, Phone, Sheen, Shot, SHOT_H, SHOT_W, fontFamily} from './Promo';
import {lerp, prog} from './lib/motion';

/** Three vertical Reels for Tori (1080x1920 @30, 15 s). Labels come from the product's own he.json; invented numbers none. */
const W = 1080, H = 1920, ACC = '#4fd1bb', BG = '#050d0e', BAD = '#ff7a8a', AMBER = '#ffc15e';
export const REEL_FRAMES = 450;
type Cap = {t: string; a: number; b: number};
const card: React.CSSProperties = {direction: 'rtl', borderRadius: 38, padding: '34px 42px', background: 'linear-gradient(135deg, rgba(10,32,34,.94), rgba(5,16,18,.94))', boxShadow: '0 24px 60px rgba(0,0,0,.55)', border: `2px solid ${ACC}55`};

const Shell: React.FC<{f: number; hook: [string, string]; caps: Cap[]; children: React.ReactNode}> = ({f, hook, caps, children}) => {
  const l1 = prog(f, 2, 18), l2 = prog(f, 16, 32), hOut = prog(f, 56, 76);
  const outro = prog(f, 360, 400);
  const line = (t: string, u: number, c: string) => <div style={{direction: 'rtl', fontFamily, fontWeight: 800, fontSize: 126, lineHeight: 1.18, color: c, opacity: u, transform: `translateY(${(1 - u) * 40}px)`, textShadow: c === ACC ? `0 0 60px ${ACC}99` : 'none'}}>{t}</div>;
  return (
    <AbsoluteFill style={{fontFamily}}>
      <Background accent={ACC} bg={BG} f={f * 1.3} />
      {f < 80 && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - hOut, transform: `scale(${1 + f * 0.0004})`}}><div style={{textAlign: 'center'}}>{line(hook[0], l1, '#f2fffc')}{line(hook[1], l2, ACC)}</div></AbsoluteFill>}
      <SoftFade f={f} a={60} b={96} c={326} d={370}><AbsoluteFill style={{transform: `scale(${1 + Math.max(0, f - 60) * 0.00014}) translateY(${-Math.max(0, f - 60) * 0.06}px)`}}>{children}</AbsoluteFill></SoftFade>
      {caps.map(({t, a, b}) => {
        const o = interpolate(f, [a, a + 10, b - 10, b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        if (o <= 0) return null;
        return <div key={a} style={{position: 'absolute', left: 0, right: 0, top: H - 250, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - prog(f, a, a + 14)) * 12}px)`}}><div style={{direction: 'rtl', fontWeight: 700, fontSize: 54, lineHeight: 1.15, color: '#f2fffc', padding: '14px 38px', borderRadius: 999, background: 'rgba(4,14,15,.82)', border: `2px solid ${ACC}88`, boxShadow: `0 0 43px ${ACC}44`, maxWidth: W - 80, textAlign: 'center'}}>{t}</div></div>;
      })}
      {outro > 0.001 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', width: 1300, height: 1300, borderRadius: 999, background: `radial-gradient(circle, ${ACC}${Math.round(110 * outro).toString(16).padStart(2, '0')}, transparent 60%)`}} />
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: outro, transform: `translateY(${(1 - outro) * 24}px) scale(${lerp(0.94, 1, outro) + Math.max(0, f - 400) * 0.004})`}}>
            <Img src={staticFile('logo-icon.png')} style={{width: 400, height: 'auto', filter: `drop-shadow(0 0 36px ${ACC}cc)`}} />
            <div style={{marginTop: 24, fontWeight: 700, fontSize: 124, letterSpacing: 32, color: '#f2fffc', textShadow: `0 0 44px ${ACC}`, paddingLeft: 32}}>TORI</div>
            <div style={{marginTop: 10, direction: 'rtl', fontWeight: 700, fontSize: 58, color: ACC}}>ניהול יומן ותורים</div>
            <div style={{marginTop: 22, fontWeight: 500, fontSize: 40, color: '#9fc2bd', direction: 'ltr'}}>turim.d2ryf.com</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const SoftFade: React.FC<{f: number; a: number; b: number; c: number; d: number; children: React.ReactNode}> = ({f, a, b, c, d, children}) => {
  if (f < a || f > d) return null;
  return <AbsoluteFill style={{opacity: prog(f, a, b) * (1 - prog(f, c, d))}}>{children}</AbsoluteFill>;
};
const Highlight: React.FC<{f: number; t0: number; to: [number, number]; size: number; accent: string}> = ({f, t0, to, size, accent}) => {
  const grow = prog(f, t0 + 14, t0 + 30), fade = 1 - prog(f, t0 + 24, t0 + 44);
  if (grow <= 0.001 || fade <= 0.001) return null;
  const r = size * (1.2 + grow * 2.2);
  return <div style={{position: 'absolute', left: to[0], top: to[1], pointerEvents: 'none', opacity: fade}}><div style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: 999, background: `radial-gradient(circle, ${accent}66, ${accent}22 55%, transparent 72%)`}} /></div>;
};
const rise = (L: number, a: number): React.CSSProperties => {
  const u = prog(L, a, a + 28);
  return {opacity: u, transform: `translateY(${(1 - u) * 60}px) scale(${lerp(0.96, 1, u)})`, };
};

/** A: reminder, pain-first */
export const ToriReelReminder: React.FC<{f?: number}> = () => <ReelA />;
const ReelA: React.FC = () => {
  const f = useF();
  const L = f - 60;
  const rows: [string, string][] = [['היום', 'התור נקבע'], ['יום לפני', 'תזכורת במייל ללקוח'], ['בלחיצה אחת', 'אישור הגעה']];
  const confirmed = prog(L, 190, 222), press = prog(L, 176, 188) - prog(L, 194, 206);
  return (
    <Shell f={f} hook={['הלקוח שוכח', 'את התור?']} caps={[{t: 'תזכורת במייל יום לפני', a: 100, b: 200}, {t: 'אישור הגעה בלחיצה אחת', a: 210, b: 345}]}>
      <div style={{position: 'absolute', top: 430, left: 60, width: 960, display: 'flex', flexDirection: 'column', gap: 44, transform: 'scale(1.08)', transformOrigin: 'top center'}}>
        <div style={{...card, ...rise(L, 8)}}>
          <div style={{fontWeight: 800, fontSize: 46, color: ACC, marginBottom: 14}}>מהזמנה ועד הגעה</div>
          {rows.map(([a, b], i) => {
            const u = prog(L, 20 + i * 36, 50 + i * 36);
            return <div key={a} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '18px 0', opacity: u, transform: `translateX(${(1 - u) * 40}px)`, borderTop: i ? '1px solid rgba(255,255,255,.08)' : 'none'}}>
              <div style={{width: 26, height: 26, borderRadius: 99, background: ACC, boxShadow: `0 0 22px ${ACC}`, flex: '0 0 26px'}} />
              <div style={{fontWeight: 600, fontSize: 36, color: '#9fc2bd', width: 230}}>{a}</div>
              <div style={{fontWeight: 700, fontSize: 44, color: '#f2fffc', flex: 1}}>{b}</div>
            </div>;
          })}
        </div>
        <div style={{...card, ...rise(L, 120)}}>
          <div style={{fontWeight: 800, fontSize: 46, color: ACC}}>תזכורת אוטומטית</div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginTop: 18}}>
            <div style={{fontWeight: 600, fontSize: 44, lineHeight: 1.3, color: '#e6f6f3', background: 'rgba(255,255,255,.06)', borderRadius: 28, padding: '24px 28px', flex: 1}}>תזכורת: מחר ב-10:30</div>
            <div style={{position: 'relative', fontWeight: 800, fontSize: 38, padding: '24px 30px', borderRadius: 999, whiteSpace: 'nowrap', minWidth: 270, textAlign: 'center', color: interpolateColors(confirmed, [0, 1], [ACC, '#04100f']), background: interpolateColors(confirmed, [0, 1], [ACC + '00', ACC + 'ff']), border: `2px solid ${ACC}`, transform: `scale(${1 - 0.07 * press})`, boxShadow: `0 0 ${46 * confirmed}px ${ACC}88`}}>
              <span style={{opacity: 1 - confirmed, display: 'inline-block'}}>אישור הגעה</span>
              <span style={{opacity: confirmed, position: 'absolute', left: 0, right: 0, top: '50%', transform: `translateY(-50%) scale(${lerp(0.9, 1, confirmed)})`}}>הגעה אושרה ✓</span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

/** B: cancellation refilled by the waitlist */
const ReelB: React.FC = () => {
  const f = useF();
  const L = f - 60;
  const s2 = prog(L, 70, 100), s3 = prog(L, 170, 200);
  const col = s3 > 0 ? interpolateColors(s3, [0, 1], [AMBER, ACC]) : interpolateColors(s2, [0, 1], [BAD, AMBER]);
  const drain = 1 - prog(L, 100, 170);
  const crop = prog(L, 150, 190);
  return (
    <Shell f={f} hook={['ביטלו ברגע', 'האחרון?']} caps={[{t: 'מישהו מבטל תור', a: 96, b: 160}, {t: 'הצעה במייל לממתין הראשון', a: 168, b: 262}, {t: 'והמועד מתמלא', a: 270, b: 345}]}>
      <div style={{position: 'absolute', top: 400, left: 60, width: 960, display: 'flex', flexDirection: 'column', gap: 44, transform: 'scale(1.08)', transformOrigin: 'top center'}}>
        <div style={{...card, ...rise(L, 6)}}>
          <div style={{fontWeight: 800, fontSize: 46, color: ACC}}>רשימת המתנה</div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18}}>
            <div style={{fontWeight: 800, fontSize: 96, color: '#f2fffc', fontVariantNumeric: 'tabular-nums'}}>10:30</div>
            <div style={{position: 'relative', fontWeight: 800, fontSize: 42, borderRadius: 999, minWidth: 330, height: 92, color: col, border: `2px solid ${col}`, background: col + '22', boxShadow: `0 0 30px ${col}55`}}>
              {([['בוטל', 1 - s2], ['הוצע לממתין', s2 * (1 - s3)], ['נקבע', s3]] as [string, number][]).map(([t, o]) => <span key={t} style={{position: 'absolute', left: 0, right: 0, top: '50%', textAlign: 'center', opacity: o, transform: `translateY(calc(-50% + ${(1 - o) * 8}px))`}}>{t}</span>)}
            </div>
          </div>
          <div style={{marginTop: 26, opacity: prog(L, 90, 110) * (1 - s3)}}>
            <div style={{fontWeight: 500, fontSize: 34, color: '#9fc2bd', marginBottom: 12}}>זמן מוגדר לאישור</div>
            <div style={{height: 24, borderRadius: 99, background: 'rgba(255,255,255,.08)', overflow: 'hidden'}}><div style={{width: `${drain * 100}%`, height: '100%', background: AMBER, borderRadius: 99}} /></div>
          </div>
        </div>
        <div style={{...card, padding: 0, overflow: 'hidden', opacity: crop, transform: `translateY(${(1 - crop) * 50}px)`}}>
          <div style={{position: 'relative', width: 960, height: 400, overflow: 'hidden', direction: 'ltr'}}>
            <Img src={staticFile('shots/d-details.png')} style={{position: 'absolute', width: 1920 * 1.9, left: -148 * 1.9, top: -872 * 1.9, filter: 'brightness(1.6) contrast(1.05)'}} />
          </div>
        </div>
        <div style={{fontWeight: 500, fontSize: 28, color: '#6f908b', direction: 'rtl', opacity: crop, textAlign: 'center'}}>צילום מסך אמיתי · נתוני דמו</div>
      </div>
    </Shell>
  );
};

/** C: customers book alone, real mobile screens */
const ReelC: React.FC = () => {
  const f = useF();
  const L = f - 60;
  const phoneH = 1480, b = phoneH * 0.016, sh = phoneH - 2 * b, sw = (sh * SHOT_W) / SHOT_H;
  const st = (a: number) => ({opacity: prog(L, a, a + 22), transform: `translateX(${(1 - prog(L, a, a + 22)) * -50}px)`});
  const rot = lerp(-12, -4, prog(L, 0, 260));
  return (
    <Shell f={f} hook={['בלי אפליקציה.', 'בלי סיסמה.']} caps={[{t: 'הלקוח בוחר שירות ויום', a: 96, b: 170}, {t: 'רואה רק שעות פנויות', a: 178, b: 250}, {t: 'ומקבל אישור מיידי', a: 258, b: 345}]}>
      <AbsoluteFill style={{perspective: 2600}}>
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translateY(${-90 + Math.sin(L / 30) * 6}px) rotateY(${rot}deg) rotateX(3deg) scale(${lerp(0.94, 1, prog(L, 0, 30))})`}}>
          <Phone h={phoneH} accent={ACC} glow={1.2}>
            <Shot src="m-services.png" />
            <Shot src="m-date.png" opacity={prog(L, 50, 86)} style={{transform: `translateX(${(1 - prog(L, 50, 86)) * -50}px)`}} />
            <Shot src="m-time.png" opacity={prog(L, 130, 166)} style={{transform: `translateX(${(1 - prog(L, 130, 166)) * -50}px)`}} />
            <Shot src="m-confirm.png" opacity={prog(L, 210, 248)} style={{transform: `scale(${lerp(1.04, 1, prog(L, 210, 248))})`}} />
            {[[36, 0.55, 0.33], [114, 0.63, 0.4], [194, 0.5, 0.4977]].map(([t0, x, y]) => <Highlight key={t0} f={L} t0={t0 - 10} to={[sw * x, sh * y]} size={sw * 0.045} accent={ACC} />)}
            <Sheen f={L * 1.5} />
          </Phone>
        </div>
      </AbsoluteFill>
      {void st}
    </Shell>
  );
};

import {useCurrentFrame} from 'remotion';
const useF = () => useCurrentFrame();
export const ToriReelA = ReelA, ToriReelB = ReelB, ToriReelC = ReelC;
