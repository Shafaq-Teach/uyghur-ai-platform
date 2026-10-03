'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.08] py-5 bg-white/90 dark:bg-[#08090d]/90 backdrop-blur-md relative z-10">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">{t.siteTitle}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-400 dark:text-slate-500">{t.siteSubtitle}</span>
        </div>

        <div className="text-[11px] text-slate-400 dark:text-slate-500">
          <span>© {new Date().getFullYear()} {t.siteTitle}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
