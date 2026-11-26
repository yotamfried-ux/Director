#!/usr/bin/env node
// CC0-only music search on Freesound (official API v2). Read-only: lists candidates, downloads nothing.
// Usage: FREESOUND_API_KEY=... node scripts/music-search.mjs "<query>" [--min 20] [--max 90] [--limit 10]
// Why not a generic Freesound MCP: those servers pass the license filter through unchecked and download lossy previews.
// Here the license filter is built in AND every result is re-checked client-side; anything that is not CC0 is dropped and counted.
// Next step after a pick: download the ORIGINAL from the sound page (needs Yotam's login), then follow docs/04-music.md.
const args = process.argv.slice(2), query = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? Number(args[i + 1]) : d; };
if (!query) { console.error('usage: music-search.mjs "<query>" [--min s] [--max s] [--limit n]'); process.exit(2); }
const key = process.env.FREESOUND_API_KEY;
if (!key) { console.error("set FREESOUND_API_KEY (free key from freesound.org/apiv2/apply)"); process.exit(2); }
const base = process.env.FREESOUND_BASE ?? "https://freesound.org/apiv2";
const CC0 = "http://creativecommons.org/publicdomain/zero/1.0/";
const min = opt("min", 20), max = opt("max", 90), limit = Math.min(opt("limit", 10), 50);
const filter = `license:"Creative Commons 0" duration:[${min} TO ${max}]`;
const url = `${base}/search/text/?query=${encodeURIComponent(query)}&filter=${encodeURIComponent(filter)}&page_size=${limit}&fields=id,name,duration,license,url,username,tags`;
const res = await fetch(url, { headers: { Authorization: `Token ${key}` } });
if (!res.ok) { console.error(`Freesound ${res.status}`); process.exit(1); }
const data = await res.json();
const all = data.results ?? [], keep = all.filter(r => r.license === CC0);
console.log(JSON.stringify({ query, requested_filter: filter, returned: all.length, dropped_not_cc0: all.length - keep.length, candidates: keep.map(r => ({ id: r.id, name: r.name, seconds: Math.round(r.duration), license: "CC0", page: r.url, by: r.username, tags: (r.tags ?? []).slice(0, 8) })), note: "Offer Yotam two options named A/B. The agent cannot hear: describe only what the tags and numbers say." }, null, 2));
