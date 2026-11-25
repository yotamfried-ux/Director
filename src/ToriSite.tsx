import React from 'react';
import {AbsoluteFill, Img, interpolate, interpolateColors, staticFile, useCurrentFrame} from 'remotion';
import {Fade, Highlight, prog} from './lib/motion';
import {Background, Monitor, Phone, Sheen, Shot, SHOT_H, SHOT_W, ease, fontFamily, lerp} from './Promo';

// Tori — site video, LONG (project page). 1920x1080 @30, silent, he/en captions. See products/tori-script-long-v1.md
const BAD = '#ff7a8a', AMBER = '#ffc15e';

export type ToriSiteProps = {lang: 'he' | 'en'; accent: string; bg: string};

const TXT = {
  he: {
    hook1: 'פחות הודעות.', hook2: 'יותר תורים.',
    c1: 'הלקוח בוחר שירות ויום', c2: 'רואה רק שעות פנויות', c3: 'ומקבל אישור מיידי', c4: 'ובצד העסק, התור כבר ביומן',
    c5: 'תזכורות ורשימת המתנה, הכול אוטומטי', c6: 'אתם קובעים את הכללים', c7: 'ודוחות ברורים על מה שקורה בעסק',
    remT: 'תזכורת אוטומטית', rem: 'תזכורת: מחר ב-10:30', confirm: 'אישור הגעה', confirmed: 'הגעה אושרה ✓',
    waitT: 'רשימת המתנה', st: ['בוטל', 'הוצע לממתין', 'נקבע'], waitSub: 'המועד מוצע אוטומטית לממתין הראשון',
    rulesT: 'אתם קובעים את הכללים', rules: ['זמן ביטול מותר ללקוח', 'אישור ידני לתור חדש', 'חסימה אחרי אי-הגעות חוזרות'],
    reports: 'דוחות', ranges: ['7 ימים', '30 ימים', '90 ימים'], kpi: ['תורים', 'הכנסות', 'אי-הגעות', 'לקוחות חוזרים'],
    byDay: 'תורים לפי יום', byService: 'לפי שירות', serv: ['תספורת גברים', 'תספורת וזקן', 'צבע'], excel: 'ייצוא ל-Excel', demo: 'נתוני דמו',
    name: 'TORI', tagline: 'ניהול יומן ותורים',
  },
  en: {
    hook1: 'Fewer messages.', hook2: 'More bookings.',
    c1: 'Customers pick a service and day', c2: 'See only the free slots', c3: 'And get instant confirmation', c4: 'On your side, it is already in the calendar',
    c5: 'Reminders and a smart waitlist, automatic', c6: 'You set the rules', c7: 'Clear reports on how the business is doing',
    remT: 'Automatic reminder', rem: 'Reminder: tomorrow 10:30', confirm: 'Confirm arrival', confirmed: 'Arrival confirmed ✓',
    waitT: 'Waitlist', st: ['Cancelled', 'Offered', 'Booked'], waitSub: 'The slot is offered to the first person waiting',
    rulesT: 'You set the rules', rules: ['Cancellation window', 'Manual approval for new bookings', 'Block after repeated no-shows'],
    reports: 'Reports', ranges: ['7 days', '30 days', '90 days'], kpi: ['Appointments', 'Revenue', 'No-shows', 'Returning customers'],
    byDay: 'Appointments by day', byService: 'By service', serv: ['Men’s haircut', 'Haircut & beard', 'Colour'], excel: 'Export to Excel', demo: 'Demo data',
    name: 'TORI', tagline: 'Calendar & appointment management',
  },
};

const card = (rtl: boolean): React.CSSProperties => ({direction: rtl ? 'rtl' : 'ltr', borderRadius: 32, padding: '30px 38px', background: 'linear-gradient(135deg, rgba(10,32,34,.94), rgba(5,16,18,.94))', boxShadow: '0 24px 60px rgba(0,0,0,.55)'});

