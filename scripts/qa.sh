#!/usr/bin/env bash
# Usage: scripts/qa.sh <slug> <video>
# Extracts 1 frame/sec, OCRs each (Hebrew pass + English pass, light preprocessing) and
# fuzzy-matches every string in must_appear_text (>=0.8 similarity). Exit 1 if any is missing.
set -euo pipefail
slug="$1"; vid="$2"; d="$(mktemp -d)"
ffmpeg -v error -i "$vid" -vf "fps=1,format=gray,eq=contrast=1.4" "$d/f_%02d.png"
python3 - "$slug" "$d" <<'PY'
import json,sys,glob,subprocess,difflib,re
slug,d=sys.argv[1:3]
need=json.load(open(f'products/{slug}.json'))['must_appear_text']
lines=[]
for f in sorted(glob.glob(d+'/f_*.png')):
    for lang in ('heb','eng'):
        out=subprocess.run(['tesseract',f,'-','-l',lang,'--psm','6'],capture_output=True,text=True).stdout
        lines+= [l.strip().lower() for l in out.splitlines() if l.strip()]
def found(t):
    t=t.lower()
    for l in lines:
        if t in l: return True
        words=l.split(); n=len(t.split())
        for i in range(max(1,len(words)-n+1)):
            if difflib.SequenceMatcher(None,t,' '.join(words[i:i+n])).ratio()>=0.8: return True
    return False
missing=[t for t in need if not found(t)]
print('MISSING:',missing) if missing else print('QA OK')
sys.exit(1 if missing else 0)
PY
