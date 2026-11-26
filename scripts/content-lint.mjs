#!/usr/bin/env node
// Deterministic checks for a social draft before Yotam sees it. Pass/fail only, no taste.
// Usage: node scripts/content-lint.mjs <draft.md> [--product tori] [--json]
// Draft = markdown with front matter: id, platform, format, lang, status, claim_ref (verbatim fragment from products/<slug>.md), hypothesis.
// Exit 1 when a HARD check fails.
import { readFileSync, existsSync } from "node:fs";
const args = process.argv.slice(2), file = args.find(a => !a.startsWith("--") && a !== args[args.indexOf("--product") + 1]);
const slug = args.includes("--product") ? args[args.indexOf("--product") + 1] : null;
if (!file) { console.error("usage: content-lint.mjs <draft.md> [--product slug] [--json]"); process.exit(2); }
const raw = readFileSync(file, "utf8");
const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
const fm = {}; if (m) for (const l of m[1].split("\n")) { const k = l.match(/^(\w+):\s*(.*)$/); if (k) fm[k[1]] = k[2].replace(/^"(.*)"$/, "$1"); }
const body = (m ? m[2] : raw).split(/\n\s*Asset plan:/)[0].trim();   // checks apply to the text that would be posted, not to production notes
const productMd = slug && existsSync(`products/${slug}.md`) ? readFileSync(`products/${slug}.md`, "utf8") : "";
const productJson = slug && existsSync(`products/${slug}.json`) ? JSON.parse(readFileSync(`products/${slug}.json`, "utf8")) : {};
const verified = productMd.split(/^## Forbidden/m)[0];                         // only the part before the forbidden section can back a claim
const norm = s => s.replace(/\s+/g, " ").trim();
const checks = [];
const add = (id, hard, pass, detail) => checks.push({ id, hard, pass, detail });
add("front-matter", true, !!m && ["id", "platform", "format", "lang", "status", "claim_ref", "hypothesis"].every(k => fm[k]), m ? `missing: ${["id", "platform", "format", "lang", "status", "claim_ref", "hypothesis"].filter(k => !fm[k]).join(",") || "none"}` : "no front matter");
add("status-is-draft", true, fm.status === "draft", `status=${fm.status}`);
add("claim-traceable", true, !!fm.claim_ref && fm.claim_ref.length >= 15 && norm(verified).includes(norm(fm.claim_ref)), fm.claim_ref ? (norm(verified).includes(norm(fm.claim_ref)) ? "found verbatim in the product file" : "claim_ref not found verbatim in the verified part of the product file") : "no claim_ref");
const forbidden = (productJson.forbidden_text ?? []).filter(t => body.includes(t) || (fm.claim_ref ?? "").includes(t));
add("no-forbidden-text", true, forbidden.length === 0, forbidden.length ? `found: ${forbidden.join(", ")}` : "none");
add("no-invented-social-proof", true, !/(★|⭐|\d\s*כוכבים|לקוחות\s+(אומרים|ממליצים|אוהבים)|מומלץ\s+על\s+ידי|testimonial|rated\s+\d)/i.test(body), "reviews, ratings and customer quotes are never invented");
const hasNumbers = /\d+\s*%|\b\d{2,}\b/.test(body.replace(/https?:\/\/\S+/g, ""));
const nums = body.replace(/https?:\/\/\S+/g, "").match(/\b\d{2,}\b/g) ?? [];
add("numbers-are-labelled", true, !hasNumbers || body.includes("נתוני דמו") || (!/\d\s*%/.test(body) && nums.every(n => norm(verified).includes(n))), hasNumbers ? "numbers need the label נתוני דמו or a source in the product file" : "no numbers");
const first = body.split("\n")[0] ?? "";
add("first-line-fits-feed-cut", false, [...first].length <= 125, `${[...first].length} chars (visible before '... more': 125)`);
const tags = body.match(/#[\p{L}\d_]+/gu) ?? [];
add("hashtags-at-most-5", false, tags.length <= 5, `${tags.length}`);
add("at-most-one-link", false, (body.match(/https?:\/\//g) ?? []).length <= 1, `${(body.match(/https?:\/\//g) ?? []).length}`);
add("language-matches", false, fm.lang !== "he" || /[֐-׿]/.test(body), `lang=${fm.lang}`);
const hardFail = checks.filter(c => c.hard && !c.pass), softFail = checks.filter(c => !c.hard && !c.pass);
const result = { file, checks, hard_failed: hardFail.map(c => c.id), soft_failed: softFail.map(c => c.id), passed: checks.filter(c => c.pass).length, total: checks.length };
if (args.includes("--json")) console.log(JSON.stringify(result, null, 2));
else { for (const c of checks) console.log(`${c.pass ? "PASS" : c.hard ? "FAIL" : "warn"}  ${c.id}  ${c.detail}`); console.log(`${result.passed}/${result.total} passed`); }
process.exit(hardFail.length ? 1 : 0);
