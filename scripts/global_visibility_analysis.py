import sys
import os
import math
import numpy as np
import pandas as pd

# Add src to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src'))

from predictor import calculate_aurora_probability
from space_weather import get_kp_index, get_solar_wind, get_plasma_data

def run_analysis():
    print("Initializing Global Visibility Pulse Analysis...")
    
    # 1. Get Live Telemetry
    kp_df = get_kp_index()
    sw_df = get_solar_wind()
    plasma_df = get_plasma_data()
    
    if kp_df is None or sw_df is None or plasma_df is None:
        print("Error: Could not fetch live telemetry.")
        return

    current_kp = kp_df.iloc[-1]['kp']
    current_bz = sw_df.iloc[-1]['bz_gsm']
    current_bt = sw_df.iloc[-1]['bt']
    current_speed = plasma_df.iloc[-1]['speed']
    current_density = plasma_df.iloc[-1]['density']
    current_temp = plasma_df.iloc[-1]['temperature']
    
    print(f"Current Environment: Kp={current_kp}, Bz={current_bz}, Speed={current_speed}")

    # 2. Generate Grid (Approx 100km separation)
    # 1 degree of latitude is ~111km.
    # We'll use 1 degree steps for simplicity, then filter by distance if strictly needed, 
    # but 1deg is a good proxy for "100k apart" at the equator.
    lats = np.arange(-90, 91, 1)
    lons = np.arange(-180, 181, 2) # Lon is denser at poles, so we skip some
    
    total_locations = 0
    high_visibility_locations = 0
    results = []

    print(f"Analyzing {len(lats) * len(lons)} planetary coordinates...")

    for lat in lats:
        # Adjust longitude density based on latitude to maintain approx 100km spacing
        # Circumference at lat = 40075 * cos(lat)
        # Degree spacing = 111 * cos(lat)
        # To keep 100km, we need 100 / (111 * cos(lat)) degrees
        cos_lat = math.cos(math.radians(lat))
        if cos_lat > 0.1:
            lon_step = max(1, round(1 / cos_lat))
        else:
            lon_step = 30 # Near poles, very sparse
            
        for lon in np.arange(-180, 181, lon_step):
            total_locations += 1
            
            # Use ML predictor for each point (assume 0 cloud cover for global potential)
            pred = calculate_aurora_probability(
                kp=current_kp,
                bz=current_bz,
                bt=current_bt,
                lat=lat,
                lon=lon,
                speed=current_speed,
                density=current_density,
                temp=current_temp,
                cloud_cover=0
            )
            
            score = pred.get('aurora_score', 0)
            if score > 50:
                high_visibility_locations += 1
                results.append((lat, lon, score))

    print("\n--- Analysis Results ---")
    print(f"Total points analyzed: {total_locations}")
    print(f"Locations with >50% visibility: {high_visibility_locations}")
    print(f"Global Coverage Percentage: {(high_visibility_locations / total_locations * 100):.2f}%")
    
    if results:
        # Show top 5 samples
        results.sort(key=lambda x: x[2], reverse=True)
        print("\nTop Visibility Zones:")
        for r in results[:5]:
            print(f"Lat: {r[0]}, Lon: {r[1]} -> Score: {r[2]}%")

if __name__ == "__main__":
    run_analysis()
