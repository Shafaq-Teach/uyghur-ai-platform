import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigServer } from '@/lib/serverConfig';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverConfig = await getSystemConfigServer();
    const defaultModel = serverConfig.activeModels?.chat || 'google/gemini-2.5-flash';
    const { 
      messages, 
      model = defaultModel, 
      provider = 'openrouter', 
      systemPrompt, 
      openRouterApiKey, 
      geminiApiKey 
    } = body;

    const cleanOpenRouterKey = (openRouterApiKey || serverConfig.openRouterKey || process.env.OPENROUTER_API_KEY || '').trim();
    const cleanGeminiKey = (geminiApiKey || serverConfig.geminiKey || process.env.GEMINI_API_KEY || '').trim();

    // Check if OpenRouter is requested
    if (provider === 'openrouter') {
      if (!cleanOpenRouterKey || cleanOpenRouterKey.length < 8) {
        return NextResponse.json(
          { 
            error: 'TEMPORARY_ERROR',
            message: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.',
          },
          { status: 503 }
        );
      }

      const formattedMessages = [];
      if (systemPrompt) {
        formattedMessages.push({ role: 'system', content: systemPrompt });
      }
      formattedMessages.push(...messages);

      let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanOpenRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://uyghur-ai.local',
          'X-Title': 'Uyghur AI Platform',
        },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages,
        }),
      });

      // If user-provided key failed with 401, try falling back to the server's Supabase master key
      if (!response.ok && response.status === 401 && serverConfig.openRouterKey && cleanOpenRouterKey !== serverConfig.openRouterKey) {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serverConfig.openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://uyghur-ai.local',
            'X-Title': 'Uyghur AI Platform',
          },
          body: JSON.stringify({
            model: model,
            messages: formattedMessages,
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          return NextResponse.json(
            { 
              error: 'TEMPORARY_ERROR',
              message: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.',
            },
            { status: 503 }
          );
        }
        if (response.status === 400 && errorText.includes('decisions model')) {
          return NextResponse.json(
            { 
              error: 'MODEL_NOT_SUPPORTED',
              message: `«${model}» مودېلى پاراڭ (Chat) ئۈچۈن ئىشلىتىلمەيدۇ، ئۇ باھالاش/قارار سىناق مودېلى. مەرھەمەت قىلىپ باشقا پاراڭ مودېلىنى تاللاڭ (مەسىلەن: google/gemini-2.5-flash ياكى باشقا ئەركىن پاراڭ مودېللىرى).`,
            },
            { status: 400 }
          );
        }

        if (response.status === 429 || errorText.includes('rate-limited')) {
          return NextResponse.json(
            { 
              error: 'RATE_LIMITED',
              message: `بۇ ھەقسىز (:free) مودېلغا دۇنيا مىقياسىدا ئادەم كۆپ ئىشلىتىۋاتقانلىقى ئۈچۈن، ھەقسىز ئومۇمىي مۇلازىمېتىر ۋاقىتلىق ئالدىراش بولۇپ قالدى (429 Rate Limit).\n\nچارە: 10 سېكۇنت ساقلاپ قايتا سىناڭ ياكى باشقا مودېلنى تاللاڭ (مەسىلەن: qwen/qwen3.8-27b:free ياكى google/gemini-2.5-flash).`,
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { error: `OpenRouter API خاتالىقى: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'جاۋاب قۇرۇق كەلدى.';
      return NextResponse.json({ reply });
    }

    // Direct Gemini provider
    if (provider === 'gemini') {
      if (!cleanGeminiKey || cleanGeminiKey.length < 8) {
        return NextResponse.json(
          { 
            error: 'TEMPORARY_ERROR',
            message: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.',
          },
          { status: 503 }
        );
      }

      // Clean model and migrate deprecated models
      let geminiModel = model.replace(/^google\//, '').replace(/^models\//, '').trim();
      if (geminiModel === 'gemini-2.5-flash' || geminiModel === 'gemini-2.5-flash-latest' || !geminiModel) {
        geminiModel = 'gemini-flash-latest';
      } else if (geminiModel === 'gemini-2.5-pro') {
        geminiModel = 'gemini-pro-latest';
      }

      let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${cleanGeminiKey}`;

      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const payload: any = { contents };

      if (systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: systemPrompt }],
        };
      }

      let response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Auto-fallback if Google reports model deprecated or unavailable (404, 503, 500)
      if (!response.ok && (response.status === 404 || response.status === 503 || response.status === 500)) {
        const fallbackCandidates = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash'];
        for (const candidate of fallbackCandidates) {
          if (candidate === geminiModel) continue;
          const retryUrl = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${cleanGeminiKey}`;
          const retryRes = await fetch(retryUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (retryRes.ok) {
            response = retryRes;
            break;
          }
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 400 || response.status === 403) {
          return NextResponse.json(
            { 
              error: 'TEMPORARY_ERROR',
              message: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.',
            },
            { status: 503 }
          );
        }

        if (response.status === 404) {
          return NextResponse.json(
            {
              error: 'MODEL_NOT_FOUND',
              message: `Google Gemini دا «${geminiModel}» مودېلى يېڭى ھېساباتلار ئۈچۈن توختىتىلغان. تەڭشەكتىن «gemini-3.8-flash» ياكى «gemini-2.0-flash» نى تاللاڭ.`,
            },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { error: `Gemini API خاتالىقى: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'جاۋاب ھاسىل بولمىدى.';
      return NextResponse.json({ reply });
    }

    return NextResponse.json({ error: 'TEMPORARY_ERROR', message: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.' }, { status: 400 });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'TEMPORARY_ERROR', message: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.' }, { status: 500 });
  }
}
