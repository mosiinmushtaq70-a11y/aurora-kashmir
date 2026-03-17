import os
import joblib

# Matches predictor.py logic
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')
print(f"Computed MODEL_DIR: {MODEL_DIR}")
print(f"Exists: {os.path.exists(MODEL_DIR)}")

target = os.path.join(MODEL_DIR, 'feature_medians.pkl')
print(f"Target file: {target}")
print(f"Target exists: {os.path.exists(target)}")

try:
    data = joblib.load(target)
    print("Sucessfully loaded target!")
    print(f"Type: {type(data)}")
except Exception as e:
    print(f"Load failed: {e}")
