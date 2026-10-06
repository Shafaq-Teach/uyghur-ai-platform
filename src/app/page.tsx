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
  ShieldCheck, 
  Zap,
  Layers,
  Cpu,
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
      borderHover: 'border-indigo-500/25 hover:border-indigo-500/60 hover:shadow-indigo-500/15',
      badgeColor: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
      dotColor: 'bg-indigo-400',
      textColor: 'text-indigo-400',
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
      borderHover: 'border-emerald-500/25 hover:border-emerald-500/60 hover:shadow-emerald-500/15',
      badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
      dotColor: 'bg-emerald-400',
      textColor: 'text-emerald-400',
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
      borderHover: 'border-rose-500/25 hover:border-rose-500/60 hover:shadow-rose-500/15',
      badgeColor: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
      dotColor: 'bg-rose-400',
      textColor: 'text-rose-400',
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
      borderHover: 'border-amber-500/25 hover:border-amber-500/60 hover:shadow-amber-500/15',
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      dotColor: 'bg-amber-400',
      textColor: 'text-amber-400',
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
      borderHover: 'border-purple-500/25 hover:border-purple-500/60 hover:shadow-purple-500/15',
      badgeColor: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
      dotColor: 'bg-purple-400',
      textColor: 'text-purple-400',
      tag: lang === 'ug' ? 'ئادەمسىز • ماكرو فىلىم' : 'Strictly No Humans • Macro',
      stats: lang === 'ug' ? 'كەسپىي سۈپەت • ئەقلىي سېنارىيە' : '3-Layer Safety • Cinematic 4K',
    },
    {
      id: 'history',
      code: lang === 'ug' ? '6-بۆلەك' : 'MOD_06',
      href: '/history',
      title: t.fHistoryTitle,
      desc: t.fHistoryDesc,
      icon: History,
      accentColor: 'cyan',
      borderHover: 'border-cyan-500/25 hover:border-cyan-500/60 hover:shadow-cyan-500/15',
      badgeColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
      dotColor: 'bg-cyan-400',
      textColor: 'text-cyan-400',
      tag: lang === 'ug' ? 'ئەسەرلەرنى ساقلاش ۋە باشقۇرۇش' : 'Cloud & Local Vault',
      stats: lang === 'ug' ? 'تولۇق كۆرۈش • مەڭگۈلۈك ساقلاش' : 'Cloud Sync • Instant Search',
    },
  ];

  return (
    <div className="space-y-10 py-2 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Cockpit Section */}
      <section className="relative py-7 sm:py-16 overflow-hidden rounded-3xl tech-card border border-slate-200 dark:border-white/[0.08] px-3 sm:px-8 lg:px-12 text-center w-full min-w-0">
        {/* Subtle grid light lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))] pointer-events-none" />

        {/* Hero Title */}
        <h1 
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight max-w-5xl mx-auto leading-[1.35] sm:leading-[1.25] font-kawak break-words px-1"
          style={{ fontFamily: "'UKIJ Kawak 3D', sans-serif" }}
        >
          <span 
            className="rainbow-dynamic-text font-kawak select-none"
            style={{ fontFamily: "'UKIJ Kawak 3D', sans-serif" }}
          >
            {t.heroTitle}
          </span>
        </h1>

        {/* Hero Description */}
        <p className="mt-4 sm:mt-6 text-xs sm:text-base lg:text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium px-1 sm:px-2">
          {t.heroDesc}
        </p>

        {/* Technical Telemetry Dashboard Specs */}
        <div className="mt-7 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 max-w-5xl mx-auto text-start w-full min-w-0">
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-indigo-400 dark:hover:border-indigo-500/30 transition min-w-0 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 dark:text-indigo-400" />
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500">{lang === 'ug' ? 'ئالاھىدىلىك 1' : 'SPEC // 01'}</span>
            </div>
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{t.spec1Title}</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{t.spec1Desc}</p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-emerald-400 dark:hover:border-emerald-500/30 transition min-w-0 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500">{lang === 'ug' ? 'ئالاھىدىلىك 2' : 'SPEC // 02'}</span>
            </div>
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{t.spec2Title}</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{t.spec2Desc}</p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-rose-400 dark:hover:border-rose-500/30 transition min-w-0 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 dark:text-rose-400" />
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500">{lang === 'ug' ? 'ئالاھىدىلىك 3' : 'SPEC // 03'}</span>
            </div>
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{t.spec3Title}</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{t.spec3Desc}</p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-purple-400 dark:hover:border-purple-500/30 transition min-w-0 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 dark:text-purple-400" />
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500">{lang === 'ug' ? 'ئالاھىدىلىك 4' : 'SPEC // 04'}</span>
            </div>
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{t.spec4Title}</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{t.spec4Desc}</p>
          </div>
        </div>
      </section>

      {/* Universal Omni-Box Launcher for Instant Tasks */}
      <UniversalLauncher />

      {/* Module Matrix Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 tech-pulse" />
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                {t.modulesOnline}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t.modulesSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t.modulesSectionDesc}
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            return (
              <Link
                key={feature.id}
                href={feature.href}
                className={`group bg-[#090b14]/90 dark:bg-[#0a0d18]/95 border rounded-[26px] p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 shadow-xl hover:shadow-2xl ${feature.borderHover}`}
              >
                <div>
                  {/* Top Header: Badge on right/start and Code on left/end */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      {feature.code}
                    </span>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${feature.badgeColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${feature.dotColor}`} />
                      <span>{feature.tag}</span>
                    </span>
                  </div>

                  {/* Visual Mockup Box */}
                  {feature.id === 'chat' && (
                    <div className="w-full h-24 rounded-2xl bg-[#090b14] border border-indigo-500/20 p-3.5 flex items-center justify-between mb-4 relative overflow-hidden group-hover:border-indigo-500/40 transition">
                      <div className="space-y-2 flex-1 max-w-[65%]">
                        <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-indigo-500/35 to-indigo-500/10" />
                        <div className="h-2.5 w-3/4 rounded-full bg-gradient-to-r from-indigo-500/25 to-indigo-500/5" />
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-150" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-300" />
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {feature.id === 'translate' && (
                    <div className="w-full h-24 rounded-2xl bg-[#081211] border border-emerald-500/20 p-3.5 flex items-center justify-between mb-4 relative overflow-hidden group-hover:border-emerald-500/40 transition">
                      <div className="flex flex-col justify-between h-full py-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-300 border border-white/[0.1]">
                            EN
                          </span>
                          <span className="text-[10px] text-emerald-400/80 font-bold">---</span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                            ئۇي
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400/80 tracking-wider font-semibold">
                          UG ⇄ EN ⇄ TR ⇄ AR
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        <Languages className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {feature.id === 'image' && (
                    <div className="w-full h-24 rounded-2xl bg-[#140a12] border border-rose-500/20 p-3.5 flex items-center justify-between mb-4 relative overflow-hidden group-hover:border-rose-500/40 transition">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-13 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 shadow-lg shadow-rose-500/30 p-0.5 flex items-center justify-center shrink-0 group-hover:rotate-2 transition-transform">
                          <div className="w-full h-full rounded-[10px] bg-black/30 backdrop-blur-xs flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white/90" />
                          </div>
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-rose-300/90 font-medium leading-tight">
                          4K • 8K • 16:9 • Ultra Realistic
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20 group-hover:scale-105 transition-transform">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {feature.id === 'tts' && (
                    <div className="w-full h-24 rounded-2xl bg-[#141009] border border-amber-500/20 p-3.5 flex items-center justify-between mb-4 relative overflow-hidden group-hover:border-amber-500/40 transition">
                      <div className="flex flex-col justify-between h-full py-0.5">
                        <div className="flex items-end gap-1 h-6">
                          <span className="w-1 h-3 rounded-full bg-amber-400" />
                          <span className="w-1 h-5 rounded-full bg-amber-400" />
                          <span className="w-1 h-6 rounded-full bg-amber-300" />
                          <span className="w-1 h-4 rounded-full bg-amber-400" />
                          <span className="w-1 h-2 rounded-full bg-amber-400" />
                          <span className="w-1 h-5 rounded-full bg-amber-300" />
                          <span className="w-1 h-3 rounded-full bg-amber-400" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-amber-300/90 font-medium">
                          HD Studio Voice • 48kHz
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
                        <Volume2 className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {feature.id === 'video' && (
                    <div className="w-full h-24 rounded-2xl bg-[#120a1b] border border-purple-500/20 p-3.5 flex items-center justify-between mb-4 relative overflow-hidden group-hover:border-purple-500/40 transition">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30 group-hover:scale-105 transition-transform shrink-0">
                          <Play className="w-4 h-4 fill-white ms-0.5" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-purple-300/90 font-medium leading-tight">
                          Cinematic 60fps • 3D Render
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform">
                        <Video className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {feature.id === 'history' && (
                    <div className="w-full h-24 rounded-2xl bg-[#091317] border border-cyan-500/20 p-3.5 flex items-center justify-between mb-4 relative overflow-hidden group-hover:border-cyan-500/40 transition">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex flex-col justify-center gap-1.5 px-2 shadow-md shadow-cyan-500/20 shrink-0">
                          <div className="h-1 w-full bg-cyan-400/80 rounded-full" />
                          <div className="h-1 w-2/3 bg-cyan-400/50 rounded-full" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-cyan-300/90 font-medium leading-tight">
                          Cloud Vault • Encrypted
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-sm shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                        <History className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    {feature.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs gap-2">
                  <span className={`flex items-center gap-1.5 font-bold transition-all shrink-0 ${feature.textColor} group-hover:opacity-90`}>
                    <Arrow className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1" />
                    <span>{t.openConsole}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <span>{feature.stats}</span>
                    <span className="text-slate-600 dark:text-slate-500">•</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
