'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  History, 
  Trash2, 
  MessageSquare, 
  Languages, 
  Image as ImageIcon, 
  Volume2, 
  Video, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export default function HistoryPage() {
  const { t, isRtl, history, removeHistoryItem, clearHistory } = useApp();
  const [filter, setFilter] = useState<'all' | 'chat' | 'translate' | 'image' | 'tts' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filterTabs = [
    { id: 'all', label: t.filterAll, icon: History },
    { id: 'chat', label: t.navChat, icon: MessageSquare },
    { id: 'translate', label: t.navTranslate, icon: Languages },
    { id: 'image', label: t.navImage, icon: ImageIcon },
    { id: 'tts', label: t.navTts, icon: Volume2 },
    { id: 'video', label: t.navVideo, icon: Video },
  ];

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter((item) => item.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'translate': return <Languages className="w-4 h-4 text-emerald-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-rose-400" />;
      case 'tts': return <Volume2 className="w-4 h-4 text-amber-400" />;
      case 'video': return <Video className="w-4 h-4 text-purple-400" />;
      default: return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl tech-card border border-white/[0.08] shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t.navHistory}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t.historyDesc}</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearAllHistory}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/40'
                  : 'bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* History Items Grid */}
      {filteredHistory.length === 0 ? (
        <div className="p-16 text-center rounded-3xl tech-card border border-white/[0.06] text-slate-500 text-sm">
          <History className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p>{t.emptyHistory}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl tech-card border border-white/[0.08] hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3.5 shadow-lg"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      {getIcon(item.type)}
                    </div>
                    <span className="font-semibold text-xs text-white truncate max-w-[200px]">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Media Preview or Text */}
                {item.type === 'image' && item.data?.imageUrl ? (
                  <div className="rounded-2xl overflow-hidden max-h-48 bg-[#06070a] flex items-center justify-center border border-white/[0.06]">
                    <img src={item.data.imageUrl} alt={item.title} className="w-full h-auto object-cover" />
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 line-clamp-3 bg-[#06070a] p-3 rounded-2xl border border-white/[0.06] leading-relaxed">
                    {item.preview}
                  </p>
                )}
              </div>

              {/* Item Footer */}
              <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px] bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                  {item.data?.model || 'AI Model'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item.id, item.preview || item.title)}
                    className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition"
                    title={t.copy}
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => removeHistoryItem(item.id)}
                    className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
