import sys
import os
sys.path.append('src')

# Mocking data_manager to avoid cache issues in testing if needed
# But let's just try running it assuming it works
from space_weather import fetch_7day_kp_forecast

print("Testing 7-day forecast fetch...")
df = fetch_7day_kp_forecast()
if df is not None:
    print("Successfully fetched 7-day forecast!")
    print(df)
else:
    print("Failed to fetch 7-day forecast.")
