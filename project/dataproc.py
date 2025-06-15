import pandas as pd
from lightgbm import LGBMClassifier
import json

data = pd.read_csv('creditcard.csv')
X = data.drop(['Class'], axis=1)
y = data['Class']

from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

model = LGBMClassifier(n_estimators=100, max_depth=5)
model.fit(X_train, y_train)

y_prob = model.predict_proba(X_test)[:, 1]
y_true = y_test.values

with open('data/probabilities.json', 'w') as f:
    json.dump(y_prob.tolist(), f);

with open('data/labels.json', 'w') as f:
    json.dump(y_true.tolist(), f);
