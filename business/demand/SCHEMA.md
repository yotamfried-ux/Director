# Demand data (freelance and job-board listings)

Purpose: find project types that recur, so Yotam can build once and sell to several owners, or reuse code across projects. Real data stays out of git (`business/demand/*` is ignored except this file, `sources.json`, the effort template and `fixtures/`).

## Listing record (one JSON object per listing, in `business/demand/listings.json`)
`id` (stable, e.g. source + listing id) · `source` (id from sources.json) · `url` (pointer to the public listing) · `seen_on` / `posted_on` (YYYY-MM-DD) · `region` (IL / abroad) · `category` (automation / etl / fullstack / other) · `title` · `summary` (your own words, one line, no copied text) · `tags` (tools and domains, lowercase: e.g. "n8n", "zapier", "postgres", "react") · `budget_min` / `budget_max` / `currency` (only if shown publicly; never estimated) · `poster_ref` (a hash or the listing URL, not a name).

## Rules
- Sources must be allowed (see sources.json): public pages whose robots.txt and current terms permit automated reading, official APIs, public feeds, or files Yotam exports or pastes. No login-wall scraping, no bypassing blocks, no purchased lists. Large marketplaces often forbid automated collection in their terms: check each source's current terms before reading it, and record the check date.
- Store listings, not people. Do not collect names, phones, emails or profiles of the people posting. If a business name is shown publicly and Yotam wants to follow up, record it in the D2R lead store (consent `none`, private, never git) and treat outreach under `customer-finder` rules (drafts only, legal check first).
- Summaries in your own words; do not copy listing text.
- Budgets are compared only within one currency; no conversion is invented.
