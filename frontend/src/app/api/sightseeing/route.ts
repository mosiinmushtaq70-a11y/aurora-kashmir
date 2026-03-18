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

  // Generate 3x3 grid
  const grid = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      grid.push({
        lat: baseLat + i * offset,
        lon: baseLon + j * offset,
      });
    }
  }

  // Fetch Kp estimation from our global route (we can just fetch it or default to 5 for now,
  // let's fetch from the global route or just use a default since it might be slow to loop.
  // Actually, wait, let's just use a fixed Kp of 5 for the score math here since we don't have
  // a dedicated Kp endpoint, or we can fetch it. Let's assume Kp=5 for the formula as we don't 
  // want to block on the global route fetching NOAA.
  const Kp = 5.0;

  // Fetch Elevation and Weather for each point
  const pointsData = await Promise.all(
    grid.map(async (point, idx) => {
      try {
        const [elvRes, wxRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/elevation?latitude=${point.lat}&longitude=${point.lon}`),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lon}&current=cloud_cover`)
        ]);

        const elvData = await elvRes.json();
        const wxData = await wxRes.json();

        const altitude = elvData?.elevation?.[0] || 0;
        const cloudCover = wxData?.current?.cloud_cover || 0;

        const score = (Kp * 10) + (altitude / 100) - (cloudCover * 1.2);

        return {
          id: idx + 1,
          lat: point.lat,
          lng: point.lon, // use lng for frontend matching
          altitude,
          cloudCover,
          score,
          // Calculate distance mock roughly: offset * 111km
          distance: `${((Math.abs(point.lat - baseLat) + Math.abs(point.lon - baseLon)) * 111 / 2).toFixed(1)} km`,
          lightPollution: "Low", // Just mock for now or calculate from distance
          rating: score > 50 ? "Excellent" : "Good",
          stars: score > 50 ? 5 : 4
        };
      } catch (err) {
        console.error("Error fetching point", err);
        return {
          id: idx + 1,
          lat: point.lat,
          lng: point.lon,
          altitude: 0,
          cloudCover: 100,
          score: -100,
          distance: "Unknown",
          lightPollution: "High",
          rating: "Poor",
          stars: 1
        };
      }
    })
  );

  // Sort by score descending and take top 3
  const topPoints = pointsData
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((p, i) => {
      // Dynamic naming logic and reasons are handled on the frontend, we just pass the raw data
      // but we need a 'name' field fallback or we'll let frontend override it.
      let name = `Peak @ ${p.altitude}m`;
      if (p.altitude > 2000) name = `High Altitude Peak @ ${p.altitude}m`;
      else if (p.cloudCover < 10) name = "Clear Sky Valley";
      
      return {
        ...p,
        name
      };
    });

  return NextResponse.json(topPoints);
}
