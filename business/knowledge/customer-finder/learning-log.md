# Customer finder learning log (domain and process only, no personal data)

## 2026-11-26 run product-customers-20261126193400 (synthetic Tori benchmark, dev)
- Score fit and contactability separately; a strong fit without a published business channel is "qualified, blocked", not a draft.
- Gate order: need signal -> dated signal -> published business channel -> existing tool/competitor.
- Open legal questions for the lawyer: email to a business address, WhatsApp/phone to a business number, B2B treatment under Israeli anti-spam law. Drafts carry an advertisement label, sender, address placeholder and opt-out as a precaution.
- Same-date prospect file collides across runs: append a labelled section.

## 2026-11-26 run product-customers-20261126193628 (synthetic Tori benchmark, holdout)
- Explicit opt-out is a hard exclusion before scoring: suppress, do not draft, whatever the fit.
- Qualification order: opt-out/suppression -> need signal -> signal date -> published business channel -> existing tool.
- Appointment businesses outside the named ICP list (tattoo, grooming, physio) share the pain; ask Yotam to widen the ICP wording.
- A no-show complaint maps to reminder + no-show policy features; promise features only, never a reduction figure.
