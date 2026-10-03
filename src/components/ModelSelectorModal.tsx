'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { FeatureModels, AIProvider } from '@/types';
import { CHAT_MODELS, TRANSLATE_MODELS, IMAGE_MODELS, TTS_MODELS, VIDEO_MODELS } from '@/lib/models-data';
import { X, Check, Cpu, Sparkles, Search, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  feature: keyof FeatureModels;
}

interface ModelItem {
  id: string;
  name: string;
  provider: AIProvider;
  description?: string;
  isFree?: boolean;
}

let cachedGlobalModels: ModelItem[] | null = null;

export const ModelSelectorModal: React.FC<Props> = ({ isOpen, onClose, feature }) => {
  const { t, isRtl, settings, setModelForFeature } = useApp();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'gemini' | 'openrouter' | 'free'>('recommended');
  const [customModelId, setCustomModelId] = useState('');
  const [customProvider, setCustomProvider] = useState<AIProvider>('openrouter');
  const [allModels, setAllModels] = useState<ModelItem[]>(cachedGlobalModels || []);
  const [loading, setLoading] = useState(false);

  const currentModel = settings.featureModels[feature];

  const getRecommendedModels = () => {
    switch (feature) {
      case 'chat': return CHAT_MODELS;
      case 'translate': return TRANSLATE_MODELS;
      case 'image': return IMAGE_MODELS;
      case 'tts': return TTS_MODELS;
      case 'video': return VIDEO_MODELS;
      default: return CHAT_MODELS;
    }
  };

  const recommended = getRecommendedModels();

  // Load all models on open
  useEffect(() => {
    if (!isOpen) return;
    if (cachedGlobalModels && cachedGlobalModels.length > 0) {
      setAllModels(cachedGlobalModels);
      return;
    }

    setLoading(true);
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.models)) {
          cachedGlobalModels = data.models;
          setAllModels(data.models);
        }
      })
      .catch((err) => console.error('Failed to load models:', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const displayedModels = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (activeTab === 'recommended' && !q) {
      return recommended;
    }

    const pool = activeTab === 'recommended' ? recommended : (allModels.length > 0 ? allModels : recommended);

    return pool.filter((m) => {
      if (activeTab === 'gemini') {
        if (m.provider !== 'gemini' && !m.id.includes('gemini')) return false;
      } else if (activeTab === 'openrouter') {
        if (m.provider !== 'openrouter') return false;
      } else if (activeTab === 'free') {
        if (!m.isFree && !m.id.includes(':free')) return false;
      }

      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
      );
    });
  }, [allModels, recommended, search, activeTab]);

  if (!isOpen) return null;

  const handleSelect = (modelId: string, provider: AIProvider) => {
    setModelForFeature(feature, modelId, provider);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customModelId.trim()) {
      setModelForFeature(feature, customModelId.trim(), customProvider);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl tech-card border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">{t.changeModel}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {feature.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.currentModel || 'ھازىرقى مودېل'}: <span className="text-indigo-400 font-mono font-semibold">{currentModel}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-white/[0.06] bg-black/20 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchModelPlaceholder}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2 px-3 ps-10 pe-9 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              dir="ltr"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute end-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar text-xs">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition ${
                activeTab === 'recommended'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.tabRecommended} ({recommended.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.tabAllModels} ({allModels.length || '470+'})
            </button>
            <button
              onClick={() => setActiveTab('gemini')}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition ${
                activeTab === 'gemini'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.tabGemini}
            </button>
            <button
              onClick={() => setActiveTab('openrouter')}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition ${
                activeTab === 'openrouter'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.tabOpenRouter}
            </button>
            <button
              onClick={() => setActiveTab('free')}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition ${
                activeTab === 'free'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.tabFree}
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>{t.modelsLoading}</span>
            </div>
          ) : displayedModels.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-slate-400">«{search}» {t.noModelsFound}.</p>
              {search.trim() && (
                <button
                  onClick={() => {
                    const provider: AIProvider = (search.includes('gemini') && !search.includes('google/')) ? 'gemini' : 'openrouter';
                    handleSelect(search.trim(), provider);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  {t.selectThisCode}: {search.trim()}
                </button>
              )}
            </div>
          ) : (
            displayedModels.slice(0, 150).map((m) => {
              const isSelected = currentModel === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelect(m.id, m.provider)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-1 overflow-hidden flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-200">{m.name}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                          m.provider === 'openrouter'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {m.provider === 'openrouter' ? 'OpenRouter' : 'Gemini'}
                      </span>
                      {m.isFree && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate" dir="ltr">{m.id}</p>
                    {m.description && <p className="text-xs text-slate-400 line-clamp-1">{m.description}</p>}
                  </div>
                  {isSelected && (
                    <div className="p-1 rounded-full bg-indigo-500 text-white shrink-0 mt-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {displayedModels.length > 150 && (
            <div className="text-center py-2 text-[11px] text-slate-500">
              +{displayedModels.length - 150} {t.moreModelsHint}
            </div>
          )}

          {/* Custom Model Form */}
          <div className="pt-3 mt-3 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.customModelInput}</span>
            </h4>
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. qwen/qwen-2.5-72b-instruct"
                value={customModelId}
                onChange={(e) => setCustomModelId(e.target.value)}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                dir="ltr"
              />
              <select
                value={customProvider}
                onChange={(e) => setCustomProvider(e.target.value as AIProvider)}
                className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="openrouter">OpenRouter</option>
                <option value="gemini">Gemini</option>
              </select>
              <button
                type="submit"
                disabled={!customModelId.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition"
              >
                {t.save}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
          <span>{t.totalOptions} {allModels.length > 0 ? allModels.length : recommended.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
