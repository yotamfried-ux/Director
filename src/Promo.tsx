import React from 'react';
import {AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// ---------- fonts (bundled locally, no network at render time) ----------
export const fontFamily = 'HeeboLocal';
const faces: [string, string, string][] = [
  ['hebrew', '400', 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F'],
  ['hebrew', '700', 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F'],
  ['latin', '400', 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122'],
  ['latin', '700', 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122'],
];
const fontHandle = delayRender('fonts');
Promise.all(
  faces.map(([subset, weight, range]) =>
    new FontFace(fontFamily, `url(${staticFile(`fonts/heebo-${subset}-${weight}-normal.woff2`)})`, {weight, unicodeRange: range})
      .load()
      .then((f) => document.fonts.add(f)),
  ),
).then(() => continueRender(fontHandle));

export type PromoProps = {name: string; tagline: string; accent: string; bg: string; cap1: string; cap2: string; cap3: string};

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const prog = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Layout = {kind: 'land' | 'port' | 'sq'; k: number; p1: {h: number; x: number; y: number}; p3: {h: number; x: number; y: number}; m3: {w: number; x: number; y: number}; capY: number; capSize: number; logoW: number};
const getLayout = (w: number, h: number): Layout => {
  if (h > w * 1.2) return {kind: 'port', k: 1.25, p1: {h: 1500, x: 0, y: -60}, p3: {h: 780, x: 270, y: 310}, m3: {w: 1000, x: -20, y: -330}, capY: h - 230, capSize: 54, logoW: 440};
  if (Math.abs(w - h) < 80) return {kind: 'sq', k: 1, p1: {h: 900, x: 0, y: -30}, p3: {h: 520, x: 300, y: 150}, m3: {w: 700, x: -150, y: -90}, capY: h - 105, capSize: 38, logoW: 330};
  return {kind: 'land', k: 1, p1: {h: 840, x: 0, y: -40}, p3: {h: 700, x: 600, y: 50}, m3: {w: 1060, x: -310, y: -40}, capY: h - 140, capSize: 46, logoW: 360};
};

// ---------- devices ----------
export const SHOT_W = 1170, SHOT_H = 2532;

export const Phone: React.FC<{h: number; accent: string; children: React.ReactNode; glow?: number}> = ({h, accent, children, glow = 1}) => {
  const b = h * 0.016;
  const sh = h - 2 * b;
  const sw = (sh * SHOT_W) / SHOT_H;
  const pw = sw + 2 * b;
  const r = pw * 0.16;
  return (
    <div style={{position: 'relative', width: pw, height: h}}>
      <div style={{position: 'absolute', inset: -h * 0.02, borderRadius: r * 1.2, boxShadow: `0 0 ${h * 0.09}px ${accent}${Math.round(70 * glow).toString(16).padStart(2, '0')}, 0 ${h * 0.05}px ${h * 0.12}px rgba(0,0,0,.6)`}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: r, background: 'linear-gradient(145deg,#1b2a2c 0%,#050909 40%,#0d1718 100%)', border: `1.5px solid ${accent}55`}} />
      <div style={{position: 'absolute', left: b, top: b, width: sw, height: sh, borderRadius: r - b, overflow: 'hidden', background: '#0b1213'}}>{children}</div>
      <div style={{position: 'absolute', left: '50%', top: b + sh * 0.012, transform: 'translateX(-50%)', width: pw * 0.28, height: sh * 0.014, borderRadius: 99, background: '#000'}} />
      <div style={{position: 'absolute', right: -2, top: h * 0.2, width: 3, height: h * 0.07, borderRadius: 2, background: '#223234'}} />
    </div>
  );
};

export const Monitor: React.FC<{w: number; accent: string; children: React.ReactNode}> = ({w, accent, children}) => {
  const b = w * 0.012;
  const sw = w - 2 * b;
  const sh = (sw * 9) / 16;
  const outerH = sh + 2 * b;
  const chin = w * 0.05;
  return (
    <div style={{position: 'relative', width: w, height: outerH + chin + w * 0.17}}>
      <div style={{position: 'absolute', left: -w * 0.02, top: -w * 0.02, width: w * 1.04, height: outerH + chin + w * 0.04, borderRadius: w * 0.03, boxShadow: `0 0 ${w * 0.08}px ${accent}40, 0 ${w * 0.04}px ${w * 0.1}px rgba(0,0,0,.55)`}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: outerH + chin, borderRadius: w * 0.014, background: 'linear-gradient(160deg,#1d2c2e,#070c0d 55%,#111c1d)', border: `1.5px solid ${accent}44`}} />
      <div style={{position: 'absolute', left: b, top: b, width: sw, height: sh, borderRadius: w * 0.006, overflow: 'hidden', background: '#0b1213'}}>{children}</div>
      <div style={{position: 'absolute', left: '50%', top: outerH + chin - 2, transform: 'translateX(-50%)', width: w * 0.09, height: w * 0.12, background: 'linear-gradient(90deg,#0a1112,#233638 50%,#0a1112)', clipPath: 'polygon(18% 0,82% 0,100% 100%,0 100%)'}} />
      <div style={{position: 'absolute', left: '50%', top: outerH + chin + w * 0.115, transform: 'translateX(-50%)', width: w * 0.26, height: w * 0.018, borderRadius: 99, background: 'linear-gradient(90deg,#0a1112,#2b4144 50%,#0a1112)', boxShadow: `0 0 ${w * 0.05}px ${accent}55`}} />
    </div>
  );
};

export const Sheen: React.FC<{f: number; strength?: number}> = ({f, strength = 1}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,${0.10 * strength}) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 72%, rgba(255,255,255,${0.05 * strength}) 100%)`}} />
    <div style={{position: 'absolute', top: '-20%', bottom: '-20%', width: '22%', left: `${lerp(-30, 130, ((f % 240) / 240))}%`, transform: 'skewX(-18deg)', background: 'linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.07),rgba(255,255,255,0))'}} />
  </>
);

export const Shot: React.FC<{src: string; opacity?: number; style?: React.CSSProperties}> = ({src, opacity = 1, style}) => (
  <Img src={staticFile(`shots/${src}`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity, ...style}} />
);

// ---------- background ----------
export const Background: React.FC<{accent: string; bg: string; f: number}> = ({accent, bg, f}) => {
  const dots = Array.from({length: 36}, (_, i) => ({x: random(`x${i}`) * 100, y0: random(`y${i}`) * 100, s: 2 + random(`s${i}`) * 5, sp: 0.02 + random(`v${i}`) * 0.05, o: 0.15 + random(`o${i}`) * 0.4}));
  const drift = Math.sin(f / 60) * 30;
  return (
    <AbsoluteFill style={{background: bg}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at ${50 + drift / 6}% 42%, ${accent}38 0%, ${accent}14 32%, transparent 62%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 15% 90%, ${accent}18, transparent 45%)`}} />
      {dots.map((d, i) => (
        <div key={i} style={{position: 'absolute', left: `${d.x}%`, top: `${(d.y0 - f * d.sp * 3 + 200) % 110}%`, width: d.s, height: d.s, borderRadius: 99, background: accent, opacity: d.o, filter: 'blur(1px)'}} />
      ))}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.65) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- main ----------
