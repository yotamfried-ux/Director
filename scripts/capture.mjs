// Usage: node scripts/capture.mjs <slug>
// Captures real product screens in DARK mode, he-IL, 2x DPR. Needs network access to the product URL
// (run on your own machine / Claude Code session, not in the locked-down cloud sandbox).
import {chromium} from 'playwright';
import fs from 'fs';
const slug = process.argv[2] || 'tori';
const cfg = JSON.parse(fs.readFileSync(`products/${slug}.json`, 'utf8'));
const exe = process.env.CHROME_PATH || undefined;
fs.mkdirSync(`assets/${slug}`, {recursive: true});
const b = await chromium.launch({executablePath: exe, args: ['--no-sandbox']});
const shots = [
  {name: 'desktop-calendar', viewport: {width: 1440, height: 900}, path: '/'},
  {name: 'mobile-booking',   viewport: {width: 390,  height: 844}, path: '/', mobile: true},
];
for (const s of shots) {
  const ctx = await b.newContext({viewport: s.viewport, deviceScaleFactor: 2, colorScheme: 'dark', locale: 'he-IL', isMobile: !!s.mobile, hasTouch: !!s.mobile});
  const p = await ctx.newPage();
  await p.goto(cfg.url + s.path.replace(/^\//, ''), {waitUntil: 'networkidle'});
  await p.screenshot({path: `assets/${slug}/${s.name}.png`});
  await ctx.close();
}
await b.close();
console.log('captured', shots.map(s => s.name));
// NOTE: logged-in screens (calendar with demo data) need a demo account/storageState – add per product.
