# Tori — product brief for marketing

- **What:** multi-tenant appointment-booking & calendar SaaS for small Israeli businesses (Hebrew/RTL first). Live: https://turim.d2ryf.com · Repo: `yotamfried-ux/appointment-scheduling-system` (docs in `docs/`, UI strings in `messages/he.json`, readiness evidence in `docs/evidence/`).
- **Audience:** owners of appointment businesses (barbers, beauty, clinics, coaches, teachers); end customers book from mobile.
- **Design language:** "Day Ribbon" (docs/07-design-direction.md): Lagoon teal `#0A6B5E` / dark-mode accent `#4CCDB8`, IBM Plex Sans Hebrew in-app (videos use Heebo), hairlines not shadows. Video accent used: `#4fd1bb` on bg `#050d0e`.
- **Tagline (video):** "ניהול יומן ותורים". Hook line (from the product's own auth shell): "פחות הודעות. יותר תורים."
- **Trial:** product copy says 14 days free, no credit card (only mention if Yotam confirms the offer is current).

## Verified claims (safe to show or say) — verified 2026-11-24; the product is still in development: re-verify against repo HEAD before the next video — source: `messages/he.json` home.*, `docs/01-project-8-summary.md`, readiness evidence
- Public booking page per business, no app/account/password; works on mobile; only free slots matching service duration, hours, breaks and closed days.
- Instant confirmation; personal link to cancel/reschedule until the cut-off the business sets (reschedule max 3 moves).
- Automatic reminder the day before with one-click arrival confirmation.
- Smart waitlist: customers join for a day/time window; when a slot frees, the first waiting customer gets a timed offer by email.
- Business policies: cancel/reschedule window, manual approval for new bookings, no-show handling (`off / warn / require approval / block`).
- Owner calendar: day/week/month, today's KPIs (appointments, awaiting approval, occupancy %, free hours), appointment details, add manual booking.
- Team members with own hours/services; exceptions & vacations; customers folder with visit history, no-show tracking.
- Reports: appointments, revenue from completed visits, expected revenue, average ticket, no-show rate, cancel rate, new vs returning customers, by day / by service / by weekday; CSV and Excel export (RTL Hebrew Excel).
- Google Calendar sync; WhatsApp contact button; slug redirects; settings revisions/undo (see docs; mention only if shown).
- Quality evidence: 688 unit tests passing at last audit; race-free booking under load (60 concurrent requests on 12 slots → exactly 12 bookings). Use sparingly and only with Yotam's OK.

## Forbidden / not to advertise (as of 2026-11-24 — may change with development)
- **Payments, invoicing, card checkout** — skeleton/fake provider only.
- Anything about SMS reminders (reminders are email today; WhatsApp is a contact button).
- Any fabricated customers, ratings, percentages of no-show reduction, or "AI" claims.

## Visual assets
| Need | Source | Status |
|---|---|---|
| Customer booking flow (mobile, dark) | `public/shots/m-*.png` (1170×2532) | real |
| Owner calendar week/day, appointment detail | `public/shots/d-week.png`, `d-details.png` (1920×1080) | real |
| Hours before/after, public availability | `public/shots/f-*.png`, `d-hours-*`, `d-avail-*` | real (not used in v6) |
| Reminder, waitlist, rules, reports | built in `src/Showcase.tsx` as motion graphics with real labels and demo numbers | **no real dark screenshots yet** |
All real shots were captured from the app on 2026-11-21 in an isolated local stack with fake email/billing (demo data: "Studio Alon", Noa/Ori). Original sets: Yotam's Drive (light + dark).

## Future
Capture real dark screenshots for reports/waitlist/reminders (run the app with a local Supabase DB), then swap the motion-graphic scenes. English-UI screenshots do not exist yet.
