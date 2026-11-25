import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from './Promo';

// SportReel site clip v3 (24 s, 1920x1080, silent). Story: drone footage in -> personal reels out.
// Hook -> chaos of raw clips -> detection/tracking -> same athlete across files -> auto 9:16 framing -> QA gate -> result.
// Boxes, track ids, crop rectangles come from the real sidecar/EDL of the run (see products/sportreel.md).
// Assets: public/sportreel/{clips,reel,data}. Proxy (1280x720) and full-quality files share names.

const BG = '#0A0E1A';
const ACCENT = '#00E5FF';
const FEATURE = '#FFD60A';
const GREEN = '#22C55E';
const SRC_W = 3840;
const SRC_H = 2160;
const CONF_MIN = 0.4;
const CLIP97_T0 = 1.001; // sidecar time of the first frame of clips/0097.mp4
const soft = Easing.bezier(0.45, 0, 0.2, 1);
const prog = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: soft});
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Det = {track_id: number; bbox_xyxy: [number, number, number, number]; confidence: number; time_sec: number};
type Sample = {t: number; dets: Det[]};
type Sidecar = {samples: Sample[]};
type Crop = {cx: number; cy: number; w: number; h: number};
type Edl = {shots: {out_start: number; out_end: number; keyframes: {out_frame: number; crop: Crop}[]}[]};

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

// Real detection per track nearest in time (<= 50 ms). No interpolation or smoothing of boxes.
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

type Pt = {t: number; x: number; y: number; by: number};
const trackPoints = (sc: Sidecar | null, id: number): Pt[] => {
  if (!sc) return [];
  const out: Pt[] = [];
  for (const s of sc.samples) {
    for (const d of s.dets) {
      if (d.track_id === id) out.push({t: d.time_sec, x: (d.bbox_xyxy[0] + d.bbox_xyxy[2]) / 2, y: (d.bbox_xyxy[1] + d.bbox_xyxy[3]) / 2, by: d.bbox_xyxy[3]});
    }
  }
  return out.sort((a, b) => a.t - b.t);
};
const smoothCenter = (pts: Pt[], t: number): {x: number; y: number} => {
  const near = pts.filter((p) => Math.abs(p.t - t) <= 0.45);
  const use = near.length ? near : pts.length ? [pts.reduce((a, b) => (Math.abs(a.t - t) < Math.abs(b.t - t) ? a : b))] : [];
  if (!use.length) return {x: SRC_W / 2, y: SRC_H / 2};
  return {x: use.reduce((s, p) => s + p.x, 0) / use.length, y: use.reduce((s, p) => s + p.y, 0) / use.length};
};

