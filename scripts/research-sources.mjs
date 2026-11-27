#!/usr/bin/env node
// Ledger of sources the weekly Claude-practice research has looked at, so each week starts from what is already known.
//   add    --url <u> --type youtube|github|instagram|docs|article|other --topic <t> --read full|partial|metadata --verdict adopted|rejected|watch|unverified [--target engineering-os|director|agent:<id>|none] [--note "<=200 chars"] [--title "<t>"]
//   seen   --url <u>            exit 0 and print the row when already logged, exit 1 when new
//   list   [--since YYYY-MM-DD] [--verdict v]
//   status [--since YYYY-MM-DD] counts by type and verdict, share read in full
// Only public URLs; links that carry tokens or keys in the query are refused. Override the file with RESEARCH_FILE.
import { readFileSync, appendFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
const file = process.env.RESEARCH_FILE ?? "business/research/sources.jsonl";
const [cmd, ...rest] = process.argv.slice(2), a = {};
for (let i = 0; i < rest.length; i++) if (rest[i].startsWith("--")) a[rest[i].slice(2)] = rest[i + 1]?.startsWith("--") || rest[i + 1] == null ? true : rest[++i];
const fail = m => { console.error(m); process.exit(2); };
const TYPES = ["youtube", "github", "instagram", "docs", "article", "other"], READ = ["full", "partial", "metadata"], VERDICT = ["adopted", "rejected", "watch", "unverified"];
const norm = u => {
  let x; try { x = new URL(u); } catch { fail("not a valid URL"); }
  if (!/^https?:$/.test(x.protocol)) fail("only http(s) URLs");
  if ([...x.searchParams.keys()].some(k => /token|key|secret|sig|auth|password/i.test(k))) fail("URL carries a credential-like parameter: refused");
  const host = x.hostname.replace(/^www\./, "").replace(/^m\./, "");
  if (host === "youtu.be") return `youtube.com/watch?v=${x.pathname.slice(1)}`;
  if (host === "youtube.com" && x.searchParams.get("v")) return `youtube.com/watch?v=${x.searchParams.get("v")}`;
  return host + x.pathname.replace(/\/$/, "");
};
const rows = () => existsSync(file) ? readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
const since = r => !a.since || r.date >= a.since;
if (cmd === "add") {
  for (const k of ["url", "type", "topic", "read", "verdict"]) if (!a[k] || a[k] === true) fail(`--${k} required`);
  if (!TYPES.includes(a.type)) fail(`--type one of ${TYPES}`); if (!READ.includes(a.read)) fail(`--read one of ${READ}`); if (!VERDICT.includes(a.verdict)) fail(`--verdict one of ${VERDICT}`);
  const key = norm(a.url), old = rows().find(r => r.key === key);
  if (old && old.verdict === a.verdict && old.read === a.read) { console.log("already logged, unchanged"); process.exit(0); }
  const row = { key, url: a.url, type: a.type, topic: String(a.topic).slice(0, 80), read: a.read, verdict: a.verdict, target: a.target ?? "none", title: String(a.title ?? "").slice(0, 120), note: String(a.note ?? "").slice(0, 200), date: a.now ?? new Date().toISOString().slice(0, 10) };
  mkdirSync(dirname(file), { recursive: true }); appendFileSync(file, JSON.stringify(row) + "\n"); console.log(old ? "updated" : "added");
} else if (cmd === "seen") {
  if (!a.url || a.url === true) fail("--url required");
  const last = rows().filter(r => r.key === norm(a.url)).pop();
  if (last) { console.log(JSON.stringify(last)); process.exit(0); } process.exit(1);
} else if (cmd === "list") {
  const latest = new Map(rows().map(r => [r.key, r]));
  for (const r of latest.values()) if (since(r) && (!a.verdict || r.verdict === a.verdict)) console.log(`${r.date}\t${r.type}\t${r.verdict}\t${r.read}\t${r.target}\t${r.url}`);
} else if (cmd === "status") {
  const latest = [...new Map(rows().map(r => [r.key, r])).values()].filter(since), n = latest.length, by = {};
  for (const r of latest) { const k = `${r.type}/${r.verdict}`; by[k] = (by[k] ?? 0) + 1; }
  console.log(`sources: ${n}, read in full: ${latest.filter(r => r.read === "full").length}, metadata only: ${latest.filter(r => r.read === "metadata").length}`);
  for (const [k, v] of Object.entries(by).sort()) console.log(`${k}\t${v}`);
  if (!n) console.log("ledger empty for this period");
} else fail("usage: research-sources.mjs add|seen|list|status");
