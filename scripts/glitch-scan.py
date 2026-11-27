#!/usr/bin/env python3
"""List glitch frame RUNS (render corruption, dark frames): prints "first-last" ranges whose mean luminance is below the local median by > thr.
Usage: python3 -I scripts/glitch-scan.py <video> [thr=1.0]"""
import subprocess, sys, numpy as np
f = sys.argv[1]; thr = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
w, h = 108, 192
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(float)
m = a.mean(axis=(1, 2)); n = len(m)
bad = [i for i in range(10, n - 20) if m[i] < np.median(m[max(0, i - 4):i + 5]) - thr]
runs = []
for i in bad:
    if runs and i == runs[-1][1] + 1: runs[-1][1] = i
    else: runs.append([i, i])
print(' '.join(f'{x}-{y}' for x, y in runs) if runs else 'none')
