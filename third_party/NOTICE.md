# Third-party skills vendored into `.claude/skills/`

Reviewed 2026-11-26 (read-through for shell/network/exfiltration patterns; none acting outside the working directory). All MIT; licence texts are in this folder.

| Prefix | Upstream | Commit/date | Notes |
|---|---|---|---|
| `mkt-*` (14 skills) | https://github.com/coreyhaines31/marketingskills | cloned 2026-11-26 | `name:` prefixed with `mkt-`; evals and `.mjs` scripts removed |
| `ig-*` (8 skills) | https://github.com/Jakeschincariol/instagram-agent-skill | cloned 2026-11-26 | state paths changed from `~/.claude/instagram/` to `business/social/`; `ig-dm`, `ig-viral`, `ig-human`, `ig-comment`, `ig-story` NOT vendored |

Not vendored: `slavingia/skills` (Minimalist Entrepreneur): no licence file found, so only referenced, not copied.

**Director rules override these skills.** Where a vendored skill suggests sending, posting, scraping, cold outreach at scale, or installing tools, follow CLAUDE.md and `docs/10-business-os.md` instead: drafts only, per-action approval, no restricted-source scraping.
