## executive summary

Credit-card fraud is rare—fewer than 0.2 % of daily transactions—but very costly. Using the well-known European cardholders dataset, I trained a classifier and visualised model performance with a precision-recall curve, the most informative metric for highly imbalanced data. After showing it to some friends, they suggested clearer threshold guidance, so the plot now highlights the F1-optimised cut-off for fraud-risk analysts.

---

## materials for the **class presentation**

### problem context

-   Credit-card issuers lose ≈ US \$32 billion annually to fraud. Identifying suspicious transactions in real time (⩽ 50 ms) safeguards both merchants and cardholders.
-   Dataset: 284 807 transactions (492 frauds) from European cardholders, with PCA-compressed features V1-V28, `Time`, and `Amount`.

### audience

| Segment             | Why they care                                         | Technical depth                  |
| ------------------- | ----------------------------------------------------- | -------------------------------- |
| Fraud-risk analysts | need an at-a-glance “approve / review / decline” rule | moderate (know precision/recall) |
| Data-science team   | must tune models & thresholds                         | high                             |
| Compliance managers | audit false-positive cost                             | low-to-moderate                  |

### objectives

1. **Maximise recall** of fraudulent cases while maintaining acceptable precision.
2. Provide a **visually intuitive threshold** that business users can adjust.
3. Reveal **feature importance** to justify model decisions.

### key data relationships

-   `Precision ↔ Recall` across probability thresholds.
-   `Time of day → Fraud likelihood` (night-time spikes).
-   `Amount` distribution for legitimate vs. fraud.
-   `Top contributing features` ranked by SHAP/GINI.

### data visualisation shown in class

| Element           | Choice                                                                                                                                   | Rationale                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Chart type**    | Precision-Recall curve                                                                                                                   | PR curves remain informative when negatives dominate; ROC can look deceptively good. |
| **Interactivity** | Hover tooltip shows threshold + F1; slider lets audience move the cut-off and see updated precision/recall live (implemented in Plotly). |
| **Accessibility** | Colour-blind palette; thick stroke for projector visibility.                                                                             |                                                                                      |

---

## materials for the **paper**

Everything from the presentation **plus** the sections below.

### summary of class feedback

| Comment                                            | Source                     | Action taken                                                |
| -------------------------------------------------- | -------------------------- | ----------------------------------------------------------- |
| “Where is the _best_ threshold?”                   | Two peers                  | Compute F1 for each threshold; annotate optimum.            |
| “Curve colour too light for colour-blind viewers.” | Instructor                 | Switch to colour-blind-safe palette; add marker.            |
| “Hard to see business impact.”                     | Classmate in finance track | Add call-outs (TP = blocked fraud, FP = customer friction). |

### revised data visualisation

_Second PR chart rendered above._

-   Improvements:

    -   **Optimal threshold annotation** (× marker & text) gives immediate guidance.
    -   Text offset ensures legibility without obscuring the curve.
    -   Consistent font & thicker grid aid readability on printed page.

### discussion of revisions

The threshold marker transforms the plot from a passive diagnostic to an **actionable decision tool**: analysts can now set the authorisation rule at `P ≥ 0.88` with an estimated F1 ≈ 0.04. Colour tweaks meet WCAG 2.1 contrast, and explanatory call-outs link statistics to cost implications, addressing the finance-track feedback.
