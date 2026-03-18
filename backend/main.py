from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import math

app = FastAPI()

# Enable CORS so your Next.js frontend can talk to this Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Real-world Aurora Viewing Spots Database
SIGHTSEEING_SPOTS = [
    {"id": 1, "name": "Tarsar Lake", "lat": 34.15, "lng": 75.12, "region": "Kashmir", "pollution": "Minimal", "rating": 5},
    {"id": 2, "name": "Sonamarg Valley", "lat": 34.30, "lng": 75.30, "region": "Kashmir", "pollution": "Low", "rating": 4},
    {"id": 3, "name": "Murphy Dome", "lat": 64.95, "lng": -147.41, "region": "Alaska", "pollution": "Minimal", "rating": 5},
    {"id": 4, "name": "Chenna Lakes", "lat": 64.79, "lng": -147.22, "region": "Alaska", "pollution": "Low", "rating": 4},
    {"id": 5, "name": "Thingvellir Park", "lat": 64.25, "lng": -21.12, "region": "Iceland", "pollution": "Minimal", "rating": 5},
]

def get_distance(lat1, lon1, lat2, lon2):
    return math.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)

@app.get("/api/weather/forecast/global")
async def get_forecast(lat: float, lon: float):
    # Mocking a real Aurora calculation based on Latitude
    # (Higher latitudes get better aurora scores)
    aurora_score = min(10, max(0, abs(lat) / 9)) 
    return {
        "aurora_score": round(aurora_score, 1),
        "status": "Optimal" if aurora_score > 6 else "Low Activity",
        "weather": "Clear Skies",
        "lat": lat,
        "lon": lon
    }

@app.get("/api/sightseeing/spots")
async def get_spots(lat: float, lon: float):
    # Sort spots by how close they are to your map's center
    sorted_spots = sorted(
        SIGHTSEEING_SPOTS, 
        key=lambda s: get_distance(lat, lon, s["lat"], s["lng"])
    )
    return sorted_spots[:3] # Return top 3 nearest spots

@app.get("/")
def read_root():
    return {"status": "Aurora Backend is LIVE"}