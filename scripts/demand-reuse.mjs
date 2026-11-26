#!/usr/bin/env node
// For each recurring demand cluster, which of Yotam's existing projects is already most of the work?
// Usage: node scripts/demand-reuse.mjs <listings.json> [assets.json] [effort.json] [--json]
// Coverage = share of the cluster's tags that an asset's capabilities already cover. The missing tags are the adaptation work.
// Hours: only if Yotam supplied `reuse_hours_saved` on the asset AND `first_build_hours` for the cluster; both are his numbers, nothing is guessed.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const files = process.argv.slice(2).filter(a => !a.startsWith("--"));
const [listings, assetsFile = "business/demand/assets.json", effortFile] = files;
if (!listings) { console.error("usage: demand-reuse.mjs <listings.json> [assets.json] [effort.json] [--json]"); process.exit(2); }
const analyze = JSON.parse(execFileSync("node", ["scripts/demand-analyze.mjs", listings, ...(effortFile ? [effortFile] : []), "--json"], { encoding: "utf8" }));
const assets = JSON.parse(readFileSync(assetsFile, "utf8")).assets;
const effort = effortFile ? JSON.parse(readFileSync(effortFile, "utf8")) : { clusters: {} };
const norm = t => String(t).toLowerCase();
const rows = analyze.clusters.map(c => {
  const need = c.tags.map(norm);
  const matches = assets.map(a => {
    const have = new Set(a.capabilities.map(norm)), covered = need.filter(t => have.has(t)), missing = need.filter(t => !have.has(t));
    const coverage = need.length ? covered.length / need.length : 0;
    const level = coverage >= 0.67 ? "strong" : coverage >= 0.34 ? "partial" : "weak";
    const first = effort.clusters?.[c.key]?.first_build_hours;
    const hours = a.reuse_hours_saved != null && first != null ? { first_build_from_scratch: first, reuse_hours_saved: a.reuse_hours_saved, first_build_with_reuse: Math.max(0, first - a.reuse_hours_saved) } : null;
    return { asset: a.id, confirmed: a.confirmed === true, same_category: a.category === c.category, coverage: Math.round(coverage * 100) / 100, level, covered, missing_to_build: missing, hours };
  }).filter(m => m.coverage > 0).sort((p, q) => q.coverage - p.coverage || (q.same_category - p.same_category));
  return { cluster: c.key, distinct_posters: c.distinct_posters, israel_listings: c.israel_listings, listings: c.listings, best: matches[0] ?? null, others: matches.slice(1, 3) };
});
if (process.argv.includes("--json")) { console.log(JSON.stringify({ clusters: rows }, null, 2)); process.exit(0); }
console.log("| project type | posters | best existing base | coverage | already covered | still to build | hours with reuse |\n|---|---|---|---|---|---|---|");
for (const r of rows) { const b = r.best; console.log(`| ${r.cluster} | ${r.distinct_posters} | ${b ? `${b.asset}${b.confirmed ? "" : " (unconfirmed)"}${b.same_category ? "" : " (other category)"}` : "none"} | ${b ? `${Math.round(b.coverage * 100)}% ${b.level}` : "-"} | ${b?.covered.join(", ") || "-"} | ${b?.missing_to_build.join(", ") || "-"} | ${b?.hours ? `${b.hours.first_build_with_reuse}h (was ${b.hours.first_build_from_scratch}h)` : "needs your estimate"} |`); }
console.log("\nReading guide: strong = most of the work exists; partial = a real head start with listed gaps; weak = not worth calling reuse. Tags come from listings and from asset descriptions, so a missing tag may only mean the listing used another word.");
