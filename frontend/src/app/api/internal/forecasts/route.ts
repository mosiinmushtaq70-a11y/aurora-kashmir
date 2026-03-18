import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { forecasts } = await req.json();
    
    if (!forecasts || !Array.isArray(forecasts)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Clean up old forecasts for this geographic block before inserting new loop
    const lats = [...new Set(forecasts.map(f => f.lat))];
    const lngs = [...new Set(forecasts.map(f => f.lng))];
    
    await prisma.forecast.deleteMany({
      where: {
        lat: { in: lats },
        lng: { in: lngs }
      }
    });

    const createPromises = forecasts.map(async (f: any) => {
      return prisma.forecast.create({
        data: {
          lat: f.lat,
          lng: f.lng,
          targetTime: new Date(f.targetTime),
          predictedScore: f.predictedScore,
        }
      });
    });

    await Promise.all(createPromises);

    return NextResponse.json({ success: true, count: forecasts.length });
  } catch (error) {
    console.error('Failed to sync T+24 forecasts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
