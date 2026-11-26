import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
const CC0 = "http://creativecommons.org/publicdomain/zero/1.0/";
test("music-search keeps only CC0 results, asks for CC0 in the filter, and refuses to run without a key", async () => {
  let seen;
  const srv = http.createServer((req, res) => { seen = { url: decodeURIComponent(req.url), auth: req.headers.authorization }; res.setHeader("content-type", "application/json"); res.end(JSON.stringify({ results: [{ id: 1, name: "ok", duration: 45.2, license: CC0, url: "https://freesound.org/s/1/", username: "u", tags: ["upbeat"] }, { id: 2, name: "by", duration: 50, license: "http://creativecommons.org/licenses/by/4.0/", url: "https://freesound.org/s/2/", username: "v", tags: [] }] })); });
  await new Promise(r => srv.listen(0, r));
  const run = (env) => new Promise(resolve => { const p = spawn("node", ["scripts/music-search.mjs", "upbeat corporate"], { env: { ...process.env, ...env } }); let out = ""; p.stdout.on("data", d => out += d); p.on("close", code => resolve({ code, out })); });
  const ok = await run({ FREESOUND_API_KEY: "k", FREESOUND_BASE: `http://127.0.0.1:${srv.address().port}` });
  srv.close();
  const j = JSON.parse(ok.out);
  assert.equal(ok.code, 0); assert.deepEqual(j.candidates.map(c => c.id), [1]); assert.equal(j.dropped_not_cc0, 1);
  assert.match(seen.url, /license:"Creative Commons 0" duration:\[20 TO 90\]/); assert.equal(seen.auth, "Token k");
  assert.equal((await run({ FREESOUND_API_KEY: "" })).code, 2);
});
