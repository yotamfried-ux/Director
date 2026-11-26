#!/usr/bin/env node
// Validates agents/registry.json and prints scheduled-task payloads.
// Usage: node scripts/agents.mjs check | list | payload <id>
// `payload` prints what to pass to create_trigger. It creates nothing.
import { readFileSync, existsSync, readdirSync } from "node:fs";
const reg = JSON.parse(readFileSync("agents/registry.json", "utf8"));
const skills = new Set(existsSync(".claude/skills") ? readdirSync(".claude/skills") : []);
const agents = new Set(existsSync(".claude/agents") ? readdirSync(".claude/agents").map(f => f.replace(/\.md$/, "")) : []);
const cronOk = c => /^(\S+\s+){4}\S+$/.test(c) && c.split(/\s+/).every(f => /^[\d*,\/-]+$/.test(f));
function check() {
  const errors = [], seen = new Set();
  for (const a of reg.agents) {
    if (seen.has(a.id)) errors.push(`${a.id}: duplicate id`); seen.add(a.id);
    if (!existsSync(a.prompt)) errors.push(`${a.id}: missing prompt ${a.prompt}`);
    if (!["cron", "event"].includes(a.trigger?.kind)) errors.push(`${a.id}: trigger.kind must be cron or event`);
    if (a.trigger?.kind === "cron" && !cronOk(a.trigger.cron ?? "")) errors.push(`${a.id}: bad cron`);
    if (a.trigger?.kind === "cron" && /^(0|30) /.test(a.trigger.cron)) errors.push(`${a.id}: avoid :00/:30 minutes`);
    for (const u of a.uses ?? []) if (!skills.has(u) && !agents.has(u) && !agents.has(u.startsWith("ext-") ? u : "")) errors.push(`${a.id}: unknown skill/agent ${u}`);
    if (!["proposed", "approved", "active"].includes(a.status)) errors.push(`${a.id}: bad status`);
  }
  const spec = existsSync("agents/results-spec.json") ? JSON.parse(readFileSync("agents/results-spec.json", "utf8")).agents : {};
  for (const a of reg.agents) {
    const sp = spec[a.id];
    if (!sp) { errors.push(`${a.id}: no entry in agents/results-spec.json`); continue; }
    if (!sp.judged_by || !(sp.min_n > 0) || !sp.metrics?.length) errors.push(`${a.id}: results-spec needs judged_by, min_n and metrics`);
    const ids = (sp.metrics ?? []).map(m => m.id); if (new Set(ids).size !== ids.length) errors.push(`${a.id}: duplicate result metric`);
  }
  return errors;
}
const [cmd, id] = process.argv.slice(2);
if (cmd === "check") { const e = check(); console.log(e.length ? e.join("\n") : `ok: ${reg.agents.length} agents`); process.exit(e.length ? 1 : 0); }
else if (cmd === "list") for (const a of reg.agents) console.log(`${a.status.padEnd(9)} ${a.id.padEnd(16)} ${a.trigger.kind === "cron" ? a.trigger.cron : "event: " + a.trigger.event}`);
else if (cmd === "payload") {
  const a = reg.agents.find(x => x.id === id); if (!a) { console.error("unknown agent"); process.exit(2); }
  if (a.status === "proposed") console.error("note: still proposed; create the scheduled task only after Yotam approves the cadence");
  const body = { name: `Director: ${a.id}`, initiation: "human_request", prompt: `Read ${a.prompt} and routines/agents/_common.md in the Director repo and do exactly what they say. Role: ${a.role}.` };
  if (a.trigger.kind === "cron") body.cron_expression = `CRON_TZ=${reg.timezone} ${a.trigger.cron}`;
  console.log(JSON.stringify(body, null, 2));
} else { console.error("usage: agents.mjs check|list|payload <id>"); process.exit(2); }
