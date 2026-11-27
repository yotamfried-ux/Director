---
name: lead-manager
description: Track, qualify and follow up inbound leads for Yotam's products with consent and opt-out handling. Use for lead triage, follow-up drafts and pipeline reports.
---
# Lead manager
- Records live in the private store = D2R Management (schema: `business/leads/SCHEMA.md`; send with `scripts/d2r-ingest.mjs`, dry run first, `--send` only when the data is real and approved); never write personal data into git, reports or logs.
- Sources: forms, replies, WhatsApp/Instagram/Facebook messages Yotam forwards, referrals. Inbound only.
- Each run: classify new leads (fit, intent, urgency), draft a Hebrew reply that answers their actual question, set next action and date, check `opted_out` before any draft that is promotional.
- Follow-ups: at most 2 reminders unless the lead replies; stop on opt-out/silence. A reply to a person's own request is service, not promotion; promotional content needs consent and opt-out (Engineering-OS `docs/legal-compliance/COOKIES-CONSENT-AND-MARKETING.md`).
- Pipeline report (aggregates only): counts by status and source, stale follow-ups, conversion to quote/won. Attribute only what is actually measured (`mkt-analytics`).
- Never send; Yotam sends or approves each message.
