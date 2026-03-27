import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  if (!latStr || !lonStr) {
    return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
  }

  const baseLat = parseFloat(latStr);
  const baseLon = parseFloat(lonStr);
  const offset = 0.2;

  // Generate 3x3 grid fallback
  const grid = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      grid.push({
        lat: baseLat + i * offset,
        lon: baseLon + j * offset,
        name: null
      });
    }
  }

  // 1. Fetch real viewpoints/peaks from Overpass API (50km radius)
  let poiPoints: any[] = [];
  try {
    const query = `
      [out:json][timeout:10];
      (
        node["natural"="peak"](around:100000, ${baseLat}, ${baseLon});
        node["tourism"="viewpoint"](around:100000, ${baseLat}, ${baseLon});
      );
      out body 10;
    `;
    const overpassRes = await fetch(`https://overpass-api.de/api/interpreter`, {
      method: "POST",
      body: query
    });
    if (overpassRes.ok) {
      const overpassData = await overpassRes.json();
      poiPoints = overpassData.elements.map((el: any) => ({
        lat: el.lat,
        lon: el.lon,
        name: el.tags?.name || (el.tags?.natural === 'peak' ? 'Unnamed Peak' : 'Observation Point')
      }));
    }
  } catch (err) {
    console.error("Overpass API failed, falling back to grid", err);
  }

  // Combine real spots with grid fallback, limit to 6 to avoid rate limits on weather API
  const searchPoints = poiPoints.length >= 3 ? poiPoints.slice(0, 6) : [...poiPoints, ...grid].slice(0, 6);

  const Kp = 5.0; // Baseline for internal sorting

  // 2. Fetch Elevation and Weather for each real point
  const pointsData = await Promise.all(
    searchPoints.map(async (point, idx) => {
      try {
        const [elvRes, wxRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/elevation?latitude=${point.lat}&longitude=${point.lon}`),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lon}&current=cloud_cover`)
        ]);

        const elvData = await elvRes.json();
        const wxData = await wxRes.json();

        const altitude = elvData?.elevation?.[0] || 0;
        const cloudCover = wxData?.current?.cloud_cover || 0;

        const score = (Kp * 10) + (altitude / 100) - (cloudCover * 1.5);

        // Distance in km using Haversine approximation
        const R = 6371; // Earth's radius in km
        const dLat = (point.lat - baseLat) * Math.PI / 180;
        const dLon = (point.lon - baseLon) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(baseLat * Math.PI / 180) * Math.cos(point.lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c;

        return {
          id: `poi-${idx}`,
          lat: point.lat,
          lng: point.lon, 
          altitude,
          cloudCover,
          score,
          distance: `${distance.toFixed(1)} km`,
          lightPollution: distance > 20 ? "Low" : "Moderate",
          rating: score > 50 ? "Excellent" : "Good",
          stars: score > 50 ? 5 : (score > 30 ? 4 : 3),
          name: point.name // Retain real name
        };
      } catch (err) {
        console.error("Error fetching point data", err);
        return null;
      }
    })
  );

  const validPoints = pointsData.filter((p) => p !== null);

  // Sort by score descending and take top 3
  const topPoints = validPoints
    .sort((a, b) => b!.score - a!.score)
    .slice(0, 3)
    .map((p) => {
      let finalName = p!.name;
      // Fallback naming if no real name was found
      if (!finalName) {
        finalName = p!.altitude > 1000 ? `High Altitude Terrain @ ${p!.altitude}m` : `Clear Sky Valley`;
      }
      return {
        ...p,
        name: finalName
      };
    });

  return NextResponse.json(topPoints);
}
