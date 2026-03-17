import sys
sys.path.append('src')
import requests

url = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json"
r = requests.get(url, timeout=10)
print("Status:", r.status_code)
print("First 300 chars:", r.text[:300])