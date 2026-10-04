import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigServer } from '@/lib/serverConfig';

export const runtime = 'edge';

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
    let englishPrompt = prompt.trim();
    const isUyghurOrNonLatin = /[\u0600-\u06FF]/.test(prompt);

    if (isUyghurOrNonLatin && effectiveGeminiKey) {
      try {
        console.log('Gemini translation request with key prefix:', effectiveGeminiKey?.slice(0, 10), 'prompt:', prompt);
        const transRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${effectiveGeminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an expert visual AI prompt engineer. Translate the following Uyghur image description into a vivid, accurate, highly detailed English text-to-image prompt. Only return the English translation, do not include explanations or quotes:\n\n${prompt}`,
                    },
                  ],
                },
              ],
            }),
          }
        );
        console.log('Gemini trans status:', transRes.status);
        if (transRes.ok) {
          const transJson = await transRes.json();
          const translated = transJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          console.log('Gemini translated:', translated);
          if (translated) {
            englishPrompt = translated.replace(/^["']|["']$/g, '');
          }
        } else {
          console.log('Gemini trans failed text:', await transRes.text());
        }
      } catch (err) {
        console.warn('Gemini prompt translation error:', err);
      }
    }

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
          const imageUrl = choice?.message?.images?.[0]?.url || choice?.message?.content;
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
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enrichedPrompt)}?width=${dims.width}&height=${dims.height}`;

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
