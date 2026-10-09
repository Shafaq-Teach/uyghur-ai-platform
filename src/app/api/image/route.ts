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
  // Strictly use the active model configured under 🌐 تەرجىمە (Translate)
  const targetTranslateModel = translateModel || 'google/gemini-2.5-flash';

  const isNativeGemini = !targetTranslateModel.includes('/') && targetTranslateModel.toLowerCase().includes('gemini');

  // Tier 1: If 🌐 Translate model is a native Gemini model and geminiKey is available
  if (isNativeGemini && geminiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      const directModel = targetTranslateModel.includes('latest') ? targetTranslateModel : 'gemini-flash-latest';

      const transRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${directModel}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert Uyghur-to-English translator for AI visual generation (Flux.1 / Midjourney). Translate the following Uyghur description directly into a concise, detailed, highly visual English prompt describing the scene, lighting, atmosphere, and key objects. Output ONLY the English prompt. Do NOT add notes, explanations, or quotes:\n\n${prompt}`,
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
        const candidate = lines.find((l: string) => !/[\u0600-\u06FF]/.test(l) && l.length > 3) || raw;
        const cleaned = candidate
          .replace(/^["'`*>\s]+|["'`*>\s]+$/g, '')
          .replace(/^(Direct Translation:|Translation:)\s*/i, '')
          .trim();
        if (cleaned && !/[\u0600-\u06FF]/.test(cleaned)) {
          englishText = cleaned;
          console.log(`[Translate Model: ${targetTranslateModel} (Gemini Direct)] prompt translation success:`, englishText);
        }
      }
    } catch (err) {
      console.warn(`[Translate Model: ${targetTranslateModel}] direct error:`, err);
    }
  }

  // Tier 2: Call OpenRouter using the configured 🌐 Translate model
  if (!englishText && openRouterKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

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
          model: targetTranslateModel,
          messages: [
            {
              role: 'system',
              content: 'You are an expert Uyghur-to-English translator for AI image generation (Flux.1 / Midjourney). Translate the Uyghur prompt into a vivid, descriptive, high-quality English visual prompt. Return ONLY the direct English translation without preamble, without markdown, without quotes, without introductory text.',
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
          const cleaned = content
            .replace(/^["'`*>\s]+|["'`*>\s]+$/g, '')
            .replace(/^(Direct Translation:|Translation:)\s*/i, '')
            .trim();
          if (cleaned.length > 3) {
            englishText = cleaned;
            console.log(`[Translate Model: ${targetTranslateModel} (OpenRouter)] prompt translation success:`, englishText);
          }
        }
      } else {
        console.warn(`[Translate Model: ${targetTranslateModel}] failed with status:`, orRes.status);
      }
    } catch (err) {
      console.warn(`[Translate Model: ${targetTranslateModel}] translation error:`, err);
    }
  }

  // Tier 3: Resilient fallback to Gemini Direct (gemini-flash-latest) if the chosen translate model failed or errored
  if ((!englishText || /[\u0600-\u06FF]/.test(englishText)) && geminiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const transRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert Uyghur-to-English translator for AI image generation. Translate this Uyghur image prompt into English in one or two descriptive sentences. Return ONLY the English translation, without markdown, without quotes, without introductory text:\n${prompt}`,
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
        const cleaned = candidate
          .replace(/^["'`*>\s]+|["'`*>\s]+$/g, '')
          .replace(/^(Direct Translation:|Translation:)\s*/i, '')
          .trim();
        if (cleaned && !/[\u0600-\u06FF]/.test(cleaned)) {
          englishText = cleaned;
          console.log('Gemini fallback prompt translation success:', englishText);
        }
      }
    } catch (err) {
      console.warn('Gemini fallback translation error/timeout:', err);
    }
  }

  // Tier 4: Fallback to Llama 3.3 on OpenRouter
  if ((!englishText || /[\u0600-\u06FF]/.test(englishText)) && openRouterKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

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
            {
              role: 'system',
              content: 'Translate the following Uyghur description directly into a concise visual English prompt for image generation. Return ONLY the English prompt, no markdown, no quotes, no conversational filler.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });
      clearTimeout(timeoutId);

      if (llamaRes.ok) {
        const llamaData = await llamaRes.json();
        const content = llamaData.choices?.[0]?.message?.content?.trim();
        if (content && !/[\u0600-\u06FF]/.test(content)) {
          const cleaned = content.replace(/^["'`*>\s]+|["'`*>\s]+$/g, '').trim();
          if (cleaned.length > 3) {
            englishText = cleaned;
            console.log('Llama fallback prompt translation success:', englishText);
          }
        }
      }
    } catch (err) {
      console.warn('Llama fallback translation error:', err);
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
