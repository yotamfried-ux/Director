# Social content rules (the file the agent re-reads before every plan or draft)
Source: CLAUDE.md, `.claude/skills/social-content/SKILL.md` and Yotam's messages. Change only when Yotam says so; log the change date.

## Must
- Every claim traces to a verified line in `products/<slug>.md`; invented numbers are labelled "נתוני דמו".
- Real screenshots or motion graphics with the product's real labels. Real photos only if Yotam supplied them (asset inbox, see `scripts/social-assets.mjs`).
- Hebrew first. Instagram caption: the full `https://` URL on its own line plus "הקישור בביו"; Facebook: URL in the text.
- Which products get posts: only those Yotam marked active and gave a `url` (see social-content).
- Every draft passes `scripts/content-lint.mjs`, then waits for Yotam's per-post approval.

## Never
- Invented testimonials, reviews, customers or numbers; claims outside the verified list (Tori: no payments/invoicing).
- AI-generated people, places or UI text; AI-drawn product screens.
- Internal status as a negative in marketing copy ("not production ready").
- Publishing, scheduling or messaging on a standing instruction (a daily batch approval is NOT a standing instruction: see Daily batch approval); follow/unfollow, pods, scraping, unsolicited DMs.
- The same post copy reposted across accounts or repeated within a short period (vary the angle instead).

## Mix and rhythm (hypotheses, not facts; Yotam decides)
- Cadence: **3 posts per day** (Yotam, 27 Nov 2026), scheduled. **Format: all three are Reels (vertical 9:16 video, 1080x1920, 10-20 s, hook in the first 2 s, Hebrew captions on screen, music REQUIRED on every reel (real CC0 track from the library, never synthesized; verify with ffprobe an audio stream and mean volume above -40 dB before sending)). No static image posts or carousels for now (Yotam, 27 Nov 2026 21:48).** A clip rendered by Remotion must pass `video-qa` before it is sent. If fewer than three reels reach the bar, send fewer and say why. Needs about 21 distinct assets a week; `social-assets.mjs status` warns when stock is low, and then the agent asks Yotam for more instead of reusing or inventing. Never fill the quota with weak or repeated posts: fewer good posts beat three bad ones, and say so.
- Posting times: three slots a day (A/B/C) defined in `schedule.json`, rotated daily with `scripts/social-schedule.mjs` so each kind of content visits every slot. Slot times are hypotheses to test, not facts; Yotam delegated the choice (27 Nov 2026): A 07:45 morning commute, B 12:30 lunch break, C 20:30 evening after work, Asia/Jerusalem, from Sunday 29 Nov 2026. These are guesses for an Israeli business-owner audience, not findings; the debrief decides whether to move them.
- Slot effects are confounded with content, audience mood and day of week on one small account: treat the slot table in the debrief as a lead, never as proof, and re-check after at least 10 posts per slot.
- Pillar mix and a day-by-day rhythm: NOT SET. Propose A/B/C options in the next plan and record Yotam's choice here with the date.

## Daily batch approval (Yotam, 27 Nov 2026)
- The agent prepares the day's three posts, each with exact captions (IG and FB), the exact file and its assigned slot and time, and sends them to Yotam in one message (options named A/B/C where he has a choice).
- The batch for day D is sent to Yotam at the latest the day before (D-1), so he can approve ahead; same-day approval also works if it is early enough for the slot.
- Yotam approves the whole batch in chat ("אשר את שלושת הפוסטים של היום", or approves specific ones). That approval covers exactly that text, file and slot on that date D only. It is never a standing instruction and does not carry over to another day, a changed text, a different file or a moved slot. If a post is not published within 2 hours after its slot, the approval lapses.
- After approval each post is queued for its own slot; publishing happens at that time by the gated n8n workflow. Yotam can cancel or hold any post before its slot.
- Changes after approval (caption, file, time) need a new approval. A post that missed its slot window is not published late without asking.
- Record each published post in `posts.jsonl` with `slot` and `published_at`; the numbers come from official Meta Insights only.

## Assets are the agent's job (Yotam, 27 Nov 2026)
The agent produces and sources the assets itself and does not wait for Yotam to supply them (details and procedures: `docs/14-asset-factory.md`). Allowed: real screenshots and screen recordings of Yotam's own live products (public pages and demo data only), Remotion motion graphics built from real screenshots and the product's real labels, repo-derived visuals (README diagrams, architecture drawn with real names), files in a Drive folder Yotam names, and original graphics of the agent's own design. Every asset is registered with `social-assets.mjs add ... --source "<how it was made>"` and is used once.
Never: AI-drawn product screens or UI text, people or faces unless Yotam supplied the photo, a customer's real data, another creator's image or video, stock footage passed off as ours, or a screenshot of a page with personal data.
Quality bar: sharp at 1080x1350 or 1080x1920, readable at phone size, Hebrew RTL correct, one idea per asset, demo numbers labelled "נתוני דמו". If the agent cannot reach the bar for a slot, it posts fewer that day and says why.
