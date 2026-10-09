'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { HistoryItem } from '@/types';
import { downloadMedia } from '@/lib/download';
import { apiFetch } from '@/lib/apiClient';
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
  RefreshCw,
  Image as ImageIcon,
  Languages,
  Volume2,
  Video,
  MessageSquare,
  Clock,
  Layers,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface FeatureHistorySectionProps {
  feature: 'chat' | 'translate' | 'image' | 'tts' | 'video';
  onReuse?: (item: HistoryItem) => void;
}

function isValidAudioUrl(url: any): boolean {
  if (typeof url !== 'string') return false;
  return url.startsWith('data:audio/') || url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://');
}

function formatAudioTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function FeatureHistorySection({ feature, onReuse }: FeatureHistorySectionProps) {
  const { history, removeHistoryItem, isRtl, settings } = useApp();
  // Open by default so user can immediately see history, or toggle with 1 click
  const [isOpen, setIsOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio player state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const [audioProgress, setAudioProgress] = useState<Record<string, { current: number; duration: number }>>({});
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Filter history for this feature only
  const items = history.filter((h) => h.type === feature);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };
  }, []);

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

  // Obtain or synthesize audio URL on-demand
  const getOrSynthesizeAudio = async (item: HistoryItem): Promise<string | null> => {
    if (audioCache[item.id]) return audioCache[item.id];
    if (isValidAudioUrl(item.data?.audioUrl)) return item.data.audioUrl;
    if (isValidAudioUrl(item.preview)) return item.preview;

    const textToSynthesize = item.data?.text || item.title;
    if (!textToSynthesize || !textToSynthesize.trim()) return null;

    setLoadingAudioId(item.id);
    try {
      const res = await apiFetch('/api/tts', {
        method: 'POST',
        body: JSON.stringify({
          text: textToSynthesize.trim(),
          voice: item.data?.voice || 'female1',
          speed: item.data?.speed || 1.0,
          pitch: item.data?.pitch || 1.0,
          model: settings?.featureModels?.tts,
          provider: settings?.featureProviders?.tts,
          openRouterApiKey: settings?.openRouterApiKey,
          geminiApiKey: settings?.geminiApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.audioUrl) {
        throw new Error(data.message || data.error || 'ئاۋاز ھاسىل قىلىش مەغلۇپ بولدى');
      }

      setAudioCache((prev) => ({ ...prev, [item.id]: data.audioUrl }));
      return data.audioUrl;
    } catch (err: any) {
      console.error('Audio synthesis error:', err);
      return null;
    } finally {
      setLoadingAudioId(null);
    }
  };

  // Toggle play/pause for TTS audio cards
  const handleTogglePlayAudio = async (item: HistoryItem) => {
    // If currently playing this item, pause it
    if (playingAudioId === item.id) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    // Stop currently playing audio if any
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
      setPlayingAudioId(null);
    }

    const audioUrl = await getOrSynthesizeAudio(item);
    if (!audioUrl) return;

    try {
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      audio.playbackRate = typeof item.data?.speed === 'number' ? item.data.speed : 1.0;

      audio.onloadedmetadata = () => {
        setAudioProgress((prev) => ({
          ...prev,
          [item.id]: { current: 0, duration: audio.duration || 0 },
        }));
      };

      audio.ontimeupdate = () => {
        setAudioProgress((prev) => ({
          ...prev,
          [item.id]: { current: audio.currentTime, duration: audio.duration || prev[item.id]?.duration || 0 },
        }));
      };

      audio.onended = () => {
        setPlayingAudioId(null);
        setAudioProgress((prev) => ({
          ...prev,
          [item.id]: { current: 0, duration: prev[item.id]?.duration || 0 },
        }));
      };

      audio.onerror = () => {
        setPlayingAudioId(null);
      };

      await audio.play();
      setPlayingAudioId(item.id);
    } catch (playErr) {
      console.warn('Playback error:', playErr);
      setPlayingAudioId(null);
    }
  };

  // Download .wav file
  const handleDownloadAudio = async (item: HistoryItem) => {
    const audioUrl = await getOrSynthesizeAudio(item);
    if (audioUrl) {
      downloadMedia(audioUrl, `voice-${item.id}.wav`);
    }
  };

  // Seek within audio track
  const handleSeekAudio = (item: HistoryItem, e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeAudioRef.current || playingAudioId !== item.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const ratio = Math.max(0, Math.min(1, clickX / width));
    const duration = activeAudioRef.current.duration || 0;
    if (duration > 0) {
      activeAudioRef.current.currentTime = duration * ratio;
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
                          {onReuse && (
                            <button
                              type="button"
                              onClick={() => onReuse(item)}
                              className="p-2 rounded-xl bg-rose-500/40 hover:bg-rose-500/60 text-white transition shadow"
                              title="ستۇدىيەگە قايتا قاچىلاش"
                            >
                              <ExternalLink className="w-4 h-4" />
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
                          {onReuse && (
                            <button
                              type="button"
                              onClick={() => onReuse(item)}
                              className="p-1 hover:text-emerald-400 transition"
                              title="ستۇدىيەگە قايتا قاچىلاش"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
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
                        <div className="text-slate-400 line-clamp-2 bg-black/20 p-2 rounded-xl">
                          <span className="text-[10px] text-slate-500 block mb-0.5">ئەسلى تېكىست:</span>
                          {item.data?.source || item.title}
                        </div>
                        <div className="text-emerald-300 font-medium line-clamp-3 bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/10">
                          <span className="text-[10px] text-emerald-500 block mb-0.5">تەرجىمىسى:</span>
                          {item.data?.translated || item.preview}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TTS Voice Cards with Interactive Audio Engine */}
              {feature === 'tts' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {items.map((item) => {
                    const isPlaying = playingAudioId === item.id;
                    const isLoading = loadingAudioId === item.id;
                    const progress = audioProgress[item.id] || { current: 0, duration: 0 };
                    const progressPercent = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl bg-white/[0.02] border transition space-y-3 text-right flex flex-col justify-between ${
                          isPlaying 
                            ? 'border-amber-500/60 shadow-lg shadow-amber-500/10 bg-amber-950/10' 
                            : 'border-white/[0.08] hover:border-amber-500/30'
                        }`}
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-center justify-between text-[11px] pb-2 border-b border-white/[0.05]">
                            <span className="text-amber-400 font-bold flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>ئاۋازلىق ئەسەر</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500">{formatDate(item.createdAt)}</span>
                              <button
                                type="button"
                                onClick={() => removeHistoryItem(item.id)}
                                className="p-1 hover:text-rose-400 transition text-slate-500"
                                title="ئۆچۈرۈش"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Speech Text */}
                          <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed bg-black/25 p-2.5 rounded-xl mt-2 select-text font-medium">
                            {item.data?.text || item.title || item.preview || 'ئاۋازغا ئايلاندۇرۇلغان تېكىست'}
                          </p>
                        </div>

                        {/* Interactive Sound Player Bar */}
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-2 mt-2">
                          <div className="flex items-center gap-2.5">
                            {/* Play / Pause / Load Button */}
                            <button
                              type="button"
                              onClick={() => handleTogglePlayAudio(item)}
                              disabled={isLoading}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow-md shrink-0 ${
                                isPlaying
                                  ? 'bg-amber-500 text-slate-950 font-bold scale-105'
                                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 hover:scale-105 active:scale-95'
                              }`}
                              title={isPlaying ? 'توختىتىش' : 'ئاۋازنى قويۇش'}
                            >
                              {isLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                              ) : isPlaying ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 translate-x-0.5" />
                              )}
                            </button>

                            {/* Player Track and Timers */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="text-amber-300/90 font-medium truncate text-[11px]">
                                  {isLoading
                                    ? 'ئاۋاز ھازىرلىنىۋاتىدۇ...'
                                    : isPlaying
                                    ? 'ئاڭلىنىۋاتىدۇ...'
                                    : audioCache[item.id] || isValidAudioUrl(item.data?.audioUrl)
                                    ? 'ئاڭلاشقا تەييار'
                                    : 'چەكسىڭىز ئاڭلىتىدۇ'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {formatAudioTime(progress.current)} / {formatAudioTime(progress.duration)}
                                </span>
                              </div>

                              {/* Interactive Progress Track */}
                              <div
                                onClick={(e) => handleSeekAudio(item, e)}
                                className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden cursor-pointer relative group/track"
                                title="ئىلگىرى-كېيىن قىلىش"
                              >
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100 rounded-full"
                                  style={{ width: `${isPlaying || progressPercent > 0 ? Math.max(progressPercent, 4) : 0}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Footer Action Buttons */}
                          <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/[0.05]">
                            <button
                              type="button"
                              onClick={() => handleDownloadAudio(item)}
                              disabled={isLoading}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[10px] font-medium transition"
                              title="ئاۋاز ھۆججىتىنى كومپيۇتېر ياكى تېلېفونغا چۈشۈرۈش"
                            >
                              <Download className="w-3 h-3" />
                              <span>چۈشۈرۈش (.wav)</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              {onReuse && (
                                <button
                                  type="button"
                                  onClick={() => onReuse(item)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-[10px] transition"
                                  title="ستۇدىيەدە ئېچىش ۋە تەھرىرلەش"
                                >
                                  <ExternalLink className="w-3 h-3 text-amber-400" />
                                  <span>ستۇدىيەدە ئېچىش</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleCopy(item.id, item.data?.text || item.title || '', e)}
                                className="p-1 text-slate-400 hover:text-white transition rounded"
                                title="تېكىستنى كۆچۈرۈش"
                              >
                                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
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
                      className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.08] hover:border-purple-500/30 transition shadow-lg text-right flex flex-col justify-between"
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
                          <div className="flex items-center gap-1.5">
                            {item.preview && (
                              <button
                                type="button"
                                onClick={() => downloadMedia(item.preview, `keyframe-${item.id}.png`)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[11px] transition"
                              >
                                <Download className="w-3 h-3" />
                                <span>چۈشۈرۈش</span>
                              </button>
                            )}
                            {onReuse && (
                              <button
                                type="button"
                                onClick={() => onReuse(item)}
                                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-[10px] transition"
                                title="ستۇدىيەدە ئېچىش"
                              >
                                <ExternalLink className="w-3 h-3 text-purple-400" />
                                <span>ئېچىش</span>
                              </button>
                            )}
                          </div>
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
                        <div className="flex items-center gap-1.5">
                          {onReuse && (
                            <button
                              type="button"
                              onClick={() => onReuse(item)}
                              className="p-1 hover:text-indigo-400 transition text-slate-500"
                              title="قايتا ئەۋەتىش"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeHistoryItem(item.id)}
                            className="p-1 hover:text-rose-400 transition text-slate-500"
                            title="ئۆچۈرۈش"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
