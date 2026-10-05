'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ModelBar } from '@/components/ModelBar';
import { 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  RefreshCw,
  Music, 
  Radio
} from 'lucide-react';

export default function TtsPage() {
  const { t, isRtl, settings, addHistoryItem, requireAuth } = useApp();
  const [text, setText] = useState('سۈنئىي ئىدراك تور بېكىتىگە كەلگىنىڭىزنى قىزغىن قارشى ئالىمىز! بۈگۈن سىزگە نېمە ياردەم قىلاي؟');
  const [voice, setVoice] = useState('female1');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sampleTexts = [
    'ئەسسالامۇئەلەيكۇم! بۇ يەردە تېكىستلەر ئۆزلۈكىدىن راۋان ئاۋازغا ئايلىنىدۇ.',
    'بىلىم — ئىنساننىڭ مەنىۋى بايلىقى ۋە كەلگۈسىگە تۇتاشقان كۆۋرۈكىدۇر.',
    'مەھسۇلاتىمىز سىزگە ئەڭ ئەلا سۈپەت ۋە ئەڭ راھەت تۇرمۇش تەجرىبىسىنى ئېلىپ كېلىدۇ.',
  ];

  const voices = [
    { id: 'female1', name: t.voiceFemale1, gender: 'female' },
    { id: 'male1', name: t.voiceMale1, gender: 'male' },
    { id: 'female2', name: t.voiceFemale2, gender: 'female' },
    { id: 'male2', name: t.voiceMale2, gender: 'male' },
  ];

  const handleGenerateAndPlay = async () => {
    if (!requireAuth()) return;
    if (!text.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice,
          speed,
          pitch,
          model: settings.featureModels.tts,
          provider: settings.featureProviders.tts,
          openRouterApiKey: settings.openRouterApiKey,
          geminiApiKey: settings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ئاۋاز ھاسىل قىلىش مەغلۇپ بولدى');
      }

      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          audioRef.current.playbackRate = speed;
          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (playErr) {
            console.warn('Playback error or blocked by browser policy:', playErr);
          }
        }
      }

      // Save to history
      addHistoryItem({
        type: 'tts',
        title: text.slice(0, 30),
        preview: `ئاۋاز: ${voice}, سۈرئەت: ${speed}x`,
        data: {
          text,
          voice,
          speed,
          pitch,
          model: settings.featureModels.tts,
        },
      });
    } catch (err: any) {
      console.error('TTS execution error:', err);
      setError(err.message || 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleReplay = async () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = speed;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Replay error:', e);
      }
    } else {
      handleGenerateAndPlay();
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `uyghur-speech-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Invisible real HTML Audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        className="hidden"
      />

      {/* Model Selector Bar */}
      <ModelBar feature="tts" featureTitle={t.fTtsTitle} />

      {/* Input Box */}
      <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>{t.ttsInputLabel}</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
            {text.length} {t.charCount}
          </span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.ttsInputPlaceholder}
          rows={4}
          className="w-full bg-[#0d0f17] border border-white/[0.1] rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 custom-scrollbar resize-none leading-relaxed"
        />

        {/* Quick sample sentences */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 custom-scrollbar">
          <span className="text-[11px] text-slate-400 shrink-0 font-medium">{t.sampleExamples}</span>
          {sampleTexts.map((st, i) => (
            <button
              key={i}
              onClick={() => setText(st)}
              className="text-[11px] px-3 py-1 rounded-xl bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.06] hover:border-amber-500/40 transition whitespace-nowrap"
            >
              {st.slice(0, 25)}...
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fade-in">
          {error}
        </div>
      )}

      {/* Voice Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Voice Selection */}
        <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-3 shadow-lg">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-amber-400" />
            <span>{t.voiceActor}</span>
          </label>
          <div className="space-y-2">
            {voices.map((v) => (
              <button
                key={v.id}
                onClick={() => setVoice(v.id)}
                className={`w-full p-3 rounded-2xl border text-start flex items-center justify-between transition-all duration-200 ${
                  voice === v.id
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span className="text-xs font-medium">{v.name}</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                  {v.gender === 'female' ? t.voiceGenderFemale : t.voiceGenderMale}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders (Speed & Pitch) */}
        <div className="p-5 rounded-3xl tech-card border border-white/[0.08] space-y-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            {/* Speed slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{t.speechSpeed}</span>
                <span className="font-mono text-amber-400 font-bold bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">{speed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.25"
                value={speed}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSpeed(val);
                  if (audioRef.current) {
                    audioRef.current.playbackRate = val;
                  }
                }}
                className="w-full accent-amber-500 bg-white/[0.05] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5x</span>
                <span>{t.speedNormal}</span>
                <span>2.0x</span>
              </div>
            </div>

            {/* Pitch slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{t.speechPitch}</span>
                <span className="font-mono text-amber-400 font-bold bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">{pitch}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-white/[0.05] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            {!isPlaying ? (
              <button
                onClick={handleGenerateAndPlay}
                disabled={!text.trim() || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:opacity-95 disabled:opacity-40 text-white font-bold text-sm shadow-xl shadow-amber-600/25 transition-all duration-200 border border-amber-400/30 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{loading ? 'سۈنئىي ئەقىل ئاۋاز چىقىرىۋاتىدۇ...' : t.generateAudioBtn}</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/25 transition-all"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>{t.stopAudio}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audio Visualizer & Player Box */}
      <div className="p-6 rounded-3xl tech-card border border-white/[0.08] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">{t.audioPlayerTitle}</h4>
          </div>
          <span className="text-xs text-amber-400 font-mono flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-amber-400 tech-pulse' : 'bg-slate-600'}`} />
            {isPlaying ? t.audioPlaying : t.audioReady}
          </span>
        </div>

        {/* Animated Waveform Bars */}
        <div className="h-20 flex items-center justify-center gap-1.5 bg-[#06070a] rounded-2xl p-4 border border-white/[0.06] overflow-hidden">
          {Array.from({ length: 42 }).map((_, i) => {
            const isHighlighted = isPlaying;
            const barHeight = isPlaying ? Math.floor(Math.sin(i * 0.4) * 26 + 32) : 6;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isHighlighted ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-sm shadow-amber-500/30' : 'bg-white/[0.06]'
                }`}
                style={{ height: `${barHeight}px` }}
              />
            );
          })}
        </div>

        {/* Bottom player controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReplay}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-amber-400 border border-white/[0.08] hover:border-amber-500/40 transition disabled:opacity-40"
              title={t.replayAudio}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={!audioUrl}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white text-xs font-medium border border-white/[0.08] hover:border-amber-500/40 transition disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.downloadAudioWav}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
