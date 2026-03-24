import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the NVIDIA NIM Client
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { score, location, cloudCover, temperature } = body;
    const systemPrompt = `You are a tactical weather/aurora satellite AI. The user is targeting ${location}. Score is ${score}/100. Clouds: ${cloudCover}%. Temp: ${temperature}°C. Write a strict, 2-sentence tactical briefing. If the score is near a threshold (e.g., 49), note that photographic evidence is likely even if naked-eye visibility is low. No greetings, just raw tactical data.`;

    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate tactical brief." }
      ],
      temperature: 0.3,
      top_p: 0.7,
      max_tokens: 150,
    });

    const responseContent = completion.choices[0]?.message?.content || "Telemetry currently unavailable. Recommend standard visual protocol.";

    return NextResponse.json({
      brief: responseContent.trim(),
    });

  } catch (error: any) {
    console.error('[Tactical Brief Error]', error);
    return NextResponse.json(
      { error: 'Failed to establish satellite uplink.' },
      { status: 500 }
    );
  }
}
