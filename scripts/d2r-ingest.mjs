#!/usr/bin/env node
// Signs and sends a batch of business records to D2R Management (private store).
// Usage: node scripts/d2r-ingest.mjs <records.json | --roster> [--send]
// Record types: lead customer post metric run agent publication digest (publications need Yotam's approval on the D2R Approvals screen).
// Default is a dry run: validates shape, prints counts, sends nothing.
// Env: D2R_BASE_URL (e.g. https://<app-domain>), D2R_AGENT_SECRET (32+ chars).
// Never commit the records file: it contains personal data.
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

let [file, flag] = process.argv.slice(2);
// --roster: build the agent roster records from agents/registry.json (no personal data), then continue as usual.
if (file === "--roster") {
  const reg = JSON.parse(readFileSync(new URL("../agents/registry.json", import.meta.url), "utf8"));
  const cadence = t => (t.kind === "cron" ? `cron ${t.cron}` : "לפי אירוע");
  const records = reg.agents.map(a => ({ type: "agent", key: a.id, name: a.id, job: String(a.role).slice(0, 200), cadence: cadence(a.trigger), status: a.status === "active" ? "active" : "proposed" }));
  const { writeFileSync } = await import("node:fs");
  file = "/tmp/d2r-roster.json"; writeFileSync(file, JSON.stringify({ records }));
}
if (!file) { console.error("usage: d2r-ingest.mjs <records.json> [--send]"); process.exit(2); }
const input = JSON.parse(readFileSync(file, "utf8"));
const records = Array.isArray(input) ? input : input.records;
if (!Array.isArray(records) || records.length < 1 || records.length > 200) { console.error("records must be an array of 1..200 items"); process.exit(2); }
const types = new Set(["lead", "customer", "post", "metric", "run", "agent", "publication", "digest"]);
for (const [i, r] of records.entries()) if (!types.has(r?.type) || typeof r.key !== "string") { console.error(`record ${i}: needs type (${[...types].join("/")}) and key`); process.exit(2); }
const counts = records.reduce((m, r) => (m[r.type] = (m[r.type] ?? 0) + 1, m), {});
const body = JSON.stringify({ batchId: input.batchId ?? randomUUID(), records });
if (flag !== "--send") { console.log("dry run, nothing sent:", counts, `${body.length} bytes`); process.exit(0); }
const base = process.env.D2R_BASE_URL, secret = process.env.D2R_AGENT_SECRET;
if (!base || !secret || secret.length < 32) { console.error("set D2R_BASE_URL and D2R_AGENT_SECRET (32+ chars)"); process.exit(2); }
const timestamp = String(Date.now());
const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
const res = await fetch(new URL("/api/agent/ingest", base), { method: "POST", body, headers: { "content-type": "application/json", "x-d2r-timestamp": timestamp, "x-d2r-signature": signature } });
console.log(res.status, await res.text());
process.exit(res.ok ? 0 : 1);
