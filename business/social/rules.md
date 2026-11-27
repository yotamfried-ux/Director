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
- Publishing, scheduling or messaging on a standing instruction; follow/unfollow, pods, scraping, unsolicited DMs.
- The same post copy reposted across accounts or repeated within a short period (vary the angle instead).

## Mix and rhythm (hypotheses, not facts; Yotam decides)
- Cadence: at most 3 posts per week unless Yotam sets another number.
- Pillar mix and a day-by-day rhythm: NOT SET. Propose A/B/C options in the next plan and record Yotam's choice here with the date.
