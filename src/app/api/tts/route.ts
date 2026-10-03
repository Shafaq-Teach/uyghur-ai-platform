import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigServer } from '@/lib/serverConfig';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverConfig = await getSystemConfigServer();
    const defaultModel = serverConfig.activeModels?.tts || 'openai/tts-1';
    const { 
      text, 
      voice = 'female1', 
      speed = 1.0, 
      pitch = 1.0,
      model = defaultModel,
      provider = 'openrouter',
      openRouterApiKey,
      geminiApiKey
    } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'تېكىست كىرگۈزۈلمىدى' }, { status: 400 });
    }

    const effectiveOpenRouterKey = openRouterApiKey || serverConfig.openRouterKey || process.env.OPENROUTER_API_KEY;

    // Check if OpenRouter audio endpoint is called
    if (provider === 'openrouter' && effectiveOpenRouterKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveOpenRouterKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model.includes('tts') ? model : 'openai/tts-1',
            input: text,
            voice: voice.includes('female') ? 'nova' : 'onyx',
            speed: Number(speed),
          }),
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Audio = buffer.toString('base64');
          return NextResponse.json({
            audioUrl: `data:audio/mp3;base64,${base64Audio}`,
            text,
            voice,
            model,
          });
        }
      } catch (e) {
        console.warn('OpenRouter TTS direct fetch failed', e);
      }
    }

    // High quality demo audio synthesis fallback
    return NextResponse.json({
      useClientSpeech: true,
      text,
      voice,
      speed,
      pitch,
      model,
      message: 'توركۆرگۈ ياكى سۈنئىي ئاۋاز بىر تەرەپ قىلىش مودۇلى قوزغىتىلدى.',
    });
  } catch (error: any) {
    console.error('TTS API Error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 });
  }
}
