import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigServer } from '@/lib/serverConfig';

export const runtime = 'edge';

async function translatePromptToEnglish(prompt: string, geminiKey?: string, openRouterKey?: string): Promise<string> {
  const isUyghurOrNonLatin = /[\u0600-\u06FF]/.test(prompt);
  if (!isUyghurOrNonLatin) {
    return prompt.trim();
  }

  let englishText = '';

  // Tier 1: Try OpenRouter (blazing fast, highly accurate Uyghur translation)
  if (openRouterKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://uyghur-ai.local',
          'X-Title': 'Uyghur AI Image Studio',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Uyghur-to-English translator for AI image generation (Flux/Stable Diffusion). Translate the Uyghur prompt into a vivid, descriptive, high-quality English image prompt. Return ONLY the direct English translation without preamble, without markdown, without quotes.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });
      clearTimeout(timeoutId);

      if (orRes.ok) {
        const orData = await orRes.json();
        const content = orData.choices?.[0]?.message?.content?.trim();
        if (content && !/[\u0600-\u06FF]/.test(content)) {
          englishText = content.replace(/^["'`*>\s]+|["'`*>\s]+$/g, '');
          console.log('OpenRouter prompt translation success:', englishText);
        }
      }
    } catch (err) {
      console.warn('OpenRouter translation error:', err);
    }
  }

  // Tier 2: Try Google Gemini direct if available
  if ((!englishText || /[\u0600-\u06FF]/.test(englishText)) && geminiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const transRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Translate this Uyghur image prompt into English for image generation. Return ONLY the translation in one concise English sentence, without markdown, without quotes, without introductory text:\n${prompt}`,
                  },
                ],
              },
            ],
          }),
        }
      );
      clearTimeout(timeoutId);

      if (transRes.ok) {
        const transJson = await transRes.json();
        const raw = transJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        const lines = raw.split('\n').map((l: string) => l.trim()).filter((l: string) => l && !l.startsWith('#') && !l.startsWith('*') && !l.startsWith('>'));
        const candidate = lines.find((l: string) => !/[\u0600-\u06FF]/.test(l) && l.length > 5) || raw;
        const cleaned = candidate.replace(/^["'`*>\s]+|["'`*>\s]+$/g, '');
        if (cleaned && !/[\u0600-\u06FF]/.test(cleaned)) {
          englishText = cleaned;
          console.log('Gemini prompt translation success:', englishText);
        }
      }
    } catch (err) {
      console.warn('Gemini translation error/timeout:', err);
    }
  }

  // Tier 3: MyMemory API fallback
  if (!englishText || /[\u0600-\u06FF]/.test(englishText)) {
    try {
      const mmRes = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(prompt)}&langpair=ug|en`
      );
      if (mmRes.ok) {
        const mmData = await mmRes.json();
        const mmText = mmData.responseData?.translatedText?.trim();
        if (mmText && !/[\u0600-\u06FF]/.test(mmText)) {
          englishText = mmText;
          console.log('MyMemory prompt translation success:', englishText);
        }
      }
    } catch (err) {
      console.warn('MyMemory translation error:', err);
    }
  }

  return englishText || prompt.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const serverConfig = await getSystemConfigServer();
    console.log('serverConfig keys:', {
      hasOR: !!serverConfig.openRouterKey,
      orPrefix: serverConfig.openRouterKey?.slice(0, 10),
      hasGemini: !!serverConfig.geminiKey,
      geminiPrefix: serverConfig.geminiKey?.slice(0, 10)
    });
    const defaultModel = serverConfig.activeModels?.image || 'black-forest-labs/flux-1-schnell';
    const { 
      prompt, 
      aspectRatio = '1:1', 
      size = 'medium', 
      style = 'photorealistic',
      model = defaultModel,
      provider = 'openrouter',
      openRouterApiKey,
      geminiApiKey
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt كىرگۈزۈلمىدى' }, { status: 400 });
    }

    const effectiveOpenRouterKey = openRouterApiKey || serverConfig.openRouterKey || process.env.OPENROUTER_API_KEY;
    const effectiveGeminiKey = geminiApiKey || serverConfig.geminiKey || process.env.GEMINI_API_KEY;

    // Calculate dimensions
    const dimensionMap: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1344, height: 768 },
      '9:16': { width: 768, height: 1344 },
      '4:3': { width: 1152, height: 864 },
      '3:4': { width: 864, height: 1152 },
      '3:2': { width: 1216, height: 832 },
      '2:3': { width: 832, height: 1216 },
    };

    const dims = dimensionMap[aspectRatio] || dimensionMap['1:1'];

    const stylePrompts: Record<string, string> = {
      photorealistic: 'hyperrealistic 8k photograph, professional photography, natural lighting, sharp focus',
      cinematic: 'cinematic lighting, dramatic atmosphere, anamorphic 35mm lens, movie still',
      '3d': '3D render, Octane render, unreal engine 5, ray tracing, ultra detailed textures',
      anime: 'modern anime aesthetic, vibrant colors, makoto shinkai style, studio ghibli lighting',
      watercolor: 'delicate watercolor painting, artistic paper texture, soft pastel tones',
      cyberpunk: 'cyberpunk aesthetic, neon glows, rainy futuristic cityscape, high contrast reflections',
      minimalist: 'minimalist clean design, subtle shadows, elegant composition, muted pastel colors',
    };

    // 1. Automatic Uyghur/Non-Latin -> English Translation for AI Image Models
    const englishPrompt = await translatePromptToEnglish(prompt, effectiveGeminiKey, effectiveOpenRouterKey);

    const styleModifier = stylePrompts[style] || stylePrompts.photorealistic;
    const enrichedPrompt = `${englishPrompt}, ${styleModifier}, high quality, detailed masterpiece`;

    // 2. Try OpenRouter FLUX / SD if key is provided and active
    if (provider === 'openrouter' && effectiveOpenRouterKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveOpenRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://uyghur-ai.local',
            'X-Title': 'Uyghur AI Image Studio',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: enrichedPrompt,
              },
            ],
            modalities: ['image', 'text'],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const choice = data.choices?.[0];
          const rawImg = choice?.message?.images?.[0];
          const imageUrl = rawImg?.image_url?.url || rawImg?.url || choice?.message?.content;
          if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:image'))) {
            return NextResponse.json({
              imageUrl,
              originalPrompt: prompt,
              translatedPrompt: englishPrompt,
              enhancedPrompt: enrichedPrompt,
              aspectRatio,
              model,
            });
          }
        } else {
          console.warn('OpenRouter image call failed with status:', response.status);
        }
      } catch (e) {
        console.warn('OpenRouter image direct call failed', e);
      }
    }

    // 3. High-Quality Neural AI Image Generation (Real AI Diffusion matching exact prompt)
    const seed = Math.floor(Math.random() * 1000000);
    const cleanPrompt = enrichedPrompt.replace(/['"`]/g, '').replace(/[^a-zA-Z0-9, ]+/g, ' ').replace(/\s+/g, ' ').trim();
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${dims.width}&height=${dims.height}&seed=${seed}&nologo=true`;

    return NextResponse.json({
      imageUrl: pollinationsUrl,
      originalPrompt: prompt,
      translatedPrompt: englishPrompt,
      enhancedPrompt: enrichedPrompt,
      aspectRatio,
      model: model || 'black-forest-labs/flux-1-schnell',
    });
  } catch (error: any) {
    console.error('Image API Error:', error);
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 });
  }
}
