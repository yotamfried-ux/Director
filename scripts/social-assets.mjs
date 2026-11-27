#!/usr/bin/env node
// Asset inbox with a used/unused ledger for social content (Yotam drops real photos/clips/screens; the agent never reuses blindly).
//   scan   [--product <slug>]          hash new files under <dir>/assets/inbox/<product>/ and add them to the ledger
//   next   --product <slug> [--kind photo|clip|graphic] [--n 3]   oldest unused assets
//   add    --file <path> --product <slug> --source "<how it was made>" [--name <file name>]   copy a file the agent produced into the inbox and register it with provenance
//   use    --id <id> --post <post-id>   mark an asset as used in a post (a draft id or a published post id)
//   status [--product <slug>] [--low 3] counts per product; exit 3 when unused assets are below --low (ask Yotam for more)
// Media files live in business/social/assets/inbox/ (gitignored). Only the ledger (ids, relative paths, dates) is committed:
// never put people's names or contact details in file names. Override the dir with SOCIAL_DIR.
import { readFileSync, appendFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, extname, relative, basename } from "node:path";
const dir = process.env.SOCIAL_DIR ?? "business/social";
const inbox = join(dir, "assets", "inbox"), ledgerFile = join(dir, "assets", "ledger.jsonl");
const [cmd, ...rest] = process.argv.slice(2), a = {};
for (let i = 0; i < rest.length; i++) if (rest[i].startsWith("--")) a[rest[i].slice(2)] = rest[i + 1]?.startsWith("--") || rest[i + 1] == null ? true : rest[++i];
const fail = m => { console.error(m); process.exit(2); };
const KIND = { ".jpg": "photo", ".jpeg": "photo", ".png": "graphic", ".webp": "graphic", ".mp4": "clip", ".mov": "clip" };
const rows = () => existsSync(ledgerFile) ? readFileSync(ledgerFile, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
const append = o => { mkdirSync(join(dir, "assets"), { recursive: true }); appendFileSync(ledgerFile, JSON.stringify(o) + "\n"); };
const state = () => {
  const assets = new Map();
  for (const r of rows()) {
    if (r.type === "asset") assets.set(r.id, { ...r, used_in: [] });
    else if (r.type === "use" && assets.has(r.id)) assets.get(r.id).used_in.push(r.post);
  }
  return [...assets.values()];
};
const walk = d => !existsSync(d) ? [] : readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
if (cmd === "scan") {
  const have = new Set(state().map(x => x.id)); let added = 0, skipped = 0;
  for (const f of walk(inbox).sort()) {
    const rel = relative(inbox, f), product = rel.split("/")[0], kind = KIND[extname(f).toLowerCase()];
    if (a.product && a.product !== product) continue;
    if (!kind || rel.split("/").length < 2) { skipped++; continue; }
    if (/[\w.+-]+@[\w-]+\.\w+|\+?\d[\d\s-]{8,}/.test(rel)) fail(`file name looks like it holds personal data: ${rel}`);
    const id = createHash("sha256").update(readFileSync(f)).digest("hex").slice(0, 12);
    if (have.has(id)) continue;
    append({ type: "asset", id, product, kind, path: rel, added: a.now ?? new Date().toISOString().slice(0, 10) }); have.add(id); added++;
  }
  console.log(`scan: added ${added}, skipped ${skipped} (unsupported or not inside a <product>/ folder)`);
} else if (cmd === "add") {
  for (const k of ["file", "product", "source"]) if (!a[k] || a[k] === true) fail(`--${k} required`);
  if (!/^[a-z0-9-]+$/.test(a.product)) fail("--product must be a slug (a-z, 0-9, -)");
  if (!existsSync(a.file)) fail("file not found");
  const name = a.name && a.name !== true ? a.name : basename(a.file), kind = KIND[extname(name).toLowerCase()];
  if (!kind) fail("unsupported file type (jpg, png, webp, mp4, mov)");
  if (/[\w.+-]+@[\w-]+\.\w+|\+?\d[\d\s-]{8,}/.test(name)) fail(`file name looks like it holds personal data: ${name}`);
  const id = createHash("sha256").update(readFileSync(a.file)).digest("hex").slice(0, 12);
  if (state().some(x => x.id === id)) { console.log(`already registered: ${id}`); process.exit(0); }
  mkdirSync(join(inbox, a.product), { recursive: true }); copyFileSync(a.file, join(inbox, a.product, name));
  append({ type: "asset", id, product: a.product, kind, path: `${a.product}/${name}`, source: String(a.source).slice(0, 200), added: a.now ?? new Date().toISOString().slice(0, 10) });
  console.log(`${id}\t${kind}\t${a.product}/${name}`);
} else if (cmd === "next") {
  if (!a.product || a.product === true) fail("--product required");
  const n = Number(a.n ?? 3), list = state().filter(x => x.product === a.product && !x.used_in.length && (!a.kind || x.kind === a.kind)).slice(0, n);
  for (const x of list) console.log(`${x.id}\t${x.kind}\t${x.path}${x.source ? "\t(" + x.source + ")" : ""}`);
  if (!list.length) { console.log("no unused assets: ask Yotam for more"); process.exit(3); }
} else if (cmd === "use") {
  if (!a.id || !a.post || a.id === true || a.post === true) fail("--id and --post required");
  if (!state().some(x => x.id === a.id)) fail("unknown asset id");
  append({ type: "use", id: a.id, post: a.post, at: a.now ?? new Date().toISOString().slice(0, 10) }); console.log("recorded");
} else if (cmd === "status") {
  const low = Number(a.low ?? 3), by = {};
  for (const x of state()) { if (a.product && x.product !== a.product) continue; const b = by[x.product] ??= { total: 0, unused: 0, used: 0 }; b.total++; x.used_in.length ? b.used++ : b.unused++; }
  let alarm = false;
  for (const [p, b] of Object.entries(by)) { const l = b.unused < low; alarm ||= l; console.log(`${p}\ttotal ${b.total}\tused ${b.used}\tunused ${b.unused}${l ? "\tLOW: ask Yotam for more assets" : ""}`); }
  if (!Object.keys(by).length) { console.log("ledger empty: run scan after Yotam adds files to the inbox"); alarm = true; }
  process.exit(alarm ? 3 : 0);
} else fail("usage: social-assets.mjs scan|add|next|use|status");
