import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigServer } from '@/lib/serverConfig';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverConfig = await getSystemConfigServer();
    const defaultModel = serverConfig.activeModels?.translate || 'google/gemini-2.5-flash';
    const { 
      text, 
      sourceLang = 'auto', 
      targetLang = 'ug', 
      role = 'standard', 
      customInstruction = '',
      model = defaultModel,
      provider = 'openrouter',
      openRouterApiKey,
      geminiApiKey
    } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'تېكىست كىرگۈزۈلمىدى' }, { status: 400 });
    }

    const cleanOpenRouterKey = (openRouterApiKey || serverConfig.openRouterKey || process.env.OPENROUTER_API_KEY || '').trim();
    const cleanGeminiKey = (geminiApiKey || serverConfig.geminiKey || process.env.GEMINI_API_KEY || '').trim();

    // Role style prompt instructions
    const styleDescriptions: Record<string, string> = {
      standard: 'Natural, smooth, standard everyday phrasing.',
      formal: 'Polite, respectful, business and diplomatic formal phrasing (ھۆرمەتلىك، رەسمىي ئىش ئورنى تىلى).',
      literary: 'Eloquent, artistic, deeply poetic literary aesthetic with rich cultural nuance (بەدىئىي، چىرايلىق ۋە تەسىرلىك ئىپادىلەش).',
      academic: 'Rigorous scientific, academic, terminology-focused translation (ئىلمىي ۋە ئاتالغۇ جەھەتتىن ئېنىق).',
      marketing: 'Persuasive, engaging, energetic commercial marketing copywriting (قىزىقتۇرارلىق ۋە جەلپكار سودا تىلى).',
      simple: 'Easy, accessible, simplified vocabulary suitable for students and learners (ئاددىي، ساددا ۋە چۈشىنىشلىك).',
      conversational: 'Casual, colloquial, spoken everyday conversation (ئاغزاكى، كۈندىلىك پاراڭ تىلى).',
    };

    const targetNames: Record<string, string> = {
      ug: 'Uyghur (ئۇيغۇرچە - Arabic script, strictly adhering to standard Uyghur orthography)',
      en: 'English',
      tr: 'Turkish (Türkçe)',
      ar: 'Arabic (العربية)',
    };

    const targetDesc = targetNames[targetLang] || targetLang;
    const styleDesc = styleDescriptions[role] || styleDescriptions.standard;

    const systemPrompt = `You are a premier master multilingual translator specializing in Uyghur, English, Turkish, and Arabic.
Task: Translate the provided input text precisely into ${targetDesc}.
Source language: ${sourceLang === 'auto' ? 'Auto-detect source language' : sourceLang}.
Style / Tone: ${styleDesc}
${customInstruction ? `Additional Custom Instruction: ${customInstruction}` : ''}

CRITICAL RULES:
1. Provide ONLY the direct translation output. Do NOT include greetings, preamble, explanations, notes, or quotes.
2. If translating to Uyghur, write exclusively in standard Uyghur Arabic script (ئۇيغۇر تىلى يېزىقى) with correct ligatures and punctuation.
3. Preserve the original formatting, line breaks, and any embedded code or numbers.`;

    // OpenRouter branch
    if (provider === 'openrouter') {
      if (!cleanOpenRouterKey || cleanOpenRouterKey.length < 8) {
        return NextResponse.json(
          { error: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.' },
          { status: 503 }
        );
      }

      let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanOpenRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://uyghur-ai.local',
          'X-Title': 'Uyghur AI Translator',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          temperature: 0.3,
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
            'X-Title': 'Uyghur AI Translator',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text },
            ],
            temperature: 0.3,
          }),
        });
      }

      if (!response.ok) {
        // Fallback 1: Try with google/gemini-2.5-flash on OpenRouter if current model failed
        if (model !== 'google/gemini-2.5-flash') {
          const retryRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${cleanOpenRouterKey || serverConfig.openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://uyghur-ai.local',
              'X-Title': 'Uyghur AI Translator',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
              ],
              temperature: 0.3,
            }),
          });
          if (retryRes.ok) {
            response = retryRes;
          }
        }

        // Fallback 2: If OpenRouter still fails and Gemini key exists, seamlessly try direct Gemini
        if (!response.ok && cleanGeminiKey && cleanGeminiKey.length > 8) {
          const gemPayload = {
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nInput text to translate:\n${text}` }],
              },
            ],
            generationConfig: { temperature: 0.3 },
          };
          const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${cleanGeminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gemPayload),
          });
          if (gemRes.ok) {
            const gemData = await gemRes.json();
            const translation = gemData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            return NextResponse.json({ translation });
          }
        }
      }

      if (!response.ok) {
        return NextResponse.json(
          { error: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content?.trim() || '';
      return NextResponse.json({ translation });
    }

    // Direct Gemini branch
    if (provider === 'gemini') {
      const effectiveGeminiKey = cleanGeminiKey;
      if (!effectiveGeminiKey || effectiveGeminiKey.length < 8) {
        return NextResponse.json(
          { error: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.' },
          { status: 503 }
        );
      }

      // Migrate deprecated models
      let geminiModel = model.replace(/^google\//, '').replace(/^models\//, '').trim();
      if (geminiModel === 'gemini-2.5-flash' || geminiModel === 'gemini-2.5-flash-latest' || !geminiModel) {
        geminiModel = 'gemini-flash-latest';
      } else if (geminiModel === 'gemini-2.5-pro') {
        geminiModel = 'gemini-pro-latest';
      }

      let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${effectiveGeminiKey}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nInput text to translate:\n${text}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
        },
      };

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
          const retryUrl = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${effectiveGeminiKey}`;
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

      // If Gemini still fails, seamlessly fallback to OpenRouter if key is available
      if (!response.ok && cleanOpenRouterKey && cleanOpenRouterKey.length > 8) {
        const orFallback = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cleanOpenRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://uyghur-ai.local',
            'X-Title': 'Uyghur AI Translator',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text },
            ],
            temperature: 0.3,
          }),
        });
        if (orFallback.ok) {
          const orData = await orFallback.json();
          const translation = orData.choices?.[0]?.message?.content?.trim() || '';
          return NextResponse.json({ translation });
        }
      }

      if (!response.ok) {
        return NextResponse.json(
          { error: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const translation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      return NextResponse.json({ translation });
    }

    return NextResponse.json({ error: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.' }, { status: 400 });
  } catch (error: any) {
    console.error('Translate API Error:', error);
    return NextResponse.json({ error: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.' }, { status: 500 });
  }
}
