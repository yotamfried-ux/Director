import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, interpolateColors, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Background, Monitor, Phone, Sheen, Shot, SHOT_H, SHOT_W, ease, fontFamily, lerp} from './Promo';

const soft = Easing.bezier(0.45, 0, 0.2, 1);
const prog = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: soft});

const Panel: React.FC<{w: number; ratio: number; accent: string; a: string; b: string; t: number; pulse: number}> = ({w, ratio, accent, a, b, t, pulse}) => (
  <div style={{position: 'relative', width: w, height: w / ratio, borderRadius: 26, overflow: 'hidden', background: '#0b1213', border: `2px solid ${accent}${Math.round(60 + 120 * pulse).toString(16).padStart(2, '0')}`, boxShadow: `0 0 ${50 + 70 * pulse}px ${accent}${Math.round(40 + 60 * pulse).toString(16).padStart(2, '0')}, 0 30px 80px rgba(0,0,0,.6)`}}>
    <Shot src={a} style={{filter: 'brightness(1.15)'}} />
    <Shot src={b} opacity={t} style={{filter: 'brightness(1.15)'}} />
    <Sheen f={0} strength={0.5} />
  </div>
);



const Finger: React.FC<{f: number; t0: number; to: [number, number]; size: number; accent: string; from?: [number, number]}> = ({f, t0, to, size, accent}) => {
  // soft in-place highlight on the pressed element: no cursor, no travel
  const grow = prog(f, t0 + 14, t0 + 30);
  const fade = 1 - prog(f, t0 + 24, t0 + 44);
  if (grow <= 0.001 || fade <= 0.001) return null;
  const r = size * (1.2 + grow * 2.2);
  return (
    <div style={{position: 'absolute', left: to[0], top: to[1], pointerEvents: 'none', opacity: fade}}>
      <div style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: 999, background: `radial-gradient(circle, ${accent}66, ${accent}22 55%, transparent 72%)`, filter: 'blur(2px)'}} />
    </div>
  );
};

const BAD = '#ff7a8a', AMBER = '#ffc15e';
const R = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const card: React.CSSProperties = {direction: 'rtl', borderRadius: 38, padding: '34px 42px', background: 'linear-gradient(135deg, rgba(10,32,34,.94), rgba(5,16,18,.94))', boxShadow: '0 24px 60px rgba(0,0,0,.55)'};
const SceneTitle: React.FC<{text: string; accent: string; u: number}> = ({text, accent, u}) => (
  <div style={{direction: 'rtl', fontFamily, fontWeight: 800, fontSize: 44, color: accent, letterSpacing: 1, opacity: u, transform: `translateY(${(1 - u) * 20}px)`, marginBottom: 6}}>{text}</div>
);

