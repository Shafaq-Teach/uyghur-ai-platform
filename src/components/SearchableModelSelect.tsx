'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Check, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
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
  const [activeTab, setActiveTab] = useState<'all' | 'gemini' | 'openrouter' | 'free' | 'image' | 'reasoning' | 'tts'>('all');
  const [models, setModels] = useState<ModelItem[]>(cachedGlobalModels || []);
  const [loading, setLoading] = useState(!cachedGlobalModels);
  const [alignH, setAlignH] = useState<'right' | 'left'>('right');
  const [alignV, setAlignV] = useState<'bottom' | 'top'>('bottom');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const SPECIAL_MODELS: ModelItem[] = [
    {
      id: 'openai/tts-1',
      name: 'OpenAI TTS-1 (تەبىئىي ئاۋاز)',
      provider: 'openrouter',
      description: 'Standard high-speed natural speech synthesis',
    },
    {
      id: 'openai/tts-1-hd',
      name: 'OpenAI TTS-1 HD (ستۇدىيە سۈپىتىدە ئاۋاز)',
      provider: 'openrouter',
      description: 'Studio quality speech synthesizer model',
    },
    {
      id: 'black-forest-labs/flux-1-schnell',
      name: 'FLUX-1 Schnell (Black Forest Labs)',
      provider: 'openrouter',
      description: 'Ultra fast 4-step high resolution image generation',
    },
    {
      id: 'black-forest-labs/flux-1-dev',
      name: 'FLUX-1 Dev (Black Forest Labs)',
      provider: 'openrouter',
      description: 'Elite open weights image generation model',
    },
    {
      id: 'stabilityai/stable-diffusion-3-medium',
      name: 'Stable Diffusion 3 Medium',
      provider: 'openrouter',
      description: 'Multimodal diffusion model for photo generation',
    },
  ];

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
          // Merge unique special models
          const combined = [...SPECIAL_MODELS];
          data.models.forEach((m: any) => {
            if (!combined.some((x) => x.id === m.id)) {
              combined.push(m);
            }
          });
          cachedGlobalModels = combined;
          setModels(combined);
        }
      })
      .catch((err) => {
        console.error('Failed to load models:', err);
        setModels(SPECIAL_MODELS);
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

  // Dynamically calculate dropdown position relative to screen bounds
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // In RTL or narrow screens, if right-aligned panel overflows left side of window:
      if (rect.right - 460 < 16) {
        setAlignH('left');
      } else {
        setAlignH('right');
      }

      // If space below trigger is constrained, flip dropdown to show above
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 420 && spaceAbove > spaceBelow) {
        setAlignV('top');
      } else {
        setAlignV('bottom');
      }
    }
  }, [isOpen]);

  // Tab scroll helper functions (smooth right/left sliding)
  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsRef.current) return;
    const offset = direction === 'left' ? -160 : 160;
    tabsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (!tabsRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - tabsRef.current.offsetLeft;
    scrollLeftRef.current = tabsRef.current.scrollLeft;
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !tabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    tabsRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleTabsMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const handleTabsWheel = (e: React.WheelEvent) => {
    if (!tabsRef.current) return;
    if (e.deltaY !== 0) {
      tabsRef.current.scrollLeft += e.deltaY;
    }
  };

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
      } else if (activeTab === 'tts') {
        const isTTS = m.id.includes('tts') || m.id.includes('speech') || m.id.includes('audio');
        if (!isTTS) return false;
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
        className="w-full bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/[0.1] hover:border-indigo-500/60 rounded-2xl px-3.5 py-2.5 text-start flex items-center justify-between gap-2 transition shadow-sm focus:outline-none focus:border-indigo-500"
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <Cpu className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <div className="truncate flex items-center gap-2">
            <span className="font-semibold text-xs text-slate-800 dark:text-white truncate">
              {selectedModel.name}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline truncate">
              ({selectedModel.id})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${
              selectedModel.provider === 'gemini'
                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30'
                : 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30'
            }`}
          >
            {selectedModel.provider === 'gemini' ? 'Gemini' : 'OpenRouter'}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Panel with Dynamic Viewport Bounds */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 w-[94vw] sm:w-[480px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[480px] animate-fade-in backdrop-blur-2xl ${
            alignV === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${
            alignH === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {/* Search Box & Sliding Category Tabs */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchModelPlaceholder || 'مودېل نامى ياكى كودىنى كىرگۈزۈپ ئىزدەڭ...'}
                className="w-full bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 ps-9 pe-8 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
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

            {/* Filter Tabs Horizontal Slider (ئوڭ-سولغا سىيرىش) */}
            <div className="relative flex items-center group/slider mt-1">
              {/* Slide Left Button */}
              <button
                type="button"
                onClick={() => scrollTabs('left')}
                title="سولغا سىيرىش"
                className="shrink-0 p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 transition shadow-sm me-1.5 z-10"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Scrollable & Draggable Tabs Track */}
              <div
                ref={tabsRef}
                onMouseDown={handleTabsMouseDown}
                onMouseMove={handleTabsMouseMove}
                onMouseUp={handleTabsMouseUpOrLeave}
                onMouseLeave={handleTabsMouseUpOrLeave}
                onWheel={handleTabsWheel}
                className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 custom-scrollbar text-[11px] select-none scroll-smooth cursor-grab active:cursor-grabbing flex-1"
                style={{
                  scrollbarWidth: 'thin',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition shadow-sm ${
                    activeTab === 'all'
                      ? 'bg-indigo-600 text-white font-semibold ring-2 ring-indigo-400/40'
                      : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {t.tabAllModels} ({models.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gemini')}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition shadow-sm ${
                    activeTab === 'gemini'
                      ? 'bg-blue-600 text-white font-semibold ring-2 ring-blue-400/40'
                      : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {t.tabGemini}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('openrouter')}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition shadow-sm ${
                    activeTab === 'openrouter'
                      ? 'bg-purple-600 text-white font-semibold ring-2 ring-purple-400/40'
                      : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {t.tabOpenRouter}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('free')}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition shadow-sm ${
                    activeTab === 'free'
                      ? 'bg-emerald-600 text-white font-semibold ring-2 ring-emerald-400/40'
                      : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {t.tabFree}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('image')}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition shadow-sm ${
                    activeTab === 'image'
                      ? 'bg-rose-600 text-white font-semibold ring-2 ring-rose-400/40'
                      : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {t.tabImage}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reasoning')}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition shadow-sm ${
                    activeTab === 'reasoning'
                      ? 'bg-amber-600 text-white font-semibold ring-2 ring-amber-400/40'
                      : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {t.tabReasoning}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tts')}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition shadow-sm ${
                    activeTab === 'tts'
                      ? 'bg-cyan-600 text-white font-semibold ring-2 ring-cyan-400/40'
                      : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  ئاۋاز (TTS)
                </button>
              </div>

              {/* Slide Right Button */}
              <button
                type="button"
                onClick={() => scrollTabs('right')}
                title="ئوڭغا سىيرىش"
                className="shrink-0 p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 transition shadow-sm ms-1.5 z-10"
              >
                <ChevronRight className="w-3.5 h-3.5" />
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
