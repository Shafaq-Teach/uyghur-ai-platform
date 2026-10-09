import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigServer } from '@/lib/serverConfig';

export const runtime = 'edge';

async function translatePromptToEnglish(
  prompt: string,
  translateModel: string,
  geminiKey?: string,
  openRouterKey?: string
): Promise<string> {
  const isUyghurOrNonLatin = /[\u0600-\u06FF]/.test(prompt);
  if (!isUyghurOrNonLatin) {
    return prompt.trim();
  }

  let englishText = '';

  // 1. Normalize model name for the 🌐 Translate engine
  let primaryModel = translateModel || 'google/gemini-2.5-flash';
  if (!primaryModel.includes('/') && primaryModel.toLowerCase().includes('gemini')) {
    primaryModel = `google/${primaryModel}`;
  }
  // If the admin or user chose a placeholder/future tag like gemini-3.8-flash, map to high-speed gemini-2.5-flash
  if (primaryModel === 'google/gemini-3.8-flash' || primaryModel === 'gemini-3.8-flash') {
    primaryModel = 'google/gemini-2.5-flash';
  }

  const systemInstructions =
    'You are an expert Uyghur-to-English visual prompt translator for AI image generation (Flux.1 / Midjourney). ' +
    'Translate the following Uyghur description directly into a concise, detailed, high-quality visual English prompt describing the scene, lighting, atmosphere, and key objects. ' +
    'CRITICAL: Return ONLY the English translation in 1 or 2 sentences. Do NOT output any Uyghur text. Do NOT add markdown, explanations, or quotes.';

  // Helper to extract clean English from model response
  const extractCleanEnglish = (raw: string): string => {
    if (!raw) return '';
    // Look for lines that don't have Arabic/Uyghur script
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && !l.startsWith('('));
    const nonUyghurLine = lines.find((l) => !/[\u0600-\u06FF]/.test(l) && l.length > 8);
    const candidate = nonUyghurLine || raw;
    const cleaned = candidate
      .replace(/^["'`*>\s]+|["'`*>\s]+$/g, '')
      .replace(/^(Direct Translation:|Translation:|Prompt:)\s*/i, '')
      .replace(/^["'`*>\s]+|["'`*>\s]+$/g, '')
      .trim();
    return !/[\u0600-\u06FF]/.test(cleaned) && cleaned.length > 5 ? cleaned : '';
  };

  // Tier 1: OpenRouter with the configured 🌐 Translate model (Fast: ~2.5s)
  if (openRouterKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

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
          model: primaryModel,
          messages: [
            { role: 'system', content: systemInstructions },
            { role: 'user', content: prompt },
          ],
        }),
      });
      clearTimeout(timeoutId);

      if (orRes.ok) {
        const orData = await orRes.json();
        const content = orData.choices?.[0]?.message?.content?.trim() || '';
        const parsed = extractCleanEnglish(content);
        if (parsed) {
          englishText = parsed;
          console.log(`[Translate Model: ${primaryModel}] translation success:`, englishText);
        }
      } else {
        console.warn(`[Translate Model: ${primaryModel}] OpenRouter status:`, orRes.status);
      }
    } catch (err) {
      console.warn(`[Translate Model: ${primaryModel}] error:`, err);
    }
  }

  // Tier 2: OpenRouter backup with meta-llama/llama-3.3-70b-instruct (Ultra-fast Uyghur comprehension)
  if (!englishText && openRouterKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5500);

      const llamaRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://uyghur-ai.local',
          'X-Title': 'Uyghur AI Image Studio',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemInstructions },
            { role: 'user', content: prompt },
          ],
        }),
      });
      clearTimeout(timeoutId);

      if (llamaRes.ok) {
        const llamaData = await llamaRes.json();
        const content = llamaData.choices?.[0]?.message?.content?.trim() || '';
        const parsed = extractCleanEnglish(content);
        if (parsed) {
          englishText = parsed;
          console.log('[Backup: Llama 3.3] translation success:', englishText);
        }
      }
    } catch (err) {
      console.warn('[Backup: Llama 3.3] error:', err);
    }
  }

  // Tier 3: OpenRouter with google/gemini-2.5-flash as guaranteed backup
  if (!englishText && openRouterKey && primaryModel !== 'google/gemini-2.5-flash') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5500);

      const geminiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            { role: 'system', content: systemInstructions },
            { role: 'user', content: prompt },
          ],
        }),
      });
      clearTimeout(timeoutId);

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const content = geminiData.choices?.[0]?.message?.content?.trim() || '';
        const parsed = extractCleanEnglish(content);
        if (parsed) {
          englishText = parsed;
          console.log('[Backup: Gemini 2.5 Flash] translation success:', englishText);
        }
      }
    } catch (err) {
      console.warn('[Backup: Gemini 2.5 Flash] error:', err);
    }
  }

  // Strictly verify translation - NEVER allow raw Uyghur text to reach the image engine!
  if (!englishText || /[\u0600-\u06FF]/.test(englishText)) {
    throw new Error('تەرجىمە ماتورى جاۋاب قايتۇرمىدى، قايتا بېسىپ سىناپ بېقىڭ');
  }

  return englishText;
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
      translateModel: reqTranslateModel,
      openRouterApiKey,
      geminiApiKey
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt كىرگۈزۈلمىدى' }, { status: 400 });
    }

    const effectiveOpenRouterKey = openRouterApiKey || serverConfig.openRouterKey || process.env.OPENROUTER_API_KEY;
    const effectiveGeminiKey = geminiApiKey || serverConfig.geminiKey || process.env.GEMINI_API_KEY;

    // Use strictly the model configured under 🌐 تەرجىمە (Translate)
    const effectiveTranslateModel = reqTranslateModel || serverConfig.activeModels?.translate || 'google/gemini-2.5-flash';

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

    // 1. Automatic Uyghur/Non-Latin -> English Translation using 🌐 Translate model
    const englishPrompt = await translatePromptToEnglish(
      prompt,
      effectiveTranslateModel,
      effectiveGeminiKey,
      effectiveOpenRouterKey
    );

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

    // 3. High-Quality Neural AI Image Generation (Flux.1 Diffusion matching exact prompt)
    const seed = Math.floor(Math.random() * 1000000);
    // Sanitize newlines and unsafe characters without wiping out non-English content
    const cleanPrompt = enrichedPrompt.replace(/[\r\n\t]+/g, ' ').replace(/[#%&?/\\]/g, ' ').trim();
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?model=flux&width=${dims.width}&height=${dims.height}&seed=${seed}&nologo=true`;

    return NextResponse.json({
      imageUrl: pollinationsUrl,
      originalPrompt: prompt,
      translatedPrompt: englishPrompt,
      enhancedPrompt: enrichedPrompt,
      aspectRatio,
      model: model || 'black-forest-labs/flux-1-schnell',
      translateModel: effectiveTranslateModel,
    });
  } catch (error: any) {
    console.error('Image API Error:', error);
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 });
  }
}
