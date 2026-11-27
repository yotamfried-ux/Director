# AI Agent System — product file for marketing (benchmark slug: agent-system-bench)

- **Name on screen:** "AI Agent System" (the name on the portfolio card).
- **What:** Yotam's multi-agent system for end-to-end software engineering, with a bounded self-improvement lane. It lives as a control plane in Yotam's own n8n (self-hosted); there is no repository for it.
- **True source:** the read-only spec workflow "PROJECT SPEC — n8n On-Demand Engineering Run System" in that n8n, read through the n8n MCP tools. Nothing was modified. Do not print the server address, internal ids or names of the repositories used as test targets.
- **Audience:** business owners and technical buyers on the portfolio site (silent card, about 630 px), who are sceptical of AI agents.
- **Status of this file:** benchmark task, not for publication.

## Verified claims (safe to show or say). Claims verified on 2026-11-26 against the spec workflow as last updated 2026-11-26
- V1 One user request is one logical run with a persistent run id; a run holds many internal steps. (spec: Core operating principle; Run lifecycle)
- V2 A team of 15 separate roles: orchestrator, profiler, planner, development, failure investigator, repair, CI/test, web, mobile, API, data/DB, security, verifier, memory, morning reporter. Web and mobile are separate; API and data are separate. The investigator asks why it failed; the verifier asks whether success is proven. (spec: Agent / Worker Architecture)
- V3 The repository and ref are runtime input; a profiler reads the stack and only the relevant specialists launch. (spec: Runtime Repository Contract)
- V4 Mandatory failure loop: run, inspect, diagnose, fix, rerun, verify. (spec: Evidence rules)
- V5 Trust order: runtime and test evidence over CI logs and artifacts over scanner output over agent interpretation; an agent's claim is not evidence. (spec: Evidence rules)
- V6 It never reports PASS when execution failed, timed out, hit a quota or produced no evidence. (spec)
- V7 It runs only on explicit demand; no default nightly schedule. (spec: Run lifecycle)
- V8 Deterministic tools first; models are requested by capability with automatic failover; free routes preferred; no hidden paid fallback. (spec: LLM Policy, Safety)
- V9 It stops and escalates for missing credentials, payments, destructive or out-of-scope actions. (spec: Safety boundaries)
- V10 It ends with a run report: requested work, discovered findings, changes, evidence, blockers, remaining work. (spec: Run lifecycle)
- V11 Self-improvement is a separate lane: sandbox only, no production writes, no auto-merge, and a candidate is checked against a separate holdout before any result counts. (spec: SI notes of 2026-11-22)

## Forbidden / not to claim
- Any outcome: bugs found or fixed, time or money saved, number of repositories or runs, success rates, customers, reviews.
- That the system improves itself or has improved results (no verified improvement exists).
- Production readiness, availability to clients, prices.
- Internal status or limits as a negative statement (they are documentation; tell Yotam instead). Internal items stay in the conversation with Yotam, not in the video.
- Server address, internal ids, names of test-target repositories.

## Visual assets
None needed: motion graphics only, using the spec's real role and step names. No screenshots, no AI-drawn UI or text. No numbers appear, so no "נתוני דמו" label is needed.
