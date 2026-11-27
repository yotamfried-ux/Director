#!/usr/bin/env node
// Weekly social debrief: turns the post log into "double down / cut / no signal" CANDIDATES with denominators.
//   node scripts/social-debrief.mjs [--days 28] [--now ISO] [--min-n 5] [--min-reach 100] [--out file.md]
// Input: <dir>/posts.jsonl, one JSON per line, numbers copied from official Insights (never estimated):
//   {"id","date":"YYYY-MM-DD","product","format":"reel|carousel|image|story","hook","pillar","reach","saves","shares","views3s"?,"source":"Meta Insights"}
// Rules: rates are per reach; a format needs >= min-n posts with reach >= min-reach to have a median, otherwise "no signal";
// candidates are 1.5x / 0.5x the format median of the same window. Output is correlation only, never a cause. Override dir with SOCIAL_DIR.
import { readFileSync, existsSync, writeFileSync } from "node:fs";
const dir = process.env.SOCIAL_DIR ?? "business/social";
const a = {}, argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) a[argv[i].slice(2)] = argv[i + 1]?.startsWith("--") || argv[i + 1] == null ? true : argv[++i];
const days = Number(a.days ?? 28), minN = Number(a["min-n"] ?? 5), minReach = Number(a["min-reach"] ?? 100);
const now = a.now ? Date.parse(a.now) : Date.now(), since = now - days * 864e5;
const file = `${dir}/posts.jsonl`;
if (!existsSync(file)) { console.error(`no ${file}: log posts with their official Insights first`); process.exit(2); }
const all = readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const bad = all.filter(p => !p.source || !/insights/i.test(p.source) || !(p.reach > 0));
if (bad.length) { console.error(`rows without official Insights source or reach: ${bad.map(p => p.id).join(", ")}`); process.exit(2); }
const posts = all.filter(p => Date.parse(p.date) >= since && Date.parse(p.date) <= now).map(p => ({ ...p, saveRate: p.saves / p.reach, shareRate: p.shares / p.reach }));
const med = xs => { const s = [...xs].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = x => (x * 100).toFixed(2) + "%";
const out = [`# Social debrief (${new Date(since).toISOString().slice(0, 10)} .. ${new Date(now).toISOString().slice(0, 10)})`, "", `Posts in window: ${posts.length}. Rates are per reach. Candidates, not conclusions: no causal claims.`, ""];
const formats = [...new Set(posts.map(p => p.format))];
const dd = [], cut = [], nosig = [];
for (const f of formats) {
  const ps = posts.filter(p => p.format === f), ok = ps.filter(p => p.reach >= minReach);
  out.push(`## ${f} (n=${ps.length}, with reach >= ${minReach}: ${ok.length})`);
  if (ok.length < minN) { out.push(`No signal: fewer than ${minN} usable posts, no median.`, ""); ps.forEach(p => nosig.push(p.id)); continue; }
  const ms = med(ok.map(p => p.saveRate)), mh = med(ok.map(p => p.shareRate));
  out.push(`Median saves/reach ${pct(ms)}, shares/reach ${pct(mh)}.`, "", "| post | date | pillar | hook | reach | saves/reach | shares/reach |", "|---|---|---|---|---|---|---|");
  for (const p of ok) {
    out.push(`| ${p.id} | ${p.date} | ${p.pillar ?? ""} | ${String(p.hook ?? "").replace(/\|/g, "/")} | ${p.reach} | ${pct(p.saveRate)} | ${pct(p.shareRate)} |`);
    const hi = p.saveRate >= 1.5 * ms || p.shareRate >= 1.5 * mh, lo = p.saveRate <= 0.5 * ms && p.shareRate <= 0.5 * mh;
    if (hi && !lo) dd.push(`${p.id} (${f}, pillar ${p.pillar ?? "?"})`); else if (lo) cut.push(`${p.id} (${f}, pillar ${p.pillar ?? "?"})`);
  }
  ps.filter(p => p.reach < minReach).forEach(p => nosig.push(p.id)); out.push("");
}
out.push("## Double-down candidates (>= 1.5x the format median on saves or shares)", ...(dd.length ? dd.map(x => `- ${x}`) : ["- none"]), "", "## Cut candidates (<= 0.5x the median on both)", ...(cut.length ? cut.map(x => `- ${x}`) : ["- none"]), "", "## No signal (small format sample or low reach)", ...(nosig.length ? nosig.map(x => `- ${x}`) : ["- none"]), "", "## Next experiment (draft; one change only, approval by Yotam)", "- Hypothesis: <fill from the candidates above, one variable>", "- Success measure and window: <metric per reach, how many posts>", "");
const text = out.join("\n");
if (a.out && a.out !== true) writeFileSync(a.out, text); else console.log(text);
