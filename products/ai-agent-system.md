# AI Agent System — product brief for marketing

- **Name on screen:** "AI Agent System" (Hebrew: מערכת סוכני בינה מלאכותית), the title of the project card on Yotam's portfolio (`src/lib/projects.ts`, slug `ai-agent-system`, badge "AI workflow experiments").
- **What it is (Yotam, 2026-11-26):** the project lives in his own n8n instance on his own server, not in a GitHub repo of its own. Source of truth: the n8n workflow "PROJECT SPEC — n8n On-Demand Engineering Run System" (documentation workflow, read 2026-11-26). Engineering-OS (GitHub) is only a knowledge/tool source that equips the agents, not the runtime. Earlier wrong readings, now discarded: the Director system, and Engineering-OS as the product.
- **Mission (from the spec):** a reusable software-engineering system that runs only on explicit user demand: one request = one logical RUN on a given repository/ref; specialist agents plan, build, test, diagnose, repair and verify; results come back with evidence. A separate, owner-authorized, sandbox-only lane experiments with self-improvement.
- **Audience:** startup managers/clients judging whether Yotam can build controlled, evidence-based AI engineering workflows.
- **Tone:** calm, precise, honest about being an experiment. Dark mode, accent `#8fa8ff`, bg `#07090f`, Heebo.

## Verified claims (what the spec says the system requires; read 2026-11-26)
- One user request = one RUN with a persistent run_id; repository/ref are runtime inputs (never hard-coded); no default nightly schedule.
- A Repository Profiler chooses specialists dynamically (a backend-only repo does not launch mobile/web workers).
- Specialist roles in the spec: Orchestrator, Repository Profiler, Planner, Development Agent, Failure Investigator, Repair Agent, CI/Test Agent, Web Testing Agent, Mobile Testing Agent, API Agent, Data/DB Agent, Security Agent, Verifier, Memory/Context, Morning Reporter. Investigator asks WHY it failed; Verifier asks WHETHER success is proven; they are never merged.
- Evidence rules: "LLMs are not judges of their own work"; trust order runtime/test evidence > CI jobs/logs > deterministic scanner output > agent interpretation; a task is COMPLETE only with mechanical evidence; never report PASS/CLEAN when execution failed, timed out, hit a quota or missed the target; impossible progress is marked BLOCKED / NEEDS_USER_ACTION.
- Models are requested by capability through a router with failover; deterministic tools first; no hidden paid fallback.
- Self-improvement lane: policy SI_AUTONOMOUS_SANDBOX_V1: sandbox only, $0 additional spend, free models only, production_write / auto_merge / auto_promote / production_deploy all false, Kill Switch RUNNING, a protected holdout the agents cannot read.
- Real, independently audited proofs in the spec: a scoped CI task closure with authentic GitHub signature and a live model; a code repair on an isolated branch verified by paired CI runs (baseline vs fix).

## Honest status (must shape the copy)
- The spec itself says SYSTEM_NOT_PRODUCTION_READY. Self-improvement: autonomous execution of a sandbox cycle was demonstrated; a verified improvement was NOT proven (one experiment REJECTED_BY_HOLDOUT, one blocked by a database constraint). The video presents an experiment, never a finished product.

## Forbidden / do not advertise (re-verify each video)
- "Production ready", "fully autonomous", "improves itself" as a result, "ran N projects", speed/cost/quality numbers, customers.
- The n8n server address, client repository names, credentials, model/provider specifics, any internal ids.
- Engineering-OS or Director as the system's name.

## Visual assets
Motion graphics only, with real labels (role names, status words, policy field names from the spec). No screenshot of the n8n canvas (it exposes internal ids). Example items labelled "דוגמה".
