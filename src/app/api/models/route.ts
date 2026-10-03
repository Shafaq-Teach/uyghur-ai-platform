import { NextResponse } from 'next/server';

export const runtime = 'edge';

let cachedModels: any[] | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const GEMINI_DIRECT_MODELS = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Direct API) - تەۋسىيە',
    provider: 'gemini',
    description: 'Direct Google Gemini API: Google نىڭ ئەڭ يېڭى ۋە ئەڭ تېز رەسمىي تاللانغان مودېلى',
    context_length: 1048576,
  },
  {
    id: 'gemini-3.8-pro',
    name: 'Gemini 3.8 Pro (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini API: مۇرەككەپ تەپەككۇر، كودلاش ۋە چوڭقۇر پىكىرلەش مودېلى',
    context_length: 2097152,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini API: Ultra fast, multimodal, 1M context token window',
    context_length: 1048576,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini API: Advanced reasoning, coding and complex problem solving',
    context_length: 2097152,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini API: Next-gen high speed multimodal model',
    context_length: 1048576,
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini API: Extremely lightweight, cost-effective',
    context_length: 1048576,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini API: 2M token context, deep cross-modal reasoning',
    context_length: 2097152,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini API: Fast and versatile multimodal performance',
    context_length: 1048576,
  },
  {
    id: 'imagen-3.0-generate-002',
    name: 'Imagen 3 (Direct Gemini)',
    provider: 'gemini',
    description: 'Direct Google Image Generation model for photorealistic images',
    context_length: 0,
  },
];

export async function GET() {
  const now = Date.now();

  if (cachedModels && (now - lastCacheTime < CACHE_DURATION)) {
    return NextResponse.json({ models: cachedModels });
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'HTTP-Referer': 'https://uyghur-ai.local',
        'X-Title': 'Uyghur AI Platform',
      },
      next: { revalidate: 600 },
    });

    let openRouterList: any[] = [];
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        openRouterList = data.data
          .filter((m: any) => {
            const id = m.id.toLowerCase();
            if (id.includes('decide') || id.includes('embed') || id.includes('rerank') || id.includes('moderation') || id.includes('guard')) {
              return false;
            }
            return true;
          })
          .map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            provider: 'openrouter',
            description: m.description || '',
            context_length: m.context_length || 0,
            pricing: m.pricing,
            isFree: m.id.endsWith(':free') || (m.pricing?.prompt === '0' && m.pricing?.completion === '0'),
          }));
      }
    }

    // Combine Gemini direct models with all OpenRouter models
    const merged = [...GEMINI_DIRECT_MODELS, ...openRouterList];
    cachedModels = merged;
    lastCacheTime = now;

    return NextResponse.json({ models: merged });
  } catch (error: any) {
    console.error('Failed to fetch OpenRouter models:', error);
    // If fetching fails, return Gemini and fallback curated models
    if (cachedModels) {
      return NextResponse.json({ models: cachedModels });
    }
    return NextResponse.json({ models: GEMINI_DIRECT_MODELS });
  }
}
