import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from './Promo';

// SportReel site clip: "from raw drone footage to a personal reel" (16 s, 1920x1080, silent).
// Every box / track id comes from the real Ultralytics+BoT-SORT sidecar of the run (see products/sportreel.md).
// Assets live in public/sportreel/{clips,reel,data}. Proxy files (1280x720) and full-quality files share names,
// so the same composition renders both.

const BG = '#0A0E1A';
const ACCENT = '#00E5FF';
const FEATURE = '#FFD60A';
const SRC_W = 3840;
const SRC_H = 2160;
const CONF_MIN = 0.4; // display threshold for non-featured boxes (declared in the product brief)
const soft = Easing.bezier(0.45, 0, 0.2, 1);
const prog = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: soft});
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Det = {track_id: number; bbox_xyxy: [number, number, number, number]; confidence: number; time_sec: number};
type Sample = {t: number; dets: Det[]};
type Sidecar = {samples: Sample[]};
type Crop = {cx: number; cy: number; w: number; h: number};
type Shot = {out_start: number; out_end: number; keyframes: {out_frame: number; crop: Crop}[]};
type Edl = {shots: Shot[]; output: {duration_sec: number}};

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

// For every track, the real detection nearest in time (max 50 ms away). Nothing is interpolated or smoothed:
// the sidecar only stores some tracks on alternate frames, so we look at the neighbouring samples too.
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

