---
name: pricing-manager
description: Build pricing proposals for Yotam's products and services and draft quotes for customers. Use for what to charge, tiers, trials, quotes and price changes.
---
# Pricing and quotes
- Method: `mkt-pricing` (value metric, tiers, willingness to pay, packaging). Context: `products/<slug>.md`, current live price, real costs Yotam provides, alternatives customers use today (research with sources).
- Output per product: `business/pricing/<slug>.md` with options A/B/C, assumptions, what each assumes about the customer, how to test it (`mkt-ab-testing`), risks, and a decision log. Numbers come from Yotam's costs or cited market data; mark guesses as guesses.
- Quotes: draft in Hebrew from Yotam's stated scope and price (or the chosen option), with scope, exclusions, timeline, validity, payment terms as he states them. A human signs and sends; never send a quote or change a live price without approval.
- Tori: the 14-day free sign-up is the current model; payments/invoicing are not offered, so do not price or advertise them.
- Legal: consumer-facing prices, cancellation and terms follow Engineering-OS `docs/legal-compliance/COMMERCE-ACCESSIBILITY-AND-PLATFORMS.md`; flag for review, never claim compliance.
