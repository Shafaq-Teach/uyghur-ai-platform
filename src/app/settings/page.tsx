'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Settings, 
  KeyRound, 
  Cpu, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ClipboardPaste,
  Trash2,
  AlertTriangle,
  Cloud,
  Palette,
  Sun,
  Moon,
  Sunset
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import { AppTheme } from '@/types';
import { 
  CHAT_MODELS, 
  TRANSLATE_MODELS, 
  IMAGE_MODELS, 
  TTS_MODELS, 
  VIDEO_MODELS 
} from '@/lib/models-data';
import { SearchableModelSelect } from '@/components/SearchableModelSelect';
import { AIProvider } from '@/types';

export default function SettingsPage() {
  const { t, isRtl, settings, updateSettings, user, isAdmin, isLoadingUser, openAuthModal, theme, setTheme } = useApp();

  const [openRouterKey, setOpenRouterKey] = useState(settings.openRouterApiKey);
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [chatModel, setChatModel] = useState(settings.featureModels.chat);
  const [translateModel, setTranslateModel] = useState(settings.featureModels.translate);
  const [imageModel, setImageModel] = useState(settings.featureModels.image);
  const [ttsModel, setTtsModel] = useState(settings.featureModels.tts);
  const [videoModel, setVideoModel] = useState(settings.featureModels.video);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handlePasteOpenRouter = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setOpenRouterKey(text.trim());
    } catch (_) {}
  };

  const handlePasteGemini = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setGeminiKey(text.trim());
    } catch (_) {}
  };

  // Sync state whenever settings change (e.g. on initial localStorage hydration)
  React.useEffect(() => {
    if (settings.openRouterApiKey !== undefined) {
      setOpenRouterKey(settings.openRouterApiKey);
    }
    if (settings.geminiApiKey !== undefined) {
      setGeminiKey(settings.geminiApiKey);
    }
  }, [settings.openRouterApiKey, settings.geminiApiKey]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings({
      openRouterApiKey: openRouterKey.trim(),
      geminiApiKey: geminiKey.trim(),
      featureModels: {
        chat: chatModel,
        translate: translateModel,
        image: imageModel,
        tts: ttsModel,
        video: videoModel,
      },
      featureProviders: {
        chat: (chatModel.startsWith('gemini-') || chatModel === 'gemini') && !chatModel.includes('/') ? 'gemini' : 'openrouter',
        translate: (translateModel.startsWith('gemini-') || translateModel === 'gemini') && !translateModel.includes('/') ? 'gemini' : 'openrouter',
        image: imageModel.includes('imagen') ? 'gemini' : 'openrouter',
        tts: (ttsModel.startsWith('gemini-') || ttsModel === 'gemini') && !ttsModel.includes('/') ? 'gemini' : 'openrouter',
        video: (videoModel.startsWith('gemini-') || videoModel === 'gemini') && !videoModel.includes('/') ? 'gemini' : 'openrouter',
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (!openRouterKey.trim() && !geminiKey.trim()) {
        setTestResult('⚠️ API ئاچقۇچى كىرگۈزۈلمىگەن. ئاچقۇچ كىرگۈزۈپ ئاندىن سىناڭ.');
        return;
      }

      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openRouterKey: openRouterKey.trim(),
          geminiKey: geminiKey.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTestResult(`❌ سىناق مەغلۇپ بولدى: ${data.error || 'Server error'}`);
        return;
      }

      const results = [];
      if (data.openRouter) {
        results.push(data.openRouter.ok ? `✅ ${data.openRouter.message}` : `❌ ${data.openRouter.message}`);
      }
      if (data.gemini) {
        results.push(data.gemini.ok ? `✅ ${data.gemini.message}` : `❌ ${data.gemini.message}`);
      }

      setTestResult(results.join(' | ') || '✅ سىناق تاماملاندى.');
    } catch (e: any) {
      setTestResult(`❌ سىناق مەغلۇپ بولدى: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleResetDefaults = () => {
    setChatModel('google/gemini-2.5-flash');
    setTranslateModel('google/gemini-2.5-flash');
    setImageModel('black-forest-labs/flux-1-schnell');
    setTtsModel('openai/tts-1');
    setVideoModel('google/gemini-2.5-flash');
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">كىملىك تەكشۈرۈلۈۋاتىدۇ...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0f121a] border border-rose-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-pink-500" />
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/30 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">تەڭشەكلەرنى پەقەت باشقۇرغۇچى ئۆزگەرتەلەيدۇ</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              API ئاچقۇچى ۋە سىستېما تەڭشەكلىرى مەركىزىي ئورگان باشقۇرغۇچىسى (<span className="font-mono text-indigo-400">yulgun353@gmail.com</span>) تەرىپىدىن بىردەك قوغدىلىدۇ ۋە باشقۇرۇلىدۇ. ئادەتتىكى ئەزالارنىڭ بۇ مەزمۇنلارنى كۆرۈش ياكى ئۆزگەرتىش ھوقۇقى چەكلەنگەن.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-slate-800 dark:text-white font-bold text-xs transition"
            >
              باش بەتكە قايتىش
            </Link>
            {!user && (
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition"
              >
                باشقۇرغۇچى سۈپىتىدە كىرىش
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Title */}
      <div className="flex items-center justify-between p-5 rounded-3xl tech-card border border-white/[0.08] shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t.settingsTitle}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t.settingsSubtitle}</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{t.settingsSaved}</span>
          </div>
        )}
      </div>

      {/* Supabase Cloud Sync Card */}
      {user ? (
        <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Supabase بۇلۇت ماس قەدەملەش قوزغىتىلدى</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold">
                  ھېسابات ئۇلاندى
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                ھېسابات: <strong className="text-emerald-300 font-mono">{user.email}</strong>. ساقلىغان بارلىق API ئاچقۇچلىرىڭىز ۋە مودېل تەڭشەكلىرىڭىز بىخەتەر بۇلۇتتا ساقلىنىۋاتىدۇ.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Google (Gmail) بىلەن كىرىپ، ئاچقۇچلارنى بۇلۇتقا ساقلاڭ
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                كىرسىڭىز، API ئاچقۇچلىرىڭىز ۋە سۈنئىي ئەقىل خاتىرىلىرىڭىز مەڭگۈ يوقالمايدۇ، بارلىق كومپيۇتېر ۋە تېلېفونىڭىزدا ئورتاق ئىشلىتىلىدۇ.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md transition hover:scale-[1.02]"
          >
            Google / ئېلخەت بىلەن كىرىش
          </button>
        </div>
      )}

      {/* Theme Selection Section */}
      <div className="p-6 rounded-3xl tech-card border border-white/[0.08] space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>كۆرۈنمە يۈز تېمىلىرى (Theme System - 4 خىل ئۇسلۇب)</span>
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">1-CLICK INSTANT SWITCH</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'dark' as AppTheme,
              name: 'قاراڭغۇ كىبېر (Cyber Dark)',
              desc: 'كلاسسىك قارا، كىبېر نۇر ۋە تېخنىكىلىق كەيپىيات',
              icon: Moon,
              bgPreview: 'bg-[#08090d] border-indigo-500/30 text-white',
              accent: 'border-indigo-500 text-indigo-400',
            },
            {
              id: 'light' as AppTheme,
              name: 'يۇمشاق كۈندۈز (Soft Light)',
              desc: 'كۆزگە راھەت كۈمۈش-كۈلرەڭ، كۆزنى قاقتۇرمايدىغان يورۇق ئاق',
              icon: Sun,
              bgPreview: 'bg-[#edf2f7] border-slate-300 text-slate-800',
              accent: 'border-amber-500 text-amber-500',
            },
            {
              id: 'midnight' as AppTheme,
              name: 'تۈن كۆكى (Midnight Navy)',
              desc: 'چوڭقۇر ئوكيان كۆكى، كۆك نېئون ۋە خرۇستال سايە',
              icon: Sparkles,
              bgPreview: 'bg-[#070d19] border-cyan-500/30 text-white',
              accent: 'border-cyan-500 text-cyan-400',
            },
            {
              id: 'warm' as AppTheme,
              name: 'ئىللىق قەغەز (Warm Eye-Care)',
              desc: 'كىتاب قەغىزى ئۇسلۇبى، كۆزنى چارچاتمايدىغان قەدىمىي سارغۇچ',
              icon: Sunset,
              bgPreview: 'bg-[#f7f3ec] border-amber-200 text-amber-950',
              accent: 'border-orange-500 text-orange-500',
            },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                className={`p-4 rounded-2xl border text-start transition-all relative group flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10 bg-indigo-500/[0.04]'
                    : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] bg-slate-50/50 dark:bg-white/[0.02]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${item.bgPreview} border shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 tech-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-400">ID: {item.id.toUpperCase()}</span>
                  <span className={`font-semibold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                    {isSelected ? 'قوزغىتىلغان ✓' : 'تاللاش'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* App Version Control Card */}
      <div className="p-6 rounded-3xl tech-card border border-white/[0.08] space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>ئەپ نەشرى ۋە كونترول ھالىتى (App Version & Update Control)</span>
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            v1.0.0 (Build 100)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 tech-pulse" />
              <h3 className="text-xs font-bold text-white">رەسمىي ئالىي ئەپ نەشرى 1.0.0 ئىشقا كىرىشتۈرۈلدى</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              سۇپىدا مەجبۇرىي ئاپتوماتىك يېڭىلاش ھالىتى تەستىقلانغان. يېڭى نەشر تارقىتىلغان ھامان 360 گىرادۇسلۇق ئىلگىرىلەش كۆرسەتكۈچى بىلەن ئەپ ئىچىدىن بىۋاسىتە يېڭىلىنىدۇ.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <a
              href="/uyghur-ai-v1.0.0.apk"
              download="uyghur-ai-v1.0.0.apk"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
            >
              <span>APK چۈشۈرۈش (9.2MB)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="/version.json"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>نەشىر ھۆججىتى (JSON)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* API Keys Configuration */}
      <div className="p-6 rounded-3xl tech-card border border-white/[0.08] space-y-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>{t.apiKeysSection}</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">ENCRYPTED: LOCAL STORAGE ONLY</span>
        </div>

        {/* Duplicate Warning */}
        {openRouterKey && geminiKey && openRouterKey === geminiKey && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>دىققەت:</strong> ھەر ئىككى كۆزنەككە ئوخشاش بىر ئاچقۇچ كىرىپ قاپتۇ! OpenRouter ئاچقۇچى <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-amber-300">sk-or-v1-...</code> بىلەن باشلىنىدۇ، Gemini ئاچقۇچى بولسا <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-blue-300">AQ...</code> ياكى <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-blue-300">AIza...</code> بىلەن باشلىنىدۇ.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpenRouterKey('')}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-200 transition"
            >
              OpenRouter نى بوشىتىش
            </button>
          </div>
        )}

        {/* OpenRouter Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <label className="flex items-center gap-1.5">
              <span>{t.openRouterKeyLabel}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                OpenRouter
              </span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteOpenRouter}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-normal hover:underline"
                title="چاپلاش تاختىسىدىن چاپلاش"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>چاپلاش</span>
              </button>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 text-[11px] font-normal ms-2"
              >
                <span>{t.getKeyFromSite}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="relative">
            <input
              id="token_openrouter_main"
              name="token_openrouter_main"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              type="text"
              style={{ WebkitTextSecurity: showOpenRouterKey ? 'none' : 'disc' } as React.CSSProperties}
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-[#0d0f17] border border-white/[0.1] rounded-xl px-4 py-2.5 pe-24 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
              dir="ltr"
            />
            <div className="absolute end-2.5 top-2 flex items-center gap-1.5 text-slate-400">
              {openRouterKey && (
                <button
                  type="button"
                  onClick={() => setOpenRouterKey('')}
                  className="p-1 hover:text-rose-400 hover:bg-white/[0.06] rounded-lg transition"
                  title="تازىلاش"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                className="p-1 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition"
                title={showOpenRouterKey ? 'يوشۇرۇش' : 'كۆرسىتىش'}
              >
                {showOpenRouterKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {openRouterKey && (openRouterKey.startsWith('AQ.') || openRouterKey.startsWith('AIza')) && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
              <span>⚠️ بۇ Google Gemini ئاچقۇچىغا ئوخشايدۇ! OpenRouter ئاچقۇچى چوقۇم <code className="font-mono bg-black/40 px-1 py-0.5 rounded">sk-or-v1-...</code> دەپ باشلىنىشى كېرەك.</span>
              <button
                type="button"
                onClick={() => setOpenRouterKey('')}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 rounded text-[11px] font-semibold text-amber-200"
              >
                تازىلاش
              </button>
            </div>
          )}
          {openRouterKey && !openRouterKey.startsWith('sk-') && !openRouterKey.startsWith('AQ.') && !openRouterKey.startsWith('AIza') && (
            <p className="text-[11px] text-amber-400">
              ⚠️ ئەسكەرتىش: OpenRouter ئاچقۇچى ئادەتتە <code className="font-mono">sk-or-v1-...</code> دەپ باشلىنىدۇ.
            </p>
          )}
          <p className="text-[11px] text-slate-400">{t.openRouterKeyHint}</p>
        </div>

        {/* Gemini Key */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <label className="flex items-center gap-1.5">
              <span>{t.geminiKeyLabel}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">
                Google AI Studio
              </span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteGemini}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-normal hover:underline"
                title="چاپلاش تاختىسىدىن چاپلاش"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>چاپلاش</span>
              </button>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 text-[11px] font-normal ms-2"
              >
                <span>{t.getKeyFromSite}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="relative">
            <input
              id="token_gemini_main"
              name="token_gemini_main"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              type="text"
              style={{ WebkitTextSecurity: showGeminiKey ? 'none' : 'disc' } as React.CSSProperties}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... ياكى AQ..."
              className="w-full bg-[#0d0f17] border border-white/[0.1] rounded-xl px-4 py-2.5 pe-24 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
              dir="ltr"
            />
            <div className="absolute end-2.5 top-2 flex items-center gap-1.5 text-slate-400">
              {geminiKey && (
                <button
                  type="button"
                  onClick={() => setGeminiKey('')}
                  className="p-1 hover:text-rose-400 hover:bg-white/[0.06] rounded-lg transition"
                  title="تازىلاش"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="p-1 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition"
                title={showGeminiKey ? 'يوشۇرۇش' : 'كۆرسىتىش'}
              >
                {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {geminiKey && geminiKey.startsWith('sk-') && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
              <span>⚠️ بۇ OpenRouter ئاچقۇچىغا ئوخشايدۇ! Google Gemini ئاچقۇچى ئادەتتە <code className="font-mono bg-black/40 px-1 py-0.5 rounded">AIza...</code> ياكى <code className="font-mono bg-black/40 px-1 py-0.5 rounded">AQ...</code> دەپ باشلىنىدۇ.</span>
              <button
                type="button"
                onClick={() => setGeminiKey('')}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 rounded text-[11px] font-semibold text-amber-200"
              >
                تازىلاش
              </button>
            </div>
          )}
          <p className="text-[11px] text-slate-400">{t.geminiKeyHint}</p>
        </div>

        {/* Test connection row */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06]">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.08] hover:border-indigo-500/40 transition flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{testing ? t.testingConnection : t.testConnection}</span>
          </button>

          {testResult && (
            <span className="text-xs font-medium animate-fade-in">
              {testResult}
            </span>
          )}
        </div>
      </div>

      {/* Independent Model Selection Per Feature */}
      <div className="p-6 rounded-3xl tech-card border border-white/[0.08] space-y-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>{t.modelDefaultsSection}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t.modelDefaultsDesc}
            </p>
          </div>

          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.resetDefaults}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Chatbot Model */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:border-indigo-500/30 transition">
            <SearchableModelSelect
              label={t.modelChatLabel}
              value={chatModel}
              onChange={(id) => setChatModel(id)}
              categoryHint="chat"
            />
          </div>

          {/* Translation Model */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:border-emerald-500/30 transition">
            <SearchableModelSelect
              label={t.modelTranslateLabel}
              value={translateModel}
              onChange={(id) => setTranslateModel(id)}
              categoryHint="translate"
            />
          </div>

          {/* Image Model */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:border-rose-500/30 transition">
            <SearchableModelSelect
              label={t.modelImageLabel}
              value={imageModel}
              onChange={(id) => setImageModel(id)}
              categoryHint="image"
            />
          </div>

          {/* TTS Model */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:border-amber-500/30 transition">
            <SearchableModelSelect
              label={t.modelTtsLabel}
              value={ttsModel}
              onChange={(id) => setTtsModel(id)}
              categoryHint="tts"
            />
          </div>

          {/* Video Model */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 md:col-span-2 hover:border-purple-500/30 transition">
            <SearchableModelSelect
              label={t.modelVideoLabel}
              value={videoModel}
              onChange={(id) => setVideoModel(id)}
              categoryHint="video"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all duration-200 border border-indigo-400/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Check className="w-4 h-4" />
          <span>{t.save}</span>
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
