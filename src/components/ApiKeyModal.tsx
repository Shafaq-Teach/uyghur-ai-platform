'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { KeyRound, Eye, EyeOff, ExternalLink, Check, X, ShieldAlert, Sparkles, ClipboardPaste, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose, initialMessage }) => {
  const { t, isRtl, settings, updateSettings } = useApp();
  const [openRouterKey, setOpenRouterKey] = useState(settings.openRouterApiKey);
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey);
  const [showOpenRouter, setShowOpenRouter] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [saved, setSaved] = useState(false);

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

  useEffect(() => {
    setOpenRouterKey(settings.openRouterApiKey);
    setGeminiKey(settings.geminiApiKey);
  }, [settings.openRouterApiKey, settings.geminiApiKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      openRouterApiKey: openRouterKey.trim(),
      geminiApiKey: geminiKey.trim(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">API ئاچقۇچىنى تەڭشەش</h3>
              <p className="text-xs text-slate-400">OpenRouter ياكى Gemini ئاچقۇچىڭىزنى چاپلاڭ</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {initialMessage && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{initialMessage}</span>
            </div>
          )}

          {/* Duplicate Warning */}
          {openRouterKey && geminiKey && openRouterKey === geminiKey && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>ھەر ئىككىسىگە ئوخشاش بىر ئاچقۇچ كىرىپ قاپتۇ! OpenRouter ئاچقۇچى sk-or-v1- بولىدۇ.</span>
              </div>
              <button
                type="button"
                onClick={() => setOpenRouterKey('')}
                className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 rounded text-[11px] font-semibold text-rose-200"
              >
                OpenRouter نى بوشىتىش
              </button>
            </div>
          )}

          {/* OpenRouter Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <label className="flex items-center gap-1.5">
                <span>OpenRouter API Key</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  تەۋسىيەلىك
                </span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteOpenRouter}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-normal hover:underline"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>چاپلاش</span>
                </button>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-normal ms-1"
                >
                  <span>ئاچقۇچ ئېلىش</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="relative">
              <input
                id="modal_token_openrouter"
                name="modal_token_openrouter"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                type="text"
                style={{ WebkitTextSecurity: showOpenRouter ? 'none' : 'disc' } as React.CSSProperties}
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 pe-20 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                dir="ltr"
              />
              <div className="absolute end-2 top-2 flex items-center gap-1 text-slate-400">
                {openRouterKey && (
                  <button
                    type="button"
                    onClick={() => setOpenRouterKey('')}
                    className="p-1 hover:text-rose-400 hover:bg-slate-700 rounded transition"
                    title="تازىلاش"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowOpenRouter(!showOpenRouter)}
                  className="p-1 hover:text-slate-200 hover:bg-slate-700 rounded transition"
                  title={showOpenRouter ? 'يوشۇرۇش' : 'كۆرسىتىش'}
                >
                  {showOpenRouter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {openRouterKey && (openRouterKey.startsWith('AQ.') || openRouterKey.startsWith('AIza')) && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between gap-1">
                <span>⚠️ بۇ Google Gemini ئاچقۇچى. OpenRouter غا <code className="font-mono">sk-or-v1-...</code> ئاچقۇچى كېرىشى كېرەك.</span>
                <button
                  type="button"
                  onClick={() => setOpenRouterKey('')}
                  className="px-1.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 rounded text-[10px] font-semibold text-amber-200"
                >
                  تازىلاش
                </button>
              </div>
            )}
            {openRouterKey && !openRouterKey.startsWith('sk-') && !openRouterKey.startsWith('AQ.') && !openRouterKey.startsWith('AIza') && (
              <p className="text-[10px] text-amber-400">
                ⚠️ ئەسكەرتىش: OpenRouter ئاچقۇچى ئادەتتە <code className="font-mono">sk-or-v1-...</code> دەپ باشلىنىدۇ.
              </p>
            )}
            <p className="text-[10px] text-slate-400">
              openrouter.ai/keys ئادرېسىدىن يېڭى ئاچقۇچ (Create Key) قۇرۇپ بۇ يەرگە چاپلاڭ.
            </p>
          </div>

          {/* Gemini Key */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <label>Google Gemini API Key</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteGemini}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-normal hover:underline"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>چاپلاش</span>
                </button>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-normal ms-1"
                >
                  <span>ئاچقۇچ ئېلىش</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="relative">
              <input
                id="modal_token_gemini"
                name="modal_token_gemini"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                type="text"
                style={{ WebkitTextSecurity: showGemini ? 'none' : 'disc' } as React.CSSProperties}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... ياكى AQ..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 pe-20 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                dir="ltr"
              />
              <div className="absolute end-2 top-2 flex items-center gap-1 text-slate-400">
                {geminiKey && (
                  <button
                    type="button"
                    onClick={() => setGeminiKey('')}
                    className="p-1 hover:text-rose-400 hover:bg-slate-700 rounded transition"
                    title="تازىلاش"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="p-1 hover:text-slate-200 hover:bg-slate-700 rounded transition"
                  title={showGemini ? 'يوشۇرۇش' : 'كۆرسىتىش'}
                >
                  {showGemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            {geminiKey && geminiKey.startsWith('sk-') && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between gap-1">
                <span>⚠️ بۇ OpenRouter ئاچقۇچىغا ئوخشايدۇ! Gemini ئاچقۇچى <code className="font-mono">AIza...</code> ياكى <code className="font-mono">AQ...</code> دەپ باشلىنىدۇ.</span>
                <button
                  type="button"
                  onClick={() => setGeminiKey('')}
                  className="px-1.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 rounded text-[10px] font-semibold text-amber-200"
                >
                  تازىلاش
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenRouterKey('');
                  setGeminiKey('');
                  updateSettings({
                    openRouterApiKey: '',
                    geminiApiKey: '',
                  });
                  setSaved(true);
                  setTimeout(() => {
                    setSaved(false);
                    onClose();
                  }, 800);
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 transition flex items-center gap-1.5"
                title="سۇپابەستىكى مەركىزىي ئاچقۇچ ئارقىلىق ئىشلىتىش"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>سۇپابەس مەركىزىي ئاچقۇچىنى ئىشلىتىش</span>
              </button>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
              <span>{saved ? 'ساقلاندى!' : 'ساقلاش ۋە قوزغىتىش'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