const AutoScene: React.FC<{f: number; accent: string}> = ({f, accent}) => {
  const L = f - 330; // local frame
  const inn = prog(f, 328, 360), out = prog(f, 490, 516);
  const cardIn = (i: number) => prog(L, 8 + i * 38, 40 + i * 38);
  const wrap = (i: number): React.CSSProperties => {
    const u = cardIn(i);
    return {...card, position: 'relative', opacity: u, transform: `translateY(${(1 - u) * 70}px) scale(${lerp(0.96, 1, u)})`, filter: `blur(${(1 - u) * 6}px)`, border: `2px solid ${accent}${Math.round(70 + 110 * Math.sin(Math.PI * prog(L, 8 + i * 38, 84 + i * 38))).toString(16).padStart(2, '0')}`};
  };
  const press = prog(L, 54, 64) - prog(L, 68, 82);
  const confirmed = prog(L, 62, 86);
  // waitlist status: cancelled -> offered -> booked
  const s2 = prog(L, 92, 116), s3 = prog(L, 120, 144);
  const statusCol = s3 > 0 ? interpolateColors(s3, [0, 1], [AMBER, accent]) : interpolateColors(s2, [0, 1], [BAD, AMBER]);
  const tog = (a: number) => prog(L, a, a + 22);
  const rows = ['זמן ביטול מותר ללקוח', 'אישור ידני לתור חדש', 'חסימה אחרי אי-הגעות חוזרות'];
  return (
    <AbsoluteFill style={{alignItems: 'center', opacity: inn * (1 - out), transform: `scale(${lerp(1.03, 1, inn)})`, filter: `blur(${(1 - inn) * 8 + out * 8}px)`}}>
      <div style={{position: 'absolute', top: 270, width: 960, display: 'flex', flexDirection: 'column', gap: 42, transform: 'scale(1.1)', transformOrigin: 'top center'}}>
        <div style={wrap(0)}>
          <SceneTitle text="תזכורת אוטומטית" accent={accent} u={1} />
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginTop: 14}}>
            <div style={{fontFamily, fontWeight: 600, fontSize: 42, lineHeight: 1.3, color: '#e6f6f3', background: 'rgba(255,255,255,.06)', borderRadius: 28, padding: '22px 28px', flex: 1}}>תזכורת: מחר ב-10:30</div>
            <div style={{position: 'relative', fontFamily, fontWeight: 800, fontSize: 38, padding: '22px 30px', borderRadius: 999, whiteSpace: 'nowrap', minWidth: 250, textAlign: 'center', color: interpolateColors(confirmed, [0, 1], [accent, '#04100f']), background: interpolateColors(confirmed, [0, 1], [accent + '00', accent + 'ff']), border: `2px solid ${accent}`, transform: `scale(${1 - 0.07 * press})`, boxShadow: `0 0 ${46 * confirmed}px ${accent}88`}}>
              <span style={{opacity: 1 - confirmed, display: 'inline-block'}}>אישור הגעה</span>
              <span style={{opacity: confirmed, position: 'absolute', left: 0, right: 0, top: '50%', transform: `translateY(-50%) scale(${lerp(0.9, 1, confirmed)})`}}>הגעה אושרה ✓</span>
            </div>
          </div>
          <div style={{position: 'absolute', inset: 0}}><Finger f={L} t0={38} to={[190, 128]} size={26} accent={accent} from={[330, 210]} /></div>
        </div>
        <div style={wrap(1)}>
          <SceneTitle text="רשימת המתנה" accent={accent} u={1} />
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14}}>
            <div style={{fontFamily, fontWeight: 800, fontSize: 64, color: '#f2fffc', fontVariantNumeric: 'tabular-nums'}}>10:30</div>
            <div style={{position: 'relative', fontFamily, fontWeight: 800, fontSize: 40, borderRadius: 999, minWidth: 270, height: 80, color: statusCol, border: `2px solid ${statusCol}`, background: statusCol + '22', boxShadow: `0 0 30px ${statusCol}55`}}>
              {[['בוטל', 1 - s2], ['הוצע לממתין', s2 * (1 - s3)], ['נקבע', s3]].map(([t, o]) => <span key={t as string} style={{position: 'absolute', left: 0, right: 0, top: '50%', textAlign: 'center', opacity: o as number, transform: `translateY(calc(-50% + ${(1 - (o as number)) * 8}px))`}}>{t}</span>)}
            </div>
          </div>
          <div style={{fontFamily, fontWeight: 500, fontSize: 36, color: '#9fc2bd', marginTop: 12}}>המועד מוצע אוטומטית לממתין הראשון</div>
        </div>
        <div style={wrap(2)}>
          <SceneTitle text="אתם קובעים את הכללים" accent={accent} u={1} />
          {rows.map((r, i) => {
            const k = tog(118 + i * 12);
            return (
              <div key={r} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: i ? '1px solid rgba(255,255,255,.08)' : 'none', marginTop: i ? 0 : 10}}>
                <div style={{fontFamily, fontWeight: 600, fontSize: 40, color: '#e6f6f3'}}>{r}</div>
                <div style={{width: 96, height: 52, borderRadius: 999, background: interpolateColors(k, [0, 1], ['rgba(255,255,255,0.14)', accent]), position: 'relative', flex: '0 0 96px', boxShadow: `0 0 ${24 * Math.sin(Math.PI * k)}px ${accent}99`}}>
                  <div style={{position: 'absolute', top: 6, right: 6 + 44 * k, width: 40, height: 40, borderRadius: 999, background: '#fff'}} />
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
const SERV: [string, number][] = [['תספורת גברים', 0.92], ['תספורת וזקן', 0.66], ['צבע', 0.38]];
const InsightScene: React.FC<{f: number; accent: string}> = ({f, accent}) => {
  const L = f - 494;
  const inn = prog(f, 496, 526), out = prog(f, 616, 642);
  const kpis: [string, number, (n: number) => string][] = [
    ['תורים', 128, (n) => String(Math.round(n))],
    ['הכנסות', 14200, (n) => '₪' + Math.round(n).toLocaleString('en-US')],
    ['אי-הגעות', 3, (n) => Math.round(n) + '%'],
    ['לקוחות חוזרים', 64, (n) => Math.round(n) + '%'],
  ];
  return (
    <AbsoluteFill style={{alignItems: 'center', opacity: inn * (1 - out), transform: `scale(${lerp(1.03, 1, inn)})`, filter: `blur(${(1 - inn) * 8 + out * 8}px)`}}>
      <div style={{position: 'absolute', top: 200, width: 960, direction: 'rtl', fontFamily, transform: 'scale(1.06)', transformOrigin: 'top center'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontWeight: 800, fontSize: 64, color: '#f2fffc'}}>דוחות</div>
          <div style={{display: 'flex', gap: 12}}>{['7 ימים', '30 ימים', '90 ימים'].map((c, i) => <div key={c} style={{fontWeight: 700, fontSize: 30, padding: '10px 22px', borderRadius: 999, color: i === 1 ? '#04100f' : '#9fc2bd', background: i === 1 ? accent : 'rgba(255,255,255,.08)'}}>{c}</div>)}</div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 28}}>
          {kpis.map(([label, v, fmt], i) => {
            const u = prog(L, 6 + i * 8, 30 + i * 8), n = prog(L, 14 + i * 8, 60 + i * 8);
            return (
              <div key={label} style={{...card, padding: '26px 32px', border: `2px solid ${accent}55`, opacity: u, transform: `translateY(${(1 - u) * 40}px)`}}>
                <div style={{fontWeight: 500, fontSize: 34, color: '#9fc2bd'}}>{label}</div>
                <div style={{fontWeight: 800, fontSize: 84, color: '#f2fffc', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1}}>{fmt(v * n)}</div>
              </div>
            );
          })}
        </div>
        <div style={{...card, marginTop: 22, padding: '28px 36px', border: `2px solid ${accent}55`, opacity: prog(L, 30, 52)}}>
          <div style={{fontWeight: 700, fontSize: 36, color: '#9fc2bd'}}>תורים לפי יום</div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 230, marginTop: 14, direction: 'ltr'}}>
            {DAYS.map((d, i) => <div key={i} style={{flex: 1, height: `${d * 10 * prog(L, 40 + i * 2, 72 + i * 2)}%`, borderRadius: 10, background: `linear-gradient(180deg, ${accent}, ${accent}55)`, boxShadow: `0 0 18px ${accent}44`}} />)}
          </div>
        </div>
        <div style={{...card, marginTop: 22, padding: '28px 36px', border: `2px solid ${accent}55`, opacity: prog(L, 56, 78)}}>
          <div style={{fontWeight: 700, fontSize: 36, color: '#9fc2bd', marginBottom: 12}}>לפי שירות</div>
          {SERV.map(([n, v], i) => (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 14}}>
              <div style={{fontWeight: 600, fontSize: 34, color: '#e6f6f3', width: 270}}>{n}</div>
              <div style={{flex: 1, height: 26, borderRadius: 999, background: 'rgba(255,255,255,.08)', overflow: 'hidden'}}><div style={{width: `${v * 100 * prog(L, 64 + i * 6, 96 + i * 6)}%`, height: '100%', borderRadius: 999, background: accent}} /></div>
            </div>
          ))}
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, opacity: prog(L, 84, 104)}}>
          <div style={{fontWeight: 700, fontSize: 34, padding: '14px 30px', borderRadius: 999, border: `2px solid ${accent}`, color: accent}}>ייצוא ל-Excel</div>
          <div style={{fontWeight: 500, fontSize: 28, color: '#6f908b'}}>נתוני דמו</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export type ShowcaseProps = {name: string; tagline: string; accent: string; bg: string; caps: {t: string; a: number; b: number}[]};

