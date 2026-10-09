'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { HistoryItem } from '@/types';
import { downloadMedia } from '@/lib/download';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Sparkles, 
  Play, 
  Pause,
  Image as ImageIcon,
  Languages,
  Volume2,
  Video,
  MessageSquare,
  Clock,
  Layers,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

interface FeatureHistorySectionProps {
  feature: 'chat' | 'translate' | 'image' | 'tts' | 'video';
  onReuse?: (item: HistoryItem) => void;
}

export function FeatureHistorySection({ feature, onReuse }: FeatureHistorySectionProps) {
  const { history, removeHistoryItem, isRtl } = useApp();
  // Open by default so user can immediately see history, or toggle with 1 click
  const [isOpen, setIsOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  // Filter history for this feature only
  const items = history.filter((h) => h.type === feature);

  const meta = {
    image: {
      title: 'ساقلانغان رەسىملەر',
      desc: 'ئىلگىرى ھاسىل قىلىنغان بارلىق سۈنئىي ئەقىل رەسىم ئەسەرلىرى',
      icon: ImageIcon,
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    translate: {
      title: 'تەرجىمە خاتىرىلىرى',
      desc: 'ئىلگىرى تەرجىمە قىلىنغان بارلىق تېكىستلەر',
      icon: Languages,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    tts: {
      title: 'ساقلانغان ئاۋاز ئەسەرلىرى',
      desc: 'ئىلگىرى ھاسىل قىلىنغان تېكىست ئاۋاز خاتىرىلىرى',
      icon: Volume2,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    video: {
      title: 'ساقلانغان ئىلان سىن لايىھەلىرى',
      desc: 'ھاسىل قىلىنغان سىن سېنارىيەلىرى ۋە ئاساسىي كادىر رەسىملىرى',
      icon: Video,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    chat: {
      title: 'پاراڭ خاتىرىلىرى',
      desc: 'ئىلگىرى ئېلىپ بېرىلغان پاراڭ سۆھبەتلەر',
      icon: MessageSquare,
      color: 'from-indigo-500/20 to-sky-500/10 text-indigo-400 border-indigo-500/30',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
  }[feature];

  const Icon = meta.icon;

  const handleCopy = (id: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString(isRtl ? 'ug' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full mt-8 p-4 sm:p-6 rounded-3xl tech-card border border-white/[0.08] shadow-2xl transition-all duration-300">
      {/* 1-Click Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 text-right hover:opacity-90 transition group focus:outline-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${meta.color} border flex items-center justify-center shrink-0 shadow-md`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-right">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {meta.title}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta.badgeColor}`}>
                {items.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate hidden sm:block">
              {meta.desc}
            </p>
          </div>
        </div>

        {/* 1-Click Action Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] group-hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-slate-300 transition shrink-0">
          <span>{isOpen ? 'يىغىش' : 'كۆرۈش'}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-300" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-300" />
          )}
        </div>
      </button>

      {/* Collapsible Content Body */}
      {isOpen && (
        <div className="mt-5 pt-5 border-t border-white/[0.06] animate-in fade-in duration-200">
          {items.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
              <p className="text-xs">تېخى ساقلانغان مەزمۇن يوق.</p>
              <p className="text-[11px] text-slate-500">يۇقىرىدىن مەزمۇن ھاسىل قىلسىڭىز بۇ يەردە ئاپتوماتىك كۆرۈنىدۇ.</p>
            </div>
          ) : (
            <>
              {/* Image Grid */}
              {feature === 'image' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-white/[0.08] hover:border-rose-500/40 transition shadow-lg flex flex-col"
                    >
                      <div className="aspect-square relative w-full overflow-hidden bg-slate-950">
                        {item.preview ? (
                          <img
                            src={item.preview}
                            alt={item.title || 'ھاسىل قىلىنغان رەسىم'}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        {/* Hover Overlay Buttons */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 backdrop-blur-[2px]">
                          {item.preview && (
                            <button
                              type="button"
                              onClick={() => downloadMedia(item.preview, `image-${item.id}.png`)}
                              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition shadow"
                              title="چۈشۈرۈش"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleCopy(item.id, item.data?.prompt || item.title || '', e)}
                            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition shadow"
                            title="بۇيرۇقنى كۆچۈرۈش"
                          >
                            {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHistoryItem(item.id)}
                            className="p-2 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 transition shadow"
                            title="ئۆچۈرۈش"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-2.5 space-y-1 text-right">
                        <p className="text-[11px] text-slate-300 truncate font-medium" title={item.data?.prompt || item.title}>
                          {item.data?.prompt || item.title || 'رەسىم'}
                        </p>
                        <span className="text-[10px] text-slate-500 block">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Translate Cards */}
              {feature === 'translate' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/30 transition space-y-2.5 text-right relative group"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/[0.05] pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <span>{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{formatDate(item.createdAt)}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(item.id, item.data?.translated || item.preview || '', e)}
                            className="p-1 hover:text-white transition"
                            title="كۆچۈرۈش"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHistoryItem(item.id)}
                            className="p-1 hover:text-rose-400 transition"
                            title="ئۆچۈرۈش"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {item.data?.source && (
                          <div className="text-slate-400 text-[11px] bg-black/20 p-2 rounded-xl">
                            <span className="text-slate-500 block text-[10px] mb-0.5">ئەسلى تېكىست:</span>
                            {item.data.source}
                          </div>
                        )}
                        <div className="text-slate-200 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl font-medium">
                          <span className="text-emerald-400/80 block text-[10px] mb-0.5">تەرجىمىسى:</span>
                          {item.data?.translated || item.preview}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TTS Voice Cards */}
              {feature === 'tts' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {items.map((item) => {
                    const audioSrc = item.preview || item.data?.audioUrl;
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/30 transition space-y-3 text-right"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-amber-400 font-bold flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>ئاۋازلىق ئەسەر</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">{formatDate(item.createdAt)}</span>
                            <button
                              type="button"
                              onClick={() => removeHistoryItem(item.id)}
                              className="p-1 hover:text-rose-400 transition"
                              title="ئۆچۈرۈش"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-black/20 p-2 rounded-xl">
                          {item.title || item.data?.text || 'ئاۋازغا ئايلاندۇرۇلغان تېكىست'}
                        </p>

                        {audioSrc && (
                          <div className="space-y-2 pt-1">
                            <audio
                              controls
                              src={audioSrc}
                              className="w-full h-8"
                              preload="none"
                            />
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => downloadMedia(audioSrc, `voice-${item.id}.wav`)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-medium transition"
                              >
                                <Download className="w-3 h-3" />
                                <span>چۈشۈرۈش (.wav)</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleCopy(item.id, item.title || item.data?.text || '', e)}
                                className="p-1.5 text-slate-400 hover:text-white transition"
                                title="تېكىستنى كۆچۈرۈش"
                              >
                                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Video Studio Cards */}
              {feature === 'video' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.08] hover:border-purple-500/30 transition shadow-lg text-right flex flex-col"
                    >
                      {item.preview && (
                        <div className="aspect-video relative overflow-hidden bg-slate-950">
                          <img
                            src={item.preview}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/30 text-[10px] text-purple-200 font-bold backdrop-blur-sm">
                            كىنو كادىرى
                          </div>
                        </div>
                      )}
                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <h4 className="font-bold text-white text-xs truncate">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-500">{formatDate(item.createdAt)}</span>
                          </div>
                          {item.data?.productDesc && (
                            <p className="text-[11px] text-slate-400 line-clamp-2">
                              {item.data.productDesc}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                          {item.preview && (
                            <button
                              type="button"
                              onClick={() => downloadMedia(item.preview, `keyframe-${item.id}.png`)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[11px] transition"
                            >
                              <Download className="w-3 h-3" />
                              <span>رەسىمنى چۈشۈرۈش</span>
                            </button>
                          )}
                          <div className="flex items-center gap-1.5">
                            {item.data?.storyboard && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(item.id, item.data.storyboard, e)}
                                className="p-1.5 text-slate-400 hover:text-white transition"
                                title="سېنارىيەنى كۆچۈرۈش"
                              >
                                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeHistoryItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                              title="ئۆچۈرۈش"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Cards */}
              {feature === 'chat' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/30 transition text-right space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <h4 className="font-bold text-white text-xs truncate">
                          {item.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeHistoryItem(item.id)}
                          className="p-1 hover:text-rose-400 transition text-slate-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {item.preview}
                      </p>
                      <span className="text-[10px] text-slate-500 block pt-1">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
