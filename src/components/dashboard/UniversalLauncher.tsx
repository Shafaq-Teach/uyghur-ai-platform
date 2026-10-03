'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Sparkles, 
  MessageSquare, 
  Languages, 
  Image as ImageIcon, 
  Volume2, 
  Video, 
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  X
} from 'lucide-react';

export const UniversalLauncher: React.FC = () => {
  const { t, isRtl } = useApp();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');

  const suggestions = [
    t.promptSuggestion1,
    t.promptSuggestion2,
    t.promptSuggestion3,
    t.promptSuggestion4,
  ];

  const handleLaunch = (targetPath: string, paramName: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      router.push(targetPath);
      return;
    }
    const encoded = encodeURIComponent(trimmed);
    router.push(`${targetPath}?${paramName}=${encoded}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleLaunch('/chat', 'prompt');
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="relative rounded-3xl tech-card border border-slate-200 dark:border-white/[0.1] p-5 sm:p-7 shadow-2xl backdrop-blur-2xl overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-40 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-40 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Launcher Header Badge */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {t.dashTitle}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.dashSubtitle}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 tech-pulse" />
          <span>OMNI-ENGINE // LIVE</span>
        </div>
      </div>

      {/* Main Omnibox Input Area */}
      <div className="relative rounded-2xl bg-slate-50/90 dark:bg-[#0c0e17] border border-slate-200 dark:border-white/[0.08] focus-within:border-indigo-500 dark:focus-within:border-indigo-500/80 transition-all p-3 shadow-inner">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.omniPlaceholder}
          rows={3}
          className="w-full bg-transparent resize-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed custom-scrollbar"
          dir={isRtl ? 'rtl' : 'ltr'}
        />

        {/* Input Bottom Action Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-white/[0.05] mt-1 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            {prompt.length > 0 && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition px-1.5 py-0.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.06]"
              >
                <X className="w-3 h-3" />
                <span>{t.clear}</span>
              </button>
            )}
            <span className="font-mono text-[10px]">{prompt.length} {t.charCount}</span>
          </div>

          <div className="text-[10px] text-slate-600 dark:text-slate-300 hidden sm:block">
            <span>Ctrl + Enter ئارقىلىق تېز پاراڭ باشلاش</span>
          </div>
        </div>
      </div>

      {/* 5-Directional Engine Dispatch Buttons */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
        {/* 1. Chat */}
        <button
          type="button"
          onClick={() => handleLaunch('/chat', 'prompt')}
          className="group flex items-center justify-between sm:justify-center gap-2 p-2.5 sm:py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-600 transition-all duration-200 shadow-sm hover:shadow-indigo-500/20"
        >
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition" />
            <span className="font-bold text-xs">{t.omniActionChat}</span>
          </div>
          <ArrowIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 2. Translate */}
        <button
          type="button"
          onClick={() => handleLaunch('/translate', 'text')}
          className="group flex items-center justify-between sm:justify-center gap-2 p-2.5 sm:py-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-600 text-cyan-800 dark:text-cyan-300 hover:text-white border border-cyan-200 dark:border-cyan-800/50 hover:border-cyan-600 transition-all duration-200 shadow-sm hover:shadow-cyan-500/20"
        >
          <div className="flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:text-white transition" />
            <span className="font-bold text-xs">{t.omniActionTranslate}</span>
          </div>
          <ArrowIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 3. Image */}
        <button
          type="button"
          onClick={() => handleLaunch('/image', 'prompt')}
          className="group flex items-center justify-between sm:justify-center gap-2 p-2.5 sm:py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white border border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-600 transition-all duration-200 shadow-sm hover:shadow-emerald-500/20"
        >
          <div className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition" />
            <span className="font-bold text-xs">{t.omniActionImage}</span>
          </div>
          <ArrowIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 4. TTS */}
        <button
          type="button"
          onClick={() => handleLaunch('/tts', 'text')}
          className="group flex items-center justify-between sm:justify-center gap-2 p-2.5 sm:py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-600 text-amber-800 dark:text-amber-300 hover:text-white border border-amber-200 dark:border-amber-800/50 hover:border-amber-600 transition-all duration-200 shadow-sm hover:shadow-amber-500/20"
        >
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:text-white transition" />
            <span className="font-bold text-xs">{t.omniActionTts}</span>
          </div>
          <ArrowIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 5. Video */}
        <button
          type="button"
          onClick={() => handleLaunch('/ad-video', 'concept')}
          className="col-span-2 sm:col-span-1 group flex items-center justify-between sm:justify-center gap-2 p-2.5 sm:py-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 text-purple-800 dark:text-purple-300 hover:text-white border border-purple-200 dark:border-purple-800/50 hover:border-purple-600 transition-all duration-200 shadow-sm hover:shadow-purple-500/20"
        >
          <div className="flex items-center gap-1.5">
            <Video className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:text-white transition" />
            <span className="font-bold text-xs">{t.omniActionVideo}</span>
          </div>
          <ArrowIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* Quick Prompt Suggestions / Chips */}
      <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-white/[0.06] flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 me-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.omniTips}</span>
        </div>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPrompt(s)}
            className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-white/[0.06] hover:border-indigo-300 dark:hover:border-indigo-500/40 transition truncate max-w-[280px]"
            title={s}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
