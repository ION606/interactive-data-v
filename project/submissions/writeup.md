# Credit Card Fraud Detection: Turning a Diagnostic Plot Into a Decision Tool

_Itamar Oren-Naftalovich_

---

## 1. Class-presentation materials (18 June)

### 1 A Problem & context

Credit-card fraud, though < 0.2 % of daily transactions, costs issuers ≈ USD 32 billion annually. A model that flags suspicious authorisations in ≤ 50 ms can prevent huge downstream losses while minimising customer friction. Data come from a public European-cardholder set containing **284 807 transactions (492 frauds)** with PCA-compressed features V1–V28, plus raw `Time` and `Amount`.&#x20;

### 1 B Audience

| Segment             | Why they care                                     | Technical depth |     |
| ------------------- | ------------------------------------------------- | --------------- | --- |
| Fraud-risk analysts | need a clear “approve / review / decline” cut-off | medium          |     |
| Data-science team   | must tune the model & threshold                   | high            |     |
| Compliance managers | audit false-positive cost / customer impact       | low–medium      |     |

### 1 C Objectives

1. **Maximise recall** of fraudulent cases while keeping precision acceptable.
2. Provide an **intuitive, adjustable threshold** the business can act on.
3. Surface **feature importance** evidence for explainability.&#x20;

### 1 D Key data relationships

-   `precision ↔ recall` over probability thresholds (primary).
-   `time-of-day → fraud likelihood` (night-time spikes).
-   `amount` distribution legitimate vs fraud.
-   Top contributing features ranked by SHAP/Gini.&#x20;

### 1 E Data visualisation shown in class

| Element           | Choice                                                                 | Rationale                                                                            |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Chart type**    | Precision–Recall (PR) curve                                            | PR curves stay informative when negatives dominate; ROC can appear deceptively good. |
| **Tool**          | _Plotly_                                                               | Allows hover tool-tips and a live threshold slider.                                  |
| **Accessibility** | Colour-blind-safe palette; thick 2 px stroke for projector visibility. |                                                                                      |

**Figure 1.** _Original PR-curve (as presented 18 June)_ – no marker, default colour palette.

---

## 2. Paper-only sections (due 27 June)

### 2 A Summary of class feedback

| Comment / question                                   | Source             | Action taken                                               |     |
| ---------------------------------------------------- | ------------------ | ---------------------------------------------------------- | --- |
| “Where exactly is the _best_ threshold?”             | Two peers          | Compute F1 at every threshold; annotate opt-F1 point.      |     |
| “Curve colour a bit light for colour-blind viewers.” | Instructor         | Switch to Tableau colour-blind palette.                    |     |
| “Could you relate stats to business impact?”         | Finance-track peer | Add call-outs: TP = blocked fraud, FP = customer friction. |     |

### 2 B Revised data visualisation

**Figure 2.** _Annotated PR-curve (revised)_ – generated with the script in _dispdata.py_; the marker denotes the **F1-maximising threshold t = 0.83 (F1 = 0.69)**.

### 2 C Discussion of revisions

1. **Actionability ↑** – The new marker transforms a descriptive plot into a **decision tool**: analysts can set the rule “flag if P ≥ 0.83”, achieving **0.81 precision at 0.59 recall**.
2. **Accessibility ↑** – Switching to the Tableau colour-blind palette and adding a 50-pt marker meet WCAG 2.1 contrast guidelines.
3. **Business framing ↑** – Text call-outs linking TP/FP to blocked losses vs. customer friction make the costs explicit to non-technical stakeholders.

---

## 3. Technical appendix (for reviewers)

### 3 A Modelling pipeline

-   **Dataset:** `creditcard.csv`.
-   **Split:** 80 / 20 stratified train–test.
-   **Model:** `LightGBMClassifier(n_estimators = 100, max_depth = 5)`.
-   **Outputs:** Probability scores (`probabilities.json`) and true labels (`labels.json`).&#x20;

### 3 C Future work

-   **Cost-sensitive thresholds:** weight FP over TP to reflect \$ cost ratio.
-   **SHAP summary plot:** expose top features driving fraud predictions.
-   **Real-time A/B test:** deploy threshold slider in dashboard for live tuning.

---

### 4. References

European card-fraud dataset (2013) – _UCI Machine Learning Repository_
Ke, G. et al. (2017) “LightGBM: A Highly Efficient Gradient Boosting Decision Tree.” _NIPS_.
