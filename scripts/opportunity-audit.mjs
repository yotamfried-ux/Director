#!/usr/bin/env node
// Opportunity ledger with independent audit statuses (spec section 8.5-8.6). No personal data: listings are pointed to by URL only.
// File: business/demand/opportunities.json (git-ignored; override OPP_FILE).
//   add     --json '<opportunity>'          main agent registers an opportunity (status UNVERIFIED)
//   audit   --id ID --status VERIFIED|NEEDS_RESEARCH|NEEDS_CORRECTION|REJECTED|POLICY_BLOCKED --reason "..." [--gap-type query|source|collection|verification|ranking|solution|resources]
//   reopen  --id ID --note "..."             main agent answers a finding: increments the round, back to UNVERIFIED for re-audit
//   board   [--json]                          what Yotam sees: only VERIFIED is shown as an opportunity; everything else is marked unverified
//   gaps                                      recurring audit findings by gap type (input for DRAFT improvements, never auto-applied)
//   stats   [--json]                          computable success metrics (spec 8.8)
// Evidence levels: 1 hypothesis, 2 real evidence of the problem, 3 evidence it costs money or time, 4 evidence of existing willingness to pay.
// kind: explicit = the customer asked for it; inferred = our reading of a signal. An inferred need is never presented as a request.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
const FILE = process.env.OPP_FILE ?? "business/demand/opportunities.json";
const STATUS = ["VERIFIED", "NEEDS_RESEARCH", "NEEDS_CORRECTION", "REJECTED", "POLICY_BLOCKED"], GAPS = ["query", "source", "collection", "verification", "ranking", "solution", "resources"];
const [cmd, ...rest] = process.argv.slice(2), a = {};
for (let i = 0; i < rest.length; i++) if (rest[i].startsWith("--")) a[rest[i].slice(2)] = rest[i + 1]?.startsWith("--") || rest[i + 1] == null ? true : rest[++i];
const fail = m => { console.error(m); process.exit(2); };
const load = () => existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : [];
const save = o => { mkdirSync(dirname(FILE), { recursive: true }); writeFileSync(FILE, JSON.stringify(o, null, 2) + "\n"); };
const PII = /[\w.+-]+@[\w-]+\.\w{2,}|(?:\+972|0)(?:5\d|[2-9])[-\s]?\d{3}[-\s]?\d{4}/;
const now = a.now ?? new Date().toISOString();
const find = (all, id) => all.find(o => o.id === id) ?? fail("unknown opportunity id");
if (cmd === "add") {
  const o = JSON.parse(a.json ?? fail("--json required"));
  if (!o.id || !o.title || !o.solution) fail("id, title and solution are required");
  if (!["explicit", "inferred"].includes(o.kind)) fail("kind: explicit|inferred");
  if (![1, 2, 3, 4].includes(o.evidence_level)) fail("evidence_level: 1-4");
  if (!Array.isArray(o.evidence) || o.evidence.some(e => !e.source || !e.url || !e.seen_on)) fail("evidence: list of {source, url, seen_on}");
  if (o.evidence_level >= 2 && !o.evidence.length) fail("level 2+ needs evidence");
  if (PII.test(JSON.stringify(o))) fail("no emails or phone numbers in opportunities");
  const all = load(); if (all.some(x => x.id === o.id)) fail("duplicate id");
  all.push({ ...o, found_by: o.found_by ?? "scanner", status: "UNVERIFIED", audit: null, rounds: 0, findings: [], created: now, updated: now }); save(all); console.log("added (UNVERIFIED)");
} else if (cmd === "audit") {
  if (!STATUS.includes(a.status)) fail(`--status ${STATUS.join("|")}`);
  const reason = a.reason === true ? "" : String(a.reason ?? ""); if (reason.length < 10 || reason.length > 400) fail("--reason 10-400 chars with the evidence you checked");
  if (a["gap-type"] != null && !GAPS.includes(a["gap-type"])) fail(`--gap-type ${GAPS.join("|")}`);
  const all = load(), o = find(all, a.id);
  if (a.status === "VERIFIED") {
    const srcs = new Set(o.evidence.map(e => e.source));
    if (o.evidence_level < 2) fail("VERIFIED needs evidence level 2 or more");
    if (srcs.size < 2) fail("VERIFIED needs evidence from at least 2 independent sources (draft policy: otherwise NEEDS_RESEARCH)");
  }
  o.audit = { status: a.status, reason, at: now }; o.status = a.status; o.updated = now;
  if (a.status !== "VERIFIED" && a.status !== "POLICY_BLOCKED") o.findings.push({ round: o.rounds, gap_type: a["gap-type"] ?? null, text: reason, at: now });
  if (a.status === "POLICY_BLOCKED") o.findings.push({ round: o.rounds, gap_type: "source", text: reason, at: now });
  save(all); console.log(`audited: ${a.status}`);
} else if (cmd === "reopen") {
  const all = load(), o = find(all, a.id);
  if (!["NEEDS_RESEARCH", "NEEDS_CORRECTION"].includes(o.status)) fail("only NEEDS_RESEARCH or NEEDS_CORRECTION can be reopened");
  o.rounds++; o.status = "UNVERIFIED"; o.updated = now; o.response = String(a.note === true ? "" : a.note ?? "").slice(0, 400); save(all); console.log(`reopened for re-audit (round ${o.rounds})`);
} else if (cmd === "board") {
  const all = load(), V = all.filter(o => o.status === "VERIFIED").sort((p, q) => q.evidence_level - p.evidence_level), U = all.filter(o => o.status !== "VERIFIED");
  if (a.json) { console.log(JSON.stringify({ verified: V, unverified: U.map(o => ({ id: o.id, status: o.status })) }, null, 2)); process.exit(0); }
  console.log("## Verified opportunities (drafts only: nothing is sent or submitted; auditor approval is not approval to act)");
  for (const o of V) console.log(`- ${o.id} [level ${o.evidence_level}, ${o.kind === "explicit" ? "customer asked for it" : "INFERRED need, not a customer request"}] ${o.title}; audit: ${o.audit.reason}`);
  if (!V.length) console.log("- none");
  console.log("\n## Not verified (do not treat as opportunities)");
  for (const o of U) console.log(`- ${o.id}: ${o.status}${o.audit ? ` - ${o.audit.reason}` : ""}`);
  if (!U.length) console.log("- none");
} else if (cmd === "gaps") {
  const c = {}; for (const o of load()) for (const f of o.findings) if (f.gap_type) c[f.gap_type] = (c[f.gap_type] ?? 0) + 1;
  const rows = Object.entries(c).sort((p, q) => q[1] - p[1]);
  console.log(rows.length ? rows.map(([k, v]) => `${k}: ${v}${v >= 2 ? "  <- recurring: write a DRAFT improvement proposal (not applied until approved and independently checked)" : ""}`).join("\n") : "no findings yet");
} else if (cmd === "stats") {
  const all = load(), audited = all.filter(o => o.audit), n = all.length, c = s => all.filter(o => o.status === s).length;
  const r = { opportunities: n, verified: c("VERIFIED"), rejected: c("REJECTED"), policy_blocked: c("POLICY_BLOCKED"), needs_work: c("NEEDS_RESEARCH") + c("NEEDS_CORRECTION"), unaudited: n - audited.length, rejection_rate_of_audited: audited.length ? Math.round(100 * audited.filter(o => o.status === "REJECTED").length / audited.length) : null, inferred_share: n ? Math.round(100 * all.filter(o => o.kind === "inferred").length / n) : null, missed_found_by_audit: all.filter(o => o.found_by === "auditor").length, avg_rounds_to_verify: (() => { const v = all.filter(o => o.status === "VERIFIED"); return v.length ? Math.round(10 * v.reduce((s, o) => s + o.rounds, 0) / v.length) / 10 : null; })(), not_computable_here: ["conversion to paying customers", "revenue and profit", "manual hours saved", "cost per verified opportunity"] };
  console.log(JSON.stringify(r, null, 2));
} else fail("usage: opportunity-audit.mjs add|audit|reopen|board|gaps|stats");
