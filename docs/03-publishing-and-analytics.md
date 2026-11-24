# Publishing & analytics (planned)

**Gate:** Claude drafts and prepares; **Yotam approves each publish in chat**. No auto-posting, no bulk outreach, no invented leads or testimonials.

## Intended pipeline
render → QA → send preview to Yotam → approval → publish (n8n workflow or Postiz skill, whichever is connected) → collect metrics → write to `experiments/log.md` → next iteration.

## Candidates
- Yotam runs a local **n8n** instance; Claude's n8n connector can build workflows (call `get_user_preferences` first; read the SDK reference before writing code).
- A `postiz` skill exists in some Claude sessions for scheduling posts.
- Metrics to track per video: views, watch-through, link clicks, replies in WhatsApp groups, leads. Per-channel exports only from official analytics.
- Engineering-OS references: `docs/product-experience/analytics-experimentation-growth.md` (measurement design), `docs/product-experience/video-hooks-and-retention-research.md` (openings/retention), `external-skills/instagram-agent-skill` (human-reviewed copy, no auto-post).

Nothing here is built yet; build it only on Yotam's request and keep every outward action behind approval.
