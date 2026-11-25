# Script v2 — Customer Churn Prediction — project clip (33 s, 16:9, silent, he/en)
Replaces v1 after Yotam's feedback (2026-11-25 11:43): v1 was an improvement but "unfinished" and gave **no background on the project and what we did** at the start.
Claims: `products/churn-prediction.md` (verified 2026-11-25). Brief: `products/churn-prediction-brief-v1.md`.

**What changed:** a real opening scene (what the project is, who/what data, tools, goal), a persistent five-step progress bar (הבעיה · הנתונים · המודל · התוצאה · מסד נתונים) so the viewer sees "what we did" at a glance, and a closing line that returns to the promise. Length 33 s (Yotam: half a minute is realistic; +3 s for the background).

| Time | Step | Visual (source) | Text (he) |
|---|---|---|---|
| 0–7.2 | 1. Background | Left: held-out customers as dots, 26.5% amber. Right: title, "פרויקט גמר · קורס אנליסט נתונים · הטכניון", goal sentence, three numbers (7,043 לקוחות · 19 מאפיינים · 26.5% עזבו), tool chips Python · scikit-learn · pandas · MongoDB (notebooks, deck) | חיזוי נטישת לקוחות · המטרה: לזהות מי עומד לעזוב, לפני שהוא עוזב |
| 6.4–13.2 | 2. Data insight | Paired bars from churn.csv: חוזה חודשי 42.7% / דו-שנתי 2.8%; ותק עד שנה 47.4% / מעל שנה 17.1%; צ'ק אלקטרוני 45.3% / אוטומטי 16.0% | מה מנבא נטישה? |
| 12.4–21.2 | 3. Model | Prep chips (ניקוי · קידוד · נרמול, 19 ← 46 עמודות), then bars of best test accuracy per family (KNN 78.4, עץ החלטה 79.2, יער אקראי 80.2) with the 73.5% no-model line | הכנת הנתונים · 61 הגדרות · 3 משפחות מודלים · יער אקראי ניצח |
| 20.4–27.2 | 4. Result | 80.2% accuracy on 1,409 unseen customers, 193 of 374 found, 98 false alarms, AUC 0.84, "מעל ניחוש ללא מודל: 73.5%" | התוצאה על לקוחות שלא נראו |
| 26 – 33 | 5. Database + close | 25,000 רשומות ← תיקון שדה ← 24,218 קיבלו ציון ← CSV; closing line with slow motion | ובשלב ב׳: מסד נתונים · לדעת מי עומד לעזוב, לפני שהוא עוזב |

Footer: "מערך נתונים ציבורי מהקורס". Known limits as in v1 (no money claims; recall 52% shown as "זוהו"; 80.2% always next to the 73.5% baseline; no MongoDB screenshot; no student name/ID). "חברת תקשורת" is the dataset's domain (phone/internet service columns), not a claim about a real company.
