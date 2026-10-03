import { supabase } from './supabase';
import { FeatureModels } from '@/types';

interface CachedSystemConfig {
  openRouterKey: string;
  geminiKey: string;
  activeModels: FeatureModels;
  timestamp: number;
}

let cachedConfig: CachedSystemConfig | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export async function getSystemConfigServer() {
  const now = Date.now();
  if (cachedConfig && now - cachedConfig.timestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('id', 'global')
      .single();

    if (data && !error) {
      cachedConfig = {
        openRouterKey: data.master_openrouter_key || process.env.OPENROUTER_API_KEY || '',
        geminiKey: data.master_gemini_key || process.env.GEMINI_API_KEY || '',
        activeModels: data.active_models || {
          chat: 'google/gemini-2.5-flash',
          translate: 'google/gemini-2.5-flash',
          image: 'black-forest-labs/flux-1-schnell',
          tts: 'openai/tts-1',
          video: 'google/gemini-2.5-flash',
        },
        timestamp: now,
      };
      return cachedConfig;
    }
  } catch (err) {
    console.error('Failed to load system config from Supabase:', err);
  }

  return {
    openRouterKey: process.env.OPENROUTER_API_KEY || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
    activeModels: {
      chat: 'google/gemini-2.5-flash',
      translate: 'google/gemini-2.5-flash',
      image: 'black-forest-labs/flux-1-schnell',
      tts: 'openai/tts-1',
      video: 'google/gemini-2.5-flash',
    },
    timestamp: now,
  };
}

export function invalidateSystemConfigCache() {
  cachedConfig = null;
}
