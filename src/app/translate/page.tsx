'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ModelBar } from '@/components/ModelBar';
import { apiFetch } from '@/lib/apiClient';
import { FeatureHistorySection } from '@/components/FeatureHistorySection';
import { 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Volume2, 
  Sparkles, 
  RefreshCw,
  SlidersHorizontal,
  BookmarkPlus
} from 'lucide-react';

export default function TranslatePage() {
  const { t, isRtl, settings, addHistoryItem, requireAuth, user, updateUserCoins } = useApp();
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [role, setRole] = useState('standard');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  const langOptions = [
    { id: 'ug', label: t.transLangUg, dir: 'rtl' },
    { id: 'en', label: t.transLangEn, dir: 'ltr' },
    { id: 'tr', label: t.transLangTr, dir: 'ltr' },
    { id: 'ar', label: t.transLangAr, dir: 'rtl' },
  ];

  const roles = [
    { id: 'standard', name: t.roleStandard },
    { id: 'formal', name: t.roleFormal },
    { id: 'literary', name: t.roleLiterary },
    { id: 'academic', name: t.roleAcademic },
    { id: 'marketing', name: t.roleMarketing },
    { id: 'simple', name: t.roleSimple },
    { id: 'conversational', name: t.roleConversational },
  ];

  const getDir = (langCode: string, fallbackDir: 'rtl' | 'ltr') => {
    if (langCode === 'ug' || langCode === 'ar') return 'rtl';
    if (langCode === 'en' || langCode === 'tr') return 'ltr';
    return fallbackDir;
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') {
      setSourceLang(targetLang);
      setTargetLang('ug');
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
    const prevSourceText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(prevSourceText);
  };

  const handleTranslate = async () => {
    if (!requireAuth()) return;
    if (!sourceText.trim() || loading) return;

    const hasOwnKey = Boolean((settings.openRouterApiKey || settings.geminiApiKey || '').trim());
    if (!hasOwnKey && (user?.coins ?? 0) < 15) {
      setTranslatedText(`تەڭگىڭىز يېتەرلىك ئەمەس! تەرجىمىگە 15 تەڭگە كېتىدۇ، سىزدە پەقەت ${user?.coins ?? 0} تەڭگە قالدى.`);
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          text: sourceText.trim(),
          sourceLang,
          targetLang,
          role,
          customInstruction: customPrompt,
          model: settings.featureModels.translate,
          provider: settings.featureProviders.translate,
          openRouterApiKey: settings.openRouterApiKey,
          geminiApiKey: settings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'تەرجىمە قىلىش مەغلۇپ بولدى');

      if (typeof data.remainingCoins === 'number') {
        updateUserCoins(data.remainingCoins);
      }

      const result = data.translation || '';
      setTranslatedText(result);

      // Save to history
      addHistoryItem({
        type: 'translate',
        title: `${sourceLang.toUpperCase()} → ${targetLang.toUpperCase()}: ${sourceText.slice(0, 25)}`,
        preview: result.slice(0, 60),
        data: {
          source: sourceText,
          translated: result,
          sourceLang,
          targetLang,
          role,
          model: settings.featureModels.translate,
        },
      });
    } catch (err: any) {
      setTranslatedText('ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, langCode: string) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (langCode === 'en') utterance.lang = 'en-US';
      if (langCode === 'tr') utterance.lang = 'tr-TR';
      if (langCode === 'ar') utterance.lang = 'ar-SA';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Model Selector Bar */}
      <ModelBar feature="translate" featureTitle={t.fTransTitle} />

      {/* Tone / Role Selector */}
      <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-3.5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">{t.transRole}</span>
          </div>
          <button
            onClick={() => setShowCustomPrompt(!showCustomPrompt)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            {showCustomPrompt ? t.customInstructionHide : '+ ' + t.transCustomPrompt}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200 ${
                role === r.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-400/40'
                  : 'bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {showCustomPrompt && (
          <div className="pt-2 animate-fade-in">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={t.customInstructionPlaceholder}
              className="w-full bg-[#0d0f17] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Language Header Bar */}
      <div className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/[0.08] p-3 rounded-2xl backdrop-blur-md">
        {/* Source Language */}
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="bg-[#0f121c] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="auto">🌐 {t.transSourceAuto}</option>
          {langOptions.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>

        {/* Swap button */}
        <button
          onClick={handleSwap}
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] hover:border-emerald-500/40 transition shadow-sm hover:scale-105 active:scale-95"
          title={t.swapLanguages}
        >
          <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Target Language */}
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-[#0f121c] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          {langOptions.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dual Textboxes (Side-by-side or stacked on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Box */}
        <div className="flex flex-col rounded-3xl tech-card border border-white/[0.08] p-5 space-y-3 focus-within:border-emerald-500/60 transition shadow-lg">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            dir={getDir(sourceLang, isRtl ? 'rtl' : 'ltr')}
            rows={9}
            placeholder={t.transInputPlaceholder}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm leading-relaxed resize-none focus:outline-none custom-scrollbar"
          />
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs text-slate-400">
            <span className="font-mono text-[11px]">{sourceText.length} {t.charCount}</span>
            {sourceText && (
              <button
                onClick={() => setSourceText('')}
                className="hover:text-rose-400 transition"
              >
                {t.clear}
              </button>
            )}
          </div>
        </div>

        {/* Output Box */}
        <div className="flex flex-col rounded-3xl tech-card border border-white/[0.08] p-5 space-y-3 relative shadow-lg">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <span>{t.loading}</span>
            </div>
          ) : (
            <div
              dir={getDir(targetLang, 'ltr')}
              className={`flex-1 text-sm leading-relaxed whitespace-pre-wrap select-text custom-scrollbar overflow-y-auto min-h-[216px] ${
                translatedText ? 'text-slate-100' : 'text-slate-500 italic'
              }`}
            >
              {translatedText || t.transOutputPlaceholder}
            </div>
          )}

          {/* Action buttons on translated output */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!translatedText}
                className="flex items-center gap-1.5 hover:text-white disabled:opacity-40 transition"
                title={t.copy}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : t.copy}</span>
              </button>

              <button
                onClick={() => handleSpeak(translatedText, targetLang)}
                disabled={!translatedText}
                className="flex items-center gap-1.5 hover:text-emerald-400 disabled:opacity-40 transition ms-2"
                title={t.readAloud}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.readAloud}</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
              {settings.featureModels.translate}
            </span>
          </div>
        </div>
      </div>

      {/* Main Translate Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || loading}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-sm transition-all duration-200 shadow-xl shadow-emerald-600/25 border border-emerald-400/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{t.transButton}</span>
        </button>
      </div>

      {/* 1-Click Collapsible Saved Translation History */}
      <FeatureHistorySection 
        feature="translate" 
        onReuse={(item) => {
          setSourceText(item.data?.source || item.title || '');
          if (item.data?.translated) setTranslatedText(item.data.translated);
          if (item.data?.sourceLang) setSourceLang(item.data.sourceLang);
          if (item.data?.targetLang) setTargetLang(item.data.targetLang);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