// ---------- overlays ----------
const Boxes: React.FC<{sc: Sidecar | null; t: number; w: number; featured?: number; opacity?: number; labels?: boolean; thin?: boolean}> = ({sc, t, w, featured, opacity = 1, labels = true, thin = false}) => {
  const k = w / SRC_W;
  const dets = detsAt(sc, t).filter((d) => d.track_id === featured || d.confidence >= CONF_MIN);
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      {dets.map((d) => {
        const [x1, y1, x2, y2] = d.bbox_xyxy;
        const isF = d.track_id === featured;
        const color = isF ? FEATURE : ACCENT;
        const bw = isF ? (thin ? 3 : 4.5) : thin ? 1.6 : 2.4;
        return (
          <div key={d.track_id} style={{position: 'absolute', left: x1 * k, top: y1 * k, width: (x2 - x1) * k, height: (y2 - y1) * k, border: `${bw}px solid ${color}`, borderRadius: 4, boxShadow: isF ? `0 0 18px ${FEATURE}88` : 'none', opacity: isF ? 1 : 0.9}}>
            {labels && (
              <div style={{position: 'absolute', left: -bw, top: -(thin ? 26 : 29), background: color, color: '#0A0E1A', fontFamily, fontWeight: 700, fontSize: thin ? 17 : 19, padding: thin ? '1px 7px' : '2px 8px', borderRadius: 4, whiteSpace: 'nowrap'}}>
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
const StepChip: React.FC<{n: number; label: string; opacity: number}> = ({n, label, opacity}) => (
  <div style={{position: 'absolute', left: 64, top: 52, opacity, display: 'flex', alignItems: 'center', gap: 14, fontFamily, color: '#fff'}}>
    <div style={{width: 56, height: 56, borderRadius: 28, background: ACCENT, color: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 30}}>{n}</div>
    <div style={{fontSize: 38, fontWeight: 700, letterSpacing: 0.3, textShadow: '0 2px 14px rgba(0,0,0,.65)'}}>{label}</div>
  </div>
);

const Caption: React.FC<{text: string; sub?: string; opacity: number; y?: number}> = ({text, sub, opacity, y = 0}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', opacity, transform: `translateY(${y}px)`}}>
    <div style={{background: 'rgba(10,14,26,.82)', border: '1px solid #2D3F55', borderRadius: 18, padding: '18px 40px', fontFamily, color: '#fff', textAlign: 'center', backdropFilter: 'blur(6px)'}}>
      <div style={{fontSize: 52, fontWeight: 700}}>{text}</div>
      {sub && <div style={{fontSize: 32, color: '#94A3B8', marginTop: 6}}>{sub}</div>}
    </div>
  </div>
);

const Scene: React.FC<{from: number; dur: number; fadeIn?: boolean; fadeOut?: boolean; children: (local: number, global: number) => React.ReactNode}> = ({from, dur, fadeIn = true, fadeOut = true, children}) => (
  <Sequence from={from} durationInFrames={dur}>
    <SceneInner from={from} dur={dur} fadeIn={fadeIn} fadeOut={fadeOut}>{children}</SceneInner>
  </Sequence>
);
const SceneInner: React.FC<{from: number; dur: number; fadeIn: boolean; fadeOut: boolean; children: (local: number, global: number) => React.ReactNode}> = ({from, dur, fadeIn, fadeOut, children}) => {
  const lf = useCurrentFrame();
  const o = (fadeIn ? prog(lf, 0, 12) : 1) * (fadeOut ? 1 - prog(lf, dur - 12, dur) : 1);
  return <AbsoluteFill style={{opacity: o}}>{children(lf, lf + from)}</AbsoluteFill>;
};

// ---------- composition ----------
export type SportReelSiteProps = {name: string};

export const SportReelSite: React.FC<SportReelSiteProps> = () => {
  const sc0162 = useJson('sportreel/data/0162.json', toSidecar);
  const sc0118 = useJson('sportreel/data/0118.json', toSidecar);
  const sc0146 = useJson('sportreel/data/0146.json', toSidecar);
  const edl = useJson<Edl>('sportreel/data/edl_compact.json', (j) => j);
  const shot1 = edl?.shots[0];

  const cropAt = (of: number): Crop => {
    const kf = shot1?.keyframes ?? [];
    if (kf.length === 0) return {cx: 1264, cy: 944, w: 1036, h: 1842};
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

  const shotLens = useMemo(() => (edl ? edl.shots.map((s) => s.out_end - s.out_start) : [608, 232, 586, 532, 687]), [edl]);
  const totalLen = shotLens.reduce((a, b) => a + b, 0);

  return (
    <AbsoluteFill style={{background: BG}}>
      {/* A+B: raw footage, then detection + tracking on the same shot (clip 0162, 0..5.5 s) */}
      <Scene from={0} dur={177} fadeIn={false}>
        {(lf) => {
          const boxes = prog(lf, 58, 78);
          const capA = prog(lf, 6, 20) * (1 - prog(lf, 52, 64));
          const capB = prog(lf, 70, 88);
          const t = lf / 30;
          return (
            <>
              <Clip file="0162" startFrom={0} w={1920} h={1080} />
              <div style={{position: 'absolute', inset: 0}}>
                <Boxes sc={sc0162} t={t} w={1920} opacity={boxes} />
              </div>
              <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,26,.55) 0%, rgba(10,14,26,0) 22%, rgba(10,14,26,0) 70%, rgba(10,14,26,.6) 100%)'}} />
              <StepChip n={1} label="Raw drone footage" opacity={1 - prog(lf, 54, 66)} />
              <StepChip n={2} label="Detect & track every athlete" opacity={prog(lf, 62, 76)} />
              <Caption text="Raw 4K drone footage, many athletes in frame" opacity={capA} />
              <Caption text="Computer vision finds and tracks everyone" sub="YOLO detection + BoT-SORT tracking, real output" opacity={capB} />
            </>
          );
        }}
      </Scene>

      {/* C: same athlete across separate clips */}
      <Scene from={165} dur={112}>
        {(lf) => {
          const t = 2 + lf / 30;
          const panelW = 900;
          const panelH = 506;
          const y0 = 232;
          const badge = prog(lf, 24, 44);
          return (
            <>
              <AbsoluteFill style={{background: BG}} />
              <StepChip n={3} label="Identity across clips" opacity={prog(lf, 4, 20)} />
              {[{file: '0118', sc: sc0118, id: 10003, x: 50, label: 'Clip A'}, {file: '0146', sc: sc0146, id: 10001, x: 970, label: 'Clip B'}].map((p) => (
                <div key={p.file} style={{position: 'absolute', left: p.x, top: y0, width: panelW, height: panelH, borderRadius: 18, overflow: 'hidden', border: '1px solid #2D3F55', boxShadow: '0 20px 60px rgba(0,0,0,.5)'}}>
                  <Clip file={p.file} startFrom={60} w={panelW} h={panelH} />
                  <Boxes sc={p.sc} t={t} w={panelW} featured={p.id} thin />
                  <div style={{position: 'absolute', left: 14, bottom: 12, fontFamily, fontSize: 24, fontWeight: 700, color: '#fff', background: 'rgba(10,14,26,.78)', padding: '4px 12px', borderRadius: 8}}>{p.label} · different source file</div>
                </div>
              ))}
              <div style={{position: 'absolute', left: 0, right: 0, top: y0 + panelH + 30, display: 'flex', justifyContent: 'center', opacity: badge, transform: `translateY(${(1 - badge) * 12}px)`}}>
                <div style={{fontFamily, color: BG, background: FEATURE, fontWeight: 700, fontSize: 36, padding: '10px 30px', borderRadius: 14}}>★ athlete id ath_aeacfdea76</div>
              </div>
              <Caption text="Same athlete, tracked across separate clips" sub="No face recognition: identity is kept per run" opacity={prog(lf, 12, 32)} />
            </>
          );
        }}
      </Scene>

      {/* D: complete rides, auto-framed 9:16 (clip 0094 = reel shot 1, out_frame = 90 + local) */}
      <Scene from={265} dur={102}>
        {(lf) => {
          const of = 90 + lf;
          const crop = cropAt(of);
          const lw = 1100;
          const lh = (lw * SRC_H) / SRC_W;
          const ph = lh;
          const pw = (ph * 9) / 16;
          const gap = 60;
          const x0 = (1920 - (lw + gap + pw)) / 2;
          const y0 = 110;
          const s = lw / SRC_W;
          const vs = ph / crop.h;
          const tlY = y0 + lh + 44;
          const tlW = lw + gap + pw;
          return (
            <>
              <AbsoluteFill style={{background: BG}} />
              <StepChip n={4} label="Select complete rides, frame 9:16" opacity={prog(lf, 4, 20)} />
              <div style={{position: 'absolute', left: x0, top: y0, width: lw, height: lh, borderRadius: 14, overflow: 'hidden', border: '1px solid #2D3F55'}}>
                <Clip file="0094" startFrom={90} w={lw} h={lh} />
                <div style={{position: 'absolute', left: (crop.cx - crop.w / 2) * s, top: (crop.cy - crop.h / 2) * s, width: crop.w * s, height: crop.h * s, border: `3px solid ${FEATURE}`, borderRadius: 6, boxShadow: '0 0 0 4000px rgba(10,14,26,.5)'}} />
              </div>
              <div style={{position: 'absolute', left: x0 + lw + gap, top: y0, width: pw, height: ph, borderRadius: 14, overflow: 'hidden', border: `2px solid ${FEATURE}`, boxShadow: `0 0 30px ${FEATURE}44`}}>
                <div style={{position: 'absolute', left: -(crop.cx - crop.w / 2) * vs, top: -(crop.cy - crop.h / 2) * vs, width: SRC_W * vs, height: SRC_H * vs}}>
                  <OffthreadVideo src={staticFile('sportreel/clips/0094.mp4')} startFrom={90} muted style={{width: SRC_W * vs, height: SRC_H * vs}} />
                </div>
              </div>
              {/* real reel timeline from the EDL */}
              <div style={{position: 'absolute', left: x0, top: tlY, width: tlW, display: 'flex', gap: 6, opacity: prog(lf, 10, 28)}}>
                {shotLens.map((len, i) => {
                  const w = (len / totalLen) * (tlW - 6 * 4);
                  const fill = i === 0 ? Math.min(1, of / shotLens[0]) : 0;
                  return (
                    <div key={i} style={{width: w}}>
                      <div style={{height: 14, borderRadius: 7, background: '#1E293B', overflow: 'hidden'}}>
                        <div style={{width: `${fill * 100}%`, height: '100%', background: ACCENT}} />
                      </div>
                      <div style={{fontFamily, fontSize: 24, color: '#94A3B8', marginTop: 6}}>Ride {i + 1}</div>
                    </div>
                  );
                })}
              </div>
              <Caption text="Complete rides, auto-selected and framed" sub="5 rides from 5 clips, one 9:16 reel" opacity={prog(lf, 12, 30)} />
            </>
          );
        }}
      </Scene>

      {/* E: QA gate (real result of this run) */}
      <Scene from={355} dur={67}>
        {(lf) => {
          const rows: {label: string; value: string; color: string; at: number}[] = [
            {label: 'Content QA', value: 'PASS', color: '#22C55E', at: 6},
            {label: 'Publish gate', value: 'BLOCKED · review required', color: '#F59E0B', at: 20},
            {label: 'Re-edit request', value: 'opened, attempt 0 of 3', color: ACCENT, at: 34},
          ];
          return (
            <>
              <AbsoluteFill style={{background: BG}} />
              <StepChip n={5} label="Quality gate before anything ships" opacity={prog(lf, 2, 16)} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
                {rows.map((r) => {
                  const p = prog(lf, r.at, r.at + 14);
                  return (
                    <div key={r.label} style={{width: 1060, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E293B', border: '1px solid #2D3F55', borderRadius: 18, padding: '26px 38px', opacity: p, transform: `translateY(${(1 - p) * 16}px)`, fontFamily}}>
                      <div style={{fontSize: 40, color: '#94A3B8', fontWeight: 400}}>{r.label}</div>
                      <div style={{fontSize: 44, fontWeight: 700, color: r.color}}>{r.value}</div>
                    </div>
                  );
                })}
                <div style={{fontFamily, fontSize: 30, color: '#94A3B8', opacity: prog(lf, 38, 52), marginTop: 6}}>Reason: identity sheet needs more crops, ride ends after the athlete leaves frame</div>
              </div>
              <Caption text="The pipeline catches its own weak spots" sub="Nothing is published unchecked" opacity={prog(lf, 24, 42)} />
            </>
          );
        }}
      </Scene>

      {/* F: the personal reel + brand */}
      <Scene from={410} dur={70} fadeOut={false}>
        {(lf) => {
          const ph = 880;
          const pw = (ph * 9) / 16;
          const textIn = prog(lf, 10, 30);
          const reelIn = prog(lf, 0, 18);
                  return (
            <>
              <AbsoluteFill style={{background: BG}} />
              <div style={{position: 'absolute', left: 250, top: 100, width: pw, height: ph, borderRadius: 26, overflow: 'hidden', border: '2px solid #2D3F55', boxShadow: `0 30px 80px rgba(0,0,0,.6), 0 0 60px ${ACCENT}22`, opacity: reelIn, transform: `translateY(${(1 - reelIn) * 20}px)`}}>
                <OffthreadVideo src={staticFile('sportreel/reel/reel_20_28.mp4')} startFrom={30} muted style={{width: pw, height: ph, objectFit: 'cover'}} />
              </div>
              <div style={{position: 'absolute', left: 250 + pw + 120, top: 270, opacity: textIn, transform: `translateY(${(1 - textIn) * 16}px)`, fontFamily, color: '#fff'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
                  <Img src={staticFile('sportreel/icon.png')} style={{width: 120, height: 120, borderRadius: 28}} />
                  <div style={{fontSize: 92, fontWeight: 700, letterSpacing: -1}}>SportReel</div>
                </div>
                <div style={{fontSize: 44, fontWeight: 700, marginTop: 34, color: ACCENT}}>One personal reel per athlete</div>
                <div style={{fontSize: 34, color: '#94A3B8', marginTop: 16, lineHeight: 1.45}}>Drone footage to a vertical 4K video.<br />Silent, ready to post, add your own music.</div>
                <div style={{fontSize: 26, color: '#64748B', marginTop: 28}}>Example reel in review · 2160×3840 · 30 fps · no audio</div>
              </div>
            </>
          );
        }}
      </Scene>
    </AbsoluteFill>
  );
};
