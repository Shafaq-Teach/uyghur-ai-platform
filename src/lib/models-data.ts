import { ModelOption } from '@/types';

export const CHAT_MODELS: ModelOption[] = [
  // OpenRouter Models
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (OpenRouter)',
    provider: 'openrouter',
    description: 'Fast, highly intelligent multimodal model with excellent Uyghur understanding',
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (OpenRouter)',
    provider: 'openrouter',
    description: 'Premier reasoning and complex analysis model by Google',
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1 (OpenRouter)',
    provider: 'openrouter',
    description: 'Elite open-weights reasoning model with chain of thought',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (OpenRouter)',
    provider: 'openrouter',
    description: 'Top-tier coding, creative writing and nuanced dialogue',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (OpenRouter)',
    provider: 'openrouter',
    description: 'Flagship omni model from OpenAI with strong multilingual skills',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B (OpenRouter)',
    provider: 'openrouter',
    description: 'High-speed open source model with broad knowledge',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3 (OpenRouter)',
    provider: 'openrouter',
    description: 'Extremely capable and cost-effective chat model',
  },
  // Gemini Direct
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Direct API) - تەۋسىيە',
    provider: 'gemini',
    description: 'Direct Google Gemini API: Google نىڭ ئەڭ يېڭى ۋە ئەڭ تېز رەسمىي مودېلى',
  },
  {
    id: 'gemini-3.8-pro',
    name: 'Gemini 3.8 Pro (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini API Pro tier for in-depth reasoning',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini API Next-Gen model',
  },
];

export const TRANSLATE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Direct API) - تەۋسىيە',
    provider: 'gemini',
    description: 'Google نىڭ ئەڭ يېڭى يۇقىرى سۈرئەتلىك ۋە ئېنىق تەرجىمە مودېلى',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (OpenRouter)',
    provider: 'openrouter',
    description: 'Best for Uyghur <-> English/Turkish/Arabic contextual accuracy',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3 (OpenRouter)',
    provider: 'openrouter',
    description: 'Excellent linguistic grasp and formal phrasing',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini (OpenRouter)',
    provider: 'openrouter',
    description: 'Quick, lightweight and reliable multilingual translation',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku (OpenRouter)',
    provider: 'openrouter',
    description: 'Rapid nuanced translations for business and literary text',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini translation engine',
  },
];

export const IMAGE_MODELS: ModelOption[] = [
  {
    id: 'black-forest-labs/flux-1-schnell',
    name: 'FLUX.1 Schnell (OpenRouter)',
    provider: 'openrouter',
    description: 'Ultra fast state-of-the-art photorealistic image generation',
  },
  {
    id: 'black-forest-labs/flux-1-dev',
    name: 'FLUX.1 Dev (OpenRouter)',
    provider: 'openrouter',
    description: 'Professional high-fidelity image synthesis with deep prompt adherence',
  },
  {
    id: 'stabilityai/stable-diffusion-3.5-large',
    name: 'SD 3.5 Large (OpenRouter)',
    provider: 'openrouter',
    description: 'High resolution artistic and commercial imagery',
  },
  {
    id: 'recraft-ai/recraft-20b',
    name: 'Recraft 20B (OpenRouter)',
    provider: 'openrouter',
    description: 'Exceptional vector art, 3D and brand illustrations',
  },
  {
    id: 'imagen-3.0-generate-002',
    name: 'Imagen 3 (Direct Gemini)',
    provider: 'gemini',
    description: 'Google state of the art photorealistic image model',
  },
];

export const TTS_MODELS: ModelOption[] = [
  {
    id: 'openai/tts-1',
    name: 'OpenAI TTS-1 (OpenRouter / Audio API)',
    provider: 'openrouter',
    description: 'Natural human-like speech synthesis with crisp pronunciation',
  },
  {
    id: 'openai/tts-1-hd',
    name: 'OpenAI TTS-1 HD (OpenRouter)',
    provider: 'openrouter',
    description: 'High definition expressive voice model',
  },
  {
    id: 'gemini-2.5-flash-audio',
    name: 'Gemini Audio Engine',
    provider: 'gemini',
    description: 'Google native multimodal speech generator',
  },
  {
    id: 'edge-tts-ug',
    name: 'Uyghur Edge TTS (Gulnar / Yunus)',
    provider: 'openrouter',
    description: 'Specialized native Uyghur vocalization engine',
  },
];

export const VIDEO_MODELS: ModelOption[] = [
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash Vision (OpenRouter)',
    provider: 'openrouter',
    description: 'Analyzes product image and generates cinematic camera scripts (No Humans)',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet Vision (OpenRouter)',
    provider: 'openrouter',
    description: 'Elite visual storytelling and product commercial direction',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o Vision (OpenRouter)',
    provider: 'openrouter',
    description: 'Multimodal product analysis and marketing script creation',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash Vision (Direct API) - تەۋسىيە',
    provider: 'gemini',
    description: 'Direct Google Gemini Vision for ad creation',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash Vision (Direct API)',
    provider: 'gemini',
    description: 'Direct Google Gemini Next-Gen Vision',
  },
];
