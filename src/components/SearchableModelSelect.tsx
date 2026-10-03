'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Check, 
  ChevronDown, 
  X, 
  Sparkles, 
  Cpu, 
  Zap, 
  RefreshCw,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { AIProvider } from '@/types';
import { useApp } from '@/context/AppContext';

export interface ModelItem {
  id: string;
  name: string;
  provider: AIProvider;
  description?: string;
  context_length?: number;
  isFree?: boolean;
}

interface Props {
  value: string;
  onChange: (modelId: string, provider: AIProvider) => void;
  label?: string;
  placeholder?: string;
  defaultProvider?: AIProvider;
  categoryHint?: 'chat' | 'translate' | 'image' | 'tts' | 'video';
}

let cachedGlobalModels: ModelItem[] | null = null;

export const SearchableModelSelect: React.FC<Props> = ({
  value,
  onChange,
  label,
  placeholder,
  defaultProvider,
  categoryHint,
}) => {
  const { t, lang } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'gemini' | 'openrouter' | 'free' | 'image' | 'reasoning'>('all');
  const [models, setModels] = useState<ModelItem[]>(cachedGlobalModels || []);
  const [loading, setLoading] = useState(!cachedGlobalModels);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch full live models list
  useEffect(() => {
    if (cachedGlobalModels && cachedGlobalModels.length > 0) {
      setModels(cachedGlobalModels);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.models)) {
          cachedGlobalModels = data.models;
          setModels(data.models);
        }
      })
      .catch((err) => {
        console.error('Failed to load models:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Find currently selected model
  const selectedModel = useMemo(() => {
    return models.find((m) => m.id === value) || {
      id: value,
      name: value,
      provider: (value.includes('gemini') && !value.includes('google/')) ? 'gemini' : 'openrouter',
    };
  }, [models, value]);

  // Filter models based on search query and active tab
  const filteredModels = useMemo(() => {
    const q = search.toLowerCase().trim();

    return models.filter((m) => {
      // Tab filter
      if (activeTab === 'gemini') {
        const isGemini = m.provider === 'gemini' || m.id.toLowerCase().includes('gemini');
        if (!isGemini) return false;
      } else if (activeTab === 'openrouter') {
        if (m.provider !== 'openrouter') return false;
      } else if (activeTab === 'free') {
        if (!m.isFree && !m.id.includes(':free')) return false;
      } else if (activeTab === 'image') {
        const isImg = m.id.includes('flux') || m.id.includes('diffusion') || m.id.includes('imagen') || m.id.includes('recraft') || m.id.includes('vision');
        if (!isImg) return false;
      } else if (activeTab === 'reasoning') {
        const isReason = m.id.includes('r1') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('thinking') || m.id.includes('pro');
        if (!isReason) return false;
      }

      // Search query filter
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
      );
    });
  }, [models, search, activeTab]);

  const handleSelect = (model: ModelItem) => {
    onChange(model.id, model.provider);
    setIsOpen(false);
    setSearch('');
  };

  const handleSelectCustom = () => {
    if (!search.trim()) return;
    const customId = search.trim();
    const provider: AIProvider = (customId.includes('gemini') && !customId.includes('google/')) ? 'gemini' : 'openrouter';
    onChange(customId, provider);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-200 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-indigo-500/40 rounded-2xl px-3.5 py-2.5 text-start flex items-center justify-between gap-2 transition shadow-sm focus:outline-none focus:border-indigo-500"
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="truncate flex items-center gap-2">
            <span className="font-semibold text-xs text-white truncate">
              {selectedModel.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline truncate">
              ({selectedModel.id})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${
              selectedModel.provider === 'gemini'
                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
            }`}
          >
            {selectedModel.provider === 'gemini' ? 'Gemini' : 'OpenRouter'}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full min-w-[320px] sm:min-w-[420px] max-w-lg tech-card border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[460px] animate-fade-in backdrop-blur-2xl"
          style={{ right: 0 }}
        >
          {/* Search Box */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/90 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchModelPlaceholder}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2 px-3 ps-9 pe-8 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                dir="ltr"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute end-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabAllModels} ({models.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gemini')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'gemini'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabGemini}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('openrouter')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'openrouter'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabOpenRouter}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('free')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'free'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabFree}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('image')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'image'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabImage}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reasoning')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'reasoning'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabReasoning}
              </button>
            </div>
          </div>

          {/* Model List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar min-h-[220px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>{t.modelsLoading}</span>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  «{search}» {t.noModelsFound}.
                </p>
                {search.trim() && (
                  <button
                    type="button"
                    onClick={handleSelectCustom}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.selectThisCode}: «{search.trim()}»</span>
                  </button>
                )}
              </div>
            ) : (
              filteredModels.slice(0, 150).map((m) => {
                const isSelected = value === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelect(m)}
                    className={`p-2.5 rounded-xl cursor-pointer transition flex items-start justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/60 shadow-sm'
                        : 'hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-slate-200">
                          {m.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            m.provider === 'gemini'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {m.provider === 'gemini' ? 'Gemini' : 'OpenRouter'}
                        </span>
                        {m.isFree && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Free
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate" dir="ltr">
                        {m.id}
                      </p>
                      {m.description && (
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          {m.description}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-indigo-500 text-white shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {filteredModels.length > 150 && (
              <div className="text-center py-2 text-[11px] text-slate-500">
                +{filteredModels.length - 150} {t.moreModelsHint}
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="p-2.5 px-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-400">
            <span>{t.totalModels}: {models.length}</span>
            {search.trim() && (
              <button
                type="button"
                onClick={handleSelectCustom}
                className="text-indigo-400 hover:underline font-semibold"
              >
                {t.selectThisCode}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
