# Asset factory: the agent makes the assets (Yotam, 27 Nov 2026)
Goal: about 21 distinct, real, good-looking assets a week for 3 posts a day, without waiting for Yotam. Rules and the quality bar are in `business/social/rules.md`.

## Sources, cheapest first
1. **Own live products (real screens).** Public pages of Yotam's products (Tori: the URL in `products/registry.json`), demo data only. Capture with a browser (the built-in browser or Claude in Chrome when connected; a headless Chrome in the workspace may reach only allowlisted hosts, so say if blocked). Crop and annotate with PIL; no personal data in frame.
2. **Remotion motion graphics.** Clips and stills from `src/` using real screenshots and the product's real labels (`remotion-product-video`, `video-qa`). One scene of an existing promo can become a 6-10 s clip or a carousel slide.
3. **Repo-derived visuals.** Read the product's repository (`gh api` REST, not GraphQL): architecture, flow, test results, release notes. Draw them as clean diagrams or cards using the repo's real names; every number from the repo, labelled demo where invented.
4. **Drive.** Yotam's folder `Director - נכסים לפוסטים` (id `1731ot3k2PEqxdv-oc1ROTp0nQGZWto_l`, created 27 Nov 2026) is the only Drive location the agent reads for assets, read only; subfolders per product are fine. Use what Yotam drops there. Never browse the rest of his Drive. Files with people or customer data are not used without asking.
5. **Research-informed variants.** New angles for the same real material from the weekly research (`business/research/`): different crop, hook line, format. Never copy another creator's words or images.

## Procedure
`social-assets.mjs status` -> pick the gap (product, kind) -> make the file in a scratch folder -> check it (size, Hebrew RTL, no personal data, readable at phone size, claims traced to `products/<slug>.md`) -> `social-assets.mjs add --file ... --product <slug> --source "<how>"` -> use it in a draft -> `use --id --post`. The ledger keeps provenance, so the auditor can check where every asset came from.

## Limits to state when they bite
Unattended cloud runs often cannot open a live browser, YouTube or Instagram; then fall back to Remotion, repo-derived and Drive sources, or post fewer. Stock or AI-generated imagery is not used for product claims. The assets of products that are not active in the registry are not made.
