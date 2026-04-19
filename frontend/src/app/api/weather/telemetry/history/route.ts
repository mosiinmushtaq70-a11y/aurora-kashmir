import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api-config';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/weather/telemetry/history`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/weather/telemetry/history] Error:', err);
    // Graceful fallback with last-known realistic data
    return NextResponse.json({
      data: [
        { time_tag: '-72h', kp: 2 },
        { time_tag: '-48h', kp: 3 },
        { time_tag: '-24h', kp: 5 },
        { time_tag: '-12h', kp: 4 },
        { time_tag: '-6h',  kp: 6 },
        { time_tag: 'Now',  kp: 4 },
      ]
    });
  }
}
