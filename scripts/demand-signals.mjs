#!/usr/bin/env node
// Ranks business needs by evidence and matches each to an existing product/asset.
// Usage: node scripts/demand-signals.mjs <listings.json> [phrases.json] [assets.json] [--json]
// A listing may carry: need (id from phrases.json need_patterns), signals (["existing-spend","time-loss","willing-to-pay"]), matched_phrases (phrase ids).
// Priority = evidence weights; it ranks attention and never claims revenue. No signal is inferred here: the agent tags from the listing's own words.
import { readFileSync } from "node:fs";
const files = process.argv.slice(2).filter(a => !a.startsWith("--"));
const [lf, pf = "business/demand/phrases.json", af = "business/demand/assets.json"] = files;
if (!lf) { console.error("usage: demand-signals.mjs <listings.json> [phrases.json] [assets.json] [--json]"); process.exit(2); }
const listings = JSON.parse(readFileSync(lf, "utf8")), bank = JSON.parse(readFileSync(pf, "utf8")), assets = JSON.parse(readFileSync(af, "utf8")).assets;
const W = { "existing-spend": 3, "time-loss": 2, "willing-to-pay": 2 }, tier = s => s >= 5 ? "high" : s >= 3 ? "medium" : "low";
const known = new Set(bank.need_patterns.map(n => n.id)), badNeed = listings.filter(l => l.need && !known.has(l.need)).map(l => l.id);
const out = bank.need_patterns.map(n => {
  const ls = listings.filter(l => l.need === n.id);
  const posters = new Set(ls.map(l => l.poster_ref ?? l.url ?? l.id)).size, sources = new Set(ls.map(l => l.source)).size;
  const sig = {}; for (const l of ls) for (const s of new Set(l.signals ?? [])) if (W[s]) sig[s] = (sig[s] ?? 0) + 1;
  const recurring = posters >= 3 && sources >= 2;
  const lvl = ls.length ? Math.max(...ls.map(l => l.evidence_level ?? ((l.signals ?? []).includes("willing-to-pay") ? 4 : (l.signals ?? []).some(x => W[x]) ? 3 : 2))) : null;
  const inf = ls.filter(l => l.kind === "inferred").length, kind = !ls.length ? null : inf === 0 ? "explicit" : inf === ls.length ? "inferred" : "mixed";
  const score = Object.keys(sig).reduce((a, s) => a + W[s], 0) + (recurring ? 3 : 0);
  const need = n.tags.map(t => t.toLowerCase());
  const best = assets.map(a => { const have = new Set(a.capabilities.map(t => t.toLowerCase())), c = need.filter(t => have.has(t)); return { asset: a.id, confirmed: a.confirmed === true, coverage: Math.round(100 * c.length / need.length) / 100, covered: c, missing: need.filter(t => !have.has(t)) }; }).sort((x, y) => y.coverage - x.coverage)[0];
  const t = ls.length ? tier(score) : "none";
  const offer = ls.length && best?.coverage >= 0.67 && t !== "low" ? "prepare-offer-draft" : ls.length ? "watch" : "no-data";
  return { need: n.id, label: n.label, listings: ls.length, distinct_posters: posters, sources, signals: sig, recurring, score, priority: t, evidence_level: lvl, request_kind: kind, best_base: best?.coverage > 0 ? best : null, action: offer };
}).sort((a, b) => b.score - a.score || b.listings - a.listings);
const yieldBy = {}; for (const l of listings) for (const p of l.matched_phrases ?? []) { const y = yieldBy[p] ??= { listings: 0, with_signal: 0 }; y.listings++; if ((l.signals ?? []).length) y.with_signal++; }
const phrases = bank.phrases.map(p => ({ id: p.id, ...(yieldBy[p.id] ?? { listings: 0, with_signal: 0 }) }));
const res = { listings: listings.length, unknown_need_ids: badNeed, needs: out, phrase_yield: phrases };
if (process.argv.includes("--json")) { console.log(JSON.stringify(res, null, 2)); process.exit(0); }
console.log("| need | listings | posters | signals | recurring | evidence level | request | priority | best existing base | action |\n|---|---|---|---|---|---|---|---|---|---|");
for (const r of out) console.log(`| ${r.need} | ${r.listings} | ${r.distinct_posters} | ${Object.entries(r.signals).map(([k, v]) => `${k}x${v}`).join(", ") || "-"} | ${r.recurring ? "yes" : "no"} | ${r.evidence_level ?? "-"} | ${r.request_kind === "inferred" ? "INFERRED, not a customer request" : r.request_kind ?? "-"} | ${r.priority} (${r.score}) | ${r.best_base ? `${r.best_base.asset}${r.best_base.confirmed ? "" : " (unconfirmed)"} ${Math.round(r.best_base.coverage * 100)}%, missing: ${r.best_base.missing.join(", ") || "none"}` : "none"} | ${r.action} |`);
if (badNeed.length) console.log(`\nWARNING: ${badNeed.length} listing(s) use an unknown need id.`);
console.log("\nPhrase yield (drop candidates: zero listings over 3 runs): " + phrases.map(p => `${p.id}=${p.listings}/${p.with_signal}`).join(", "));
