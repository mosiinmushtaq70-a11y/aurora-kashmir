import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api-config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '64.84';
  const lon = searchParams.get('lon') || '-147.72';
  const hour_offset = searchParams.get('hour_offset') || '0';

  // Run backend forecast and Open-Meteo weather fetch in parallel
  const [backendRes, weatherRes] = await Promise.allSettled([
    fetch(
      `${BACKEND_URL}/api/weather/forecast/global?lat=${lat}&lon=${lon}&hour_offset=${hour_offset}`,
      { cache: 'no-store' }
    ),
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,cloud_cover&timezone=auto`,
      { cache: 'no-store' }
    ),
  ]);

  // If backend itself is down, return 503
  if (backendRes.status === 'rejected' || !backendRes.value.ok) {
    const detail = backendRes.status === 'rejected' ? String(backendRes.reason) : `HTTP ${backendRes.value.status}`;
    console.error('[api/weather/forecast/global] Backend error:', detail);
    return NextResponse.json({ error: 'Backend offline.', detail }, { status: 503 });
  }

  const data = await backendRes.value.json();

  // Inject real weather from Open-Meteo if available
  if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
    const weather = await weatherRes.value.json();
    const current = weather?.current ?? {};
    data.temperature = current.temperature_2m ?? data.temperature ?? null;
    data.cloud_cover = current.cloud_cover ?? data.cloud_cover ?? null;
    data.precipitation = current.precipitation ?? 0;
  }

  return NextResponse.json(data);
}
