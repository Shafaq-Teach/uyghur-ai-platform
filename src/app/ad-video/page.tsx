'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ModelBar } from '@/components/ModelBar';
import { 
  Video, 
  Upload, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Clapperboard,
  Clock,
  Ratio,
  SlidersHorizontal
} from 'lucide-react';

export default function AdVideoPage() {
  const { t, isRtl, settings, addHistoryItem } = useApp();
  const [productName, setProductName] = useState('ئالىي دەرىجىلىك تەبىئىي زەيتۇن مېيى');
  const [productDesc, setProductDesc] = useState('شېشە بوتۇلكىدىكى ئالتۇن رەڭلىك تەبىئىي سوغۇق پرېسلانغان زەيتۇن مېيى، ئۈستەل ئۈستىدە يورۇقلۇق نۇرى قايتىپ تۇرىدۇ.');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [adStyle, setAdStyle] = useState('luxury');
  const [duration, setDuration] = useState(8);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

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
    if (!productName.trim() || loading) return;
    setLoading(true);

    try {
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImage: imagePreview,
          productName,
          productDesc,
          adStyle,
          duration,
          aspectRatio,
          model: settings.featureModels.video,
          provider: settings.featureProviders.video,
          openRouterApiKey: settings.openRouterApiKey,
          geminiApiKey: settings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'ۋىدېيو ھاسىل قىلىش مەغلۇپ بولدى');

      setResult(data);

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
          videoUrl: data.videoUrl,
          model: settings.featureModels.video,
        },
      });
    } catch (err: any) {
      alert(`خاتالىق: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Model Selector Bar */}
      <ModelBar feature="video" featureTitle={t.fVideoTitle} />

      {/* Safety & Quality Policy Alert with Cyber Guard styling */}
      <div className="p-4.5 rounded-3xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3.5 text-xs leading-relaxed text-purple-200 backdrop-blur-md shadow-lg">
        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5 text-purple-300" />
        </div>
        <div>
          <span className="font-bold text-white block mb-1 text-sm">
            {t.videoNoticeTitle}
          </span>
          <p className="text-purple-300/90">
            {t.videoNotice}
          </p>
        </div>
      </div>

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
                  className="text-[11px] text-rose-400 hover:underline font-mono"
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

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={!productName.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 disabled:opacity-40 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all duration-200 border border-purple-400/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4" />}
            <span>{loading ? t.loading : t.generateVideoBtn}</span>
          </button>
        </div>

        {/* Output Column (Storyboard & Video) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Storyboard Card */}
          <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-3 shadow-lg min-h-[220px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.scriptTitle}</span>
              </h4>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERIFIED: NON-HUMAN
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

          {/* Video Preview Player */}
          <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs text-slate-400">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-purple-400" />
                <span>{t.videoPreviewTitle}</span>
              </span>
              <span className="font-mono text-[11px] text-purple-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">{aspectRatio}</span>
            </div>

            <div className="rounded-2xl bg-[#06070a] overflow-hidden border border-white/[0.06] flex items-center justify-center min-h-[240px]">
              {result?.videoUrl ? (
                <video
                  src={result.videoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full max-h-[320px] object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs gap-2">
                  <Video className="w-10 h-10 text-slate-800" />
                  <span>{t.videoWaitingPlaceholder}</span>
                </div>
              )}
            </div>

            {result && (
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono truncate max-w-[200px] bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                  {settings.featureModels.video}
                </span>
                <a
                  href={result.videoUrl}
                  download="product-ad.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-purple-600/25 border border-purple-400/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.download}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