// ---------- overlays ----------
const Boxes: React.FC<{sc: Sidecar | null; t: number; w: number; featured?: number; opacity?: number; labels?: boolean; inv?: number; scale?: number}> = ({sc, t, w, featured, opacity = 1, labels = true, inv = 1, scale = 1}) => {
  const k = w / SRC_W;
  const dets = detsAt(sc, t).filter((d) => d.track_id === featured || d.confidence >= CONF_MIN);
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      {dets.map((d) => {
        const [x1, y1, x2, y2] = d.bbox_xyxy;
        const isF = d.track_id === featured;
        const color = isF ? FEATURE : ACCENT;
        const bw = (isF ? 4.5 : 2.6) * scale * inv;
        return (
          <div key={d.track_id} style={{position: 'absolute', left: x1 * k, top: y1 * k, width: (x2 - x1) * k, height: (y2 - y1) * k, border: `${bw}px solid ${color}`, borderRadius: 4 * inv, boxShadow: isF ? `0 0 ${22 * inv}px ${FEATURE}99` : 'none', opacity: isF ? 1 : 0.92}}>
            {labels && (
              <div style={{position: 'absolute', left: -bw, top: -30 * scale * inv, background: color, color: BG, fontFamily, fontWeight: 700, fontSize: 21 * scale * inv, lineHeight: 1.2, padding: `${1 * inv}px ${8 * inv}px`, borderRadius: 4 * inv, whiteSpace: 'nowrap'}}>
                {isF ? '★ ' : ''}ID {d.track_id}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Clip: React.FC<{file: string; startFrom: number; w: number; h: number; style?: React.CSSProperties}> = ({file, startFrom, w, h, style}) => (
  <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', ...style}}>
    <OffthreadVideo src={staticFile(`sportreel/clips/${file}.mp4`)} startFrom={startFrom} muted style={{width: w, height: h, objectFit: 'cover'}} />
  </div>
);

// ---------- chrome ----------
const Plate: React.FC<{file: 'caustic' | 'grid' | 'threads' | 'glow'; opacity?: number; startFrom?: number}> = ({file, opacity = 1, startFrom = 0}) => (
  <AbsoluteFill style={{opacity}}>
    <OffthreadVideo src={staticFile(`sportreel/plates/${file}.mp4`)} startFrom={startFrom} muted style={{width: 1920, height: 1080, objectFit: 'cover'}} />
  </AbsoluteFill>
);

const StepChip: React.FC<{n: number; label: string; opacity: number}> = ({n, label, opacity}) => (
  <div style={{position: 'absolute', left: 64, top: 48, opacity, display: 'flex', alignItems: 'center', gap: 14, fontFamily, color: '#fff', background: 'rgba(10,14,26,.55)', border: '1px solid rgba(148,163,184,.25)', borderRadius: 40, padding: '8px 26px 8px 10px'}}>
    <div style={{width: 52, height: 52, borderRadius: 26, background: ACCENT, color: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 30}}>{n}</div>
    <div style={{fontSize: 38, fontWeight: 700, letterSpacing: 0.3}}>{label}</div>
  </div>
);

const Caption: React.FC<{text: string; sub?: string; opacity: number; y?: number}> = ({text, sub, opacity, y = 0}) => (
  <div style={{position: 'absolute', left: 110, right: 110, bottom: 64, display: 'flex', alignItems: 'stretch', gap: 24, opacity, transform: `translateY(${y + (1 - opacity) * 16}px)`, fontFamily, color: '#fff'}}>
    <div style={{width: 8, borderRadius: 4, background: ACCENT, flexShrink: 0}} />
    <div style={{textShadow: '0 3px 24px rgba(0,0,0,.85)'}}>
      <div style={{fontSize: 64, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1}}>{text}</div>
      {sub && <div style={{fontSize: 34, color: '#B6C4D6', marginTop: 8}}>{sub}</div>}
    </div>
  </div>
);

const Phone: React.FC<{w: number; h: number; children: React.ReactNode; glow?: string; style?: React.CSSProperties}> = ({w, h, children, glow = ACCENT, style}) => (
  <div style={{width: w, height: h, borderRadius: 54, padding: 12, background: 'linear-gradient(145deg,#2A3447,#10151F)', boxShadow: `0 40px 100px rgba(0,0,0,.65), 0 0 90px ${glow}30, inset 0 0 0 2px rgba(255,255,255,.08)`, position: 'relative', ...style}}>
    <div style={{width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', position: 'relative', background: '#000'}}>{children}</div>
    <div style={{position: 'absolute', top: 24, left: '50%', width: 110, height: 30, marginLeft: -55, borderRadius: 16, background: '#05070C'}} />
  </div>
);

const Scene: React.FC<{from: number; dur: number; fadeIn?: boolean; fadeOut?: boolean; children: (local: number) => React.ReactNode}> = ({from, dur, fadeIn = true, fadeOut = true, children}) => (
  <Sequence from={from} durationInFrames={dur}>
    <SceneInner dur={dur} fadeIn={fadeIn} fadeOut={fadeOut}>{children}</SceneInner>
  </Sequence>
);
const SceneInner: React.FC<{dur: number; fadeIn: boolean; fadeOut: boolean; children: (local: number) => React.ReactNode}> = ({dur, fadeIn, fadeOut, children}) => {
  const lf = useCurrentFrame();
  const o = (fadeIn ? prog(lf, 0, 10) : 1) * (fadeOut ? 1 - prog(lf, dur - 10, dur) : 1);
  return <AbsoluteFill style={{opacity: o}}>{children(lf)}</AbsoluteFill>;
};

const Check: React.FC<{size?: number}> = ({size = 40}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" stroke={GREEN} />
    <path d="M7 12.5l3.2 3.2L17 9" />
  </svg>
);

// ---------- composition ----------
export type SportReelSite3Props = {name: string};

export const SportReelSite3: React.FC<SportReelSite3Props> = () => {
  const sc97 = useJson('sportreel/data/0097.json', toSidecar);
  const sc94 = useJson('sportreel/data/0094.json', toSidecar);
  const sc118 = useJson('sportreel/data/0118.json', toSidecar);
  const sc146 = useJson('sportreel/data/0146.json', toSidecar);
  const edl97 = useJson<Edl>('sportreel/data/edl_0097.json', (j) => j);
  const pts97 = useMemo(() => trackPoints(sc97, 2), [sc97]);

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

  return (
    <AbsoluteFill style={{background: BG}}>
      {/* 1. HOOK: full-bleed ride, title */}
      <Scene from={0} dur={96} fadeIn={false}>
        {(lf) => {
          const z = lerp(1.0, 1.1, lf / 96);
          const title = prog(lf, 14, 34);
          const sub = prog(lf, 30, 50);
          return (
            <>
              <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '34% 56%'}}>
                <Clip file="0097" startFrom={120} w={1920} h={1080} />
              </div>
              <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,26,.15) 0%, rgba(10,14,26,0) 35%, rgba(10,14,26,.75) 100%)'}} />
              <div style={{position: 'absolute', left: 110, bottom: 130, fontFamily, color: '#fff', opacity: title, transform: `translateY(${(1 - title) * 22}px)`}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
                  <Img src={staticFile('sportreel/icon.png')} style={{width: 132, height: 132, borderRadius: 30, boxShadow: '0 12px 40px rgba(0,0,0,.5)'}} />
                  <div style={{fontSize: 148, fontWeight: 700, letterSpacing: -3, textShadow: '0 4px 30px rgba(0,0,0,.55)'}}>SportReel</div>
                </div>
              </div>
              <div style={{position: 'absolute', left: 120, bottom: 66, fontFamily, color: ACCENT, fontSize: 52, fontWeight: 700, opacity: sub, transform: `translateY(${(1 - sub) * 14}px)`, textShadow: '0 2px 18px rgba(0,0,0,.7)'}}>
                Drone footage in. Personal reels out.
              </div>
            </>
          );
        }}
      </Scene>

      {/* 2. CHAOS: raw clips from different files */}
      <Scene from={86} dur={100}>
        {(lf) => {
          const files = [
            {f: '0094', s: 0, n: '0094'},
            {f: '0155', s: 0, n: '0155'},
            {f: '0118', s: 30, n: '0118'},
            {f: '0146', s: 30, n: '0146'},
            {f: '0142', s: 30, n: '0142'},
            {f: '0162', s: 20, n: '0162'},
          ];
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
              <StepChip n={1} label="Raw drone footage" opacity={prog(lf, 2, 14)} />
              <div style={{position: 'absolute', inset: 0, transform: `perspective(2600px) rotateX(10deg) rotateY(${lerp(-9, -5, lf / 100)}deg) translateX(${lerp(30, -30, lf / 100)}px) scale(.94)`, transformOrigin: '50% 45%'}}>
              {files.map((c, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const p = prog(lf, 4 + i * 5, 22 + i * 5);
                return (
                  <div key={c.f} style={{position: 'absolute', left: x0 + col * (pw + gx), top: y0 + row * (ph + gy), width: pw, height: ph, borderRadius: 16, overflow: 'hidden', border: '1px solid #2D3F55', boxShadow: '0 16px 50px rgba(0,0,0,.5)', opacity: p, transform: `translateY(${(1 - p) * 26}px) scale(${lerp(0.96, 1, p)})`}}>
                    <Clip file={c.f} startFrom={c.s} w={pw} h={ph} />
                    <div style={{position: 'absolute', left: 12, bottom: 10, fontFamily, fontSize: 22, fontWeight: 700, color: '#fff', background: 'rgba(10,14,26,.78)', padding: '3px 10px', borderRadius: 8}}>DJI_…{c.n}_D.MP4</div>
                  </div>
                );
              })}
              </div>
              <Caption text="29 clips. Many athletes. No labels." sub="Who is who? The pipeline has to figure it out." opacity={prog(lf, 26, 44)} />
            </>
          );
        }}
      </Scene>

      {/* 3. COMPUTER VISION: detection + tracking, punch-in on one surfer, live counter + trail */}
      <Scene from={176} dur={150}>
        {(lf) => {
          const t = CLIP97_T0 + lf / 30;
          const zoomP = prog(lf, 52, 104);
          const S = lerp(1, 1.75, zoomP);
          const c = smoothCenter(pts97, t);
          const k = 1920 / SRC_W;
          const tx = clamp(960 - c.x * k * S, 1920 * (1 - S), 0);
          const ty = clamp(540 - c.y * k * S, 1080 * (1 - S), 0);
          const inv = 1 / S;
          const boxesOn = prog(lf, 12, 30);
          const dets = detsAt(sc97, t).filter((d) => d.track_id === 2 || d.confidence >= CONF_MIN);
          const trail = pts97.filter((p) => p.t <= t && p.t >= t - 1.3);
          return (
            <>
              <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${S})`}}>
                <Clip file="0097" startFrom={0} w={1920} h={1080} />
                <Boxes sc={sc97} t={t} w={1920} featured={2} opacity={boxesOn} inv={inv} />
                {trail.length > 1 && (
                  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: prog(lf, 56, 76)}}>
                    <polyline points={trail.map((p) => `${p.x * k},${p.by * k}`).join(' ')} fill="none" stroke={FEATURE} strokeWidth={5 * inv} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
                  </svg>
                )}
              </div>
              <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,26,.6) 0%, rgba(10,14,26,0) 20%, rgba(10,14,26,0) 70%, rgba(10,14,26,.65) 100%)'}} />
              <StepChip n={2} label="Detect & track every athlete" opacity={prog(lf, 2, 16)} />
              <div style={{position: 'absolute', right: 64, top: 52, opacity: boxesOn, fontFamily, textAlign: 'right'}}>
                <div style={{fontSize: 30, color: '#94A3B8', fontWeight: 700}}>TRACKING</div>
                <div style={{fontSize: 80, color: ACCENT, fontWeight: 700, lineHeight: 1}}>{dets.length}<span style={{fontSize: 34, color: '#fff', marginLeft: 10}}>athletes</span></div>
              </div>
              <Caption text={lf < 62 ? 'Computer vision finds every athlete' : 'One ID per athlete, frame after frame'} sub="YOLO detection + BoT-SORT tracking · real output" opacity={prog(lf, 14, 30)} />
            </>
          );
        }}
      </Scene>

      {/* 4. IDENTITY across files */}
      <Scene from={316} dur={130}>
        {(lf) => {
          const panels = [
            {file: '0094', sc: sc94, id: 37, t0: 3, at: 6, label: 'Clip A'},
            {file: '0118', sc: sc118, id: 10003, t0: 2, at: 16, label: 'Clip B'},
            {file: '0146', sc: sc146, id: 10001, t0: 2, at: 26, label: 'Clip C'},
          ];
          const pw = 580;
          const ph = 326;
          const gap = 40;
          const x0 = (1920 - (3 * pw + 2 * gap)) / 2;
          const y0 = 150;
          const badgeY = 560;
          const badge = prog(lf, 46, 66);
          const chips = ['0094', '0155', '0118', '0146', '0142'];
          return (
            <>
              <AbsoluteFill style={{background: BG}} />
              <Plate file="threads" opacity={0.85} startFrom={0} />
              <StepChip n={3} label="Same athlete, across clips" opacity={prog(lf, 2, 14)} />
              {panels.map((p, i) => {
                const a = prog(lf, p.at, p.at + 16);
                const t = p.t0 + lf / 30;
                const px = x0 + i * (pw + gap);
                return (
                  <React.Fragment key={p.file}>
                    <div style={{position: 'absolute', left: px, top: y0, width: pw, height: ph, borderRadius: 16, overflow: 'hidden', border: `2px solid ${FEATURE}66`, boxShadow: '0 16px 50px rgba(0,0,0,.5)', opacity: a, transform: `translateY(${(1 - a) * 22}px)`}}>
                      <Clip file={p.file} startFrom={p.t0 * 30} w={pw} h={ph} />
                      <Boxes sc={p.sc} t={t} w={pw} featured={p.id} scale={0.9} />
                      <div style={{position: 'absolute', left: 12, bottom: 10, fontFamily, fontSize: 24, fontWeight: 700, color: '#fff', background: 'rgba(10,14,26,.8)', padding: '3px 12px', borderRadius: 8}}>{p.label} · different file</div>
                    </div>
                  </React.Fragment>
                );
              })}
              <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
                {panels.map((p, i) => {
                  const a = prog(lf, p.at + 14, p.at + 34);
                  const sx = x0 + i * (pw + gap) + pw / 2;
                  return <path key={p.file} d={`M ${sx} ${y0 + ph + 4} C ${sx} ${y0 + ph + 70}, 960 ${badgeY - 70}, 960 ${badgeY - 6}`} stroke={FEATURE} strokeWidth={3} fill="none" strokeDasharray="520" strokeDashoffset={520 * (1 - a)} opacity={0.9} />;
                })}
              </svg>
              <div style={{position: 'absolute', left: 0, right: 0, top: badgeY, display: 'flex', justifyContent: 'center', opacity: badge, transform: `scale(${lerp(0.94, 1, badge)})`}}>
                <div style={{fontFamily, background: FEATURE, color: BG, fontWeight: 700, fontSize: 52, padding: '14px 44px', borderRadius: 20, boxShadow: `0 0 50px ${FEATURE}55`}}>★ athlete ath_aeacfdea76</div>
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: badgeY + 112, display: 'flex', justifyContent: 'center', gap: 16}}>
                {chips.map((c, i) => {
                  const a = prog(lf, 62 + i * 5, 78 + i * 5);
                  return (
                    <div key={c} style={{fontFamily, fontSize: 28, fontWeight: 700, color: '#fff', background: '#1E293B', border: '1px solid #2D3F55', borderRadius: 12, padding: '8px 18px', opacity: a, transform: `translateY(${(1 - a) * 10}px)`}}>…{c}_D.MP4</div>
                  );
                })}
              </div>
              <Caption text="One athlete found in 5 separate files" sub="Non-biometric IDs · no face recognition" opacity={prog(lf, 50, 68)} />
            </>
          );
        }}
      </Scene>

      {/* 5. AUTO EDIT: complete ride, framed 9:16 following the athlete */}
      <Scene from={436} dur={130}>
        {(lf) => {
          const of = Math.min(273, lf * 2); // out_frame in the 9.1 s reel (compressed 2x for the clip)
                  const crop = cropAt(of);
          const lw = 1100;
          const lh = (lw * SRC_H) / SRC_W;
          const vh = 640;
          const vw = (vh * 9) / 16;
          const gap = 70;
          const x0 = (1920 - (lw + gap + vw)) / 2;
          const y0 = 120;
          const ly = y0 + (vh - lh) / 2;
          const s = lw / SRC_W;
          const vs = vh / crop.h;
          const tlY = y0 + vh + 28;
          const tlW = lw + gap + vw;
          const appear = prog(lf, 4, 20);
          return (
            <>
              <AbsoluteFill style={{background: BG}} />
              <Plate file="grid" opacity={0.8} />
              <StepChip n={4} label="Pick the complete ride, frame it 9:16" opacity={prog(lf, 2, 14)} />
              <div style={{position: 'absolute', left: x0, top: ly, width: lw, height: lh, borderRadius: 14, overflow: 'hidden', border: '1px solid #2D3F55', opacity: appear}}>
                <OffthreadVideo src={staticFile('sportreel/clips/0097.mp4')} startFrom={0} playbackRate={2} muted style={{width: lw, height: lh}} />
                <div style={{position: 'absolute', left: (crop.cx - crop.w / 2) * s, top: (crop.cy - crop.h / 2) * s, width: crop.w * s, height: crop.h * s, border: `3px solid ${FEATURE}`, borderRadius: 6, boxShadow: '0 0 0 4000px rgba(10,14,26,.55)'}} />
              </div>
              <div style={{position: 'absolute', left: x0 + lw + gap - 12, top: y0 - 12, opacity: appear}}>
                <Phone w={vw + 24} h={vh + 24} glow={FEATURE}>
                  <div style={{position: 'absolute', left: -(crop.cx - crop.w / 2) * vs, top: -(crop.cy - crop.h / 2) * vs, width: SRC_W * vs, height: SRC_H * vs}}>
                    <OffthreadVideo src={staticFile('sportreel/clips/0097.mp4')} startFrom={0} playbackRate={2} muted style={{width: SRC_W * vs, height: SRC_H * vs}} />
                  </div>
                </Phone>
              </div>
              <div style={{position: 'absolute', left: x0, top: tlY, width: tlW, opacity: prog(lf, 10, 26)}}>
                <div style={{height: 14, borderRadius: 7, background: '#1E293B', overflow: 'hidden'}}>
                  <div style={{width: `${(of / 273) * 100}%`, height: '100%', background: ACCENT}} />
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontFamily, fontSize: 26, color: '#94A3B8', marginTop: 8}}>
                  <span>Complete ride · 9.1 s</span>
                  <span>Crop follows the athlete (EDL keyframes)</span>
                </div>
              </div>
              <Caption text="Picks the full ride and frames it for phones" sub="Tracked crop · 2160×3840 vertical" opacity={prog(lf, 14, 32)} />
            </>
          );
        }}
      </Scene>

      {/* 6. QA GATE: this reel passed */}
      <Scene from={556} dur={80}>
        {(lf) => {
          const rows = [
            {label: 'AI quality review', value: 'delivery 78 · engagement 65', at: 6},
            {label: 'Identity & context check', value: 'PASS', at: 20},
            {label: 'Publish gate', value: 'PASS · ready to post', at: 34},
          ];
          return (
            <>
              <AbsoluteFill style={{background: BG}} />
              <Plate file="grid" opacity={0.7} startFrom={30} />
              <StepChip n={5} label="Quality gate before anything ships" opacity={prog(lf, 2, 14)} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
                {rows.map((r) => {
                  const p = prog(lf, r.at, r.at + 12);
                  return (
                    <div key={r.label} style={{width: 1200, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E293B', border: '1px solid #2D3F55', borderRadius: 20, padding: '28px 42px', opacity: p, transform: `translateY(${(1 - p) * 16}px)`, fontFamily}}>
                      <div style={{fontSize: 44, color: '#94A3B8'}}>{r.label}</div>
                      <div style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 46, fontWeight: 700, color: '#fff'}}>{r.value}<Check size={48} /></div>
                    </div>
                  );
                })}
              </div>
              <Caption text="Weak edits go back for a re-edit" sub="Up to 3 attempts, nothing ships unchecked" opacity={prog(lf, 30, 46)} />
            </>
          );
        }}
      </Scene>

      {/* 7. RESULT */}
      <Scene from={626} dur={104} fadeOut={false}>
        {(lf) => {
          const ph = 880;
          const pw = (ph * 9) / 16;
          const reelIn = prog(lf, 0, 16);
          const textIn = prog(lf, 8, 28);
          const stat = prog(lf, 30, 48);
          return (
            <>
              <AbsoluteFill style={{background: BG}} />
              <Plate file="glow" opacity={0.95} />
              <div style={{position: 'absolute', left: 230, top: 70, opacity: reelIn, transform: `translateY(${(1 - reelIn) * 22}px)`}}>
                <Phone w={pw + 24} h={ph + 24}>
                  <OffthreadVideo src={staticFile('sportreel/reel/reel_0097.mp4')} startFrom={0} muted style={{width: pw, height: ph, objectFit: 'cover'}} />
                </Phone>
              </div>
              <div style={{position: 'absolute', left: 230 + pw + 120, top: 210, opacity: textIn, transform: `translateY(${(1 - textIn) * 16}px)`, fontFamily, color: '#fff'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                  <Img src={staticFile('sportreel/icon.png')} style={{width: 124, height: 124, borderRadius: 28}} />
                  <div style={{fontSize: 100, fontWeight: 700, letterSpacing: -2}}>SportReel</div>
                </div>
                <div style={{fontSize: 52, fontWeight: 700, marginTop: 32, color: ACCENT}}>A personal reel for every athlete</div>
                <div style={{fontSize: 36, color: '#94A3B8', marginTop: 14, lineHeight: 1.45}}>From raw 4K drone footage to a vertical video,<br />detected, tracked, matched and quality-checked.</div>
                <div style={{display: 'flex', gap: 18, marginTop: 40, opacity: stat, transform: `translateY(${(1 - stat) * 12}px)`}}>
                  {['29 clips → 14 reels', 'Gemini', 'YOLO', 'BoT-SORT'].map((c, i) => (
                    <div key={c} style={{fontSize: 30, fontWeight: 700, color: i === 0 ? BG : '#fff', background: i === 0 ? ACCENT : '#1E293B', border: i === 0 ? 'none' : '1px solid #2D3F55', borderRadius: 14, padding: '9px 22px'}}>{c}</div>
                  ))}
                </div>
                <div style={{fontSize: 24, color: '#64748B', marginTop: 22, opacity: stat}}>Figures from one real surfing run</div>
              </div>
            </>
          );
        }}
      </Scene>
    </AbsoluteFill>
  );
};
