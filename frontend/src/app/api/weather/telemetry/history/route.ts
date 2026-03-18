import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: [
        { time: '12:00', kp: 2 }, 
        { time: '14:00', kp: 3 }, 
        { time: '16:00', kp: 5 },
        { time: '18:00', kp: 7 }, 
        { time: '20:00', kp: 6 }, 
        { time: 'Now', kp: 7 }
    ]
  });
}
