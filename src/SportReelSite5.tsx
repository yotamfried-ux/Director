import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Freeze, Img, OffthreadVideo, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from './Promo';
import {GridExpand, Local, Scene, clamp, lerp, prog} from './lib/motion';

// SportReel portfolio videos v4 (client-facing, silent, 1920x1080 @30).
//  - short: ~12 s, for the project card.   - long: ~33 s, for the project page.
//  - locale: 'en' | 'he' (captions only; the footage has no UI text).
// Boxes/tracks come from the real Ultralytics+BoT-SORT sidecars. The featured athlete's box is smoothed for display
// (gaps <= 0.35 s are bridged, +-0.16 s triangular average); other detections are the raw nearest detection.

const BG = '#0A0E1A';
const ACCENT = '#00E5FF';
const FEATURE = '#FFD60A';
const SRC_W = 3840;
const SRC_H = 2160;
const CONF_MIN = 0.4;
const CLIP97_T0 = 1.001;

type Det = {track_id: number; bbox_xyxy: [number, number, number, number]; confidence: number; time_sec: number};
type Sample = {t: number; dets: Det[]};
type Sidecar = {samples: Sample[]};
type Crop = {cx: number; cy: number; w: number; h: number};
type Edl = {shots: {keyframes: {out_frame: number; crop: Crop}[]}[]};
type BoxPt = {t: number; b: [number, number, number, number]};
type Box = [number, number, number, number];

