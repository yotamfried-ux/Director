import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';

/**
 * Shared motion primitives for site/product videos (1920x1080 @30 unless noted).
 * Extracted from ToriSite and SportReelSite5 with identical behaviour.
 * Rules these encode (docs/06-lessons-learned.md): soft ease-in-out, scene overlaps >= 24 frames,
 * blur+fade between scenes, no hard cuts, no fake cursor (soft highlight only).
 */

/** The house easing: gentle in and out. */
export const soft = Easing.bezier(0.45, 0, 0.2, 1);
/** 0..1 progress of frame f between frames a and b, eased and clamped. */
export const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: soft});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Scene in a Sequence with built-in 24-frame blur+fade in/out. `children` receives the scene-local frame. */
export const Scene: React.FC<{from: number; dur: number; fadeIn?: boolean; fadeOut?: boolean; fade?: number; children: (local: number) => React.ReactNode}> = ({from, dur, fadeIn = true, fadeOut = true, fade = 24, children}) => (
  <Sequence from={from} durationInFrames={dur}>
    <SceneInner dur={dur} fadeIn={fadeIn} fadeOut={fadeOut} fade={fade}>{children}</SceneInner>
  </Sequence>
);
const SceneInner: React.FC<{dur: number; fadeIn: boolean; fadeOut: boolean; fade: number; children: (local: number) => React.ReactNode}> = ({dur, fadeIn, fadeOut, fade, children}) => {
  const lf = useCurrentFrame();
  const o = (fadeIn ? prog(lf, 0, fade) : 1) * (fadeOut ? 1 - prog(lf, dur - fade, dur) : 1);
  return <AbsoluteFill style={{opacity: o, filter: o < 0.999 ? `blur(${(1 - o) * 12}px)` : undefined}}>{children(lf)}</AbsoluteFill>;
};

/**
 * Starts something at a chosen moment: a Sequence whose render-prop gets a frame counter starting at 0.
 * Use it to begin an OffthreadVideo mid-scene (match-cut into a clip) with a constant startFrom/playbackRate.
 */
const LocalInner: React.FC<{children: (lf: number) => React.ReactNode}> = ({children}) => <>{children(useCurrentFrame())}</>;
export const Local: React.FC<{from: number; dur?: number; children: (lf: number) => React.ReactNode}> = ({from, dur, children}) => (
  <Sequence from={from} durationInFrames={dur}><LocalInner>{children}</LocalInner></Sequence>
);

/** Scene wrapper driven by an absolute frame f: fades in over a..b, out over c..d, with blur and a slight scale. */
export const Fade: React.FC<{f: number; a: number; b: number; c: number; d: number; children: React.ReactNode}> = ({f, a, b, c, d, children}) => {
  const i = prog(f, a, b), o = prog(f, c, d);
  if (f < a || f > d) return null;
  return <AbsoluteFill style={{opacity: i * (1 - o), filter: `blur(${(1 - i) * 10 + o * 10}px)`, transform: `scale(${lerp(1.03, 1, i) * lerp(1, 0.985, o)})`}}>{children}</AbsoluteFill>;
};

/** Soft accent glow marking the element being "pressed" at point `to`; no cursor, no ripple dots. t0 = start frame. */
export const Highlight: React.FC<{f: number; t0: number; to: [number, number]; size: number; accent: string}> = ({f, t0, to, size, accent}) => {
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

/**
 * Match-cut: a tilted perspective grid of tiles where ONE hero tile grows to fill the frame, so the
 * grid becomes the next full-screen scene without a cut. Pure layout: the caller draws background,
 * captions and the next scene (start the next scene's video with <Local from={q1}>).
 *
 * lf: scene-local frame. q0..q1: expansion window. fadeOthers: [a,b] window in which non-hero tiles fade out.
 * Grid is `cols` wide, centred horizontally, top at y0; the hero tile's centre is the zoom origin.
 * Tile entrance is staggered: tile i appears over [enter+i*step, enter+18+i*step].
 */
export const GridExpand: React.FC<{
  lf: number; ids: string[]; heroId: string; renderTile: (id: string) => React.ReactNode;
  pw: number; ph: number; gx: number; gy: number; y0: number; cols?: number;
  q0: number; q1: number; fadeOthers: [number, number];
  enter?: number; step?: number; width?: number; height?: number; accent?: string;
}> = ({lf, ids, heroId, renderTile, pw, ph, gx, gy, y0, cols = 3, q0, q1, fadeOthers, enter = 4, step = 5, width = 1920, height = 1080, accent = '255,214,10'}) => {
  const x0 = (width - (cols * pw + (cols - 1) * gx)) / 2;
  const hi = ids.indexOf(heroId);
  const cx = x0 + (hi % cols) * (pw + gx) + pw / 2, cy = y0 + Math.floor(hi / cols) * (ph + gy) + ph / 2;
  const q = prog(lf, q0, q1);
  const S = lerp(0.94, width / pw, q);
  const flat = 1 - q;
  return (
    <div style={{position: 'absolute', inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `perspective(2600px) translate(${(width / 2 - cx) * q}px, ${(height / 2 - cy) * q}px) scale(${S}) rotateX(${10 * flat}deg) rotateY(${lerp(-9, -6, Math.min(1, lf / 70)) * flat}deg)`}}>
      {ids.map((id, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const a = prog(lf, enter + i * step, enter + 18 + i * step);
        const hero = id === heroId;
        const others = hero ? 1 : 1 - prog(lf, fadeOthers[0], fadeOthers[1]);
        return (
          <div key={id} style={{position: 'absolute', left: x0 + col * (pw + gx), top: y0 + row * (ph + gy), width: pw, height: ph, borderRadius: hero ? lerp(16, 0, q) : 16, overflow: 'hidden', border: `${hero ? 1 + 2 * (1 - q) : 1}px solid ${hero ? `rgba(${accent},${0.9 * (1 - q)})` : '#2D3F55'}`, boxShadow: '0 16px 50px rgba(0,0,0,.5)', opacity: a * others, transform: `translateY(${(1 - a) * 26}px) scale(${lerp(0.96, 1, a)})`}}>
            {renderTile(id)}
          </div>
        );
      })}
    </div>
  );
};
