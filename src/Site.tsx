import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, Monitor, Phone, Sheen, Shot, SHOT_H, SHOT_W, ease, fontFamily, lerp} from './Promo';

// smooth in-out easing (no abrupt starts) for camera and crossfades
const soft = Easing.bezier(0.45, 0, 0.2, 1);
const prog = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: soft});

export type SiteProps = {lang: 'he' | 'en'; name: string; tagline: string; accent: string; bg: string; cap1: string; cap2: string; cap3: string; showText: boolean};

// Zoomed "site cut": 8s @30fps, smooth pacing, designed for a ~630px-wide card (everything is large).
export const Site: React.FC<SiteProps> = ({lang, name, tagline, accent, bg, cap1, cap2, cap3, showText}) => {
  const f = useCurrentFrame();
  const {height} = useVideoConfig();
  const float = Math.sin(f / 26) * 3;

  const intro = prog(f, 0, 16);
  const toConfirm = prog(f, 52, 72);
  const pull = prog(f, 92, 134);
  const monIn = prog(f, 100, 138);
  const toDetails = prog(f, 158, 178);
  const outro = prog(f, 200, 216);
  const logoIn = prog(f, 206, 230);
  const fadeOut = prog(f, 232, 240);
  const fadeIn = 1 - prog(f, 0, 8);

  const p1 = {h: 700, x: 0, y: -12}, p3 = {h: 560, x: 400, y: 70}, m3 = {w: 940, x: -150, y: -20};
  const phoneH = lerp(p1.h, p3.h, pull);
  const phoneX = lerp(p1.x, p3.x, pull);
  const phoneY = lerp(p1.y, p3.y, pull) + float;
  const rotY = lerp(lerp(-14, -5, prog(f, 0, 110)), -15, pull);
  const rotX = lerp(lerp(7, 2, prog(f, 0, 110)), 4, pull);
  const dolly = lerp(1, 1.04, prog(f, 0, 150));
  const pop = 1 + 0.03 * Math.sin(Math.PI * toConfirm);

  const tapT = (f - 22) / 26;
  const tapOn = tapT >= 0 && tapT <= 1.6;
  const sh = phoneH - 2 * phoneH * 0.016;
  const sw = (sh * SHOT_W) / SHOT_H;
  const ring = (delay: number) => {
    const t = Math.max(0, Math.min(1, (tapT - delay) / 0.9));
    return {r: 16 + t * sw * 0.22, o: (1 - t) * 0.9 * (tapT >= delay ? 1 : 0)};
  };

  const monX = lerp(m3.x - 90, m3.x, monIn);
  const monRotY = lerp(28, 12, monIn);
  const monScale = lerp(0.84, 1, monIn);

  const capSize = 58;
  const caption = (text: string, a: number, b: number) => {
    const o = interpolate(f, [a, a + 10, b - 10, b], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const y = interpolate(f, [a, a + 14], [12, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
    if (o <= 0) return null;
    return (
      <div key={text} style={{position: 'absolute', left: 0, right: 0, top: height - 112, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${y}px)`}}>
        <div style={{direction: lang === 'he' ? 'rtl' : 'ltr', fontFamily, fontWeight: 700, fontSize: capSize, lineHeight: 1.15, color: '#f2fffc', padding: `${capSize * 0.24}px ${capSize * 0.7}px`, borderRadius: 999, background: 'rgba(4,14,15,.78)', border: `2px solid ${accent}88`, boxShadow: `0 0 ${capSize * 0.8}px ${accent}44`}}>{text}</div>
      </div>
    );
  };

  const dOpacity = 1 - outro;
  return (
    <AbsoluteFill style={{fontFamily}}>
      <Background accent={accent} bg={bg} f={f * 1.3} />
      <AbsoluteFill style={{perspective: 2000, opacity: dOpacity, filter: `blur(${outro * 8}px)`, transform: `scale(${dolly * (1 - outro * 0.08)})`}}>
        {monIn > 0.001 && (
          <div style={{position: 'absolute', left: '50%', top: '50%', opacity: monIn, transform: `translate(-50%,-50%) translate(${monX}px, ${m3.y + float * 0.6}px) rotateY(${monRotY}deg) rotateX(3deg) scale(${monScale})`}}>
            <Monitor w={m3.w} accent={accent}>
              <Shot src="desktop-week.png" style={{filter: 'brightness(1.3) contrast(1.08)'}} />
              <Shot src="desktop-details.png" opacity={toDetails} style={{filter: 'brightness(1.3) contrast(1.08)'}} />
              <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${accent}${Math.round(90 * Math.sin(Math.PI * prog(f, 154, 190))).toString(16).padStart(2, '0')}, transparent 60%)`, mixBlendMode: 'screen'}} />
              <Sheen f={f * 1.5} strength={0.8} />
            </Monitor>
          </div>
        )}
        <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${phoneX}px, ${phoneY}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${lerp(0.92, 1, intro) * pop})`, opacity: intro}}>
          <Phone h={phoneH} accent={accent} glow={1 + 0.4 * Math.sin(Math.PI * toConfirm)}>
            <Shot src="mobile-time.png" opacity={1 - toConfirm} />
            <Shot src="mobile-confirm.png" opacity={toConfirm} />
            {tapOn && (
              <div style={{position: 'absolute', left: sw * 0.5, top: sh * 0.4977}}>
                {[0, 0.28].map((d) => {
                  const {r, o} = ring(d);
                  return <div key={d} style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: 999, border: `${Math.max(2, sw * 0.008)}px solid ${accent}`, opacity: o, boxShadow: `0 0 ${sw * 0.05}px ${accent}`}} />;
                })}
                <div style={{position: 'absolute', left: -sw * 0.045, top: -sw * 0.045, width: sw * 0.09, height: sw * 0.09, borderRadius: 999, background: 'rgba(255,255,255,.35)', transform: `scale(${1 - 0.25 * Math.sin(Math.PI * Math.min(1, tapT * 1.6))})`, opacity: interpolate(tapT, [0, 0.15, 0.8, 1.1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
              </div>
            )}
            <div style={{position: 'absolute', top: '-10%', bottom: '-10%', width: '40%', left: `${lerp(-60, 130, prog(f, 52, 80))}%`, transform: 'skewX(-14deg)', background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`, mixBlendMode: 'screen', opacity: Math.sin(Math.PI * prog(f, 52, 80))}} />
            <Sheen f={f * 1.5} />
          </Phone>
        </div>
      </AbsoluteFill>

      {showText && <AbsoluteFill style={{opacity: dOpacity}}>
        {caption(cap1, 4, 62)}
        {caption(cap2, 66, 124)}
        {caption(cap3, 128, 206)}
      </AbsoluteFill>}

      {outro > 0.001 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'absolute', width: 900, height: 900, borderRadius: 999, background: `radial-gradient(circle, ${accent}${Math.round(110 * logoIn).toString(16).padStart(2, '0')}, transparent 60%)`}} />
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.2 * Math.sin(Math.PI * prog(f, 200, 222))}), transparent 55%)`, mixBlendMode: 'screen'}} />
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: logoIn, transform: `translateY(${(1 - logoIn) * 18}px) scale(${lerp(0.94, 1, logoIn)})`}}>
            <Img src={staticFile('logo-icon.png')} style={{width: 270, height: 'auto', filter: `drop-shadow(0 0 22px ${accent}cc)`}} />
            <div style={{marginTop: 14, fontWeight: 700, fontSize: 84, letterSpacing: 22, color: '#f2fffc', textShadow: `0 0 28px ${accent}`, paddingLeft: 22}}>{name}</div>
            <div style={{marginTop: 6, direction: lang === 'he' ? 'rtl' : 'ltr', fontWeight: 700, fontSize: 38, color: accent}}>{tagline}</div>
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: bg, opacity: Math.max(fadeOut, fadeIn)}} />
    </AbsoluteFill>
  );
};