const AutoScene: React.FC<{f: number; accent: string; rtl: boolean; t: typeof TXT.he}> = ({f, accent, rtl, t}) => {
  const L = f - 590;
  const cardIn = (i: number) => prog(L, 20 + i * 44, 56 + i * 44);
  const wrap = (i: number): React.CSSProperties => {
    const u = cardIn(i);
    return {...card(rtl), width: 540, position: 'relative', opacity: u, transform: `translateY(${(1 - u) * 60}px) scale(${lerp(0.96, 1, u)})`, filter: `blur(${(1 - u) * 6}px)`, border: `2px solid ${accent}${Math.round(70 + 110 * Math.sin(Math.PI * prog(L, 20 + i * 44, 100 + i * 44))).toString(16).padStart(2, '0')}`};
  };
  const press = prog(L, 84, 96) - prog(L, 100, 116);
  const confirmed = prog(L, 92, 120);
  const s2 = prog(L, 150, 178), s3 = prog(L, 190, 218);
  const statusCol = s3 > 0 ? interpolateColors(s3, [0, 1], [AMBER, accent]) : interpolateColors(s2, [0, 1], [BAD, AMBER]);
  const tog = (a: number) => prog(L, a, a + 24);
  const title = (s: string) => <div style={{fontFamily, fontWeight: 800, fontSize: 40, color: accent, marginBottom: 6}}>{s}</div>;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: 40, direction: rtl ? 'rtl' : 'ltr', marginTop: -90}}>
        <div style={wrap(0)}>
          {title(t.remT)}
          <div style={{fontFamily, fontWeight: 600, fontSize: 33, lineHeight: 1.3, whiteSpace: "nowrap", color: "#e6f6f3", background: 'rgba(255,255,255,.06)', borderRadius: 24, padding: '20px 24px', marginTop: 16}}>{t.rem}</div>
          <div style={{position: 'relative', marginTop: 26, fontFamily, fontWeight: 800, fontSize: 36, padding: '18px 24px', borderRadius: 999, textAlign: 'center', color: interpolateColors(confirmed, [0, 1], [accent, '#04100f']), background: interpolateColors(confirmed, [0, 1], [accent + '00', accent + 'ff']), border: `2px solid ${accent}`, transform: `scale(${1 - 0.06 * press})`, boxShadow: `0 0 ${42 * confirmed}px ${accent}88`, height: 76}}>
            <span style={{position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', opacity: 1 - confirmed}}>{t.confirm}</span>
            <span style={{position: 'absolute', left: 0, right: 0, top: '50%', transform: `translateY(-50%) scale(${lerp(0.92, 1, confirmed)})`, opacity: confirmed}}>{t.confirmed}</span>
          </div>
        </div>
        <div style={wrap(1)}>
          {title(t.waitT)}
          <div style={{fontFamily, fontWeight: 800, fontSize: 78, color: '#f2fffc', fontVariantNumeric: 'tabular-nums', marginTop: 10}}>10:30</div>
          <div style={{position: 'relative', marginTop: 14, fontFamily, fontWeight: 800, fontSize: 38, borderRadius: 999, height: 76, color: statusCol, border: `2px solid ${statusCol}`, background: statusCol + '22', boxShadow: `0 0 30px ${statusCol}55`}}>
            {([[t.st[0], 1 - s2], [t.st[1], s2 * (1 - s3)], [t.st[2], s3]] as [string, number][]).map(([s, o]) => <span key={s} style={{position: 'absolute', left: 0, right: 0, top: '50%', textAlign: 'center', opacity: o, transform: `translateY(calc(-50% + ${(1 - o) * 8}px))`}}>{s}</span>)}
          </div>
          <div style={{fontFamily, fontWeight: 500, fontSize: 30, color: '#9fc2bd', marginTop: 18}}>{t.waitSub}</div>
        </div>
        <div style={wrap(2)}>
          {title(t.rulesT)}
          {t.rules.map((r, i) => {
            const k = tog(240 + i * 14);
            return (
              <div key={r} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '16px 0', borderTop: i ? '1px solid rgba(255,255,255,.08)' : 'none', marginTop: i ? 0 : 8}}>
                <div style={{fontFamily, fontWeight: 600, fontSize: 31, color: '#e6f6f3', lineHeight: 1.2}}>{r}</div>
                <div style={{width: 84, height: 46, borderRadius: 999, background: interpolateColors(k, [0, 1], ['rgba(255,255,255,0.14)', accent]), position: 'relative', flex: '0 0 84px', boxShadow: `0 0 ${22 * Math.sin(Math.PI * k)}px ${accent}99`}}>
                  <div style={{position: 'absolute', top: 5, [rtl ? 'right' : 'left']: 5 + 38 * k, width: 36, height: 36, borderRadius: 999, background: '#fff'} as React.CSSProperties} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DAYS = [5, 7, 6, 9, 8, 4, 2, 6, 8, 7, 10, 9, 5, 3];
const SERV_V = [0.92, 0.66, 0.38];
const InsightScene: React.FC<{f: number; accent: string; rtl: boolean; t: typeof TXT.he}> = ({f, accent, rtl, t}) => {
  const L = f - 940;
  const kv: [number, (n: number) => string][] = [[128, (n) => String(Math.round(n))], [14200, (n) => '₪' + Math.round(n).toLocaleString('en-US')], [3, (n) => Math.round(n) + '%'], [64, (n) => Math.round(n) + '%']];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 1500, direction: rtl ? 'rtl' : 'ltr', fontFamily, marginTop: -70}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontWeight: 800, fontSize: 60, color: '#f2fffc'}}>{t.reports}</div>
          <div style={{display: 'flex', gap: 12}}>{t.ranges.map((c, i) => <div key={c} style={{fontWeight: 700, fontSize: 28, padding: '10px 22px', borderRadius: 999, color: i === 1 ? '#04100f' : '#9fc2bd', background: i === 1 ? accent : 'rgba(255,255,255,.08)'}}>{c}</div>)}</div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 26}}>
          {kv.map(([v, fmt], i) => {
            const u = prog(L, 12 + i * 10, 44 + i * 10), n = prog(L, 24 + i * 10, 84 + i * 10);
            return (
              <div key={i} style={{...card(rtl), padding: '24px 30px', border: `2px solid ${accent}55`, opacity: u, transform: `translateY(${(1 - u) * 36}px)`}}>
                <div style={{fontWeight: 500, fontSize: 30, color: '#9fc2bd'}}>{t.kpi[i]}</div>
                <div style={{fontWeight: 800, fontSize: 78, color: '#f2fffc', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1}}>{fmt(v * n)}</div>
              </div>
            );
          })}
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, marginTop: 24}}>
          <div style={{...card(rtl), border: `2px solid ${accent}55`, opacity: prog(L, 50, 80)}}>
            <div style={{fontWeight: 700, fontSize: 32, color: '#9fc2bd'}}>{t.byDay}</div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 210, marginTop: 14, direction: 'ltr'}}>
              {DAYS.map((d, i) => <div key={i} style={{flex: 1, height: `${d * 10 * prog(L, 64 + i * 3, 104 + i * 3)}%`, borderRadius: 10, background: `linear-gradient(180deg, ${accent}, ${accent}55)`, boxShadow: `0 0 18px ${accent}44`}} />)}
            </div>
          </div>
          <div style={{...card(rtl), border: `2px solid ${accent}55`, opacity: prog(L, 70, 100)}}>
            <div style={{fontWeight: 700, fontSize: 32, color: '#9fc2bd', marginBottom: 6}}>{t.byService}</div>
            {t.serv.map((n, i) => (
              <div key={n} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
                <div style={{fontWeight: 600, fontSize: 30, color: '#e6f6f3', width: 230}}>{n}</div>
                <div style={{flex: 1, height: 24, borderRadius: 999, background: 'rgba(255,255,255,.08)', overflow: 'hidden', direction: 'ltr'}}><div style={{width: `${SERV_V[i] * 100 * prog(L, 84 + i * 8, 124 + i * 8)}%`, height: '100%', borderRadius: 999, background: accent}} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, opacity: prog(L, 110, 134)}}>
          <div style={{fontWeight: 700, fontSize: 32, padding: '12px 28px', borderRadius: 999, border: `2px solid ${accent}`, color: accent}}>{t.excel}</div>
          <div style={{fontWeight: 500, fontSize: 28, color: '#6f908b'}}>{t.demo}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ToriSiteLong: React.FC<ToriSiteProps> = ({lang, accent, bg}) => {
  const f = useCurrentFrame();
  const t = TXT[lang];
  const rtl = lang === 'he';
  const float = Math.sin(f / 30) * 5;

  // phone / monitor stage (dolly + pull)
  const phoneIn = prog(f, 78, 112);
  const pull = prog(f, 430, 480);
  const monIn = prog(f, 440, 490);
  const toDetails = prog(f, 520, 548);
  const stageOut = prog(f, 572, 606);
  const hookOut = prog(f, 78, 104);
  const outro = prog(f, 1140, 1170);
  const logoIn = prog(f, 1148, 1186);
  const fadeIn = 1 - prog(f, 0, 12);
  const fadeOut = prog(f, 1244, 1260);

  const p1 = {h: 860, x: 0, y: -75}, p3 = {h: 680, x: 640, y: -40}, m3 = {w: 1180, x: -260, y: 10};
  const phoneH = lerp(p1.h, p3.h, pull);
  const phoneX = lerp(p1.x, p3.x, pull);
  const phoneY = lerp(p1.y, p3.y, pull) + float;
  const rotY = lerp(lerp(-14, -5, prog(f, 78, 400)), -15, pull);
  const rotX = lerp(lerp(7, 2, prog(f, 78, 400)), 4, pull);
  const dolly = lerp(1, 1.05, prog(f, 78, 430));
  const sh = phoneH - 2 * phoneH * 0.016;
  const sw = (sh * SHOT_W) / SHOT_H;

  const caption = (text: string, a: number, b: number) => {
    const o = interpolate(f, [a, a + 14, b - 14, b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const y = interpolate(f, [a, a + 18], [12, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
    if (o <= 0) return null;
    return (
      <div key={a} style={{position: 'absolute', left: 0, right: 0, top: 1080 - 138, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${y}px)`}}>
        <div style={{direction: rtl ? 'rtl' : 'ltr', fontFamily, fontWeight: 700, fontSize: 54, lineHeight: 1.15, color: '#f2fffc', padding: '14px 40px', borderRadius: 999, background: 'rgba(4,14,15,.8)', border: `2px solid ${accent}88`, boxShadow: `0 0 40px ${accent}44`}}>{text}</div>
      </div>
    );
  };

  const stage = f >= 70 && f < 610;
  const bright = {filter: 'brightness(1.25) contrast(1.06)'};
  const sCrossA = prog(f, 150, 176), sCrossB = prog(f, 240, 266), sCrossC = prog(f, 330, 356);
  const slide = (u: number) => ({transform: `translateX(${(1 - u) * -50}px)`});

  return (
    <AbsoluteFill style={{fontFamily}}>
      <Background accent={accent} bg={bg} f={f * 1.2} />

      {f < 110 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - hookOut, filter: `blur(${hookOut * 10}px)`}}>
          <div style={{textAlign: 'center', direction: rtl ? 'rtl' : 'ltr'}}>
            {[[t.hook1, prog(f, 6, 30), '#f2fffc'], [t.hook2, prog(f, 26, 50), accent]].map(([s, u, col]) => (
              <div key={s as string} style={{fontFamily, fontWeight: 800, fontSize: 132, lineHeight: 1.15, color: col as string, opacity: u as number, transform: `translateY(${(1 - (u as number)) * 36}px)`, textShadow: col === accent ? `0 0 60px ${accent}99` : 'none'}}>{s as string}</div>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {stage && (
        <AbsoluteFill style={{perspective: 2600, opacity: (1 - stageOut) * phoneIn, filter: `blur(${stageOut * 10}px)`, transform: `scale(${dolly})`}}>
          {monIn > 0.001 && (
            <div style={{position: 'absolute', left: '50%', top: '50%', opacity: monIn, transform: `translate(-50%,-50%) translate(${lerp(m3.x - 120, m3.x, monIn)}px, ${m3.y + float * 0.6}px) rotateY(${lerp(30, 12, monIn)}deg) rotateX(3deg) scale(${lerp(0.84, 1, monIn)})`}}>
              <Monitor w={m3.w} accent={accent}>
                <Shot src="d-week.png" style={bright} />
                <Shot src="d-details.png" opacity={toDetails} style={bright} />
                <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${accent}${Math.round(80 * Math.sin(Math.PI * prog(f, 512, 560))).toString(16).padStart(2, '0')}, transparent 60%)`, mixBlendMode: 'screen'}} />
                <Sheen f={f * 1.5} strength={0.8} />
              </Monitor>
            </div>
          )}
          <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${phoneX}px, ${phoneY}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${lerp(0.92, 1, phoneIn)})`}}>
            <Phone h={phoneH} accent={accent} glow={1 + 0.4 * Math.sin(Math.PI * prog(f, 330, 380))}>
              <Shot src="m-services.png" />
              <Shot src="m-date.png" opacity={sCrossA} style={slide(sCrossA)} />
              <Shot src="m-time.png" opacity={sCrossB} style={slide(sCrossB)} />
              <Shot src="m-confirm.png" opacity={sCrossC} style={{transform: `scale(${lerp(1.04, 1, sCrossC)})`}} />
              {[[0.55, 0.33, 120], [0.63, 0.4, 206], [0.5, 0.4977, 296]].map(([x, y, t0]) => <Highlight key={t0} f={f} t0={t0} to={[sw * x, sh * y]} size={sw * 0.045} accent={accent} />)}
              <div style={{position: 'absolute', top: '-10%', bottom: '-10%', width: '40%', left: `${lerp(-60, 130, prog(f, 330, 370))}%`, transform: 'skewX(-14deg)', background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`, mixBlendMode: 'screen', opacity: Math.sin(Math.PI * prog(f, 330, 370))}} />
              <Sheen f={f * 1.5} />
            </Phone>
          </div>
        </AbsoluteFill>
      )}

      <Fade f={f} a={578} b={612} c={934} d={966}><AutoScene f={f} accent={accent} rtl={rtl} t={t} /></Fade>
      <Fade f={f} a={940} b={974} c={1134} d={1166}><InsightScene f={f} accent={accent} rtl={rtl} t={t} /></Fade>

      <AbsoluteFill style={{opacity: 1 - outro}}>
        {caption(t.c1, 112, 236)}{caption(t.c2, 238, 336)}{caption(t.c3, 338, 450)}{caption(t.c4, 462, 600)}
        {caption(t.c5, 640, 800)}{caption(t.c6, 804, 936)}{caption(t.c7, 978, 1130)}
      </AbsoluteFill>

      {outro > 0.001 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', width: 1200, height: 1200, borderRadius: 999, background: `radial-gradient(circle, ${accent}${Math.round(110 * logoIn).toString(16).padStart(2, '0')}, transparent 60%)`}} />
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: logoIn, transform: `translateY(${(1 - logoIn) * 22}px) scale(${lerp(0.95, 1, logoIn)})`}}>
            <Img src={staticFile('logo-icon.png')} style={{width: 330, height: 'auto', filter: `drop-shadow(0 0 30px ${accent}cc)`}} />
            <div style={{marginTop: 18, fontWeight: 700, fontSize: 110, letterSpacing: 28, color: '#f2fffc', textShadow: `0 0 36px ${accent}`, paddingLeft: 28}}>{t.name}</div>
            <div style={{marginTop: 10, direction: rtl ? 'rtl' : 'ltr', fontWeight: 700, fontSize: 48, color: accent}}>{t.tagline}</div>
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: bg, opacity: Math.max(fadeOut, fadeIn)}} />
    </AbsoluteFill>
  );
};
