#!/usr/bin/env python3
"""Automatic quality gate for a rendered video. Run BEFORE sending anything to Yotam.

Usage: python3 -I scripts/qa-gate.py <video.mp4> [--product slug] [--locale he|en]
                                      [--expect-size 1920x1080] [--expect-sec 30 --tol 0.5]
Exit code 1 if any FAIL; WARN lines need a human look at the contact sheet.

Checks
  spec    ffprobe: codec, size, fps, duration vs expectation
  cuts    hard cuts: frame-to-frame change far above this clip's own norm (no hard cuts rule)
  frozen  static tail / long static runs (the "dead phone at the end" defect)
  text    OCR once per second: forbidden claims (products/<slug>.json forbidden_text),
          required text (must_appear_text), and caption contrast on OCR word boxes
Not covered (say so when delivering): audio, beat sync, real-device/WhatsApp/live-site rendering,
whether motion *feels* smooth, anything OCR cannot read.
"""
import argparse, json, os, re, subprocess, sys, tempfile, glob
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('video'); ap.add_argument('--product'); ap.add_argument('--locale', default='en')
ap.add_argument('--expect-size'); ap.add_argument('--expect-sec', type=float); ap.add_argument('--tol', type=float, default=0.5)
ap.add_argument('--cut-factor', type=float, default=6.0, help='jump > factor x median motion = cut')
ap.add_argument('--frozen-tail', type=float, default=1.2, help='seconds of static tail that fails')
ap.add_argument('--frozen-any', type=float, default=3.0, help='seconds of static run anywhere that warns')
a = ap.parse_args()
fails, warns = [], []

# ---- spec
p = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=codec_name,width,height,r_frame_rate,pix_fmt:format=duration', '-of', 'json', a.video]))
s = p['streams'][0]; dur = float(p['format']['duration'])
num, den = map(int, s['r_frame_rate'].split('/')); fps = num / den
print(f"spec: {s['codec_name']} {s['width']}x{s['height']} {fps:g}fps {s['pix_fmt']} {dur:.2f}s")
if s['codec_name'] != 'h264': fails.append('codec must be h264')
if s['pix_fmt'] == 'yuvj420p': warns.append('yuvj420p (full range): fine for a Remotion master, but re-encode deliverables to yuv420p')
elif s['pix_fmt'] != 'yuv420p': fails.append('pix_fmt must be yuv420p')
if a.expect_size and f"{s['width']}x{s['height']}" != a.expect_size: fails.append(f'size != {a.expect_size}')
if a.expect_sec and abs(dur - a.expect_sec) > a.tol: fails.append(f'duration {dur:.2f}s != {a.expect_sec}s')

# ---- motion series at 160x90 gray, every frame
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-vf', f'fps={fps},scale=160:90,format=gray', '-f', 'rawvideo', '-'],
                     capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 90, 160).astype(np.float32)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))              # change between consecutive frames
med = max(float(np.median(d)), 0.25)
# a hard cut is an ISOLATED single-frame spike; fast sustained motion (zoom-ins) is not a cut
def local_med(i, k=6):
    nb = np.concatenate([d[max(0, i - k):i], d[i + 1:i + 1 + k]])
    return max(float(np.median(nb)), 0.25) if len(nb) else med
cuts = [i for i in range(len(d)) if d[i] > a.cut_factor * local_med(i) and d[i] > 6.0]
for i in cuts: fails.append(f'hard cut at {(i + 1) / fps:.2f}s (change {d[i]:.1f} vs median {med:.2f})')

# static runs: motion < 0.3 per frame (encoder keyframe flicker is ~0.2) (video noise/grain keeps real footage above this)
static = d < 0.3
runs, st = [], None
for i, v in enumerate(list(static) + [False]):
    if v and st is None: st = i
    if not v and st is not None: runs.append((st, i)); st = None
for b, e in runs:
    length = (e - b) / fps
    if e >= len(d) - 1 and length >= a.frozen_tail: fails.append(f'frozen tail: last {length:.1f}s is static (ends at {dur:.1f}s)')
    elif length >= a.frozen_any: warns.append(f'static run {b / fps:.1f}-{e / fps:.1f}s ({length:.1f}s): intended hold?')
print(f'motion: median {med:.2f}, max {d.max():.1f}, cuts {len(cuts)}, static runs {len(runs)}')

# ---- text: OCR 1 fps
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-vf', 'fps=1', f'{tmp}/f_%03d.png'], check=True)
lang = 'heb+eng' if a.locale == 'he' else 'eng'
words_all, low_contrast = [], []
for f in sorted(glob.glob(tmp + '/f_*.png')):
    img = Image.open(f).convert('RGB'); lum = np.asarray(img.convert('L'), np.float32) / 255
    tsv = subprocess.run(['tesseract', f, '-', '-l', lang, '--psm', '11', 'tsv'], capture_output=True, text=True).stdout.splitlines()[1:]
    t = int(re.search(r'f_(\d+)', f).group(1)) - 1
    for row in tsv:
        c = row.split('\t')
        if len(c) < 12 or not c[11].strip() or float(c[10]) < 60: continue
        x, y, w, h = map(int, c[6:10]); words_all.append(c[11].strip().lower())
        reg = lum[y:y + h, x:x + w]
        if reg.size < 50: continue
        hi, lo = np.percentile(reg, 95), np.percentile(reg, 5)
        lin = lambda v: ((v + 0.055) / 1.055) ** 2.4
        ratio = (lin(max(hi, lo)) + 0.05) / (lin(min(hi, lo)) + 0.05)
        if ratio < 3.0 and len(c[11].strip()) > 2: low_contrast.append((t, c[11].strip(), round(float(ratio), 1)))
text = ' '.join(words_all)
for t, wd, r in low_contrast[:8]: warns.append(f'low contrast (heuristic) {r}:1 at ~{t}s "{wd}"')
if a.product:
    cfg = json.load(open(f'products/{a.product}.json'))
    for bad in cfg.get('forbidden_text', []):
        if bad.lower() in text: fails.append(f'forbidden text on screen: "{bad}"')
    miss = [m for m in cfg.get('must_appear_text', []) if m.lower() not in text]
    if miss: warns.append(f'OCR did not find (check by eye): {miss}')
print(f'ocr: {len(words_all)} confident words, {len(low_contrast)} low-contrast')

for w in warns: print('WARN', w)
for f_ in fails: print('FAIL', f_)
print('QA-GATE', 'FAIL' if fails else 'PASS (with warnings: look at the contact sheet)' if warns else 'PASS')
sys.exit(1 if fails else 0)
