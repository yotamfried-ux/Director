# n8n social workflow (Instagram + Facebook)

Workflow: **Director: social publish (simulation)**, id `fQAniktyb1EQOi9m`, https://n8n.d2ryf.com/workflow/fQAniktyb1EQOi9m. Created 2026-11-26, **inactive**, no credentials, no external calls.

## What it does now (simulation)
Manual trigger -> Draft post -> **Approved by Yotam?** (no: stops at "Held") -> **Live mode?** (no: simulated publish) -> Build D2R batch (a JSON body, not sent).

Tested on 2026-11-26 with test executions: approved path ends with a simulated post record and a batch body (execution 53425); unapproved path stops at "Held: waiting for approval" (execution 53426). Not tested: any Meta call, any D2R call, a real approval step (the approval is a simulated field today).

## Going live (needs Yotam's Meta credentials)
1. In the `LIVE` branch use the **Facebook Graph API** node (publish to the Page and, via the Instagram content publishing endpoints, to the linked Instagram account). Upload media from binary data, not from a URL.
2. Replace the simulated approval field with a real approval step (Wait node with a resume link sent to Yotam, or a manual-approval workflow) so each post needs a per-action yes.
3. Add a scheduled branch that reads post insights and sends `metric` records.
4. Sign and send to D2R: HMAC-SHA256 over `<timestamp>.<body>`, headers `x-d2r-timestamp` / `x-d2r-signature`, `POST <D2R_BASE_URL>/api/agent/ingest` (see `scripts/d2r-ingest.mjs` for the exact format). Store the secret as an n8n credential, never in the workflow JSON.
5. Set `liveMode` to true only after the above is tested on a throwaway post.