const useJson = <T,>(path: string, map: (j: any) => T): T | null => {
  const [data, setData] = useState<T | null>(null);
  const [handle] = useState(() => delayRender(`json ${path}`));
  useEffect(() => {
    fetch(staticFile(path))
      .then((r) => r.json())
      .then((j) => {
        setData(map(j));
        continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return data;
};

const toSidecar = (j: any): Sidecar => {
  const m = new Map<number, Det[]>();
  for (const d of j.detections as Det[]) {
    const k = Math.round(d.time_sec * 1000);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(d);
  }
  return {samples: [...m.entries()].sort((a, b) => a[0] - b[0]).map(([k, dets]) => ({t: k / 1000, dets}))};
};

const detsAt = (sc: Sidecar | null, t: number): Det[] => {
  if (!sc || sc.samples.length === 0) return [];
  let lo = 0;
  let hi = sc.samples.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sc.samples[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  const best = new Map<number, {d: Det; gap: number}>();
  for (let i = Math.max(0, lo - 4); i <= Math.min(sc.samples.length - 1, lo + 3); i++) {
    const gap = Math.abs(sc.samples[i].t - t);
    if (gap > 0.05) continue;
    for (const d of sc.samples[i].dets) {
      const cur = best.get(d.track_id);
      if (!cur || gap < cur.gap) best.set(d.track_id, {d, gap});
    }
  }
  return [...best.values()].map((v) => v.d);
};

const trackBoxes = (sc: Sidecar | null, id: number): BoxPt[] => {
  if (!sc) return [];
  const out: BoxPt[] = [];
  for (const s of sc.samples) for (const d of s.dets) if (d.track_id === id) out.push({t: d.time_sec, b: d.bbox_xyxy});
  return out.sort((a, b) => a.t - b.t);
};

// Display smoothing for the featured athlete: bridges short gaps and removes frame-to-frame jitter.
const smoothBox = (pts: BoxPt[], t: number): Box | null => {
  if (pts.length === 0) return null;
  const W = 0.16;
  let sw = 0;
  const acc: Box = [0, 0, 0, 0];
  for (const p of pts) {
    const d = Math.abs(p.t - t);
    if (d > W) continue;
    const w = 1 - d / W;
    sw += w;
    for (let i = 0; i < 4; i++) acc[i] += p.b[i] * w;
  }
  if (sw > 0) return acc.map((v) => v / sw) as Box;
  let prev: BoxPt | null = null;
  let next: BoxPt | null = null;
  for (const p of pts) {
    if (p.t <= t) prev = p;
    else {
      next = p;
      break;
    }
  }
  if (prev && next && next.t - prev.t <= 0.35) {
    const k = (t - prev.t) / (next.t - prev.t);
    return prev.b.map((v, i) => lerp(v, next!.b[i], k)) as Box;
  }
  return null;
};

const centerOf = (pts: BoxPt[], t: number): {x: number; y: number} => {
  const b = smoothBox(pts, t) ?? (pts.length ? pts.reduce((a, c) => (Math.abs(a.t - t) < Math.abs(c.t - t) ? a : c)).b : [SRC_W / 2 - 50, SRC_H / 2 - 50, SRC_W / 2 + 50, SRC_H / 2 + 50]);
  return {x: (b[0] + b[2]) / 2, y: (b[1] + b[3]) / 2};
};

// ---------- text ----------
type Lang = 'en' | 'he';
const TXT = {
  en: {tag: 'Drone footage in. Personal reels out.', chaos: 'Lots of clips. Many athletes.', chaosSub: 'Who is who?', find: 'Finds every athlete', follow: '…and follows each one', same: 'Same athlete, across different clips', sameSub: 'No face recognition', frame: 'Picks the full ride, frames it for phones', frameSub: 'Vertical, ready to post', lineup: 'A personal reel for every athlete', end2: 'Drone footage to vertical video', athletes: 'ATHLETES', athlete: 'ATHLETE', tracking: 'TRACKING'},
  he: {tag: 'צילומי רחפן נכנסים. ריל אישי יוצא.', chaos: 'המון קליפים. המון ספורטאים.', chaosSub: 'מי זה מי?', find: 'מזהה כל ספורטאי', follow: '…ועוקב אחרי כל אחד', same: 'אותו ספורטאי, בקליפים שונים', sameSub: 'בלי זיהוי פנים', frame: 'בוחר את הרכיבה המלאה וממסגר לטלפון', frameSub: 'אנכי, מוכן לפרסום', lineup: 'ריל אישי לכל ספורטאי', end2: 'מצילומי רחפן לווידאו אנכי', athletes: 'ספורטאים', athlete: 'ספורטאי', tracking: 'מעקב'},
};

// ---------- building blocks ----------
const Brackets: React.FC<{x: number; y: number; w: number; h: number; color: string; stroke: number; glow?: boolean; opacity?: number}> = ({x, y, w, h, color, stroke, glow, opacity = 1}) => {
  const len = Math.max(8 * stroke, Math.min(w, h) * 0.3);
  const s = stroke / 2;
  const d = `M ${s} ${len} V ${s} H ${len} M ${w - len} ${s} H ${w - s} V ${len} M ${w - s} ${h - len} V ${h - s} H ${w - len} M ${len} ${h - s} H ${s} V ${h - len}`;
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity, filter: glow ? `drop-shadow(0 0 ${stroke * 3}px ${color}aa)` : undefined}}>
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const TrackLayer: React.FC<{sc: Sidecar | null; pts: BoxPt[]; t: number; w: number; opacity?: number; inv?: number; label?: string; others?: boolean}> = ({sc, pts, t, w, opacity = 1, inv = 1, label, others = true}) => {
  const k = w / SRC_W;
  const f = smoothBox(pts, t);
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      {others &&
        detsAt(sc, t)
          .filter((d) => d.confidence >= CONF_MIN && !(f && Math.abs((d.bbox_xyxy[0] + d.bbox_xyxy[2]) / 2 - (f[0] + f[2]) / 2) < 40 && Math.abs((d.bbox_xyxy[1] + d.bbox_xyxy[3]) / 2 - (f[1] + f[3]) / 2) < 40))
          .map((d) => {
            const [x1, y1, x2, y2] = d.bbox_xyxy;
            return <Brackets key={d.track_id} x={x1 * k} y={y1 * k} w={Math.max(10, (x2 - x1) * k)} h={Math.max(10, (y2 - y1) * k)} color="#E6F1FF" stroke={2 * inv} opacity={0.55} />;
          })}
      {f && (
        <>
          <Brackets x={f[0] * k} y={f[1] * k} w={(f[2] - f[0]) * k} h={(f[3] - f[1]) * k} color={FEATURE} stroke={4.5 * inv} glow />
          {label && (
            <div style={{position: 'absolute', left: f[0] * k, top: f[1] * k - 38 * inv, background: FEATURE, color: BG, fontFamily, fontWeight: 700, fontSize: 21 * inv, lineHeight: 1.2, padding: `${2 * inv}px ${10 * inv}px`, borderRadius: 6 * inv, whiteSpace: 'nowrap'}}>★ {label}</div>
          )}
        </>
      )}
    </div>
  );
};

const Clip: React.FC<{file: string; startFrom: number; w: number; h: number; rate?: number}> = ({file, startFrom, w, h, rate = 1}) => (
  <div style={{position: 'relative', width: w, height: h, overflow: 'hidden'}}>
    <OffthreadVideo src={staticFile(`sportreel/clips/${file}.mp4`)} startFrom={startFrom} playbackRate={rate} muted style={{width: w, height: h, objectFit: 'cover'}} />
  </div>
);

const Plate: React.FC<{file: 'caustic' | 'grid' | 'threads' | 'glow'; opacity?: number; startFrom?: number}> = ({file, opacity = 1, startFrom = 0}) => (
  <AbsoluteFill style={{opacity}}>
    <OffthreadVideo src={staticFile(`sportreel/plates/${file}.mp4`)} startFrom={startFrom} muted style={{width: 1920, height: 1080, objectFit: 'cover'}} />
  </AbsoluteFill>
);

const Caption: React.FC<{text: string; sub?: string; opacity: number; he: boolean}> = ({text, sub, opacity, he}) => (
  <div style={{position: 'absolute', left: 110, right: 110, bottom: 64, display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: 24, opacity, transform: `translateY(${(1 - opacity) * 16}px)`, fontFamily, color: '#fff', direction: he ? 'rtl' : 'ltr'}}>
    <div style={{width: 8, borderRadius: 4, background: ACCENT, flexShrink: 0}} />
    <div style={{textShadow: '0 3px 24px rgba(0,0,0,.85)', textAlign: he ? 'right' : 'left'}}>
      <div style={{fontSize: 64, fontWeight: 700, letterSpacing: he ? 0 : -0.5, lineHeight: 1.1}}>{text}</div>
      {sub && <div style={{fontSize: 34, color: '#B6C4D6', marginTop: 8}}>{sub}</div>}
    </div>
  </div>
);

const PhoneShell: React.FC<{w: number; h: number; children: React.ReactNode; glow?: string}> = ({w, h, children, glow = ACCENT}) => (
  <div style={{width: w + 24, height: h + 24, borderRadius: 54, padding: 12, background: 'linear-gradient(145deg,#2A3447,#10151F)', boxShadow: `0 40px 100px rgba(0,0,0,.65), 0 0 90px ${glow}30, inset 0 0 0 2px rgba(255,255,255,.08)`, position: 'relative'}}>
    <div style={{width: w, height: h, borderRadius: 44, overflow: 'hidden', position: 'relative', background: '#000'}}>{children}</div>
    <div style={{position: 'absolute', top: 24, left: '50%', width: 110, height: 30, marginLeft: -55, borderRadius: 16, background: '#05070C'}} />
  </div>
);

// ---------- composition ----------
export type SportReelSite5Props = {locale: Lang; variant: 'short' | 'long'};

export const SportReelSite5: React.FC<SportReelSite5Props> = ({locale, variant}) => {
  const he = locale === 'he';
  const L = TXT[locale];
  const sc97 = useJson('sportreel/data/0097.json', toSidecar);
  const sc94 = useJson('sportreel/data/0094.json', toSidecar);
  const sc155 = useJson('sportreel/data/0155.json', toSidecar);
  const sc118 = useJson('sportreel/data/0118.json', toSidecar);
  const sc146 = useJson('sportreel/data/0146.json', toSidecar);
  const sc142 = useJson('sportreel/data/0142.json', toSidecar);
  const edl97 = useJson<Edl>('sportreel/data/edl_0097.json', (j) => j);
  const p97 = useMemo(() => trackBoxes(sc97, 2), [sc97]);
  const p94 = useMemo(() => trackBoxes(sc94, 37), [sc94]);
  const p155 = useMemo(() => trackBoxes(sc155, 10001), [sc155]);
  const p118 = useMemo(() => trackBoxes(sc118, 10003), [sc118]);
  const p146 = useMemo(() => trackBoxes(sc146, 10001), [sc146]);
  const p142 = useMemo(() => trackBoxes(sc142, 10001), [sc142]);

  const cropAt = (of: number): Crop => {
    const kf = edl97?.shots[0]?.keyframes ?? [];
    if (kf.length === 0) return {cx: 1000, cy: 1088, w: 1204, h: 2142};
    if (of <= kf[0].out_frame) return kf[0].crop;
    for (let i = 1; i < kf.length; i++) {
      if (of <= kf[i].out_frame) {
        const a = kf[i - 1];
        const b = kf[i];
        const t = (of - a.out_frame) / (b.out_frame - a.out_frame);
        return {cx: lerp(a.crop.cx, b.crop.cx, t), cy: lerp(a.crop.cy, b.crop.cy, t), w: lerp(a.crop.w, b.crop.w, t), h: lerp(a.crop.h, b.crop.h, t)};
      }
    }
    return kf[kf.length - 1].crop;
  };

  const sideStyle = (px: number): React.CSSProperties => (he ? {right: px} : {left: px});

  // ---- scenes (each takes its own duration) ----
  const hook = (dur: number) => (lf: number) => {
    const z = lerp(1.0, 1.1, lf / dur);
    const title = prog(lf, 12, 30);
    const sub = prog(lf, 26, 44);
    return (
      <>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '34% 56%'}}>
          <Clip file="0097" startFrom={120} w={1920} h={1080} />
        </div>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,26,.15) 0%, rgba(10,14,26,0) 35%, rgba(10,14,26,.78) 100%)'}} />
        <div style={{position: 'absolute', ...sideStyle(110), bottom: 138, fontFamily, color: '#fff', opacity: title, transform: `translateY(${(1 - title) * 22}px)`, display: 'flex', flexDirection: he ? 'row-reverse' : 'row', alignItems: 'center', gap: 28}}>
          <Img src={staticFile('sportreel/icon.png')} style={{width: 132, height: 132, borderRadius: 30, boxShadow: '0 12px 40px rgba(0,0,0,.5)'}} />
          <div style={{fontSize: 148, fontWeight: 700, letterSpacing: -3, textShadow: '0 4px 30px rgba(0,0,0,.55)'}}>SportReel</div>
        </div>
        <div style={{position: 'absolute', ...sideStyle(120), bottom: 66, direction: he ? 'rtl' : 'ltr', fontFamily, color: ACCENT, fontSize: 52, fontWeight: 700, opacity: sub, transform: `translateY(${(1 - sub) * 14}px)`, textShadow: '0 2px 18px rgba(0,0,0,.7)'}}>{L.tag}</div>
      </>
    );
  };

  const chaos = (dur: number) => (lf: number) => {
    const files = [{f: '0094', s: 0}, {f: '0155', s: 0}, {f: '0118', s: 30}, {f: '0146', s: 30}, {f: '0142', s: 30}, {f: '0162', s: 20}];
    const pw = 590;
    const ph = 332;
    const gx = 36;
    const gy = 36;
    const x0 = (1920 - (3 * pw + 2 * gx)) / 2;
    const y0 = 150;
    return (
      <>
        <AbsoluteFill style={{background: BG}} />
        <Plate file="caustic" opacity={0.9} />
        <div style={{position: 'absolute', inset: 0, transform: `perspective(2600px) rotateX(10deg) rotateY(${lerp(-9, -5, lf / dur)}deg) translateX(${lerp(30, -30, lf / dur)}px) scale(.94)`, transformOrigin: '50% 45%'}}>
          {files.map((c, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const p = prog(lf, 4 + i * 5, 22 + i * 5);
            return (
              <div key={c.f} style={{position: 'absolute', left: x0 + col * (pw + gx), top: y0 + row * (ph + gy), width: pw, height: ph, borderRadius: 16, overflow: 'hidden', border: '1px solid #2D3F55', boxShadow: '0 16px 50px rgba(0,0,0,.5)', opacity: p, transform: `translateY(${(1 - p) * 26}px) scale(${lerp(0.96, 1, p)})`}}>
                <Clip file={c.f} startFrom={c.s} w={pw} h={ph} />
              </div>
            );
          })}
        </div>
        <Caption text={L.chaos} sub={L.chaosSub} opacity={prog(lf, 26, 44)} he={he} />
      </>
    );
  };

  const vision = (dur: number, st = 0, release = false, z: [number, number] = [0.3, 0.72], title = false) => (lf: number) => {
    const t = CLIP97_T0 + (st + lf) / 30;
    const zoomP = prog(lf, dur * z[0], dur * z[1]);
    const S = lerp(lerp(1, 1.75, zoomP), 1, release ? prog(lf, dur - 40, dur - 4) : 0);
    const c = centerOf(p97, t);
    const k = 1920 / SRC_W;
    const tx = clamp(960 - c.x * k * S, 1920 * (1 - S), 0);
    const ty = clamp(540 - c.y * k * S, 1080 * (1 - S), 0);
    const inv = 1 / S;
    const on = prog(lf, 10, 28);
    const trail = p97.filter((p) => p.t <= t && p.t >= t - 1.3);
    return (
      <>
        <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${S})`}}>
          <Clip file="0097" startFrom={st} w={1920} h={1080} />
          <TrackLayer sc={sc97} pts={p97} t={t} w={1920} opacity={on} inv={inv} label={L.athlete} />
          {trail.length > 1 && (
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: prog(lf, dur * 0.35, dur * 0.5)}}>
              <polyline points={trail.map((p) => `${((p.b[0] + p.b[2]) / 2) * k},${p.b[3] * k}`).join(' ')} fill="none" stroke={FEATURE} strokeWidth={5 * inv} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
            </svg>
          )}
        </div>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,26,.5) 0%, rgba(10,14,26,0) 20%, rgba(10,14,26,0) 66%, rgba(10,14,26,.72) 100%)'}} />
        <Caption text={lf < dur * 0.5 ? L.find : L.follow} opacity={prog(lf, 12, 28) * (1 - (release ? prog(lf, dur - 34, dur - 10) : 0))} he={he} />
        {title && (() => {
          const a = prog(lf, 6, 26), b = prog(lf, 8, 30), o = 1 - prog(lf, 62, 86);
          return (
            <div style={{position: 'absolute', ...sideStyle(110), top: 80, fontFamily, color: '#fff', opacity: o, display: 'flex', flexDirection: 'column', alignItems: he ? 'flex-end' : 'flex-start', gap: 18}}>
              <div style={{display: 'flex', flexDirection: he ? 'row-reverse' : 'row', alignItems: 'center', gap: 24, opacity: a, transform: `translateY(${(1 - a) * 18}px)`}}>
                <Img src={staticFile('sportreel/icon.png')} style={{width: 112, height: 112, borderRadius: 26, boxShadow: '0 12px 40px rgba(0,0,0,.5)'}} />
                <div style={{fontSize: 124, fontWeight: 700, letterSpacing: -2, textShadow: '0 4px 30px rgba(0,0,0,.55)'}}>SportReel</div>
              </div>
              <div style={{direction: he ? 'rtl' : 'ltr', fontSize: 56, fontWeight: 700, color: ACCENT, opacity: b, textShadow: '0 2px 6px rgba(0,0,0,.9), 0 2px 26px rgba(0,0,0,.85)'}}>{L.tag}</div>
            </div>
          );
        })()}
      </>
    );
  };

  const chaosVision = (total: number) => (lf: number) => {
    const files = [{f: '0094', s: 0}, {f: '0097', s: 0}, {f: '0155', s: 0}, {f: '0146', s: 30}, {f: '0118', s: 30}, {f: '0162', s: 20}];
    const pw = 590, ph = 332, gx = 36, gy = 36, y0 = 150;
    return (
      <>
        {lf < 110 && (
          <>
            <AbsoluteFill style={{background: BG}} />
            <Plate file="caustic" opacity={0.9 * (1 - prog(lf, 66, 100))} />
            <GridExpand lf={lf} ids={files.map((c) => c.f)} heroId="0097" pw={pw} ph={ph} gx={gx} gy={gy} y0={y0} q0={70} q1={108} fadeOthers={[66, 100]}
              renderTile={(id) => <Clip file={id} startFrom={files.find((c) => c.f === id)!.s} w={pw} h={ph} />} />
            <Caption text={L.chaos} sub={L.chaosSub} opacity={prog(lf, 26, 44) * (1 - prog(lf, 56, 72))} he={he} />
          </>
        )}
        {lf >= 108 && <Local from={108}>{(vl) => vision(total - 108, 108)(vl)}</Local>}
      </>
    );
  };

  const identity = (dur: number) => (lf: number) => {
    const nodes = [
      {file: '0094', sc: sc94, pts: p94, t0: 3.4, off: 2.0, x: 170, y: 110},
      {file: '0155', sc: sc155, pts: p155, t0: 0.2, off: 0, x: 740, y: 110},
      {file: '0118', sc: sc118, pts: p118, t0: 1, off: 0, x: 1310, y: 110},
      {file: '0146', sc: sc146, pts: p146, t0: 1, off: 0, x: 455, y: 610},
      {file: '0142', sc: sc142, pts: p142, t0: 1, off: 0, x: 1025, y: 610},
    ];
    const pw = 440;
    const ph = 248;
    const bx = 960;
    const by = 490;
    const badge = prog(lf, dur * 0.5, dur * 0.66);
    return (
      <>
        <AbsoluteFill style={{background: BG}} />
        <Plate file="threads" opacity={0.85} />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {nodes.map((n, i) => {
            const a = prog(lf, 8 + i * 8 + 12, 8 + i * 8 + 34);
            const sx = n.x + pw / 2;
            const sy = n.y + ph / 2;
            return <line key={n.file} x1={sx} y1={sy} x2={bx} y2={by} stroke={FEATURE} strokeWidth={3} strokeDasharray="900" strokeDashoffset={900 * (1 - a)} opacity={0.85} />;
          })}
        </svg>
        {nodes.map((n, i) => {
          const a = prog(lf, 8 + i * 8, 8 + i * 8 + 16);
          const t = n.t0 + n.off + lf / 30;
          return (
            <div key={n.file} style={{position: 'absolute', left: n.x, top: n.y, width: pw, height: ph, borderRadius: 16, overflow: 'hidden', border: `2px solid ${FEATURE}77`, boxShadow: '0 16px 50px rgba(0,0,0,.55)', opacity: a, transform: `translateY(${(1 - a) * 20}px) scale(${lerp(0.97, 1, a)})`}}>
              <Clip file={n.file} startFrom={Math.round(n.t0 * 30)} w={pw} h={ph} />
              <TrackLayer sc={n.sc} pts={n.pts} t={t} w={pw} inv={0.8} others={false} />
            </div>
          );
        })}
        <div style={{position: 'absolute', left: bx - 130, top: by - 130, width: 260, height: 260, borderRadius: 130, background: `radial-gradient(circle, ${FEATURE}55 0%, ${FEATURE}00 70%)`, opacity: badge, transform: `scale(${lerp(0.6, 1.1, badge)})`}} />
        <div style={{position: 'absolute', left: bx - 46, top: by - 46, width: 92, height: 92, borderRadius: 46, background: FEATURE, color: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily, fontWeight: 700, fontSize: 56, opacity: badge, transform: `scale(${lerp(0.7, 1, badge)})`, boxShadow: `0 0 50px ${FEATURE}88`}}>★</div>
        <Caption text={L.same} sub={L.sameSub} opacity={prog(lf, dur * 0.55, dur * 0.72)} he={he} />
      </>
    );
  };

  const frame = (dur: number, brandEnd: boolean, o: {of0?: number; rate?: number; holdAt?: number; lineupAt?: number; dissolveAt?: number} = {}) => (lf: number) => {
    const of0 = o.of0 ?? 0;
    const rate = o.rate ?? 205 / (dur - 30);
    const holdAt = o.holdAt ?? (205 - of0) / rate;
    const la = o.lineupAt;
    const fl = Math.min(lf, holdAt);
    const of = Math.min(205, of0 + fl * rate);
    const crop = cropAt(of);
    const ph = 840;
    const pw = (ph * 9) / 16;
    const tx = he ? 1920 - 380 - pw : 380;
    const ty = 100;
    const rx = (crop.cx - crop.w / 2) * 0.5;
    const ry = (crop.cy - crop.h / 2) * 0.5;
    const rw = crop.w * 0.5;
    const rh = crop.h * 0.5;
    const p = prog(lf, 30, 78);
    const w = lerp(rw, pw, p);
    const h = lerp(rh, ph, p);
    const sl = la ? prog(lf, la, la + 46) : 0;
    const left = lerp(lerp(rx, tx, p), 960 - pw / 2 - 12, sl);
    const top = lerp(ry, ty, p);
    const vs = h / crop.h;
    const textIn = prog(lf, 70, 96);
    const brand = brandEnd ? prog(lf, dur - 52, dur - 32) : 0;
    const textOut = brandEnd ? 1 - prog(lf, dur - 72, dur - 56) : la ? 1 - prog(lf, la - 16, la + 6) : 1;
    const textX = he ? {right: 1920 - tx + 90} : {left: tx + pw + 90};
    const sideX = (n: number) => (n === 0 ? (he ? 1252 : 250) : he ? 250 : 1252);
    return (
      <>
        <AbsoluteFill style={{background: BG}} />
        <Plate file="glow" opacity={p} />
        <div style={{position: 'absolute', inset: 0, opacity: 1 - p}}>
          <Freeze frame={fl}><Clip file="0097" startFrom={of0} w={1920} h={1080} rate={rate} /></Freeze>
        </div>
        {la && [['reel_0165', 0, 14], ['reel_0130', 1, 26]].map(([file, n, at]) => {
          const a = prog(lf, la + (at as number), la + (at as number) + 28);
          return (
            <div key={file as string} style={{position: 'absolute', left: sideX(n as number), top: 160, opacity: a, transform: `translateY(${(1 - a) * 90}px)`}}>
              <PhoneShell w={(700 * 9) / 16} h={700}>
                <Local from={la + (at as number)}>{() => <OffthreadVideo src={staticFile(`sportreel/reel/${file}.mp4`)} startFrom={0} muted style={{width: (700 * 9) / 16, height: 700, objectFit: 'cover'}} />}</Local>
              </PhoneShell>
            </div>
          );
        })}
        <div style={{position: 'absolute', left, top, width: w, height: h, borderRadius: lerp(8, 44, p), overflow: 'hidden', border: `${lerp(4, 0, p)}px solid ${FEATURE}`, boxShadow: `0 0 0 4000px rgba(10,14,26,${0.55 * (1 - p)}), 0 0 0 ${12 * p}px #1A2233, 0 40px 100px rgba(0,0,0,${0.6 * p}), 0 0 ${90 * p}px ${ACCENT}${p > 0.5 ? '30' : '00'}`}}>
          <div style={{position: 'absolute', left: -(crop.cx - crop.w / 2) * vs, top: -(crop.cy - crop.h / 2) * vs, width: SRC_W * vs, height: SRC_H * vs}}>
            <Freeze frame={fl}><OffthreadVideo src={staticFile('sportreel/clips/0097.mp4')} startFrom={of0} playbackRate={rate} muted style={{width: SRC_W * vs, height: SRC_H * vs}} /></Freeze>
          </div>
          {(la || o.dissolveAt) && (
            <div style={{position: 'absolute', inset: 0, opacity: prog(lf, (o.dissolveAt ?? la! + 8), (o.dissolveAt ?? la! + 8) + 26)}}>
              <Local from={o.dissolveAt ?? la! + 8}>{() => <OffthreadVideo src={staticFile('sportreel/reel/reel_0097.mp4')} startFrom={0} muted style={{width: w, height: h, objectFit: 'cover'}} />}</Local>
            </div>
          )}
          <div style={{position: 'absolute', top: 14, left: '50%', width: 100, height: 26, marginLeft: -50, borderRadius: 14, background: '#05070C', opacity: p}} />
        </div>
        <div style={{position: 'absolute', ...textX, top: 330, width: 760, direction: he ? 'rtl' : 'ltr', textAlign: he ? 'right' : 'left', fontFamily, color: '#fff', opacity: textIn * textOut, transform: `translateY(${(1 - textIn) * 18}px)`}}>
          <div style={{width: 80, height: 8, borderRadius: 4, background: ACCENT, marginBottom: 28, marginInlineStart: 0}} />
          <div style={{fontSize: 70, fontWeight: 700, lineHeight: 1.12, letterSpacing: he ? 0 : -1}}>{L.frame}</div>
          <div style={{fontSize: 36, color: '#B6C4D6', marginTop: 20}}>{L.frameSub}</div>
        </div>
        {brandEnd && (
          <div style={{position: 'absolute', ...textX, top: 330, width: 760, direction: he ? 'rtl' : 'ltr', textAlign: he ? 'right' : 'left', fontFamily, color: '#fff', opacity: brand, transform: `translateY(${(1 - brand) * 18}px)`}}>
            <div style={{display: 'flex', flexDirection: he ? 'row-reverse' : 'row', alignItems: 'center', gap: 24}}>
              <Img src={staticFile('sportreel/icon.png')} style={{width: 120, height: 120, borderRadius: 28}} />
              <div style={{fontSize: 104, fontWeight: 700, letterSpacing: -2}}>SportReel</div>
            </div>
            <div style={{fontSize: 52, fontWeight: 700, color: ACCENT, marginTop: 30}}>{L.lineup}</div>
          </div>
        )}
        {la && <Caption text={L.lineup} opacity={prog(lf, la + 44, la + 66)} he={he} />}
      </>
    );
  };

  const lineup = (dur: number) => (lf: number) => {
    const phones = [
      {file: 'reel_0165', h: 700, x: he ? 1252 : 250, y: 160, at: 14},
      {file: 'reel_0130', h: 700, x: he ? 250 : 1252, y: 160, at: 24},
      {file: 'reel_0097', h: 820, x: 960 - (820 * 9) / 32 - 12, y: 60, at: 4},
    ];
    return (
      <>
        <AbsoluteFill style={{background: BG}} />
        <Plate file="glow" opacity={0.95} startFrom={20} />
        {phones.map((p) => {
          const a = prog(lf, p.at, p.at + 26);
          const pw = (p.h * 9) / 16;
          const drift = lerp(0, -18, lf / dur);
          return (
            <div key={p.file} style={{position: 'absolute', left: p.x, top: p.y, opacity: a, transform: `translateY(${(1 - a) * 90 + drift}px)`}}>
              <PhoneShell w={pw} h={p.h}>
                <OffthreadVideo src={staticFile(`sportreel/reel/${p.file}.mp4`)} startFrom={0} muted style={{width: pw, height: p.h, objectFit: 'cover'}} />
              </PhoneShell>
            </div>
          );
        })}
        <Caption text={L.lineup} opacity={prog(lf, 40, 60)} he={he} />
      </>
    );
  };

  const end = () => (lf: number) => {
    const a = prog(lf, 8, 30);
    const b = prog(lf, 24, 46);
    return (
      <>
        <AbsoluteFill style={{background: BG}} />
        <Plate file="glow" opacity={0.95} startFrom={10} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily, color: '#fff'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 32, opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
            <Img src={staticFile('sportreel/icon.png')} style={{width: 170, height: 170, borderRadius: 38, boxShadow: '0 16px 50px rgba(0,0,0,.55)'}} />
            <div style={{fontSize: 170, fontWeight: 700, letterSpacing: -4}}>SportReel</div>
          </div>
          <div style={{fontSize: 54, fontWeight: 700, color: ACCENT, marginTop: 36, opacity: b, direction: he ? 'rtl' : 'ltr'}}>{L.end2}</div>
        </div>
      </>
    );
  };

  const plan =
    variant === 'short'
      ? [
          {from: 0, dur: 150, fn: vision(150, 0, true, [0.2, 0.5], true), fadeIn: false, fadeOut: true},
          {from: 126, dur: 210, fn: frame(210, true, {of0: 126, rate: 1, dissolveAt: 90}), fadeIn: true, fadeOut: false},
        ]
      : [
          {from: 0, dur: 105, fn: hook(105), fadeIn: false, fadeOut: true},
          {from: 81, dur: 268, fn: chaosVision(268), fadeIn: true, fadeOut: true},
          {from: 325, dur: 180, fn: identity(180), fadeIn: true, fadeOut: true},
          {from: 481, dur: 340, fn: frame(340, false, {lineupAt: 170}), fadeIn: true, fadeOut: true},
          {from: 797, dur: 105, fn: end(), fadeIn: true, fadeOut: false},
        ];

  return (
    <AbsoluteFill style={{background: BG}}>
      {plan.map((s, i) => (
        <Scene key={i} from={s.from} dur={s.dur} fadeIn={s.fadeIn} fadeOut={s.fadeOut}>
          {s.fn}
        </Scene>
      ))}
    </AbsoluteFill>
  );
};
