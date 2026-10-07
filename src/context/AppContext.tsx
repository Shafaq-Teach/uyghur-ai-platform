'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, AIProvider, AppSettings, HistoryItem, FeatureModels, UserProfile, AppTheme } from '@/types';
import { translations } from '@/lib/translations';
import { supabase } from '@/lib/supabase';
import { AuthModal } from '@/components/AuthModal';
import { RegisterPromptModal } from '@/components/RegisterPromptModal';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRtl: boolean;
  t: typeof translations.ug;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  cycleTheme: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  setModelForFeature: (feature: keyof FeatureModels, modelId: string, provider?: AIProvider) => void;
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
  user: UserProfile | null;
  isAdmin: boolean;
  isLoadingUser: boolean;
  isCloudSynced: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalTab: 'signin' | 'signup';
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  isRegisterPromptOpen: boolean;
  openRegisterPrompt: () => void;
  closeRegisterPrompt: () => void;
  requireAuth: () => boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'ug',
  theme: 'dark',
  openRouterApiKey: '',
  geminiApiKey: '',
  featureProviders: {
    chat: 'openrouter',
    translate: 'openrouter',
    image: 'openrouter',
    tts: 'openrouter',
    video: 'openrouter',
  },
  featureModels: {
    chat: 'google/gemini-2.5-flash',
    translate: 'google/gemini-2.5-flash',
    image: 'black-forest-labs/flux-1-schnell',
    tts: 'openai/tts-1',
    video: 'google/gemini-2.5-flash',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ug');
  const [theme, setThemeState] = useState<AppTheme>('dark');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Auth and Register Prompt Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [isRegisterPromptOpen, setIsRegisterPromptOpen] = useState(false);

  const openAuthModal = useCallback((tab: 'signin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const openRegisterPrompt = useCallback(() => {
    setIsRegisterPromptOpen(true);
  }, []);

  const closeRegisterPrompt = useCallback(() => {
    setIsRegisterPromptOpen(false);
  }, []);

  const requireAuth = useCallback((): boolean => {
    if (!user) {
      setIsRegisterPromptOpen(true);
      return false;
    }
    return true;
  }, [user]);

  // Sync data with Supabase for logged in user
  const loadUserData = async (userId: string) => {
    try {
      // 1. Fetch user API keys
      const { data: keyData } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (keyData) {
        setSettings((prev) => {
          const cloudOpenRouter = keyData.openrouter_key ?? prev.openRouterApiKey;
          const cloudGemini = keyData.gemini_key ?? prev.geminiApiKey;
          const updated = {
            ...prev,
            openRouterApiKey: cloudOpenRouter,
            geminiApiKey: cloudGemini,
            featureModels: {
              ...prev.featureModels,
              ...(keyData.preferred_models || {}),
            },
          };
          try {
            localStorage.setItem('uyghur_ai_settings', JSON.stringify(updated));
          } catch (_) {}
          return updated;
        });

        // If cloud was empty but local has keys, sync local keys up to cloud
        if ((!keyData.openrouter_key && settings.openRouterApiKey) || (!keyData.gemini_key && settings.geminiApiKey)) {
          await supabase.from('user_api_keys').upsert({
            user_id: userId,
            openrouter_key: settings.openRouterApiKey,
            gemini_key: settings.geminiApiKey,
            preferred_models: settings.featureModels,
            updated_at: new Date().toISOString(),
          });
        }
      }

      // 2. Fetch history
      const { data: historyData } = await supabase
        .from('ai_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (historyData && historyData.length > 0) {
        const cloudHistory: HistoryItem[] = historyData.map((row: any) => ({
          id: row.id,
          type: row.type,
          title: row.title,
          preview: row.preview,
          data: row.data,
          createdAt: new Date(row.created_at).getTime(),
        }));
        setHistory(cloudHistory);
        try {
          localStorage.setItem('uyghur_ai_history', JSON.stringify(cloudHistory));
        } catch (_) {}
      }
    } catch (e) {
      console.warn('Failed to sync data with Supabase:', e);
    }
  };

  const buildProfile = async (u: any): Promise<UserProfile> => {
    const isMasterAdmin = u.email?.toLowerCase() === 'yulgun353@gmail.com';
    let role: 'admin' | 'user' = isMasterAdmin ? 'admin' : 'user';
    try {
      const { data } = await supabase.from('profiles').select('role').eq('id', u.id).single();
      if (data?.role) {
        role = data.role as 'admin' | 'user';
      }
    } catch (_) {}

    if (isMasterAdmin) {
      role = 'admin';
    }

    return {
      id: u.id,
      email: u.email,
      fullName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
      avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
      role,
    };
  };

  const loadGlobalSystemModels = async () => {
    try {
      const { data } = await supabase.from('system_config').select('active_models').eq('id', 'global').single();
      if (data?.active_models) {
        setSettings(prev => ({
          ...prev,
          featureModels: {
            ...prev.featureModels,
            ...data.active_models,
          }
        }));
      }
    } catch (_) {}
  };

  // Listen to Supabase Auth state changes
  useEffect(() => {
    loadGlobalSystemModels();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await buildProfile(session.user);
        setUser(profile);
        setIsLoadingUser(false);
        await loadUserData(session.user.id);
      } else {
        setUser(null);
        setIsLoadingUser(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await buildProfile(session.user);
        setUser(profile);
        setIsLoadingUser(false);
        await loadUserData(session.user.id);
      } else {
        let preview: any = null;
        try {
          const item = typeof window !== 'undefined' ? localStorage.getItem('uyghur_ai_admin_preview') : null;
          if (item) preview = JSON.parse(item);
        } catch (_) {}
        if (preview && preview.role === 'admin') {
          setUser(preview);
        } else {
          setUser(null);
        }
        setIsLoadingUser(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Load persisted settings
    try {
      const savedSettings = localStorage.getItem('uyghur_ai_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Repair corrupted or revoked keys from localStorage
        if (
          parsed.openRouterApiKey &&
          (
            parsed.openRouterApiKey.startsWith('sk-or-v1-f027') ||
            parsed.openRouterApiKey.startsWith('sk-or-v1-f0d2') ||
            ((parsed.openRouterApiKey.startsWith('AQ.') || parsed.openRouterApiKey.startsWith('AIza')) && parsed.openRouterApiKey === parsed.geminiApiKey)
          )
        ) {
          parsed.openRouterApiKey = '';
          try {
            localStorage.setItem('uyghur_ai_settings', JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }));
          } catch (_) {}
        }
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        if (parsed.language) setLangState(parsed.language);
        if (parsed.theme) setThemeState(parsed.theme);
      }
      const savedHistory = localStorage.getItem('uyghur_ai_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    updateSettings({ language: newLang });
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === 'ug' ? 'rtl' : 'ltr';
    }
  };

  const applyThemeToDOM = (t: AppTheme) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme-setting', t);
    
    if (t === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.setAttribute('data-theme', t);
      if (t === 'light' || t === 'warm') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    updateSettings({ theme: newTheme });
    applyThemeToDOM(newTheme);
  };

  const cycleTheme = () => {
    const themeOrder: AppTheme[] = ['dark', 'light', 'system'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    setTheme(nextTheme);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ug' ? 'rtl' : 'ltr';
      applyThemeToDOM(theme);
    }

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyThemeToDOM('system');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [lang, theme]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const base = prev || DEFAULT_SETTINGS;
      const updated: AppSettings = {
        ...base,
        ...newSettings,
        openRouterApiKey: newSettings.openRouterApiKey !== undefined ? newSettings.openRouterApiKey : (base.openRouterApiKey || ''),
        geminiApiKey: newSettings.geminiApiKey !== undefined ? newSettings.geminiApiKey : (base.geminiApiKey || ''),
        featureProviders: {
          ...(base.featureProviders || DEFAULT_SETTINGS.featureProviders),
          ...(newSettings.featureProviders || {}),
        },
        featureModels: {
          ...(base.featureModels || DEFAULT_SETTINGS.featureModels),
          ...(newSettings.featureModels || {}),
        },
      };
      try {
        localStorage.setItem('uyghur_ai_settings', JSON.stringify(updated));
      } catch (e) {}

      // If user is logged in, sync keys to Supabase user_api_keys
      if (user?.id) {
        supabase
          .from('user_api_keys')
          .upsert({
            user_id: user.id,
            openrouter_key: (updated.openRouterApiKey || '').trim(),
            gemini_key: (updated.geminiApiKey || '').trim(),
            preferred_models: updated.featureModels,
            updated_at: new Date().toISOString(),
          })
          .then();
      }

      return updated;
    });
  };

  const setModelForFeature = (feature: keyof FeatureModels, modelId: string, provider?: AIProvider) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        featureModels: {
          ...prev.featureModels,
          [feature]: modelId,
        },
        featureProviders: {
          ...prev.featureProviders,
          ...(provider ? { [feature]: provider } : {}),
        },
      };
      try {
        localStorage.setItem('uyghur_ai_settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: 'h-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev.slice(0, 99)];
      try {
        localStorage.setItem('uyghur_ai_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // If user is logged in, sync history item to Supabase ai_history
    if (user?.id) {
      supabase.from('ai_history').insert({
        user_id: user.id,
        type: newItem.type,
        title: newItem.title,
        preview: newItem.preview,
        data: newItem.data,
      }).then();
    }
  };

  const removeHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('uyghur_ai_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (user?.id) {
      supabase.from('ai_history').delete().eq('id', id).then();
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('uyghur_ai_history');
    } catch (e) {}

    if (user?.id) {
      supabase.from('ai_history').delete().eq('user_id', user.id).then();
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message || 'Google login failed' };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e.message || 'Login failed' };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName || email.split('@')[0] },
        },
      });
      if (error) return { error: error.message };
      if (!data?.session) {
        const loginRes = await supabase.auth.signInWithPassword({ email, password });
        if (loginRes.error) {
          return { message: 'تىزىملىتىش تاماملاندى، ئەمدى «كىرىش» نى بېسىپ كىرىڭ.' };
        }
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'Signup failed' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isRtl = lang === 'ug';
  const t = translations[lang] || translations.ug;

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        isRtl,
        t,
        theme,
        setTheme,
        cycleTheme,
        settings: settings || DEFAULT_SETTINGS,
        updateSettings,
        setModelForFeature,
        history,
        addHistoryItem,
        removeHistoryItem,
        clearHistory,
        user,
        isAdmin: user?.role === 'admin' || user?.email?.toLowerCase() === 'yulgun353@gmail.com',
        isLoadingUser,
        isCloudSynced: !!user,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        isRegisterPromptOpen,
        openRegisterPrompt,
        closeRegisterPrompt,
        requireAuth,
      }}
    >
      <div className={`min-h-screen ${isRtl ? 'font-uyghur' : 'font-sans'}`}>
        {children}
      </div>
      <RegisterPromptModal
        isOpen={isRegisterPromptOpen}
        onClose={closeRegisterPrompt}
        onConfirm={() => {
          closeRegisterPrompt();
          openAuthModal('signup');
        }}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={closeAuthModal}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
