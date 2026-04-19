import { NextResponse } from 'next/server';

// Lightweight in-memory cache for sightseeing results (TTL: 1 hour)
const SIGHTSEEING_CACHE = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  if (!latStr || !lonStr) {
    return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 });
  }

  const baseLat = parseFloat(latStr);
  const baseLon = parseFloat(lonStr);
  
  // Create a cache key based on 0.05 precision (~5.5km grid)
  const cacheKey = `${baseLat.toFixed(2)}_${baseLon.toFixed(2)}`;
  const cached = SIGHTSEEING_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

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

  // 1. Fetch real viewpoints/peaks/parks/attractions from Overpass API (50km radius)
  let poiPoints: any[] = [];
  try {
    const query = `
      [out:json][timeout:15];
      (
        node["natural"="peak"](around:50000, ${baseLat}, ${baseLon});
        node["tourism"="viewpoint"](around:50000, ${baseLat}, ${baseLon});
        node["tourism"="attraction"](around:50000, ${baseLat}, ${baseLon});
        node["leisure"="park"](around:50000, ${baseLat}, ${baseLon});
        node["historic"](around:50000, ${baseLat}, ${baseLon});
      );
      out body 15;
    `;
    const overpassRes = await fetch(`https://overpass-api.de/api/interpreter`, {
      method: "POST",
      body: query,
      next: { revalidate: 3600 }
    });
    
    if (overpassRes.ok) {
      const overpassData = await overpassRes.json();
      poiPoints = overpassData.elements.map((el: any) => ({
        lat: el.lat,
        lon: el.lon,
        name: el.tags?.name || el.tags?.description || null,
        type: el.tags?.natural || el.tags?.tourism || el.tags?.leisure || el.tags?.historic || 'landmark'
      }));
    }
  } catch (err) {
    console.error("Overpass API failed", err);
  }

  // Filter out points without names for now, or prepare them for reverse geocoding
  let namedPoints = poiPoints.filter(p => p.name);
  let unnamedPoints = poiPoints.filter(p => !p.name).slice(0, 3); // Limit unnamed to avoid heavy API usage

  // 2. Reverse Geocode unnamed points to get real local names
  const processedPoints = await Promise.all(
    [...namedPoints, ...unnamedPoints, ...(namedPoints.length < 3 ? grid.slice(0, 3 - namedPoints.length) : [])].slice(0, 6).map(async (p) => {
      if (p.name) return p;
      try {
        // Use Nominatim for a quick reverse look-up of the area name
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.lat}&lon=${p.lon || p.lng}&zoom=14`, {
          headers: { 'User-Agent': 'AuroraLens/1.0' }
        });
        const geoData = await geoRes.json();
        const areaName = geoData.address?.suburb || geoData.address?.neighbourhood || geoData.address?.village || geoData.address?.town || geoData.address?.county || "Scenic Outpost";
        return { ...p, name: areaName };
      } catch (e) {
        return { ...p, name: "Remote Observation Point" };
      }
    })
  );

  // 3. Optimized Batch Fetch for Elevation and Weather
  const latQuery = processedPoints.map(p => p.lat).join(',');
  const lonQuery = processedPoints.map(p => (p.lon || p.lng)).join(',');
  
  const Kp = 5.0; 

  try {
    const [elvRes, wxRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/elevation?latitude=${latQuery}&longitude=${lonQuery}`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latQuery}&longitude=${lonQuery}&current=cloud_cover`)
    ]);

    const elvData = await elvRes.json();
    const wxData = await wxRes.json();

    const pointsData = processedPoints.map((point, idx) => {
      const altitude = elvData?.elevation?.[idx] || 0;
      const cloudCover = Array.isArray(wxData) ? (wxData[idx]?.current?.cloud_cover || 0) : (wxData?.current?.cloud_cover || 0);

      const score = (Kp * 10) + (altitude / 100) - (cloudCover * 1.5);

      const R = 6371; 
      const dLat = (point.lat - baseLat) * Math.PI / 180;
      const dLon = ((point.lon || point.lng) - baseLon) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(baseLat * Math.PI / 180) * Math.cos(point.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c;

      return {
        id: `poi-${idx}`,
        lat: point.lat,
        lng: point.lon || point.lng, 
        altitude,
        cloudCover,
        score,
        distance: `${distance.toFixed(1)} km`,
        lightPollution: distance > 15 ? "Low" : "Moderate",
        rating: score > 50 ? "Excellent" : "Good",
        stars: score > 50 ? 5 : (score > 35 ? 4 : 3),
        name: point.name
      };
    });

    // Sort by score descending and take top 3
    const topPoints = pointsData
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Save to cache
    SIGHTSEEING_CACHE.set(cacheKey, { data: topPoints, timestamp: Date.now() });

    return NextResponse.json(topPoints);
  } catch (err) {
    console.error("Batch fetch failed", err);
    // Return empty array instead of error object to avoid breaking frontend maps
    return NextResponse.json([]);
  }
}