export const Promo: React.FC<PromoProps> = ({name, tagline, accent, bg, cap1, cap2, cap3}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const L = getLayout(width, height);
  const float = Math.sin(f / 22) * 6 * L.k;

  // scene progress
  const intro = prog(f, 0, 26);
  const toConfirm = prog(f, 84, 104);
  const pull = prog(f, 112, 160);
  const monIn = prog(f, 120, 158);
  const toDetails = prog(f, 170, 184);
  const outro = prog(f, 204, 222);
  const logoIn = prog(f, 210, 236);

  // phone transform
  const phoneH = lerp(L.p1.h, L.p3.h, pull);
  const phoneX = lerp(L.p1.x, L.p3.x, pull);
  const phoneY = lerp(L.p1.y, L.p3.y, pull) + float;
  const rotY = lerp(lerp(-18, -6, prog(f, 0, 90)), -16, pull);
  const rotX = lerp(lerp(9, 3, prog(f, 0, 90)), 4, pull);
  const dolly = lerp(1, 1.05, prog(f, 0, 110));
  const pop = 1 + 0.03 * Math.sin(Math.PI * prog(f, 84, 104));
  const phoneScaleIn = lerp(0.9, 1, intro);

  // tap ripple on the 10:00 slot
  const tapT = (f - 34) / 26;
  const tapOn = tapT >= 0 && tapT <= 1.6;
  const sw = ((phoneH - 2 * phoneH * 0.016) * SHOT_W) / SHOT_H;
  const sh = phoneH - 2 * phoneH * 0.016;
  const ring = (delay: number) => {
    const t = Math.max(0, Math.min(1, (tapT - delay) / 0.9));
    return {r: 20 + t * sw * 0.22, o: (1 - t) * 0.9 * (tapT >= delay ? 1 : 0)};
  };

  // monitor
  const monOpacity = monIn;
  const monX = lerp(L.m3.x - 140 * L.k, L.m3.x, monIn);
  const monRotY = lerp(30, 14, monIn);
  const monScale = lerp(0.82, 1, monIn);

  // captions
  const caption = (text: string, a: number, b: number) => {
    const o = interpolate(f, [a, a + 8, b - 8, b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const y = interpolate(f, [a, a + 10], [14, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
    if (o <= 0) return null;
    return (
      <div key={text} style={{position: 'absolute', left: 0, right: 0, top: L.capY, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${y}px)`}}>
        <div style={{direction: 'rtl', fontFamily, fontWeight: 700, fontSize: L.capSize, lineHeight: 1.15, color: '#eafaf6', padding: `${L.capSize * 0.28}px ${L.capSize * 0.75}px`, borderRadius: 999, background: 'rgba(5,16,17,.62)', border: `1.5px solid ${accent}66`, boxShadow: `0 0 ${L.capSize}px ${accent}33`}}>{text}</div>
      </div>
    );
  };

  const devicesOpacity = 1 - outro;
  const devicesBlur = outro * 10;
  const devicesScale = 1 - outro * 0.08;

  return (
    <AbsoluteFill style={{fontFamily}}>
      <Background accent={accent} bg={bg} f={f} />

      {/* devices */}
      <AbsoluteFill style={{perspective: 2400 * L.k, opacity: devicesOpacity, filter: `blur(${devicesBlur}px)`, transform: `scale(${dolly * devicesScale})`}}>
        {/* monitor */}
        {monOpacity > 0.001 && (
          <div style={{position: 'absolute', left: '50%', top: '50%', opacity: monOpacity, transform: `translate(-50%,-50%) translate(${monX}px, ${L.m3.y + float * 0.6}px) rotateY(${monRotY}deg) rotateX(3deg) scale(${monScale})`}}>
            <Monitor w={L.m3.w} accent={accent}>
              <Shot src="desktop-week.png" style={{filter: 'brightness(1.25) contrast(1.05)'}} />
              <Shot src="desktop-details.png" opacity={toDetails} style={{filter: 'brightness(1.25) contrast(1.05)'}} />
              <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${accent}${Math.round(90 * Math.sin(Math.PI * prog(f, 168, 192))).toString(16).padStart(2, '0')}, transparent 60%)`, mixBlendMode: 'screen'}} />
              <Sheen f={f} strength={0.8} />
            </Monitor>
          </div>
        )}

        {/* phone */}
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${phoneX}px, ${phoneY}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${phoneScaleIn * pop})`, opacity: intro}}>
          <Phone h={phoneH} accent={accent} glow={1 + 0.4 * Math.sin(Math.PI * toConfirm)}>
            <Shot src="mobile-time.png" opacity={1 - toConfirm} />
            <Shot src="mobile-confirm.png" opacity={toConfirm} />
            {/* tap ripple */}
            {tapOn && (
              <div style={{position: 'absolute', left: sw * 0.5, top: sh * 0.4977}}>
                {[0, 0.28].map((d) => {
                  const {r, o} = ring(d);
                  return <div key={d} style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: 999, border: `${Math.max(2, sw * 0.008)}px solid ${accent}`, opacity: o, boxShadow: `0 0 ${sw * 0.05}px ${accent}`}} />;
                })}
                <div style={{position: 'absolute', left: -sw * 0.045, top: -sw * 0.045, width: sw * 0.09, height: sw * 0.09, borderRadius: 999, background: 'rgba(255,255,255,.35)', transform: `scale(${1 - 0.25 * Math.sin(Math.PI * Math.min(1, tapT * 1.6))})`, opacity: interpolate(tapT, [0, 0.15, 0.8, 1.1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
              </div>
            )}
            {/* light sweep on confirm */}
            <div style={{position: 'absolute', top: '-10%', bottom: '-10%', width: '40%', left: `${lerp(-60, 130, prog(f, 84, 112))}%`, transform: 'skewX(-14deg)', background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`, mixBlendMode: 'screen', opacity: Math.sin(Math.PI * prog(f, 84, 112))}} />
            <Sheen f={f} />
          </Phone>
        </div>
      </AbsoluteFill>

      {/* captions */}
      <AbsoluteFill style={{opacity: devicesOpacity}}>
        {caption(cap1, 8, 80)}
        {caption(cap2, 88, 124)}
        {caption(cap3, 150, 206)}
      </AbsoluteFill>

      {/* outro */}
      {outro > 0.001 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', width: L.logoW * 3, height: L.logoW * 3, borderRadius: 999, background: `radial-gradient(circle, ${accent}${Math.round(110 * logoIn).toString(16).padStart(2, '0')}, transparent 60%)`}} />
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.22 * Math.sin(Math.PI * prog(f, 204, 222))}), transparent 55%)`, mixBlendMode: 'screen'}} />
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: logoIn, transform: `translateY(${(1 - logoIn) * 24}px) scale(${lerp(0.94, 1, logoIn)})`}}>
            <Img src={staticFile('logo-icon.png')} style={{width: L.logoW, height: 'auto', filter: `drop-shadow(0 0 ${L.logoW * 0.08}px ${accent}cc)`}} />
            <div style={{marginTop: L.logoW * 0.06, fontWeight: 700, fontSize: L.logoW * 0.3, letterSpacing: `${L.logoW * 0.08}px`, color: '#f2fffc', textShadow: `0 0 ${L.logoW * 0.1}px ${accent}`, paddingLeft: L.logoW * 0.08}}>{name}</div>
            <div style={{marginTop: L.logoW * 0.03, direction: 'rtl', fontWeight: 400, fontSize: L.logoW * 0.13, color: accent}}>{tagline}</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
