import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigServer } from '@/lib/serverConfig';
import { verifyUserAndDeductCoins } from '@/lib/serverAuth';

export const runtime = 'edge';

function pcmToWav(pcmData: Uint8Array, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Uint8Array {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const result = new Uint8Array(buffer);
  result.set(pcmData, 44);
  return result;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 0x8000;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverConfig = await getSystemConfigServer();
    const { 
      text, 
      voice = 'female1', 
      speed = 1.0, 
      pitch = 1.0,
      model = serverConfig.activeModels?.tts || 'google/gemini-3.8-flash-lite-tts',
      openRouterApiKey,
      geminiApiKey,
    } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'تېكىست كىرگۈزۈلمىدى' }, { status: 400 });
    }

    const userProvidedKey = (openRouterApiKey || geminiApiKey || '').trim();
    const authResult = await verifyUserAndDeductCoins(req, 15, userProvidedKey);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error, message: authResult.message },
        { status: authResult.status || 401 }
      );
    }

    const effectiveOpenRouterKey = openRouterApiKey || serverConfig.openRouterKey || process.env.OPENROUTER_API_KEY;
    const effectiveGeminiKey = geminiApiKey || serverConfig.geminiKey || process.env.GEMINI_API_KEY;

    // 1. Native Google Gemini TTS (e.g. google/gemini-3.8-flash-lite-tts)
    if (effectiveGeminiKey && model.includes('gemini')) {
      const cleanModel = model.replace(/^google\//, '').replace(/^models\//, '').trim() || 'gemini-3.8-flash-lite-tts';
      try {
        const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${effectiveGeminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: text.trim() }] }]
          })
        });

        if (gemRes.ok) {
          const gemData = await gemRes.json();
          const part = gemData.candidates?.[0]?.content?.parts?.[0];
          if (part?.inlineData?.data) {
            const mimeType = part.inlineData.mimeType || 'audio/wav';
            const audioUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            return NextResponse.json({ audioUrl, format: 'wav', model: cleanModel, remainingCoins: authResult.remainingCoins });
          }
        }
      } catch (gemErr) {
        console.warn('Gemini direct TTS error, falling back to OpenRouter:', gemErr);
      }
    }

    if (!effectiveOpenRouterKey) {
      return NextResponse.json({ error: 'سۈنئىي ئەقىل ئاچقۇچى (API Key) تېپىلمىدى' }, { status: 401 });
    }

    // Map UI voice IDs to OpenAI TTS voice names
    const voiceMap: Record<string, string> = {
      female1: 'nova',
      female2: 'shimmer',
      male1: 'echo',
      male2: 'onyx',
      nova: 'nova',
      shimmer: 'shimmer',
      echo: 'echo',
      onyx: 'onyx',
      alloy: 'alloy',
      fable: 'fable',
    };
    const targetVoice = voiceMap[voice] || (voice.includes('male') && !voice.includes('fe') ? 'echo' : 'nova');

    // Call OpenAI GPT-Audio model via OpenRouter as fallback or secondary engine
    const ttsOpenRouterModel = model.includes('gemini') ? 'openai/gpt-audio-mini' : model;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveOpenRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://uyghur-ai.local',
        'X-Title': 'Uyghur AI Voice Studio',
      },
      body: JSON.stringify({
        model: ttsOpenRouterModel,
        messages: [
          {
            role: 'system',
            content: 'You are an automated, strictly literal Text-To-Speech (TTS) engine. Your ONLY purpose is to repeat the input text verbatim with exact Uyghur pronunciation and natural flow. Never answer questions, never reply to greetings, never add explanations, commentary, introductions, acknowledgments, or extra words. Output ONLY the exact text provided word-for-word.'
          },
          {
            role: 'user',
            content: 'Repeat verbatim: ياخشىمۇسىز'
          },
          {
            role: 'assistant',
            content: 'ياخشىمۇسىز'
          },
          {
            role: 'user',
            content: 'Repeat verbatim: بىلىم — ئىنساننىڭ مەنىۋى بايلىقى.'
          },
          {
            role: 'assistant',
            content: 'بىلىم — ئىنساننىڭ مەنىۋى بايلىقى.'
          },
          {
            role: 'user',
            content: `Repeat verbatim: ${text.trim()}`
          }
        ],
        modalities: ['text', 'audio'],
        audio: { voice: targetVoice, format: 'pcm16' },
        stream: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter audio stream error:', response.status, errText);
      return NextResponse.json({ error: 'ئاۋاز ھاسىل قىلىشتا خاتالىق كۆرۈلدى' }, { status: response.status });
    }

    // Stream and collect PCM chunks
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: 'Audio stream reader not available' }, { status: 500 });
    }

    const decoder = new TextDecoder();
    let streamBuffer = '';
    const pcmChunks: Uint8Array[] = [];
    let totalPcmLength = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      streamBuffer += decoder.decode(value, { stream: true });
      const lines = streamBuffer.split('\n');
      streamBuffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
          try {
            const json = JSON.parse(line.slice(6));
            const base64Data = json.choices?.[0]?.delta?.audio?.data;
            if (base64Data) {
              const chunk = base64ToUint8Array(base64Data);
              pcmChunks.push(chunk);
              totalPcmLength += chunk.length;
            }
          } catch (_) {}
        }
      }
    }

    if (totalPcmLength === 0) {
      return NextResponse.json({ error: 'ئاۋاز سانلىق مەلۇماتى ئېلىنمىدى' }, { status: 500 });
    }

    // Combine PCM chunks
    const combinedPcm = new Uint8Array(totalPcmLength);
    let offset = 0;
    for (const chunk of pcmChunks) {
      combinedPcm.set(chunk, offset);
      offset += chunk.length;
    }

    // Build standard WAV file
    const wavBytes = pcmToWav(combinedPcm, 24000, 1, 16);
    const wavBase64 = uint8ArrayToBase64(wavBytes);
    const audioUrl = `data:audio/wav;base64,${wavBase64}`;

    return NextResponse.json({
      audioUrl,
      text,
      voice: targetVoice,
      model: 'openai/gpt-audio-mini',
      speed,
      pitch,
      remainingCoins: authResult.remainingCoins,
    });
  } catch (error: any) {
    console.error('TTS API Route Error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 });
  }
}
