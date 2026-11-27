# Third-party skills vendored into `.claude/skills/`

Reviewed 2026-11-26 (read-through for shell/network/exfiltration patterns; none acting outside the working directory). All MIT; licence texts are in this folder.

| Prefix | Upstream | Commit/date | Notes |
|---|---|---|---|
| `mkt-*` (14 skills) | https://github.com/coreyhaines31/marketingskills | cloned 2026-11-26 | `name:` prefixed with `mkt-`; evals and `.mjs` scripts removed |
| `ig-*` (8 skills) | https://github.com/Jakeschincariol/instagram-agent-skill | cloned 2026-11-26 | state paths changed from `~/.claude/instagram/` to `business/social/`; `ig-dm`, `ig-viral`, `ig-human`, `ig-comment`, `ig-story` NOT vendored |

Not vendored: `slavingia/skills` (Minimalist Entrepreneur): no licence file found, so only referenced, not copied.

**Director rules override these skills.** Where a vendored skill suggests sending, posting, scraping, cold outreach at scale, or installing tools, follow CLAUDE.md and `docs/10-business-os.md` instead: drafts only, per-action approval, no restricted-source scraping.

## Added 2026-11-26 (Engineering-OS sources)

| Where | Upstream | Commit | Notes |
|---|---|---|---|
| `.claude/agents/ext-*.md` (17 agents) | https://github.com/msitarzewski/agency-agents (MIT) | 8ae6164 | marketing (social strategist, Instagram curator, content creator, growth hacker, short-video coach, video optimisation), sales (pipeline, proposal, outbound, offer/lead-gen, discovery), finance (analyst, FP&A), support (analytics reporter, executive summary, legal-compliance checker), experiment tracker. Unchanged. NOT imported: `marketing-multi-platform-publisher` (publishes via a local curl endpoint), `marketing-carousel-growth-engine` (API/token handling), China-market agents, engineering/security agents. |
| `.claude/skills/founder-*` (10 skills) | https://github.com/Jakeschincariol/founder-skill (MIT) | fd9385b | board, brand, cfo, competitors, launch, marketing, offer, ops, plan, pricing. The bundled Python helpers are stdlib-only, local file I/O, no network. NOT imported: `founder-consumer` (100 simulated-buyer sub-agent calls, not real research). |

Agents and `founder-*` skills write plans under the working directory only. Their output is a draft: figures from `founder-*` are modelling, not facts, and simulated buyers are never reported as customers.

## mcp-video-analyzer (referenced, not vendored)
`guimatheus92/mcp-video-analyzer`, MIT license, run through `npx` at the pinned version 0.12.0 (see `.mcp.json`). Review the version before bumping it.


## Vendored 2026-11-27 (after a file-by-file review)
| Where | Upstream | Commit | Notes |
|---|---|---|---|
| `.claude/skills/ig-hook-extractor/`, `.claude/skills/ig-humanizer/` | https://github.com/sergebulaev/instagram-skills (MIT, licence in `LICENSE-sergebulaev-instagram-skills`) | 823c681 | Only these two skills plus the reference files they use. Removed: the Apify read layer, Python `lib/` helpers (Publora, Pixfaro, Apify), the illustration and voice-profile sub-skills. No network, posting or token use remains. The humanizer's wording lists are English-specific; see the adaptation note at the end of each SKILL.md |

## Reviewed, not vendored (2026-11-27)
`sergebulaev/instagram-skills` other skills: overlap `ig-*` and need Publora/Apify/Pixfaro keys. `charlie947/social-media-skills` (MIT): reference only. Decisions and reasons: Engineering-OS `capability-registry/discoveries/claude-social-media-workflows-2026-11.md`.
