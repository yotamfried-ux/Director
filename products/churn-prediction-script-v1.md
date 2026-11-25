# Script v1 — Customer Churn Prediction — project clip (30 s, 16:9, silent, he/en)
Brief: `products/churn-prediction-brief-v1.md` (+ v2 notes below). Claims verified 2026-11-25 (`products/churn-prediction.md`).

**One promise:** a model that finds who is about to leave, built and tested end to end, from raw data to a database.
**Viewer:** a client or recruiter on the project page; must understand the *important things* in 30 s: the problem, what drives churn, how the model was chosen, how well it does, and that it runs on a database.
**Why 30 s (Yotam, 11:32):** one minute is too long; 30 s that presents the whole project is the realistic target. Five scenes, one idea each. Captions are full short sentences (≤ 40 chars on one line at 64 px), not fragments.

| Time | Scene | Visual (source) | Caption (he) |
|---|---|---|---|
| 0–5.5 | 1. The problem | 1,409 test customers as dots, 26.5% amber; stats "7,043 לקוחות" and "26.5% עזבו" (churn.csv) | Title: חיזוי נטישת לקוחות · Sentence: מי עומד לעזוב, לפני שהוא עוזב? |
| 5–11 | 2. What drives churn | Three paired bars from real rates: חוזה חודשי 42.7% / דו-שנתי 2.8%; ותק עד שנה 47.4% / מעל שנה 17.1%; צ'ק אלקטרוני 45.3% / תשלום אוטומטי 16.0% (computed from churn.csv) | מה מנבא נטישה? · חוזה חודשי, לקוחות חדשים, תשלום בצ'ק |
| 10.5–20 | 3. Prep and models | (a) three chips: ניקוי · קידוד · נרמול, "19 עמודות ← 46" (notebook cell 47); (b) bars of best test accuracy per family: KNN 78.4%, עץ החלטה 79.2%, יער אקראי 80.2% + marker "ניחוש ללא מודל 73.5%" (notebook cells 53, 58) | הכנת הנתונים · 61 הגדרות של 3 משפחות מודלים, יער אקראי ניצח |
| 19.5–25.5 | 4. Result | Big "80.2%" accuracy on 1,409 customers never seen; stats 193 of 374 churners found, 98 false alarms, AUC 0.84 (reproduced from the saved pipeline, identical to notebook) | 80.2% דיוק על לקוחות שלא נראו · מעל ניחוש ללא מודל: 73.5% |
| 25–30 | 5. Database and close | Chain: 25,000 רשומות ב-MongoDB ← תיקון סכמה ← 24,218 קיבלו ציון ← CSV (deck slide 16, notebook Part B); end line | ובשלב ב׳: מסד נתונים · פרויקט גמר, קורס אנליסט נתונים, הטכניון |

Transitions: ≥24-frame overlaps, blur+fade; slow ambient motion in the last scene (no frozen tail). No music (site clip). Footer on every frame: "מערך נתונים ציבורי מהקורס".

**Known limits / not claimed:** recall is 52% (193/374), shown as "זוהו", not as "most"; train accuracy 87.3% vs test 80.2% is not shown; no money/business-value claims; 80.2% always shown next to the 73.5% no-model baseline; Part B counts are the import/cleaning counts, the predicted share is not shown; student name/ID never shown; MongoDB screenshot not used (shows local hostnames); data points are real scores of the held-out set, no identifiers.

## v2 director notes (after Yotam's feedback 2026-11-25 11:31–11:33)
- v1 draft ("journey of one customer") rejected: opened with the 73.5% baseline and never showed the model's 80.2%; captions were fragments; skipped drivers/prep/model comparison the course deck itself highlights.
- Fix: lead with the model's own result, show baseline only as context; cover the deck's storyline in 30 s; no per-customer card.
