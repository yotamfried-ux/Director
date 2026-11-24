#!/usr/bin/env python3
"""Usage: scripts/analyze-music.py a.mp3 b.mp3 ...  -> duration, rough BPM, brightness (spectral centroid), loudness.
Numbers only: it cannot tell if a track *sounds* right. Always give the human named options (A/B), never "left/right"."""
import subprocess, sys, tempfile, os, wave
import numpy as np
from scipy.signal import stft
for path in sys.argv[1:]:
    wav = os.path.join(tempfile.mkdtemp(), "a.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", "11025", wav], check=True)
    w = wave.open(wav); sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
    f, t, Z = stft(x, sr, nperseg=512, noverlap=256); S = np.abs(Z)
    flux = np.maximum(0, np.diff(S, axis=1)).sum(0); flux -= flux.mean(); hop = 256 / sr
    ac = np.correlate(flux, flux, "full")[len(flux) - 1:]
    lo, hi = int(60 / 180 / hop), int(60 / 70 / hop)
    bpm = 60 / ((lo + np.argmax(ac[lo:hi])) * hop)
    print(f"{os.path.basename(path):40s} dur={len(x)/sr:6.1f}s bpm~{bpm:5.1f} centroid={(f[:,None]*S).sum()/S.sum():6.0f}Hz rms={np.sqrt((x**2).mean()):.3f}")
