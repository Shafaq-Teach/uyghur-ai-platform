export type Language = 'ug' | 'en';

export type AIProvider = 'openrouter' | 'gemini';

export interface ModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  isFree?: boolean;
}

export interface FeatureModels {
  chat: string;
  translate: string;
  image: string;
  tts: string;
  video: string;
}

export type AppTheme = 'dark' | 'light' | 'system' | 'midnight' | 'warm';

export interface AppSettings {
  language: Language;
  theme: AppTheme;
  openRouterApiKey: string;
  geminiApiKey: string;
  featureProviders: {
    chat: AIProvider;
    translate: AIProvider;
    image: AIProvider;
    tts: AIProvider;
    video: AIProvider;
  };
  featureModels: FeatureModels;
}

export interface HistoryItem {
  id: string;
  type: 'chat' | 'translate' | 'image' | 'tts' | 'video';
  title: string;
  preview: string;
  data: any;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: 'admin' | 'user';
}

export interface SystemConfig {
  id: string;
  activeModels: FeatureModels;
  quotaSettings?: {
    dailyUserLimit: number;
    imageLimit: number;
  };
  updatedAt?: string;
}

