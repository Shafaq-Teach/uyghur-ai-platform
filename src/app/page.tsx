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
  Sparkles, 
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
      gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      borderHover: 'hover:border-indigo-500/60 hover:shadow-indigo-500/10',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      iconColor: 'text-indigo-400',
      activeModel: settings.featureModels.chat,
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
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderHover: 'hover:border-emerald-500/60 hover:shadow-emerald-500/10',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      iconColor: 'text-emerald-400',
      activeModel: settings.featureModels.translate,
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
      gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
      borderHover: 'hover:border-rose-500/60 hover:shadow-rose-500/10',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      iconColor: 'text-rose-400',
      activeModel: settings.featureModels.image,
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
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderHover: 'hover:border-amber-500/60 hover:shadow-amber-500/10',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      iconColor: 'text-amber-400',
      activeModel: settings.featureModels.tts,
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
      gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
      borderHover: 'hover:border-purple-500/60 hover:shadow-purple-500/10',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      iconColor: 'text-purple-400',
      activeModel: settings.featureModels.video,
      tag: lang === 'ug' ? 'ئادەمسىز • ماكرو فىلىم' : 'Strictly No Humans • Macro',
      stats: lang === 'ug' ? 'كەسپىي سۈپەت • ئەقلىي سېنارىيە' : '3-Layer Safety • Cinematic 4K',
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
            const Icon = feature.icon;
            return (
              <Link
                key={feature.id}
                href={feature.href}
                className={`group tech-card rounded-3xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 ${feature.borderHover}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {feature.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${feature.badgeColor}`}>
                      {feature.tag}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs gap-2">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    {feature.stats}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform shrink-0">
                    <span>{t.openConsole}</span>
                    <Arrow className="w-3.5 h-3.5 rtl:rotate-180" />
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
