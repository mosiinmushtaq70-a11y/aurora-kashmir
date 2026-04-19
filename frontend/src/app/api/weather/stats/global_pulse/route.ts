import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api-config';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/weather/stats/global_pulse`, {
      cache: 'no-store',
    });
    
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/weather/stats/global_pulse] Error:', err);
    return NextResponse.json({ active_hotspots: 0 }, { status: 503 });
  }
}
