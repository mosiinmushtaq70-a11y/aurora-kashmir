import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    if (!messages || !context) {
      return NextResponse.json({ error: 'Missing messages or context payload' }, { status: 400 });
    }

    const temperature = context.temperature ?? 'Unknown';

    // ─── Master System Prompt ─────────────────────────────────────────────────
    const systemPrompt = `You are the Tactical Logistics & Photography Co-Pilot for the AuroraLens Command Center. 

CURRENT TARGET SECTOR: ${context.location}.
CURRENT AURORA SCORE: ${context.auroraScore}/100.
LOCAL TEMPERATURE: ${temperature}.

FORMATTING RULES (STRICTLY ENFORCED):
- NEVER output long blocks of text or paragraphs.
- Use short, punchy bullet points for all advice.
- Keep responses extremely concise, scannable, and modular.
- Use bold text to highlight critical variables (e.g., **ISO 1600**, **Sub-zero sleeping bag**).

CONVERSATION DIRECTIVES (Execute naturally in conversation):
1. HARDWARE CALIBRATION: Ask for their specific camera/smartphone hardware to provide exact settings.
2. DEPLOYMENT TYPE: Ask if they are doing a 'quick photography strike' (driving in/out) or 'overnight camping' at the target sector.
3. ENVIRONMENTAL SURVIVAL: Tailor advice based on their deployment type. 
   - If camping: Emphasize sub-zero sleeping bags, insulated ground pads, and thermal layers. 
   - If quick strike: Emphasize vehicle safety, keeping the engine warm, and fast hand-warmers.
4. INSTRUMENT PROTECTION: Warn about cold-weather battery drain. Detail the ziplock-bag method for preventing lens condensation when returning indoors.

TONE & BOUNDARIES: 
- Professional, highly technical, and precise (mission control operator tone). 
- Do NOT pretend to physically control hardware or 'initiate sequences'. 
- Act purely as an advisory intelligence.`;

    const apiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: apiMessages,
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
    });

    const replyContent = completion.choices[0]?.message?.content
      || '[ ERROR ]: Communications array failed to generate output.';

    return NextResponse.json({ role: 'assistant', content: replyContent });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

