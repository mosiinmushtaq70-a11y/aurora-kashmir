import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api-config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '64.84';
  const lon = searchParams.get('lon') || '-147.72';
  const hour_offset = searchParams.get('hour_offset') || '0';

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/weather/forecast/global?lat=${lat}&lon=${lon}&hour_offset=${hour_offset}`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`Backend returned ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/weather/forecast/global] Error:', err);
    return NextResponse.json(
      { error: 'Backend offline. Live data unavailable.', detail: String(err) },
      { status: 503 }
    );
  }
}
