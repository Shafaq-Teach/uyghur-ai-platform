'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  MessageSquare, 
  Languages, 
  Image as ImageIcon, 
  Volume2, 
  ArrowRight,
  ArrowLeft,
  Layers
} from 'lucide-react';

export const QuickEnginesGrid: React.FC = () => {
  const { t, isRtl, lang, settings } = useApp();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const engines = [
    {
      title: t.fChatTitle,
      desc: t.fChatDesc,
      href: '/chat',
      icon: MessageSquare,
      model: settings?.featureModels?.chat || 'gemini-3.8-flash',
      color: 'indigo',
      badge: lang === 'ug' ? 'ئەقلىي سۆھبەت' : 'MULTI-TURN CHAT',
      gradient: 'from-indigo-600 to-blue-600',
      tag: 'چوڭقۇر پاراڭلىشىش',
    },
    {
      title: t.fTransTitle,
      desc: t.fTransDesc,
      href: '/translate',
      icon: Languages,
      model: settings?.featureModels?.translate || 'gemini-3.8-flash',
      color: 'cyan',
      badge: lang === 'ug' ? 'ئەقلىي تەرجىمە' : 'NEURAL TRANSLATOR',
      gradient: 'from-cyan-600 to-teal-600',
      tag: '7 خىل ئۇسلۇبتا تەرجىمە',
    },
    {
      title: t.fImageTitle,
      desc: t.fImageDesc,
      href: '/image',
      icon: ImageIcon,
      model: settings?.featureModels?.image || 'flux-1-schnell',
      color: 'emerald',
      badge: lang === 'ug' ? 'سۈرەت سەنئىتى' : 'FLUX SYNTHESIS',
      gradient: 'from-emerald-600 to-green-600',
      tag: 'يۇقىرى ئېنىقلىقتا رەسىم',
    },
    {
      title: t.fTtsTitle + (lang === 'ug' ? ' ۋە ' : ' & ') + t.navVideo,
      desc: 'ئۇيغۇرچە تەبىئىي ئاۋازغا ئايلاندۇرۇش ۋە ئادەمسىز سۈپەتلىك تاۋار ئېلان سىن فىلىمى ستۇدىيەسى.',
      href: '/tts',
      icon: Volume2,
      model: 'openai/tts-1',
      color: 'purple',
      badge: lang === 'ug' ? 'ئاۋاز ۋە سىن ستۇدىيەسى' : 'VOICE & VIDEO STUDIO',
      gradient: 'from-purple-600 to-pink-600',
      tag: 'ئاۋاز ۋە سىن ستۇدىيەسى',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            {t.quickEnginesTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.modulesSectionDesc}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[10px] text-slate-600 dark:text-slate-400 font-medium">
          <Layers className="w-3 h-3 text-indigo-500" />
          <span>{lang === 'ug' ? 'ماتورلار پۈتۈنلەي ئوچۇق: 4 / 4' : 'ENGINES ACTIVE: 4 / 4'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {engines.map((eng, idx) => {
          const Icon = eng.icon;
          return (
            <Link
              key={idx}
              href={eng.href}
              className="group rounded-3xl tech-card border border-slate-200 dark:border-white/[0.08] p-5 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-md hover:shadow-xl relative overflow-hidden"
            >
              {/* Top ambient highlight on hover */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${eng.gradient} text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                    {eng.badge}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {eng.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {eng.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                  {eng.model.split('/').pop()}
                </span>
                <span className="flex items-center gap-1 font-bold text-xs text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  <span>باشلاش</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
