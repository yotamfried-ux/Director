# Content agent: design (draft v1, 2026-11-26)

**Goal:** an agent that (1) watches Yotam's GitHub repos, (2) for every product marked `active` in `products/registry.json` produces videos and post drafts, (3) publishes to Instagram and Facebook **only after per-post approval in chat**, (4) pulls official analytics and turns them into the next experiment.

## Loop
1. **Intake** (`github-product-intake` skill): read repo README, package/manifest, recent releases and commits, live URL. Output `products/<slug>.md` draft with *verified claims only* (existing `product-research` rules apply). New repos are proposed to Yotam; they become `active` only when he says so.
2. **Create:** `video-brief` -> `video-script` -> Remotion build -> QA (existing flow). Post drafts via `social-content`.
3. **Approve:** exact text + file sent to Yotam; one explicit "publish" per post.
4. **Publish:** n8n workflow (Meta Graph API: Instagram Reels, Facebook Page video). n8n has GitHub credentials today; **no Meta credential exists yet**.
5. **Measure:** official Insights API (views, reach, saves, shares, link clicks) written to `experiments/log.md` weekly, with a proposed variation.

## What Yotam must provide (cannot be done by the agent)
- Instagram **Business/Creator** account linked to a Facebook **Page**.
- A Meta developer app with the Instagram Graph API and Pages permissions, plus a long-lived token stored as an n8n credential. Meta app review may be needed for publishing permissions.
- Confirmation which repos are active (`products/registry.json`).

## n8n workflows to build (after credentials exist)
- `content-publish`: webhook (approved post id) -> upload media -> publish -> log URL. Triggered only by an approval message, never on a schedule.
- `content-insights`: weekly pull of metrics -> store -> summary to chat.
- `github-watch` (optional): new release/repo -> message "new product detected, activate?".

## Guardrails (from CLAUDE.md)
No publishing without per-action approval; no invented numbers/testimonials; demo data labelled; real CC0 music; options named A/B/C.

## Not built yet
Everything above except the registry and the intake skill file. Nothing outward-facing has been created in n8n or Meta.
