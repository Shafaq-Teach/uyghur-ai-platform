'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ModelBar } from '@/components/ModelBar';
import { downloadMedia, downloadText, recordAndDownloadVideo } from '@/lib/download';
import { apiFetch } from '@/lib/apiClient';
import { FeatureHistorySection } from '@/components/FeatureHistorySection';
import { 
  Video, 
  Upload, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Pause,
  RotateCcw,
  Download, 
  CheckCircle2, 
  Clapperboard,
  Clock,
  Ratio,
  SlidersHorizontal,
  Copy,
  Check,
  Maximize2,
  FileText,
  Film
} from 'lucide-react';

export default function AdVideoPage() {
  const { t, isRtl, settings, addHistoryItem, requireAuth, user, updateUserCoins } = useApp();
  const [productName, setProductName] = useState('ئالىي دەرىجىلىك تەبىئىي زەيتۇن مېيى');
  const [productDesc, setProductDesc] = useState('شېشە بوتۇلكىدىكى ئالتۇن رەڭلىك تەبىئىي سوغۇق پرېسلانغان زەيتۇن مېيى، ئۈستەل ئۈستىدە يورۇقلۇق نۇرى قايتىپ تۇرىدۇ.');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [adStyle, setAdStyle] = useState('luxury');
  const [duration, setDuration] = useState(8);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  // Download states
  const [downloadingVideo, setDownloadingVideo] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [downloadDoneType, setDownloadDoneType] = useState<string | null>(null);

  // Cinema Monitor states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSecond, setCurrentSecond] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const monitorRef = useRef<HTMLDivElement | null>(null);

  const styles = [
    { id: 'luxury', name: t.adStyleLuxury },
    { id: 'nature', name: t.adStyleNature },
    { id: 'tech', name: t.adStyleTech },
    { id: 'warm', name: t.adStyleWarm },
  ];

  const durations = [
    { value: 5, label: t.duration5s },
    { value: 8, label: t.duration8s },
    { value: 15, label: t.duration15s },
  ];

  // Playback timer for cinema monitor
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSecond((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!requireAuth()) return;
    if (!productName.trim() || loading) return;

    const hasOwnKey = Boolean((settings.openRouterApiKey || settings.geminiApiKey || '').trim());
    if (!hasOwnKey && (user?.coins ?? 0) < 25) {
      setError(`تەڭگىڭىز يېتەرلىك ئەمەس! سىن ھاسىل قىلىشقا 25 تەڭگە كېتىدۇ، سىزدە پەقەت ${user?.coins ?? 0} تەڭگە قالدى.`);
      return;
    }

    setLoading(true);
    setError('');
    setIsPlaying(false);
    setCurrentSecond(0);

    try {
      const response = await apiFetch('/api/video', {
        method: 'POST',
        body: JSON.stringify({
          productImage: imagePreview,
          productName,
          productDesc,
          adStyle,
          duration,
          aspectRatio,
          model: settings.featureModels.video,
          provider: settings.featureProviders.video,
          translateModel: settings.featureModels.translate,
          openRouterApiKey: settings.openRouterApiKey,
          geminiApiKey: settings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'ۋىدېيو ھاسىل قىلىش مەغلۇپ بولدى');

      if (typeof data.remainingCoins === 'number') {
        updateUserCoins(data.remainingCoins);
      }

      setResult(data);
      // Auto-start cinematic preview
      setIsPlaying(true);

      // Save to history
      addHistoryItem({
        type: 'video',
        title: `ئىلان: ${productName.slice(0, 25)}`,
        preview: data.storyboard?.slice(0, 80) || 'مەھسۇلات ئىلان فىلىمى',
        data: {
          productName,
          productDesc,
          adStyle,
          duration,
          aspectRatio,
          storyboard: data.storyboard,
          videoPrompt: data.videoPrompt,
          posterImageUrl: data.posterImageUrl,
          model: settings.featureModels.video,
        },
      });
    } catch (err: any) {
      console.error('Video generation error:', err);
      setError(err.message || 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!result?.videoPrompt) return;
    navigator.clipboard.writeText(result.videoPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownloadKeyframe = async () => {
    if (!result?.posterImageUrl || downloadingImage) return;
    setDownloadingImage(true);
    try {
      const filename = `commercial-${productName ? productName.replace(/\s+/g, '-').slice(0, 15) : 'product'}-${Date.now()}.jpg`;
      await downloadMedia(result.posterImageUrl, filename);
      setDownloadDoneType('image');
      setTimeout(() => setDownloadDoneType(null), 3000);
    } catch (e) {
      console.error('Keyframe download failed:', e);
    } finally {
      setDownloadingImage(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!result?.posterImageUrl || downloadingVideo) return;
    setDownloadingVideo(true);
    setVideoProgress(0);
    try {
      const filename = `commercial-${productName ? productName.replace(/\s+/g, '-').slice(0, 15) : 'product'}-${Date.now()}.webm`;
      await recordAndDownloadVideo(result.posterImageUrl, duration, filename, (progress) => {
        setVideoProgress(progress);
      });
      setDownloadDoneType('video');
      setTimeout(() => setDownloadDoneType(null), 3000);
    } catch (e) {
      console.error('Video recording download failed:', e);
    } finally {
      setDownloadingVideo(false);
    }
  };

  const handleDownloadScript = () => {
    if (!result?.storyboard) return;
    const filename = `commercial-script-${Date.now()}.txt`;
    downloadText(result.storyboard, filename);
    setDownloadDoneType('script');
    setTimeout(() => setDownloadDoneType(null), 3000);
  };

  const handleToggleFullscreen = () => {
    if (!monitorRef.current) return;
    if (!document.fullscreenElement) {
      monitorRef.current.requestFullscreen().catch(console.warn);
    } else {
      document.exitFullscreen().catch(console.warn);
    }
  };

  // Determine active scene based on playback second
  const scene1End = Math.max(1, Math.floor(duration / 3));
  const scene2End = Math.max(2, Math.floor((2 * duration) / 3));
  const activeSceneIndex = currentSecond <= scene1End ? 1 : currentSecond <= scene2End ? 2 : 3;
  const activeSceneLabel = activeSceneIndex === 1
    ? '1-كادىر: ماكرو يېقىن كۆرۈنۈش ۋە ئىنچىكە تەپسىلات'
    : activeSceneIndex === 2
    ? '2-كادىر: ھەيۋەتلىك ھەرىكەت ۋە نۇرلۇق ئايلىنىش'
    : '3-كادىر: باش كۆرۈنۈش ۋە ئالتۇن ماركا تامغىسى';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Model Selector Bar */}
      <ModelBar feature="video" featureTitle={t.fVideoTitle} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Upload Product Photo */}
          <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-3 shadow-lg">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>{t.productImageUpload}</span>
              {imagePreview && (
                <button
                  onClick={() => setImagePreview(null)}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  {t.removeImage}
                </button>
              )}
            </label>

            <div className="relative border-2 border-dashed border-white/[0.12] hover:border-purple-500/60 rounded-2xl p-6 text-center transition cursor-pointer bg-[#06070a] group">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="max-h-36 rounded-xl object-contain shadow-md"
                  />
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.imageUploadedSuccess}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <div className="p-3 rounded-2xl bg-white/[0.04] text-purple-400 border border-white/[0.08] group-hover:scale-105 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-slate-200">{t.uploadDragDrop}</span>
                  <span className="text-[10px] text-slate-500 font-mono">JPG, PNG, WEBP (MAX 10MB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Name & Description */}
          <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-3 shadow-lg">
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                {t.productName}
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={t.productNamePlaceholder}
                className="w-full bg-[#0d0f17] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                {t.productDesc}
              </label>
              <textarea
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                placeholder={t.productDescPlaceholder}
                rows={3}
                className="w-full bg-[#0d0f17] border border-white/[0.1] rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 custom-scrollbar resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Style & Duration Selectors */}
          <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-4 shadow-lg">
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-2 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                <span>{t.adStyle}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setAdStyle(s.id)}
                    className={`p-3 rounded-xl border text-start text-xs font-medium transition-all duration-200 ${
                      adStyle === s.id
                        ? 'bg-purple-600/20 border-purple-500/60 text-purple-200 shadow-md shadow-purple-500/10'
                        : 'bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration and Aspect Ratio */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t.durationLabel}</span>
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-[#0d0f17] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  {durations.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1">
                  <Ratio className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t.aspectRatioLabel}</span>
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-[#0d0f17] border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="9:16">9:16 (TikTok / Reels)</option>
                  <option value="16:9">16:9 (Landscape / YouTube)</option>
                  <option value="1:1">1:1 (Instagram Square)</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fade-in">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={!productName.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 disabled:opacity-40 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all duration-200 border border-purple-400/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4" />}
            <span>{loading ? 'سۈنئىي ئەقىل فىلىم ئىشلەۋاتىدۇ...' : t.generateVideoBtn}</span>
          </button>
        </div>

        {/* Output Column (Storyboard & Cinema Monitor) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Storyboard Card */}
          <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-3 shadow-lg min-h-[220px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.scriptTitle}</span>
              </h4>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                {t.verifiedNonHuman || '8K CINEMATIC QUALITY'}
              </span>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text custom-scrollbar max-h-56 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                  <span>{t.scriptGenerating}</span>
                </div>
              ) : result ? (
                result.storyboard
              ) : (
                <p className="text-slate-500 italic">
                  {t.scriptPlaceholder}
                </p>
              )}
            </div>
          </div>

          {/* Interactive Cinema Monitor */}
          <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs text-slate-400">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-purple-400" />
                <span>ئىلان فىلىمى ئالدىن كۆرۈش (Cinema Monitor)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-purple-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                  {aspectRatio}
                </span>
                {result && (
                  <button
                    onClick={handleToggleFullscreen}
                    className="p-1 rounded hover:bg-white/[0.08] text-slate-400 hover:text-white transition"
                    title="تولۇق ئېكران"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Monitor Screen Frame */}
            <div
              ref={monitorRef}
              className="rounded-2xl bg-[#06070a] overflow-hidden border border-white/[0.08] flex flex-col justify-between min-h-[300px] relative group"
            >
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                    <Clapperboard className="w-6 h-6 text-purple-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <span className="text-xs font-medium text-slate-200">
                    سۈنئىي ئەقىل ئېلان فىلىمى ۋە كىنو كۆرۈنۈشىنى تەييارلاۋاتىدۇ...
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {settings.featureModels.video}
                  </span>
                </div>
              ) : result?.posterImageUrl ? (
                <div className="relative w-full h-full min-h-[290px] flex items-center justify-center overflow-hidden bg-black">
                  {/* Dynamic Ken-Burns Visual */}
                  <img
                    src={result.posterImageUrl}
                    alt={productName}
                    className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                      isPlaying ? 'scale-115 translate-y-[-2%]' : 'scale-100'
                    }`}
                  />

                  {/* Cinematic Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

                  {/* Active Scene Watermark Badge */}
                  <div className="absolute top-3 start-3 z-10 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.1] text-[10px] font-semibold text-purple-300 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-rose-500 animate-ping' : 'bg-slate-500'}`} />
                      {activeSceneLabel}
                    </span>
                  </div>

                  {/* Center Play/Pause Overlay Trigger */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-4 rounded-full bg-black/60 hover:bg-purple-600/80 text-white backdrop-blur-md border border-white/20 transition-all transform hover:scale-110 shadow-2xl"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-white" />
                      ) : (
                        <Play className="w-6 h-6 fill-white ms-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Timeline Progress Bar & Timecode */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-1.5 z-10">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                      <span className="text-purple-300 font-bold">
                        00:0{currentSecond} / 00:0{duration}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isPlaying ? 'فىلىم قويۇلۇۋاتىدۇ' : 'توقتاپ تۇردى'}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${(currentSecond / duration) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs gap-2 min-h-[260px]">
                  <Video className="w-10 h-10 text-slate-800" />
                  <span>{t.videoWaitingPlaceholder}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {result && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentSecond(0);
                      setIsPlaying(true);
                    }}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-purple-300 border border-white/[0.08] transition text-xs flex items-center gap-1"
                    title="قايتا قويۇش"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>قايتا قويۇش</span>
                  </button>

                  <button
                    onClick={handleCopyPrompt}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition text-xs flex items-center gap-1"
                    title="پىروگرامما پىروپتىنى كۆچۈرۈش"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'كۆچۈرۈلدى' : 'پىرومپت كۆچۈرۈش'}</span>
                  </button>

                  <button
                    onClick={handleDownloadScript}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition text-xs flex items-center gap-1"
                    title="سېنارىيە تېكىستىنى ھۆججەت قىلىپ چۈشۈرۈش"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{downloadDoneType === 'script' ? 'ساقلاندى!' : 'سېنارىيە'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadKeyframe}
                    disabled={downloadingImage}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-purple-200 hover:text-white text-xs font-semibold transition border border-purple-400/30 disabled:opacity-60"
                    title="4K يۇقىرى سۈزۈكلۈكتىكى ئاساسىي كادىر رەسىمىنى چۈشۈرۈش"
                  >
                    {downloadingImage ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : downloadDoneType === 'image' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span>{downloadingImage ? 'چۈشۈۋاتىدۇ...' : downloadDoneType === 'image' ? 'چۈشۈرۈلدى!' : '4K رەسىمنى چۈشۈرۈش'}</span>
                  </button>

                  <button
                    onClick={handleDownloadVideo}
                    disabled={downloadingVideo}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-purple-600/25 border border-purple-400/30 disabled:opacity-60"
                    title="كىنو ھەرىكەتلىك سىن فىلىمىنى كومپيۇتېر ياكى تېلېفونغا چۈشۈرۈش"
                  >
                    {downloadingVideo ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : downloadDoneType === 'video' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <Film className="w-3.5 h-3.5" />
                    )}
                    <span>{downloadingVideo ? `پىشۇرۇلۇۋاتىدۇ (${videoProgress}%)...` : downloadDoneType === 'video' ? 'ۋىدېيو چۈشۈرۈلدى!' : 'سىن فىلىمىنى چۈشۈرۈش'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1-Click Collapsible Saved Commercial Video History */}
      <FeatureHistorySection 
        feature="video" 
        onReuse={(item) => {
          if (item.data?.productName) setProductName(item.data.productName);
          if (item.data?.productDesc) setProductDesc(item.data.productDesc);
          if (item.data?.adStyle) setAdStyle(item.data.adStyle);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
