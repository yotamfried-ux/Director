---
name: github-product-intake
description: Turn an active GitHub repo from products/registry.json into a verified product file and a content plan (videos + post drafts). Use when Yotam adds or activates a project.
---
# GitHub product intake

1. Read `products/registry.json`; work only on `active: true` entries. A new repo Yotam mentions: add it with `active: false`, then ask him to activate.
2. Gather evidence (repo-scoped `gh api repos/<owner>/<repo>/...`; GraphQL is blocked): README, manifest, `docs/`, releases, last ~20 commits, live URL, screenshots in repo. Re-verify on every run; products change.
3. Write/refresh `products/<slug>.md` with: one-line promise, buyer/viewer, verified features (each with its source file/URL), forbidden claims, available visuals, gaps. Mark anything unverified as such.
4. Propose a content plan: which videos (site short/long, WhatsApp), 3 post ideas, channel fit. Send Yotam a short Hebrew summary; continue to `video-brief`.
5. Never publish; see `social-content` approval gate.
