# Script v3 — Customer Churn Prediction — project clip (39.5 s, 16:9, silent, he/en)
Supersedes v2 after Yotam's feedback (2026-11-25 11:52): **the UI needs improvement, and transitions are too fast to read and understand.**
Claims: `products/churn-prediction.md` (verified 2026-11-25). Brief: `products/churn-prediction-brief-v1.md`.

## What the diagnosis of v2 found (stills + timing)
- Reading load: scene 1 put ~25 words and 7 elements on screen in 3.6 s; scene 2 revealed three bar pairs in 2.6 s; scenes cross-faded in 24 frames with the third element of each scene held for <1 s. A viewer could not read, let alone understand.
- UI: stepper 28 px and footer 24 px (unreadable at card size); scene 5 cards were wider than the frame (clipped at both edges); model bars at a 0–100 scale made 78.4 / 79.2 / 80.2 look identical and the 73.5% line sat on the bars; the result scene showed numbers with no picture of what "193 of 374" means; the two-step prep→models flip was a second hard-to-follow transition.

## Changes
1. **Time budget** per scene: ≥0.4 s per word + a full-visible hold ≥1.3 s before the fade-out starts. Reveals are staggered one idea at a time (30-frame soft reveals). Scene cross-fade 30 frames (was 24) via the new `fade` option of `Scene`. Length 33 → 39.5 s. Yotam asked for ~30 s earlier; 30 s does not fit the reading budget without removing a step (cut candidates, if he insists: step 5, or the prep strip). A 15 s card cut can be a separate idea later.
2. **UI**: bigger type (stepper 32 px, footer 28 px, body ≥ 38 px), glass cards, content centred in the band between title and stepper, stepper with a continuous progress line, prep + models on **one** screen (no inner flip), model bars on a labelled 70–82% axis with ticks so the differences and the 73.5% line are legible, a picture for "193 of 374" (374 dots = the real churners in the test set, 193 lit), scene 5 cards fit the frame with simple geometric icons.

| Frames (s) | Step | Visual (source) | Text (he) |
|---|---|---|---|
| 0–240 (0–8) | 1. Background | Left: the 1,409 test customers as dots (26.5% amber, real scores). Right: title, "פרויקט גמר · קורס אנליסט נתונים · הטכניון", goal sentence, three numbers (7,043 · 19 · 26.5%), chips Python · scikit-learn · pandas · MongoDB | חיזוי נטישת לקוחות · המטרה: לזהות לקוח שעומד לעזוב, לפני שהוא עוזב |
| 210–450 (7–15) | 2. Data insight | Three cards, one at a time, paired bars from churn.csv: חוזה חודשי 42.7 / דו-שנתי 2.8; ותק עד שנה 47.4 / מעל שנה 17.1; צ'ק אלקטרוני 45.3 / אוטומטי 16.0. Subtitle says what the % is | מה מנבא נטישה? · שיעור הנטישה בכל קבוצה |
| 420–720 (14–24) | 3. Prep + model | Top strip: 3 prep chips (ניקוי ערכים חסרים · קידוד קטגוריות · נרמול מספרים) and 19 ← 46 עמודות. Below: best test accuracy per family on a 70–82% axis (KNN 78.4, עץ החלטה 79.2, יער אקראי 80.2) with the 73.5% no-model line; winner caption | הכנת הנתונים · 61 הגדרות · 3 משפחות מודלים · יער אקראי ניצח (200 עצים) |
| 690–945 (23–31.5) | 4. Result | 80.2% count-up, "מעל ניחוש ללא מודל: 73.5%", card of 374 churner dots with 193 lit, 98 false alarms, AUC 0.84 | התוצאה על לקוחות שלא נראו · 193 מתוך 374 נוטשים זוהו |
| 915–1185 (30.5–39.5) | 5. Database + close | Four cards with icons: 25,000 רשומות נטענו ל-MongoDB → תיקון שדה בסכמה → 24,218 רשומות קיבלו ציון → ייצוא CSV; pulse dot on a track; closing line, slow drift to the last frame | ובשלב ב׳: מסד נתונים · לדעת מי עומד לעזוב, לפני שהוא עוזב |

Persistent: five-step stepper (הבעיה · הנתונים · המודל · התוצאה · מסד נתונים) switching at the middle of each cross-fade (frames 225, 435, 705, 930), progress line = frame / total, footer "מערך נתונים ציבורי מהקורס".

## Known limits (unchanged)
No money / business-value claim; recall shown as "193 מתוך 374 זוהו" (52%), never "accuracy of churners"; 80.2% always next to the 73.5% baseline; no MongoDB screenshot (motion graphic only); no student name/ID; no "production / real-time"; "חברת תקשורת" is the dataset's domain, not a claim about a real company. The 70–82% axis is truncated on purpose to make small differences visible; it is labelled with ticks and "תחילת הציר: 70%".

## Director notes (to fill after the build)
- 5-second test / message test / honesty / feel / cut: see experiments/log.md entry.
