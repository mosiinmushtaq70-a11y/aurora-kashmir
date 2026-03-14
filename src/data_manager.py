import pandas as pd
import os
import json
from datetime import datetime

# Relative to main.py's location or CWD
CACHE_DIR = os.path.join(os.getcwd(), 'cache')

if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

def save_to_cache(name, df):
    """Save a DataFrame to a persistent CSV cache."""
    if df is None or (isinstance(df, pd.DataFrame) and df.empty):
        return
    
    file_path = os.path.join(CACHE_DIR, f"{name}.csv")
    meta_path = os.path.join(CACHE_DIR, f"{name}_meta.json")
    
    try:
        df.to_csv(file_path, index=False)
        with open(meta_path, 'w') as f:
            json.dump({"last_updated": datetime.utcnow().isoformat()}, f)
    except Exception as e:
        print(f"Error saving cache for {name}: {e}")

def load_from_cache(name):
    """Load a DataFrame from the local persistent cache."""
    file_path = os.path.join(CACHE_DIR, f"{name}.csv")
    meta_path = os.path.join(CACHE_DIR, f"{name}_meta.json")
    
    if not os.path.exists(file_path):
        return None, None
    
    try:
        df = pd.read_csv(file_path)
        # Attempt to restore datetime columns if they exist
        if 'time_tag' in df.columns:
            df['time_tag'] = pd.to_datetime(df['time_tag'])
        elif 'beginTime' in df.columns: # for flares
             df['beginTime'] = pd.to_datetime(df['beginTime'])
        
        last_updated = None
        if os.path.exists(meta_path):
            with open(meta_path, 'r') as f:
                meta = json.load(f)
                last_updated = meta.get("last_updated")
        
        return df, last_updated
    except Exception as e:
        print(f"Error loading cache for {name}: {e}")
        return None, None
