import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, lat, lon, minScore, isAlertEnabled } = await request.json();

    const targetLock = await prisma.targetLock.create({
      data: {
        email,
        lat,
        lon,
        minScore,
        isAlertEnabled,
      },
    });

    return NextResponse.json({ success: true, data: targetLock });
  } catch (error) {
    console.error('API Target Save Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save target' }, { status: 500 });
  }
}
