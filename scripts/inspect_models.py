import joblib
import os
import pandas as pd

model_dir = r"d:\python_projects\aurora\models"
with open("model_inspection.txt", "w") as f:
    try:
        feature_cols = joblib.load(os.path.join(model_dir, 'feature_cols.pkl'))
        f.write("--- FEATURE COLUMNS ---\n")
        cnt = 0
        for col in feature_cols:
            f.write(f"{col}\n")
            cnt += 1
        f.write(f"Total: {cnt}\n")

        feature_medians = joblib.load(os.path.join(model_dir, 'feature_medians.pkl'))
        f.write("\n--- FEATURE MEDIANS KEYS ---\n")
        cnt = 0
        for k in feature_medians.keys():
            f.write(f"{k}\n")
            cnt += 1
        f.write(f"Total: {cnt}\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
