# Setup / installations

```bash
git clone https://github.com/yotamfried-ux/Director && cd Director
npm ci                                   # remotion 4, react, playwright, heebo font
sudo apt-get install -y ffmpeg tesseract-ocr tesseract-ocr-heb tesseract-ocr-eng   # sandbox usually has them
pip install --break-system-packages numpy scipy pillow
export CHROME_PATH=/usr/bin/google-chrome   # used by remotion.config.ts
```
- Remotion cannot always download its own Chrome in the sandbox → use system Chrome. Always `--gl=swangle`.
- Network in the sandbox is allow-listed: npm/pip and GitHub work; most other sites don't. Pull assets from Google Drive via the connector, music via GitHub (`scripts/fetch-music.sh`).
- For repos you push to: add via the session's `add_repo` (push access), clone with `--depth 1`, push with `-c push.negotiate=true`.
- Product screenshots come from the product's own repo/CI evidence or Drive; real capture needs the app running (Supabase local + `next start`), see `products/tori.md`.
