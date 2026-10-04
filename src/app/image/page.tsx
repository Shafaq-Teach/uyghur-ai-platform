'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ModelBar } from '@/components/ModelBar';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Maximize2, 
  Layers, 
  Palette,
  Ratio
} from 'lucide-react';

export default function ImagePage() {
  const { t, isRtl, settings, addHistoryItem } = useApp();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('photorealistic');
  const [size, setSize] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [translatedPrompt, setTranslatedPrompt] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [error, setError] = useState('');

  const ratios = [
    { id: '1:1', label: '1:1', desc: 'كۋادرات (Instagram / Square)' },
    { id: '16:9', label: '16:9', desc: 'تولۇق كەڭلىك (Landscape / YouTube)' },
    { id: '9:16', label: '9:16', desc: 'تىك ئېكران (Stories / TikTok / Shorts)' },
    { id: '4:3', label: '4:3', desc: 'ئەنئەنىۋى ئېكران (Standard Monitor)' },
    { id: '3:4', label: '3:4', desc: 'تىك رەسىم (Vertical Poster)' },
    { id: '3:2', label: '3:2', desc: 'فوتو سۈرەت (DSLR Landscape)' },
    { id: '2:3', label: '2:3', desc: 'تىك كارتوچكا (DSLR Portrait)' },
  ];

  const styles = [
    { id: 'photorealistic', name: t.stylePhotorealistic },
    { id: 'cinematic', name: t.styleCinematic },
    { id: '3d', name: t.style3d },
    { id: 'anime', name: t.styleAnime },
    { id: 'watercolor', name: t.styleWatercolor },
    { id: 'cyberpunk', name: t.styleCyberpunk },
    { id: 'minimalist', name: t.styleMinimalist },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || loading || imageLoading) return;
    setLoading(true);
    setImageLoading(true);
    setError('');

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          size,
          style,
          model: settings.featureModels.image,
          provider: settings.featureProviders.image,
          openRouterApiKey: settings.openRouterApiKey,
          geminiApiKey: settings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'رەسىم ھاسىل قىلىش مەغلۇپ بولدى');

      setResultImage(data.imageUrl);
      setEnhancedPrompt(data.enhancedPrompt || prompt);
      setTranslatedPrompt(data.translatedPrompt || '');

      // Save to history
      addHistoryItem({
        type: 'image',
        title: prompt.slice(0, 30),
        preview: data.imageUrl,
        data: {
          prompt,
          translatedPrompt: data.translatedPrompt,
          enhancedPrompt: data.enhancedPrompt,
          aspectRatio,
          style,
          imageUrl: data.imageUrl,
          model: settings.featureModels.image,
        },
      });
    } catch (err: any) {
      console.error('Image generation error:', err);
      setError(err.message || 'خاتالىق يۈز بەردى');
      setImageLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(enhancedPrompt || prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Model Selector Bar */}
      <ModelBar feature="image" featureTitle={t.fImageTitle} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Prompt Box */}
          <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-3 shadow-lg">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>{t.imagePromptLabel}</span>
              <span className="text-[11px] text-rose-400 font-normal font-mono">{t.promptEnhanceHint}</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.imagePromptPlaceholder}
              rows={4}
              className="w-full bg-[#0d0f17] border border-white/[0.1] rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 custom-scrollbar resize-none"
            />
            {translatedPrompt && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-rose-300 font-semibold text-[11px]">
                  <span>سۈنئىي ئەقىل تەرجىمە قىلغان پىرومپت (AI Translated Prompt):</span>
                  <span className="text-[10px] font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-200">
                    AI Neural
                  </span>
                </div>
                <p className="text-slate-200 font-mono text-[11px] leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/[0.05]" dir="ltr">
                  {translatedPrompt}
                </p>
              </div>
            )}
          </div>

          {/* Aspect Ratio Selector */}
          <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-3 shadow-lg">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Ratio className="w-4 h-4 text-rose-400" />
              <span>{t.aspectRatio}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ratios.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setAspectRatio(r.id)}
                  className={`p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                    aspectRatio === r.id
                      ? 'bg-rose-500/15 border-rose-500/60 text-rose-200 font-bold shadow-md shadow-rose-500/10'
                      : 'bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-xs font-mono">{r.label}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-full">
                    {r.id === '1:1' ? t.ratioSquare : r.id === '16:9' ? t.ratioWide : r.id === '9:16' ? t.ratioTall : r.id}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Art Style Selector */}
          <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-3 shadow-lg">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-rose-400" />
              <span>{t.imageStyle}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200 ${
                    style === s.id
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/25 border border-rose-400/40'
                      : 'bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading || imageLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:opacity-95 disabled:opacity-40 text-white font-bold text-sm shadow-xl shadow-rose-600/25 transition-all duration-200 border border-rose-400/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading || imageLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading || imageLoading ? t.loading : t.generateImageBtn}</span>
          </button>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fade-in">
              {error}
            </div>
          )}
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex-1 min-h-[380px] rounded-3xl tech-card border border-white/[0.08] p-5 flex flex-col justify-between overflow-hidden shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 tech-pulse" />
                {t.previewCanvas}
              </span>
              <span className="font-mono text-[11px] text-rose-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">{aspectRatio}</span>
            </div>

            <div className="flex-1 my-4 flex items-center justify-center overflow-hidden rounded-2xl bg-[#06070a] border border-white/[0.06] relative">
              {loading || imageLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-rose-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <span className="text-xs text-slate-300 font-medium">
                    {loading ? t.imageGenerating : 'سۈنئىي ئەقىل رەسىمنى سىزىپ چۈشۈرۈۋاتىدۇ...'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{settings.featureModels.image}</span>
                </div>
              ) : resultImage ? (
                <img
                  src={resultImage}
                  alt={prompt}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                  className="max-h-[460px] w-auto h-auto object-contain rounded-xl shadow-2xl transition duration-300 hover:scale-[1.01]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2.5 p-8 text-center text-slate-500 text-xs">
                  <Layers className="w-10 h-10 text-slate-700" />
                  <p>{t.imagePlaceholderPrompt}</p>
                </div>
              )}
            </div>

            {/* Actions for generated image */}
            {resultImage && (
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.08] text-xs transition"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? t.copied : t.copyPrompt}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs transition shadow-md shadow-rose-600/25 border border-rose-400/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.download}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
