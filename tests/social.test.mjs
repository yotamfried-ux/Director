import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "soc-"));
const env = { ...process.env, SOCIAL_DIR: dir };
const run = (s, ...a) => spawnSync("node", [`scripts/${s}.mjs`, ...a], { encoding: "utf8", env });
const put = (rel, txt) => { const p = join(dir, "assets", "inbox", rel); mkdirSync(join(p, ".."), { recursive: true }); writeFileSync(p, txt); };

test("assets: scan registers files once, next/use/status follow the ledger, low stock is flagged", () => {
  put("tori/a.jpg", "A"); put("tori/b.mp4", "B"); put("tori/c.png", "C"); put("tori/notes.txt", "x"); put("loose.jpg", "L");
  assert.match(run("social-assets", "scan").stdout, /added 3, skipped 2/);
  assert.match(run("social-assets", "scan").stdout, /added 0/);
  const next = run("social-assets", "next", "--product", "tori", "--kind", "clip");
  assert.match(next.stdout, /clip\ttori\/b\.mp4/);
  const id = next.stdout.split("\t")[0];
  assert.equal(run("social-assets", "use", "--id", id, "--post", "p1").status, 0);
  assert.doesNotMatch(run("social-assets", "next", "--product", "tori", "--kind", "clip").stdout, /b\.mp4/);
  assert.equal(run("social-assets", "next", "--product", "tori", "--kind", "clip").status, 3);
  const st = run("social-assets", "status", "--product", "tori");
  assert.match(st.stdout, /used 1\tunused 2\tLOW/); assert.equal(st.status, 3);
  assert.equal(run("social-assets", "use", "--id", "nope", "--post", "p").status, 2);
});
test("assets: personal data in a file name is refused", () => {
  put("tori/dana@example.test.jpg", "P");
  assert.equal(run("social-assets", "scan").status, 2);
});
test("debrief: rates per reach, small samples are 'no signal', candidates vs the format median", () => {
  const row = (id, reach, saves, shares, format = "reel") => JSON.stringify({ id, date: "2026-11-20", product: "tori", format, hook: "h", pillar: "demo", reach, saves, shares, source: "Meta Insights" });
  writeFileSync(join(dir, "posts.jsonl"), [row("r1", 1000, 20, 10), row("r2", 1000, 20, 10), row("r3", 1000, 20, 10), row("r4", 1000, 60, 10), row("r5", 1000, 5, 2), row("c1", 500, 50, 5, "carousel"), row("low", 50, 9, 9)].join("\n"));
  const r = run("social-debrief", "--now", "2026-11-27T00:00:00Z");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /## reel \(n=6, with reach >= 100: 5\)/);
  assert.match(r.stdout, /## carousel \(n=1[^\n]*\)\nNo signal/);
  assert.match(r.stdout, /Double-down candidates[^]*- r4 \(reel/);
  assert.match(r.stdout, /Cut candidates[^]*- r5 \(reel/);
  assert.match(r.stdout, /No signal[^]*- low/);
});
test("debrief: rows without an official Insights source are refused", () => {
  writeFileSync(join(dir, "posts.jsonl"), JSON.stringify({ id: "x", date: "2026-11-20", format: "reel", reach: 500, saves: 1, shares: 1, source: "my estimate" }) + "\n");
  assert.equal(run("social-debrief", "--now", "2026-11-27T00:00:00Z").status, 2);
});
