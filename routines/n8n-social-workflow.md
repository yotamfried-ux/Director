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

## Scheduled queue publisher (added 27 Nov 2026)
Workflow `Director: publish queue (scheduled, approved posts only)` (id `mbJ38tzuKzuOJzNa`, n8n.d2ryf.com) publishes the day's three approved posts, each at its own slot. It is created **inactive**; Yotam decides when to activate it.

**Queue:** n8n data table `director_post_queue` (id `EC37kzu7tZ6rmXvv`), columns: postId, sourceUrl (raw GitHub URL of the file), fileName, captionIg, captionFb, slot, publishAtUtc, approvedAt, approvedBy, status, publishedAt, igMediaId, note.

**Flow:** `scripts/social-schedule.mjs` assigns slots -> the agent sends Yotam ONE batch message (exact IG/FB text, file, slot time per post) -> only after his approval in chat the agent inserts the rows with `status=approved`, `approvedBy=Yotam`, `approvedAt=now`, `publishAtUtc` from the script -> every 5 minutes the workflow takes at most one row that is approved, has approver and approval time, and whose `publishAtUtc` is within the last 2 hours -> sets `publishing` first (claim, so it can never run twice) -> R2 upload -> Meta publish (IG Reel + FB video) -> deletes the R2 copy -> sets `published` with the IG media id.

**Safety:** no row = nothing happens. A post more than 2 hours past its slot is never published late (ask Yotam). A failed run leaves the row at `publishing` and is not retried automatically (avoids double posts): check the execution, then decide with Yotam. To cancel or hold a post before its slot, set its status to `cancelled`. Rows are never added without his approval of that exact text, file and slot; the approval covers that date only. The Meta token stays in the n8n credential that Yotam set; the agent never handles it. The row `selftest-inert` is a harmless test row.

**Verified 27 Nov 2026:** the workflow validates and has the existing R2 and Meta credentials attached; a manual run with no approved rows stops at "Due post" with 0 items; the time-window filter returns the expected rows. **Not verified:** a real publish through this workflow (the old gated workflow `i4Az4fAx3psqEE3x` did publish), the 5-minute schedule once activated, behaviour after a failed run, R2 auto-delete end to end.
