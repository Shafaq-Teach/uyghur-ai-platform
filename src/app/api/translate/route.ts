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
        // Fallback translation demo
        return NextResponse.json({
          translation: `[OpenRouter سىناق كۆرسىتىشى]: OpenRouter API ئاچقۇچى كىرگۈزۈلمىگەن. «تەڭشەكلەر» (Settings) بېتىدىن API ئاچقۇچىڭىزنى كىرگۈزسىڭىز، تاللانغان «${model}» مودېلى بىۋاسىتە تەرجىمە قىلىدۇ.\n\nتەرجىمە قىلىنماقچى بولغان تېكىست: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`,
          isDemo: true,
        });
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: `OpenRouter تەرجىمە خاتالىقى: ${response.status} - ${errorText}` },
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
      if (!effectiveGeminiKey) {
        return NextResponse.json({
          translation: `[Gemini سىناق كۆرسىتىشى]: Gemini API ئاچقۇچى تەڭشەلمىگەن. تاللانغان مودېل: ${model}`,
          isDemo: true,
        });
      }

      // Migrate deprecated models
      let geminiModel = model.replace(/^google\//, '').replace(/^models\//, '').trim();
      if (geminiModel === 'gemini-2.5-flash' || geminiModel === 'gemini-2.5-flash-latest' || !geminiModel) {
        geminiModel = 'gemini-3.8-flash';
      } else if (geminiModel === 'gemini-2.5-pro') {
        geminiModel = 'gemini-3.8-pro';
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

      // Auto-fallback if Google reports model deprecated or not found (404)
      if (response.status === 404) {
        const fallbackCandidates = ['gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: `Gemini تەرجىمە خاتالىقى: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      const translation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      return NextResponse.json({ translation });
    }

    return NextResponse.json({ error: 'نامەلۇم تەمىنلىگۈچى' }, { status: 400 });
  } catch (error: any) {
    console.error('Translate API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
