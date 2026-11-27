#!/usr/bin/env node
// Assigns a day's posts to posting slots with a daily rotation, so each kind of content visits every slot (slot effect is not confounded with content).
//   node scripts/social-schedule.mjs --date YYYY-MM-DD --posts id1,id2,id3 [--json]
// Reads <SOCIAL_DIR>/schedule.json. Output: slot, local time and the UTC instant for each post (feed these to the publishing queue AFTER Yotam approved them).
// This script only plans. It never approves, queues or publishes anything.
import { readFileSync } from "node:fs";
const dir = process.env.SOCIAL_DIR ?? "business/social";
const a = {}, argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) a[argv[i].slice(2)] = argv[i + 1]?.startsWith("--") || argv[i + 1] == null ? true : argv[++i];
const fail = m => { console.error(m); process.exit(2); };
const cfg = JSON.parse(readFileSync(`${dir}/schedule.json`, "utf8"));
if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date ?? "")) fail("--date YYYY-MM-DD required");
const ids = String(a.posts ?? "").split(",").filter(Boolean);
if (ids.length !== cfg.slots.length) fail(`give exactly ${cfg.slots.length} post ids (one per slot)`);
if (new Set(ids).size !== ids.length) fail("post ids must be distinct");
// UTC instant of a local wall-clock time in cfg.tz (handles DST by iterating on the offset)
const utc = (date, time) => {
  const [y, m, d] = date.split("-").map(Number), [hh, mm] = time.split(":").map(Number);
  let t = Date.UTC(y, m - 1, d, hh, mm);
  for (let i = 0; i < 3; i++) {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: cfg.tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(new Date(t)).map(x => [x.type, x.value]));
    const shown = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    t += Date.UTC(y, m - 1, d, hh, mm) - shown;
  }
  return new Date(t).toISOString();
};
const day = Math.round((Date.parse(a.date) - Date.parse(cfg.start)) / 864e5);
if (day < 0) fail("date is before the experiment start in schedule.json");
const n = cfg.slots.length, rows = ids.map((id, i) => { const s = cfg.slots[(i + day) % n]; return { post: id, slot: s.id, label: s.label, local: `${a.date} ${s.time}`, utc: utc(a.date, s.time) }; }).sort((x, y) => x.utc.localeCompare(y.utc));
if (a.json) console.log(JSON.stringify(rows, null, 2)); else rows.forEach(r => console.log(`${r.slot}\t${r.local} ${cfg.tz}\t${r.utc}\t${r.post}`));
