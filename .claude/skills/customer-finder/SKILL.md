---
name: customer-finder
description: Find and qualify potential customers for an active product from legitimate public business information and public buying signals, and prepare draft outreach for Yotam's approval. Use for "who should I approach" requests.
---
# Customer finder
1. **ICP first:** from `products/<slug>.md` define who benefits (Tori: appointment-based small businesses in Israel; SportReel: surf/football clubs and athletes; etc.), with evidence. Method: `mkt-customer-research`, then `mkt-prospecting` (local SMB branch).
2. **Sources (allowed):** the business's own website/Google listing/public social page, published business contact details, public discussions where someone states the problem. Not allowed: scraping restricted/logged-in platforms, purchased or leaked lists, guessing private emails/phones, profiling individuals.
3. **Output:** a scored candidate list in the private store (schema `business/prospects/SCHEMA.md`; D2R Management keeps leads/customers, prospects stay local and git-ignored until Yotam approves outreach): why they fit, source URL, date. No personal data in git or in reports.
4. **Outreach:** `mkt-cold-email` for draft structure only. Drafts are Hebrew, specific, honest, with sender identity and an easy opt-out. Yotam picks who to contact and sends or approves each one. Before any cold promotional email/SMS, confirm the legal position with a lawyer (Israeli anti-spam rules); a one-to-one personal message in a relevant context is a different case but still needs Yotam's approval.
5. **Learning:** log which segment/message got real replies in `experiments/log.md`; no invented conversion numbers.
