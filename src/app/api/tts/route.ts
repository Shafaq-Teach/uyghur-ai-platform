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
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
  }
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
      model: reqModel,
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

    // STRICT ADMIN MODEL ENFORCEMENT:
    // Whichever model the administrator selected in serverConfig is 100% strictly used as-is.
    const targetModel = userProvidedKey && reqModel ? reqModel : (serverConfig.activeModels?.tts || 'openai/gpt-audio-mini');

    const effectiveOpenRouterKey = openRouterApiKey || serverConfig.openRouterKey || process.env.OPENROUTER_API_KEY;
    const effectiveGeminiKey = geminiApiKey || serverConfig.geminiKey || process.env.GEMINI_API_KEY;

    // 1. Native Google Gemini TTS (if Gemini API key is configured with AIza... and model is gemini direct)
    if (effectiveGeminiKey && effectiveGeminiKey.startsWith('AIza') && targetModel.includes('gemini') && !targetModel.includes('/')) {
      const cleanModel = targetModel.replace(/^models\//, '').trim();
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

    // Map UI voice IDs based on model architecture:
    // Gemini TTS models require Gemini native voices (Aoede, Kore, Puck, Charon)
    // OpenAI models require OpenAI voices (nova, shimmer, echo, onyx)
    const isGeminiModel = targetModel.toLowerCase().includes('gemini');
    let targetVoice = '';

    if (isGeminiModel) {
      const geminiVoiceMap: Record<string, string> = {
        female1: 'Aoede',
        female2: 'Kore',
        male1: 'Puck',
        male2: 'Charon',
        Aoede: 'Aoede',
        Kore: 'Kore',
        Puck: 'Puck',
        Charon: 'Charon',
        Fenrir: 'Fenrir',
        nova: 'Aoede',
        shimmer: 'Kore',
        echo: 'Puck',
        onyx: 'Charon',
        alloy: 'Aoede',
        fable: 'Puck',
      };
      targetVoice = geminiVoiceMap[voice] || (voice.toLowerCase().includes('male') && !voice.toLowerCase().includes('fe') ? 'Puck' : 'Aoede');
    } else {
      const openAiVoiceMap: Record<string, string> = {
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
        Aoede: 'nova',
        Kore: 'shimmer',
        Puck: 'echo',
        Charon: 'onyx',
        Fenrir: 'echo',
      };
      targetVoice = openAiVoiceMap[voice] || (voice.toLowerCase().includes('male') && !voice.toLowerCase().includes('fe') ? 'echo' : 'nova');
    }

    // 2. OpenRouter Specialized Speech API (/api/v1/audio/speech)
    // Used for specialized TTS models such as google/gemini-3.8-flash-tts, openai/tts-1, etc.
    if (targetModel.includes('tts') || targetModel.includes('speech')) {
      try {
        let speechRes = await fetch('https://openrouter.ai/api/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveOpenRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://uyghur-ai.local',
            'X-Title': 'Uyghur AI Voice Studio',
          },
          body: JSON.stringify({
            model: targetModel,
            input: text.trim(),
            voice: targetVoice,
          }),
        });

        // If provider returned 400 (e.g. voice mismatch), retry once with the canonical primary voice
        if (!speechRes.ok && speechRes.status === 400) {
          const fallbackVoice = isGeminiModel ? 'Aoede' : 'nova';
          if (targetVoice !== fallbackVoice) {
            speechRes = await fetch('https://openrouter.ai/api/v1/audio/speech', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${effectiveOpenRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://uyghur-ai.local',
                'X-Title': 'Uyghur AI Voice Studio',
              },
              body: JSON.stringify({
                model: targetModel,
                input: text.trim(),
                voice: fallbackVoice,
              }),
            });
          }
        }

        if (speechRes.ok) {
          const contentType = speechRes.headers.get('content-type') || '';
          const arrayBuf = await speechRes.arrayBuffer();
          const u8 = new Uint8Array(arrayBuf);

          let finalBase64 = '';
          let format = 'wav';

          if (contentType.includes('pcm')) {
            const wavBytes = pcmToWav(u8, 24000, 1, 16);
            finalBase64 = uint8ArrayToBase64(wavBytes);
          } else {
            finalBase64 = uint8ArrayToBase64(u8);
            format = (contentType.includes('mp3') || contentType.includes('mpeg')) ? 'mp3' : 'wav';
          }

          const audioUrl = `data:audio/${format};base64,${finalBase64}`;
          return NextResponse.json({
            audioUrl,
            text,
            voice: targetVoice,
            model: targetModel,
            speed,
            pitch,
            remainingCoins: authResult.remainingCoins,
          });
        } else {
          const errText = await speechRes.text();
          console.error('OpenRouter /audio/speech failed:', speechRes.status, errText);
          return NextResponse.json(
            { error: `ئاۋاز ھاسىل قىلىشتا كاشىلا كۆرۈلدى: مودېل تەلەپنى رەت قىلدى (${speechRes.status})` },
            { status: speechRes.status }
          );
        }
      } catch (speechErr: any) {
        console.error('OpenRouter /audio/speech network exception:', speechErr);
        return NextResponse.json(
          { error: `ئاۋاز مۇلازىمىتىگە ئۇلىنىش مەغلۇپ بولدى: ${speechErr?.message || 'ئېنىقسىز خاتالىق'}` },
          { status: 500 }
        );
      }
    }

    // 3. OpenRouter Chat-Audio Streaming API (/api/v1/chat/completions with audio modality)
    // Used for multimodal chat/audio models like openai/gpt-audio-mini, openai/gpt-audio, etc.
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveOpenRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://uyghur-ai.local',
        'X-Title': 'Uyghur AI Voice Studio',
      },
      body: JSON.stringify({
        model: targetModel,
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
      model: targetModel,
      speed,
      pitch,
      remainingCoins: authResult.remainingCoins,
    });
  } catch (error: any) {
    console.error('TTS API Route Error:', error);
    return NextResponse.json({ error: error.message || 'TTS generation failed' }, { status: 500 });
  }
}
