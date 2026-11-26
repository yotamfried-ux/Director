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
