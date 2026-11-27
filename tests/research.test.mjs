import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const env = { ...process.env, RESEARCH_FILE: join(mkdtempSync(join(tmpdir(), "res-")), "s.jsonl") };
const run = (...a) => spawnSync("node", ["scripts/research-sources.mjs", ...a], { encoding: "utf8", env });
const add = (url, verdict = "watch", read = "partial") => run("add", "--url", url, "--type", "youtube", "--topic", "claude social", "--read", read, "--verdict", verdict);

test("research ledger: normalises YouTube links, remembers sources, updates verdicts, refuses credential-like URLs", () => {
  assert.match(add("https://www.youtube.com/watch?v=abc123&utm_source=x").stdout, /added/);
  assert.equal(run("seen", "--url", "https://youtu.be/abc123").status, 0);
  assert.equal(run("seen", "--url", "https://youtu.be/zzz").status, 1);
  assert.match(add("https://youtu.be/abc123").stdout, /already logged/);
  assert.match(add("https://youtu.be/abc123", "adopted", "full").stdout, /updated/);
  assert.equal(add("https://example.com/x?access_token=SECRET").status, 2);
  assert.equal(run("add", "--url", "https://example.com/a", "--type", "podcast").status, 2);
  const st = run("status").stdout;
  assert.match(st, /sources: 1, read in full: 1/); assert.match(st, /youtube\/adopted\t1/);
  assert.match(run("list", "--verdict", "adopted").stdout, /youtube\tadopted\tfull/);
});