const SPEED = 1.12;
const ShowcaseMain: React.FC<ShowcaseProps> = ({name, tagline, accent, bg, caps}) => {
  const f = useCurrentFrame() / SPEED;
  const W = 1080, H = 1920;
  const float = Math.sin(f / 30) * 5;

  const intro = prog(f, 0, 16);
  const pull = prog(f, 232, 276);
  const monIn = prog(f, 238, 280);
  const monOut = prog(f, 316, 342);
  const panelIn = 0;
  const phoneOut = prog(f, 312, 336);
  const outro = prog(f, 630, 646);
  const logoIn = prog(f, 636, 658);
  const fadeOut = prog(f, 672, 682);
  const fadeIn = 1 - prog(f, 0, 8);

  const p1 = {h: 1500, x: 0, y: -60}, p3 = {h: 780, x: 270, y: 330}, m3 = {w: 1000, x: -20, y: -330};
  const phoneH = lerp(p1.h, p3.h, pull);
  const phoneX = lerp(p1.x, p3.x, pull) + phoneOut * 260;
  const phoneY = lerp(p1.y, p3.y, pull) + float;
  const rotY = lerp(lerp(-16, -5, prog(f, 0, 140)), -15, pull);
  const rotX = lerp(lerp(8, 2, prog(f, 0, 140)), 4, pull);
  const dolly = lerp(1, 1.04, prog(f, 0, 200));

  const sh = phoneH - 2 * phoneH * 0.016;
  const sw = (sh * SHOT_W) / SHOT_H;
  const tap = (t0: number, x: number, y: number) => {
    const t = (f - t0) / 22;
    if (t < 0 || t > 1.6) return null;
    const ring = (d: number) => {const u = Math.max(0, Math.min(1, (t - d) / 0.9)); return {r: 20 + u * sw * 0.2, o: (1 - u) * 0.9 * (t >= d ? 1 : 0)};};
    return (
      <div key={t0} style={{position: 'absolute', left: sw * x, top: sh * y}}>
        {[0, 0.28].map((d) => {const {r, o} = ring(d); return <div key={d} style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: 999, border: `${Math.max(2, sw * 0.008)}px solid ${accent}`, opacity: o, boxShadow: `0 0 ${sw * 0.05}px ${accent}`}} />;})}
        <div style={{position: 'absolute', left: -sw * 0.045, top: -sw * 0.045, width: sw * 0.09, height: sw * 0.09, borderRadius: 999, background: 'rgba(255,255,255,.35)', transform: `scale(${1 - 0.25 * Math.sin(Math.PI * Math.min(1, t * 1.6))})`, opacity: interpolate(t, [0, 0.15, 0.8, 1.1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
      </div>
    );
  };

  const capSize = 54;
  const caption = (text: string, a: number, b: number) => {
    const o = interpolate(f, [a, a + 10, b - 10, b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const y = interpolate(f, [a, a + 14], [12, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
    if (o <= 0) return null;
    return (
      <div key={a} style={{position: 'absolute', left: 0, right: 0, top: H - 250, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${y}px)`}}>
        <div style={{direction: 'rtl', fontFamily, fontWeight: 700, fontSize: capSize, lineHeight: 1.15, color: '#f2fffc', padding: `${capSize * 0.26}px ${capSize * 0.7}px`, borderRadius: 999, background: 'rgba(4,14,15,.8)', border: `2px solid ${accent}88`, boxShadow: `0 0 ${capSize * 0.8}px ${accent}44`, maxWidth: W - 80, textAlign: 'center'}}>{text}</div>
      </div>
    );
  };

  const monScale = lerp(0.84, 1, monIn);
  const monY = m3.y;
  const monX = lerp(m3.x - 120, m3.x, monIn);
  const monRotY = lerp(30, 14, monIn) - monOut * 10;
  const dOpacity = 1 - outro;
  const bright = {filter: 'brightness(1.2) contrast(1.05)'};

  return (
    <AbsoluteFill style={{fontFamily}}>
      <Background accent={accent} bg={bg} f={f * 1.3} />
      <AbsoluteFill style={{perspective: 2600, opacity: dOpacity, filter: `blur(${outro * 10}px)`, transform: `scale(${dolly * (1 - outro * 0.08)})`}}>
        {monIn > 0.001 && (
          <div style={{position: 'absolute', left: '50%', top: '50%', opacity: monIn * (1 - monOut), transform: `translate(-50%,-50%) translate(${monX}px, ${monY + float * 0.6}px) rotateY(${monRotY}deg) rotateX(3deg) scale(${monScale})`}}>
            <Monitor w={m3.w} accent={accent}>
              <Shot src="d-week.png" style={bright} />
              <Sheen f={f * 1.5} strength={0.7} />
            </Monitor>
          </div>
        )}

        <div style={{position: 'absolute', left: '50%', top: '50%', opacity: intro * (1 - phoneOut), transform: `translate(-50%,-50%) translate(${phoneX}px, ${phoneY}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${lerp(0.92, 1, intro)})`}}>
          <Phone h={phoneH} accent={accent} glow={1 + 0.4 * Math.sin(Math.PI * prog(f, 134, 154))}>
            <Shot src="m-services.png" />
            <Shot src="m-date.png" opacity={prog(f, 34, 54)} style={{transform: `translateX(${(1 - prog(f, 34, 54)) * -50}px)`}} />
            <Shot src="m-time.png" opacity={prog(f, 80, 100)} style={{transform: `translateX(${(1 - prog(f, 80, 100)) * -50}px)`}} />
            <Shot src="m-confirm.png" opacity={prog(f, 134, 154)} style={{transform: `scale(${lerp(1.04, 1, prog(f, 134, 154))})`}} />
            <Shot src="m-owner.png" opacity={prog(f, 168, 192)} style={{transform: `translateX(${(1 - prog(f, 168, 192)) * -50}px)`}} />
            {[[24, 0.55, 0.33], [56, 0.63, 0.4], [70, 0.15, 0.96], [98, 0.5, 0.4977], [122, 0.15, 0.957]].map(([t0, x, y]) => <Finger key={t0} f={f} t0={t0 - 18} to={[sw * x, sh * y]} size={sw * 0.045} accent={accent} />)}
            <div style={{position: 'absolute', top: '-10%', bottom: '-10%', width: '40%', left: `${lerp(-60, 130, prog(f, 134, 160))}%`, transform: 'skewX(-14deg)', background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`, mixBlendMode: 'screen', opacity: Math.sin(Math.PI * prog(f, 134, 160))}} />
            <Sheen f={f * 1.5} />
          </Phone>
        </div>
      </AbsoluteFill>

      {f >= 322 && f < 650 && <AbsoluteFill style={{opacity: dOpacity}}><AutoScene f={f} accent={accent} /><InsightScene f={f} accent={accent} /></AbsoluteFill>}
      <AbsoluteFill style={{opacity: dOpacity}}>{caps.map((c) => caption(c.t, c.a, c.b))}</AbsoluteFill>

      {outro > 0.001 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', width: 1300, height: 1300, borderRadius: 999, background: `radial-gradient(circle, ${accent}${Math.round(110 * logoIn).toString(16).padStart(2, '0')}, transparent 60%)`}} />
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.22 * Math.sin(Math.PI * prog(f, 630, 652))}), transparent 55%)`, mixBlendMode: 'screen'}} />
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: logoIn, transform: `translateY(${(1 - logoIn) * 24}px) scale(${lerp(0.94, 1, logoIn)})`}}>
            <Img src={staticFile('logo-icon.png')} style={{width: 440, height: 'auto', filter: `drop-shadow(0 0 36px ${accent}cc)`}} />
            <div style={{marginTop: 26, fontWeight: 700, fontSize: 132, letterSpacing: 35, color: '#f2fffc', textShadow: `0 0 44px ${accent}`, paddingLeft: 35}}>{name}</div>
            <div style={{marginTop: 12, direction: 'rtl', fontWeight: 700, fontSize: 58, color: accent}}>{tagline}</div>
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: bg, opacity: Math.max(fadeOut, fadeIn)}} />
    </AbsoluteFill>
  );
};

const HOOK = 54;
const Hook: React.FC<ShowcaseProps> = ({accent, bg}) => {
  const f = useCurrentFrame();
  const l1 = prog(f, 2, 18), l2 = prog(f, 16, 32), out = prog(f, HOOK - 12, HOOK);
  const line = (text: string, u: number, color: string) => (
    <div style={{direction: 'rtl', fontFamily, fontWeight: 800, fontSize: 138, lineHeight: 1.15, color, opacity: u, transform: `translateY(${(1 - u) * 40}px)`, textShadow: color === accent ? `0 0 60px ${accent}99` : 'none'}}>{text}</div>
  );
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out}}>
      <Background accent={accent} bg={bg} f={f * 1.3} />
      <div style={{position: 'relative', textAlign: 'center'}}>{line('פחות הודעות.', l1, '#f2fffc')}{line('יותר תורים.', l2, accent)}</div>
    </AbsoluteFill>
  );
};

export const Showcase: React.FC<ShowcaseProps> = (props) => (
  <AbsoluteFill>
    <Sequence from={HOOK}><ShowcaseMain {...props} /></Sequence>
    <Sequence durationInFrames={HOOK}><Hook {...props} /></Sequence>
  </AbsoluteFill>
);
