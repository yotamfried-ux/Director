# Customer Churn Prediction — project brief for marketing

- **What:** a supervised-ML project that predicts which telecom-style customers will churn. Part A: EDA, cleaning, 3 model families compared, winner chosen by cross-validation, evaluated once on a held-out test set. Part B: pulls records from MongoDB, cleans and aligns them to the training schema, scores them with the saved pipeline and exports a CSV.
- **Source (read 2026-11-25):** Yotam's private ML repo (two notebooks Part A/B, `churn.csv`, `churn_predicted.csv`, a saved pipeline, `figures/`, a course deck; last commit 2026-01-07). The repo is private: do not link or name it in public files. Portfolio entry: `customer-churn-prediction` (currently `status: pending`, synthetic demo).
- **Audience on the portfolio site:** freelance clients (what it does for a business); engineering detail goes to the project-page exploration view (recruiters).
- **NEVER show:** the student name and ID printed at the top of both notebooks; the course deck slides without review. Never write them into this repo (it is public).

## Verified claims (from notebook outputs, 2026-11-25; re-verify before the next video)
- Dataset: **7,043 customers, 21 columns** (19 model features after dropping the id and target). Churn rate **26.5%** (1,869 yes / 5,174 no). No missing values except `TotalCharges` blanks handled in cleaning.
- Split: stratified **80/20** (5,634 train / 1,409 test); churn share 26.5% in both.
- **Baseline** "nobody churns": accuracy **73.5%**, finds **0** churners (recall 0).
- **61 configurations** across KNN, Decision Tree, Random Forest compared with cross-validation. Winner: **Random Forest (200 trees, depth 10)**, CV accuracy **80.4%**.
- Held-out test (1,409 customers, scored once): accuracy **80.2%**, F1 (churn) **0.58**, ROC-AUC **0.84**. Confusion matrix: 937 true no, 98 false alarms, 181 missed churners, **193 churners caught of 374 (recall 52%, precision 66%)**.
- Train accuracy 87.3% vs test 80.2%: a visible generalisation gap (say it if accuracy is shown against train).
- Real churn rates in the dataset (computed from `churn.csv`): by contract month-to-month **42.7%** / one-year **11.3%** / two-year **2.8%**; tenure ≤12 months **47.4%** vs >12 months **17.1%**; fiber optic **41.9%** vs DSL **19.0%** vs no internet **7.4%**; no tech support **41.6%** vs with **15.2%**; electronic-check payers **45.3%** vs automatic card/bank **15–17%**.
- Top Random Forest feature importances: tenure, total charges, monthly charges, month-to-month contract, no online security, fiber optic, no tech support.
- Part B: pulls from a MongoDB collection (25,000 documents in the Compass screenshot), found `PaperlessBilling` stored as a one-item array and fixed it, kept 24,218 complete rows, exported predictions in the original CSV schema with a duplicate check.

## Provenance (confirmed by Yotam 2026-11-25)
- Final project of the **Technion data-analyst course**; the dataset is a **public dataset provided by the course**. No real customers, no real company. Say "project" / "Technion data-analyst course project"; never "real customers", "client" or "company data".
- Part B: the MongoDB processing really happened (import, cleaning, scoring); the records are the same kind of public data, not real customers.
- Course certificate is on the portfolio site; do not state a grade or score unless Yotam gives the exact wording.

## Still not to claim
- Any business value in money or % saved, "production", "deployed", "real-time".
- Part B predicted churn share as a finding.
- The model is a classic Random Forest (no deep-learning / "AI" language).

## Assets
`figures/` (24 default-matplotlib charts: confusion matrix, ROC, feature importance, churn by contract/tenure/payment...), a MongoDB Compass screenshot (shows local hostname and database names: crop or redo before use), `churn.csv`, the saved pipeline (loads with scikit-learn 1.9.1 with a version warning; trained in 1.8.0: reproduce the test metrics before computing new numbers).
Default charts are not publishable as is; rebuild them in the video/site style from the numbers above.
