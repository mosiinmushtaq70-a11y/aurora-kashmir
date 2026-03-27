import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location } = body.context || {};

    // Simulate AI "Processing" delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockResponses = [
      `Aetheris Intelligence Uplink: Processing telemetry for ${location}. High-altitude nitrogen levels are stabilizing. Recommended shutter: 4-6s.`,
      `Site Analysis Protocol: ${location} exhibits Class 2 magnetic flux. Atmospheric clarity is peak. Proceed with wide-angle capture.`,
      `Observation Note: Solar wind density at ${location} is increasing. Expect rapid movement in the green-arc bands within 15 minutes.`
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    return NextResponse.json({
      role: 'assistant',
      content: randomResponse,
      status: 'MOCK_UPLINK_SUCCESS'
    });
  } catch (err) {
    return NextResponse.json({ error: 'MOCK_UPLINK_FAILURE' }, { status: 500 });
  }
}
