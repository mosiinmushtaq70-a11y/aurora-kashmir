import joblib
import pandas as pd
import json
import os

model_dir = r"d:\python_projects\aurora\models"

# 1. Convert feature_medians
try:
    medians = joblib.load(os.path.join(model_dir, 'feature_medians.pkl'))
    if isinstance(medians, pd.Series):
        medians_dict = medians.to_dict()
    else:
        medians_dict = dict(medians)
    
    # Clean up keys for JSON (Ensure they are strings)
    cleaned_medians = {str(k): float(v) if pd.notna(v) else 0.0 for k, v in medians_dict.items()}
    
    with open(os.path.join(model_dir, 'feature_medians.json'), 'w') as f:
        json.dump(cleaned_medians, f)
    print("Saved feature_medians.json")
except Exception as e:
    print(f"Failed to convert medians: {e}")

# 2. Convert feature_cols (already a list usually, but let's be safe)
try:
    cols = joblib.load(os.path.join(model_dir, 'feature_cols.pkl'))
    cols_list = list(cols)
    with open(os.path.join(model_dir, 'feature_cols.json'), 'w') as f:
        json.dump(cols_list, f)
    print("Saved feature_cols.json")
except Exception as e:
    print(f"Failed to convert cols: {e}")
