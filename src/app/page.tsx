'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { UniversalLauncher } from '@/components/dashboard/UniversalLauncher';
import { 
  MessageSquare, 
  Languages, 
  Image as ImageIcon, 
  Volume2, 
  Video, 
  History,
  Sparkles, 
  Play,
  ArrowLeft, 
  ArrowRight, 
  Terminal,
  Activity,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const { t, isRtl, lang, settings, isAdmin } = useApp();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const features = [
    {
      id: 'chat',
      code: lang === 'ug' ? '1-بۆلەك' : 'MOD_01',
      href: '/chat',
      title: t.fChatTitle,
      desc: t.fChatDesc,
      icon: MessageSquare,
      accentColor: 'indigo',
      borderHover: 'border-slate-200/90 dark:border-indigo-500/25 hover:border-indigo-500/50 hover:shadow-indigo-500/10',
      badgeColor: 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200/80 dark:border-indigo-500/30',
      dotColor: 'bg-indigo-500 dark:bg-indigo-400',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      tag: lang === 'ug' ? 'ئەقلىي تەپەككۇر ۋە پاراڭ' : 'Reasoning & Coding',
      stats: lang === 'ug' ? 'تېز سۈرئەتلىك ئەقلىي پاراڭ' : '128K Context • Realtime',
    },
    {
      id: 'translate',
      code: lang === 'ug' ? '2-بۆلەك' : 'MOD_02',
      href: '/translate',
      title: t.fTransTitle,
      desc: t.fTransDesc,
      icon: Languages,
      accentColor: 'emerald',
      borderHover: 'border-slate-200/90 dark:border-emerald-500/25 hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      badgeColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/30',
      dotColor: 'bg-emerald-500 dark:bg-emerald-400',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      tag: lang === 'ug' ? '7 خىل ئۇسلۇب • ئاپتوماتىك' : '7 Tones • Auto Detect',
      stats: lang === 'ug' ? 'تەبىئىي راۋان تەرجىمە' : 'Nuance Engine • RTL Native',
    },
    {
      id: 'image',
      code: lang === 'ug' ? '3-بۆلەك' : 'MOD_03',
      href: '/image',
      title: t.fImageTitle,
      desc: t.fImageDesc,
      icon: ImageIcon,
      accentColor: 'rose',
      borderHover: 'border-slate-200/90 dark:border-rose-500/25 hover:border-rose-500/50 hover:shadow-rose-500/10',
      badgeColor: 'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border-rose-200/80 dark:border-rose-500/30',
      dotColor: 'bg-rose-500 dark:bg-rose-400',
      textColor: 'text-rose-600 dark:text-rose-400',
      tag: lang === 'ug' ? 'سەنئەت ۋە يۇقىرى سۈزۈكلۈك' : 'FLUX / SD / Imagen 3',
      stats: lang === 'ug' ? 'ئەڭ يۇقىرى سۈزۈكلۈك • بېيىتىلغان تەسۋىر' : 'Ultra HD • Prompt Auto-Enhance',
    },
    {
      id: 'tts',
      code: lang === 'ug' ? '4-بۆلەك' : 'MOD_04',
      href: '/tts',
      title: t.fTtsTitle,
      desc: t.fTtsDesc,
      icon: Volume2,
      accentColor: 'amber',
      borderHover: 'border-slate-200/90 dark:border-amber-500/25 hover:border-amber-500/50 hover:shadow-amber-500/10',
      badgeColor: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border-amber-200/80 dark:border-amber-500/30',
      dotColor: 'bg-amber-500 dark:bg-amber-400',
      textColor: 'text-amber-600 dark:text-amber-400',
      tag: lang === 'ug' ? 'ئۇيغۇرچە ئاۋازلاشتۇرۇش' : 'Uyghur Vocalization',
      stats: lang === 'ug' ? 'سۈزۈك ئاۋاز • تەبىئىي ئوقۇش' : 'Neural Synthesis • Waveform',
    },
    {
      id: 'video',
      code: lang === 'ug' ? '5-بۆلەك' : 'MOD_05',
      href: '/ad-video',
      title: t.fVideoTitle,
      desc: t.fVideoDesc,
      icon: Video,
      accentColor: 'purple',
      borderHover: 'border-slate-200/90 dark:border-purple-500/25 hover:border-purple-500/50 hover:shadow-purple-500/10',
      badgeColor: 'text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 border-purple-200/80 dark:border-purple-500/30',
      dotColor: 'bg-purple-500 dark:bg-purple-400',
      textColor: 'text-purple-600 dark:text-purple-400',
      tag: lang === 'ug' ? '8K ستۇدىيە • ماكرو فىلىم' : '8K Studio • Macro Cinema',
      stats: lang === 'ug' ? 'كەسپىي سۈپەت • ئەقلىي سېنارىيە' : 'Cinematic 8K • Intelligent Storyboard',
    },
    {
      id: 'history',
      code: lang === 'ug' ? '6-بۆلەك' : 'MOD_06',
      href: '/history',
      title: t.fHistoryTitle,
      desc: t.fHistoryDesc,
      icon: History,
      accentColor: 'cyan',
      borderHover: 'border-slate-200/90 dark:border-cyan-500/25 hover:border-cyan-500/50 hover:shadow-cyan-500/10',
      badgeColor: 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200/80 dark:border-cyan-500/30',
      dotColor: 'bg-cyan-500 dark:bg-cyan-400',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      tag: lang === 'ug' ? 'ئەسەرلەرنى ساقلاش ۋە باشقۇرۇش' : 'Cloud & Local Vault',
      stats: lang === 'ug' ? 'تولۇق كۆرۈش • مەڭگۈلۈك ساقلاش' : 'Cloud Sync • Instant Search',
    },
  ];

  return (
    <div className="space-y-10 py-2 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Cockpit Section */}
      <section className="relative py-6 sm:py-14 overflow-hidden rounded-[28px] sm:rounded-3xl tech-card border border-slate-200 dark:border-white/[0.08] px-3 sm:px-8 lg:px-12 text-center w-full min-w-0">
        {/* Subtle grid light lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))] pointer-events-none" />

        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          {/* Top Model Badge Pill matching Stitch mobile */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 sm:mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 tech-pulse" />
            <span style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
              {lang === 'ug' ? 'ئەڭ يېڭى سۈرئەت • Turbo v4.5' : 'Ultra Fast • Turbo v4.5'}
            </span>
          </div>

          {/* 1st Sentence: Centered Hero Title with UKIJ Ekran font */}
          <h1 
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.35] sm:leading-[1.25] break-words px-1 text-center"
            style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}
          >
            <span 
              className="rainbow-dynamic-text select-none text-center"
              style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}
            >
              {t.heroTitle}
            </span>
          </h1>

          {/* 2nd Sentence: Centered Hero Subtitle with UKIJ Ekran font */}
          <p 
            className="mt-3 sm:mt-5 text-xs sm:text-base lg:text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium px-2 text-center"
            style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}
          >
            {t.heroDesc}
          </p>

          {/* Mobile App Interactive Console Prompt Capsule (matching Stitch screenshot) */}
          <div className="mt-5 sm:mt-7 max-w-xl mx-auto w-full px-1">
            <Link
              href="/chat"
              className="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-[#0f1322]/90 border border-slate-200/90 dark:border-indigo-500/30 hover:border-indigo-500 shadow-sm hover:shadow-indigo-500/15 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                  {lang === 'ug' ? 'ئەقلىي ياردەمچىدىن خالىغان مەزمۇننى سوراڭ...' : 'Ask AI anything or enter prompt...'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500/25 border border-indigo-500/40 text-white dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Arrow className="w-4 h-4 rtl:rotate-180" />
              </div>
            </Link>

            {/* Token Usage Status Bar */}
            <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold flex items-center gap-1.5" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                <span className="text-amber-500">⚡</span>
                <span>{lang === 'ug' ? 'كۈندىلىك ئەقلىي سىستېما' : 'Daily AI System'}</span>
              </span>
              <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                PRO • 48kHz HD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Universal Omni-Box Launcher for Instant Tasks */}
      <UniversalLauncher />

      {/* Module Matrix Section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3 sm:pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 tech-pulse" />
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                {t.modulesOnline}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
              {t.modulesSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
              {t.modulesSectionDesc}
            </p>
          </div>
        </div>

        {/* Feature Cards Grid (2-column on mobile, 3-column on desktop - Android App style) */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
          {features.map((feature) => {
            return (
              <Link
                key={feature.id}
                href={feature.href}
                className={`group bg-white/95 dark:bg-[#0a0d18]/95 border rounded-[22px] sm:rounded-[26px] p-3 sm:p-5 md:p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 shadow-md hover:shadow-xl dark:shadow-xl dark:hover:shadow-2xl ${feature.borderHover}`}
              >
                <div>
                  {/* Top Header: Badge on right/start and Code on left/end */}
                  <div className="flex items-center justify-between gap-1 mb-2.5 sm:mb-4">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      {feature.code}
                    </span>
                    <span className={`text-[9px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border flex items-center gap-1 sm:gap-1.5 truncate max-w-[70%] sm:max-w-none ${feature.badgeColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${feature.dotColor} shrink-0`} />
                      <span className="truncate" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>{feature.tag}</span>
                    </span>
                  </div>

                  {/* Visual Mockup Box */}
                  {feature.id === 'chat' && (
                    <div className="w-full h-18 sm:h-22 md:h-24 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#090b14] border border-slate-200/80 dark:border-indigo-500/20 p-2.5 sm:p-3.5 flex items-center justify-between mb-2.5 sm:mb-4 relative overflow-hidden group-hover:border-indigo-500/40 transition">
                      <div className="space-y-1.5 sm:space-y-2 flex-1 max-w-[65%]">
                        <div className="h-2 sm:h-2.5 w-full rounded-full bg-gradient-to-r from-indigo-500/30 to-indigo-500/5 dark:from-indigo-500/35 dark:to-indigo-500/10" />
                        <div className="h-2 sm:h-2.5 w-3/4 rounded-full bg-gradient-to-r from-indigo-500/20 to-indigo-500/5 dark:from-indigo-500/25 dark:to-indigo-500/5" />
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse delay-150" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse delay-300" />
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-100/80 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs dark:shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  )}

                  {feature.id === 'translate' && (
                    <div className="w-full h-18 sm:h-22 md:h-24 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#081211] border border-slate-200/80 dark:border-emerald-500/20 p-2.5 sm:p-3.5 flex items-center justify-between mb-2.5 sm:mb-4 relative overflow-hidden group-hover:border-emerald-500/40 transition">
                      <div className="flex flex-col justify-between h-full py-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-white dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] shadow-2xs">
                            EN
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400/80 font-bold">---</span>
                          <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                            ئۇي
                          </span>
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-mono text-emerald-600 dark:text-emerald-400/80 tracking-wider font-semibold">
                          UG ⇄ EN ⇄ TR
                        </span>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-500/15 border border-emerald-200/80 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs dark:shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  )}

                  {feature.id === 'image' && (
                    <div className="w-full h-18 sm:h-22 md:h-24 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#140a12] border border-slate-200/80 dark:border-rose-500/20 p-2.5 sm:p-3.5 flex items-center justify-between mb-2.5 sm:mb-4 relative overflow-hidden group-hover:border-rose-500/40 transition">
                      <div className="flex items-center gap-1.5 sm:gap-2.5">
                        <div className="w-9 h-11 sm:w-11 sm:h-13 rounded-lg sm:rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-500 shadow-sm shadow-rose-500/20 p-0.5 flex items-center justify-center shrink-0 group-hover:rotate-2 transition-transform">
                          <div className="w-full h-full rounded-[7px] sm:rounded-[10px] bg-black/20 dark:bg-black/30 backdrop-blur-xs flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          </div>
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-mono text-rose-600 dark:text-rose-300/90 font-semibold leading-tight">
                          4K • 8K • 16:9
                        </span>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-100/80 dark:bg-rose-500/15 border border-rose-200/80 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-2xs dark:shadow-rose-500/20 group-hover:scale-105 transition-transform">
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  )}

                  {feature.id === 'tts' && (
                    <div className="w-full h-18 sm:h-22 md:h-24 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#141009] border border-slate-200/80 dark:border-amber-500/20 p-2.5 sm:p-3.5 flex items-center justify-between mb-2.5 sm:mb-4 relative overflow-hidden group-hover:border-amber-500/40 transition">
                      <div className="flex flex-col justify-between h-full py-0.5">
                        <div className="flex items-end gap-1 h-5 sm:h-6">
                          <span className="w-1 h-2.5 sm:h-3 rounded-full bg-amber-500 dark:bg-amber-400" />
                          <span className="w-1 h-4 sm:h-5 rounded-full bg-amber-500 dark:bg-amber-400" />
                          <span className="w-1 h-5 sm:h-6 rounded-full bg-amber-400 dark:bg-amber-300" />
                          <span className="w-1 h-3.5 sm:h-4 rounded-full bg-amber-500 dark:bg-amber-400" />
                          <span className="w-1 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                          <span className="w-1 h-4 sm:h-5 rounded-full bg-amber-400 dark:bg-amber-300" />
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-mono text-amber-700 dark:text-amber-300/90 font-semibold">
                          HD Voice • 48kHz
                        </span>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-100/80 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs dark:shadow-amber-500/20 group-hover:scale-105 transition-transform">
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  )}

                  {feature.id === 'video' && (
                    <div className="w-full h-18 sm:h-22 md:h-24 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#120a1b] border border-slate-200/80 dark:border-purple-500/20 p-2.5 sm:p-3.5 flex items-center justify-between mb-2.5 sm:mb-4 relative overflow-hidden group-hover:border-purple-500/40 transition">
                      <div className="flex items-center gap-1.5 sm:gap-2.5">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-purple-600 to-violet-600 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white ms-0.5" />
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-mono text-purple-600 dark:text-purple-300/90 font-semibold leading-tight">
                          60fps • 3D Render
                        </span>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-100/80 dark:bg-purple-500/15 border border-purple-200/80 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs dark:shadow-purple-500/20 group-hover:scale-105 transition-transform">
                        <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  )}

                  {feature.id === 'history' && (
                    <div className="w-full h-18 sm:h-22 md:h-24 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#091317] border border-slate-200/80 dark:border-cyan-500/20 p-2.5 sm:p-3.5 flex items-center justify-between mb-2.5 sm:mb-4 relative overflow-hidden group-hover:border-cyan-500/40 transition">
                      <div className="flex items-center gap-1.5 sm:gap-2.5">
                        <div className="w-8 h-10 sm:w-10 sm:h-12 rounded-lg sm:rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/30 flex flex-col justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 shadow-2xs shrink-0">
                          <div className="h-1 w-full bg-cyan-600 dark:bg-cyan-400/80 rounded-full" />
                          <div className="h-1 w-2/3 bg-cyan-500 dark:bg-cyan-400/50 rounded-full" />
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-mono text-cyan-700 dark:text-cyan-300/90 font-semibold leading-tight">
                          Cloud Vault
                        </span>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-100/80 dark:bg-cyan-500/15 border border-cyan-200/80 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-2xs dark:shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                        <History className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  )}

                  <h3 className="text-xs sm:text-base md:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                    {feature.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 leading-relaxed line-clamp-2" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                    {feature.desc}
                  </p>
                </div>

                <div className="mt-3 sm:mt-5 pt-2 sm:pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] sm:text-xs gap-1 sm:gap-2">
                  <span className={`flex items-center gap-1 font-bold transition-all shrink-0 ${feature.textColor} group-hover:opacity-90`} style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                    <Arrow className="w-3 h-3 sm:w-3.5 sm:h-3.5 rtl:rotate-180 transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1" />
                    <span>{t.openConsole}</span>
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {feature.stats}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Works Showcase Gallery (matching Stitch Android design) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 tech-pulse" />
            <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
              {lang === 'ug' ? '✨ ئېسىل ئەسەرلەر كۆرگەزمىسى' : '✨ Featured AI Creations'}
            </h3>
          </div>
          <Link 
            href="/history" 
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}
          >
            <span>{lang === 'ug' ? 'ھەممىسىنى كۆرۈش' : 'View All'}</span>
            <Arrow className="w-3 h-3 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: 3D Video Render Showcase */}
          <Link
            href="/ad-video"
            className="group relative rounded-2xl bg-white/95 dark:bg-[#0a0d18]/95 border border-slate-200 dark:border-purple-500/20 p-3.5 flex items-center gap-3.5 hover:border-purple-500/50 shadow-md hover:shadow-lg transition-all"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-tr from-purple-900 to-indigo-900 border border-purple-500/30 flex items-center justify-center shrink-0 relative overflow-hidden shadow-xs">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.4),transparent)]" />
              <Play className="w-6 h-6 text-white fill-white/80 group-hover:scale-110 transition-transform relative z-10" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                {lang === 'ug' ? '3D سىن • 60fps' : '3D Video • 60fps'}
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition truncate" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                {lang === 'ug' ? 'مەھسۇلات ئېلان فىلىمى 1-قىسىم' : 'Commercial 3D Product Video'}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-mono">
                Cinematic Lighting • Ultra Realistic Macro
              </p>
            </div>
          </Link>

          {/* Card 2: 8K AI Art Showcase */}
          <Link
            href="/image"
            className="group relative rounded-2xl bg-white/95 dark:bg-[#0a0d18]/95 border border-slate-200 dark:border-rose-500/20 p-3.5 flex items-center gap-3.5 hover:border-rose-500/50 shadow-md hover:shadow-lg transition-all"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-tr from-rose-900 to-pink-900 border border-rose-500/30 flex items-center justify-center shrink-0 relative overflow-hidden shadow-xs">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.4),transparent)]" />
              <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform relative z-10" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                {lang === 'ug' ? 'سەنئەت رەسىمى • 8K' : 'AI Artwork • 8K'}
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition truncate" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                {lang === 'ug' ? 'ئالتۇن كۈز كەچلىك كۆرۈنۈشى' : 'Golden Autumn Cityscape'}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-mono">
                16:9 • Ultra HD • Obsidian Lumina
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
