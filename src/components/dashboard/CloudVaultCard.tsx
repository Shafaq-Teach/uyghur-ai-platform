'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Cloud, 
  ArrowRight,
  ArrowLeft,
  KeyRound,
  History
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

export const CloudVaultCard: React.FC = () => {
  const { user, isRtl, history, settings } = useApp();
  const [authOpen, setAuthOpen] = useState(false);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const historyCount = history.length;
  const keyCount = (settings?.openRouterApiKey ? 1 : 0) + (settings?.geminiApiKey ? 1 : 0);

  return (
    <>
      <div className="rounded-3xl tech-card border border-slate-200 dark:border-white/[0.1] p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Supabase بۇلۇت ئۇلىنىشى
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  بىخەتەر سانلىق مەلۇمات مەركىزى
                </p>
              </div>
            </div>

            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              user 
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-200/60 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-emerald-400 tech-pulse' : 'bg-slate-400'}`} />
              <span>{user ? 'CLOUD SYNCED' : 'LOCAL CACHE'}</span>
            </span>
          </div>

          {/* User Profile or Login Callout */}
          {user ? (
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-white/[0.02] border border-indigo-100 dark:border-white/[0.06] mb-4">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-indigo-300" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow">
                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {user.fullName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-4 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-0.5">
                    ھېساباتقا كىرىپ سىنخىرو قىلىڭ
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    API ئاچقۇچ ۋە تارىخنى بۇلۇتقا ساقلاش
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 shrink-0"
                >
                  كىرىش
                </button>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                <History className="w-3.5 h-3.5" />
                <span className="text-[10px]">ئەسەرلەر سانى</span>
              </div>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {historyCount} <span className="text-[10px] font-normal text-slate-400">دانە</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span className="text-[10px]">ئاچقۇچ ھالىتى</span>
              </div>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {keyCount} / 2 <span className="text-[10px] font-normal text-slate-400">تەڭشەلدى</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
          <Link
            href="/history"
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <span>بارلىق تارىخنى تەكشۈرۈش</span>
            <ArrowIcon className="w-3 h-3" />
          </Link>
          <span className="text-[10px] text-slate-400 font-mono">SUPABASE PRO</span>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};
