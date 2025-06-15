import json;
import numpy as np;
import matplotlib.pyplot as plt;

# load predicted probabilities and true labels from json files
with open('data/probabilities.json') as f:
    y_prob = json.load(f);
with open('data/labels.json') as f:
    y_true = json.load(f);

# compute precision & recall at 200 evenly spaced thresholds
thresholds = np.linspace(0, 1, 200);
precision = [];
recall = [];
eps = np.finfo(float).eps;
for t in thresholds:
    # true positives, false positives, false negatives
    tp = sum((p >= t) and (y == 1) for p, y in zip(y_prob, y_true));
    fp = sum((p >= t) and (y == 0) for p, y in zip(y_prob, y_true));
    fn = sum((p <  t) and (y == 1) for p, y in zip(y_prob, y_true));
    precision.append(tp / (tp + fp + eps));
    recall.append(tp / (tp + fn + eps));

precision = np.array(precision);
recall    = np.array(recall);

# find F1-maximising threshold
f1_scores = 2 * precision * recall / (precision + recall + eps);
idx_best  = np.argmax(f1_scores);
t_best    = thresholds[idx_best];


# plot pr curve
plt.style.use('tableau-colorblind10');               # color-blind-friendly palette
plt.figure(figsize=(12, 6));
plt.plot(recall, precision, label='pr curve', linewidth=2.0);

# identify f1-max threshold correctly
f1 = (2 * precision * recall) / (precision + recall + 1e-15);
best_idx = f1.argmax();
best_t = thresholds[best_idx];
plt.scatter(recall[best_idx], precision[best_idx], s=50, zorder=5, label='f1-max');
plt.annotate(f'opt t={best_t:.2f}\nf1={f1[best_idx]:.2f}',
             (recall[best_idx], precision[best_idx]),
             textcoords='offset points', xytext=(-40, -20));

# cosmetics
plt.xlabel('recall'); plt.ylabel('precision');
plt.title('precision-recall curve');
plt.grid(linewidth=0.8, alpha=0.5);
plt.legend();
plt.tight_layout(); plt.show();
