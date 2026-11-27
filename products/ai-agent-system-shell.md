# AI Agent System (portfolio card name; on screen exactly "AI Agent System")

Source of truth: Yotam's own n8n instance, workflow "PROJECT SPEC — n8n On-Demand Engineering Run System" (read-only; the spec is documentation, not an execution workflow). No GitHub repo. Registry entry `ai-agent-system` is `active: false` (Yotam's flag).

## One-line (buyer lens)
A multi-agent system that does software-engineering work for one request at a time, and is built so that no agent's own claim counts as proof.

## Verified claims
Claims verified on 2026-11-26 against the live spec workflow (updated 2026-11-26) in n8n, read-only.
| # | Claim (Hebrew on screen) | Source in spec |
|---|---|---|
| V1 | בקשה אחת = ריצה אחת (RUN); רצה רק לפי בקשה מפורשת, לא כל לילה | "One user-requested job = one logical RUN"; "no default nightly schedule" |
| V2 | 15 תפקידים מתמחים נפרדים (Orchestrator, Profiler, Planner, Development, Failure Investigator, Repair, CI/Test, Web, Mobile, API, Data/DB, Security, Verifier, Memory, Morning Reporter) | "Agent / Worker Architecture" list 1-15 |
| V3 | המאגר נקבע בכל בקשה; ה-Profiler בוחר רק את המומחים הנדרשים | "Runtime Repository Contract — MUST BE DYNAMIC" |
| V4 | לולאת כשל חובה: הרצה, בדיקה, אבחון, תיקון, הרצה חוזרת, אימות | "Failure loop is mandatory: run → inspect → diagnose → fix → rerun → verify" |
| V5 | סדר אמון: הרצה ובדיקות > CI > סורקים > פרשנות הסוכן; מודל אינו שופט של עצמו | "Trust hierarchy ..."; "LLMs are not judges of their own work" |
| V6 | חוקר התקלות (למה נכשל) ומאמת (האם ההצלחה הוכחה) הם שני תפקידים נפרדים | "Investigator and Verifier are never merged" |
| V7 | לא מדווחים PASS כשההרצה נכשלה, פגה או חסרות ראיות | "Never report CLEAN/PASS when execution actually failed..." |
| V8 | עוצרים ומעבירים לאדם כשחסרה הרשאה או החלטה | "Safety / Autonomy Boundaries": stop/escalate |
| V9 | בחירת מודל לפי יכולת, העדפה למסלולים חינמיים, בלי חיוב נסתר | "LLM Policy": "No hidden paid fallback" |
| V10 | שיפור עצמי: רק בסנדבוקס מאושר, בלי כתיבה לפרודקשן ובלי מיזוג אוטומטי | SI policy: SANDBOX_ONLY, production_write=false, auto_merge=false |
| V11 | מצב כנה: SYSTEM_NOT_PRODUCTION_READY (המערכת עדיין לא מוכנה לפרודקשן) | Production Readiness audit 2026-11-03 and later PASS notes keep this status |
| V12 | שיפור עצמי: הרצה אוטונומית הודגמה, שיפור מאומת עדיין לא הוכח (REJECTED_BY_HOLDOUT, דחייה בטוחה) | "SI 2026-11-22 — Current Verified Status" |

## Forbidden / not to claim (as of 2026-11-26)
- Production readiness, "autonomous developer replaces a team", any speed/cost/quality number, customers, reviews, uptime.
- That self-improvement works or that improvement is proven.
- Any n8n address, workflow/execution ids, client repository names.
- Anything about specific runs' results beyond status words above (no run counts shown).

## Audience / tone
Portfolio visitors (potential clients, recruiters), silent card ~600 px. Calm, technical, honest: "how it works and how it stays honest", a process experiment.

## Assets
No product UI screenshots exist (the spec is a canvas of notes). Motion graphics only, built from the spec's real role names and status words (English identifiers kept as written). No demo numbers are shown, so no "נתוני דמו" label is needed.
