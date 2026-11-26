#!/usr/bin/env node
// Groups listings into recurring project types and ranks them.
// Usage: node scripts/demand-analyze.mjs <listings.json> [effort.json] [--json]
// Demand is counted from the data. ROI is computed ONLY from Yotam's effort estimates; without them the cluster is marked "needs estimate".
import { readFileSync } from "node:fs";
const [file, effortFile] = process.argv.slice(2).filter(a => !a.startsWith("--"));
if (!file) { console.error("usage: demand-analyze.mjs <listings.json> [effort.json] [--json]"); process.exit(2); }
const asJson = process.argv.includes("--json");
const listings = JSON.parse(readFileSync(file, "utf8"));
const effort = effortFile ? JSON.parse(readFileSync(effortFile, "utf8")) : { hourly_value: null, clusters: {} };
const THRESHOLD = 0.5;
const jaccard = (a, b) => { const A = new Set(a), B = new Set(b), i = [...A].filter(x => B.has(x)).length; return A.size + B.size - i === 0 ? 0 : i / (A.size + B.size - i); };
const median = xs => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const bad = listings.filter(l => !l.id || !l.category || !Array.isArray(l.tags));
if (bad.length) { console.error(`${bad.length} listing(s) missing id/category/tags`); process.exit(2); }
const seen = new Set(), unique = listings.filter(l => !seen.has(l.id) && seen.add(l.id));
const clusters = [];
for (const l of unique) {
  const tags = l.tags.map(t => String(t).toLowerCase());
  const home = clusters.find(c => c.category === l.category && jaccard(c.tags, tags) >= THRESHOLD);
  if (home) { home.items.push(l); home.tags = [...new Set([...home.tags, ...tags])].filter(t => home.items.filter(i => i.tags.map(x => String(x).toLowerCase()).includes(t)).length * 2 >= home.items.length); if (!home.tags.length) home.tags = tags; }
  else clusters.push({ category: l.category, tags, items: [l] });
}
const rows = clusters.map(c => {
  const key = `${c.category}:${[...c.tags].sort().slice(0, 3).join("+")}`;
  const posters = new Set(c.items.map(i => i.poster_ref ?? i.url ?? i.id)).size;
  const sources = new Set(c.items.map(i => i.source)).size;
  const il = c.items.filter(i => i.region === "IL").length;
  const byCur = {};
  for (const i of c.items) if (i.currency && (i.budget_min != null || i.budget_max != null)) (byCur[i.currency] ??= []).push(((i.budget_min ?? i.budget_max) + (i.budget_max ?? i.budget_min)) / 2);
  const budgets = Object.fromEntries(Object.entries(byCur).map(([k, v]) => [k, { n: v.length, median: median(v), total: v.reduce((a, b) => a + b, 0) }]));
  const e = effort.clusters?.[key];
  let roi = null;
  if (e?.first_build_hours != null && e?.repeat_build_hours != null) {
    const hours = e.first_build_hours + (posters - 1) * e.repeat_build_hours;
    roi = Object.fromEntries(Object.entries(budgets).map(([cur, b]) => [cur, { budget_total: b.total, build_hours: hours, per_hour: Math.round(b.total / hours) , budgeted_listings: b.n, of: c.items.length }]));
  }
  return { key, category: c.category, listings: c.items.length, distinct_posters: posters, sources, israel_share: Math.round(100 * il / c.items.length) / 100, budgets, effort_estimate: e ? "provided" : "needs estimate", roi_per_build_hour: roi, example_urls: c.items.slice(0, 3).map(i => i.url) };
}).sort((a, b) => (b.distinct_posters - a.distinct_posters) || (b.listings - a.listings));
if (asJson) { console.log(JSON.stringify({ listings: unique.length, duplicates_dropped: listings.length - unique.length, clusters: rows }, null, 2)); process.exit(0); }
console.log(`# Recurring demand (${unique.length} listings, ${listings.length - unique.length} duplicates dropped)\n`);
console.log("| project type | listings | distinct posters | IL share | budget (per currency) | per build hour | estimate |\n|---|---|---|---|---|---|---|");
for (const r of rows) console.log(`| ${r.key} | ${r.listings} | ${r.distinct_posters} | ${r.israel_share} | ${Object.entries(r.budgets).map(([k, b]) => `${k} median ${b.median} (n=${b.n})`).join("; ") || "no public budgets"} | ${r.roi_per_build_hour ? Object.entries(r.roi_per_build_hour).map(([k, v]) => `${k} ${v.per_hour}`).join("; ") : "n/a"} | ${r.effort_estimate} |`);
console.log("\nReading guide: a type is a candidate to productise when distinct posters >= 3 across >= 2 sources. Budgets exist only where the listing showed one; per-build-hour uses only your effort estimates.");
