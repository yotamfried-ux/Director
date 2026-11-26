#!/usr/bin/env node
// Demand -> lead path. After Yotam delivers a project, find the earlier listings that asked for the same kind of work
// and prepare OFFER CANDIDATES for his approval. Sends nothing, writes no message text, stores no personal data.
// Usage: node scripts/demand-match.mjs <listings.json> <delivered.json> [--sources business/demand/sources.json]
//        [--outreach business/demand/outreach.json] [--max-age-days 120] [--today YYYY-MM-DD] [--d2r]
// delivered.json: [{ "slug", "title", "category", "tags": [], "delivered_on": "YYYY-MM-DD", "offer": "one line in your own words" }]
// outreach.json (git-ignored ledger): [{ "poster_ref", "delivered_slug", "state": "candidate|drafted|approved|sent|replied|won|lost|opted_out", "on": "YYYY-MM-DD" }]
// --d2r prints lead records (consent none, status new) for scripts/d2r-ingest.mjs. The private contact route is the listing URL on its platform.
import { readFileSync, existsSync } from "node:fs";
const args = process.argv.slice(2), flags = {}, pos = [];
for (let i = 0; i < args.length; i++) { if (args[i].startsWith("--")) { const k = args[i].slice(2); flags[k] = ["d2r"].includes(k) ? true : args[++i]; } else pos.push(args[i]); }
const [listingsFile, deliveredFile] = pos;
if (!listingsFile || !deliveredFile) { console.error("usage: demand-match.mjs <listings.json> <delivered.json> [options]"); process.exit(2); }
const read = f => JSON.parse(readFileSync(f, "utf8"));
const listings = read(listingsFile), delivered = read(deliveredFile);
const sources = Object.fromEntries((existsSync(flags.sources ?? "business/demand/sources.json") ? read(flags.sources ?? "business/demand/sources.json").sources : []).map(s => [s.id, s]));
const ledger = flags.outreach && existsSync(flags.outreach) ? read(flags.outreach) : [];
const maxAge = Number(flags["max-age-days"] ?? 120);
const today = new Date(flags.today ?? new Date().toISOString().slice(0, 10));
const jaccard = (a, b) => { const A = new Set(a), B = new Set(b), i = [...A].filter(x => B.has(x)).length; return A.size + B.size - i === 0 ? 0 : i / (A.size + B.size - i); };
const days = d => Math.floor((today - new Date(d)) / 864e5);
const out = [], skipped = [];
for (const d of delivered) {
  const dt = d.tags.map(t => String(t).toLowerCase()), seenPosters = new Set();
  for (const l of listings) {
    const why = [];
    const tags = (l.tags ?? []).map(t => String(t).toLowerCase()), j = jaccard(dt, tags);
    if (l.category !== d.category || j < 0.5) continue;                       // not the same kind of work: not even reported
    const when = l.posted_on ?? l.seen_on, age = when ? days(when) : null;
    const poster = l.poster_ref ?? l.url ?? l.id;
    const policy = sources[l.source]?.outreach ?? "manual-by-yotam";
    if (policy === "forbidden") why.push("source terms forbid contacting posters");
    if (age == null) why.push("no date on listing"); else if (age > maxAge) why.push(`listing is ${age} days old (limit ${maxAge})`);
    const prior = ledger.filter(r => r.poster_ref === poster);
    if (prior.some(r => r.state === "opted_out")) why.push("poster opted out");
    if (prior.some(r => r.delivered_slug === d.slug)) why.push("already offered this project");
    if (seenPosters.has(poster)) why.push("duplicate poster for this project");
    if (why.length) { skipped.push({ delivered: d.slug, listing: l.id, reasons: why }); continue; }
    seenPosters.add(poster);
    out.push({ delivered: d.slug, listing: l.id, source: l.source, region: l.region, poster_ref: poster, url: l.url, age_days: age, tag_overlap: dt.filter(t => tags.includes(t)), similarity: Math.round(j * 100) / 100, channel: policy, state: "candidate", still_needed: ["draft in the poster's language", "Yotam approval per message", "check platform rules on contacting/off-platform deals", "legal check before any email/SMS (Israeli anti-spam law)"] });
  }
}
if (flags.d2r) {
  const records = out.map(c => ({ type: "lead", key: `demand-${c.listing}-${c.delivered}`.slice(0, 80), name: `פונה בפלטפורמה ${c.source} (מודעה ${c.listing})`.slice(0, 120), contact: c.url ?? "", source: `demand:${c.source}`, product: c.delivered, status: "new", consent: "none", optedOut: false, nextAction: "לנסח הצעה לאישור יותם", note: `התאמה ${c.similarity}, גיל מודעה ${c.age_days} ימים` }));
  console.log(JSON.stringify({ records }, null, 2)); process.exit(0);
}
console.log(JSON.stringify({ as_of: today.toISOString().slice(0, 10), candidates: out, skipped, counts: { candidates: out.length, skipped: skipped.length } }, null, 2));
