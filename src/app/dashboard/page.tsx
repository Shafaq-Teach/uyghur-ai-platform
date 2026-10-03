'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ModelTelemetryWidget } from '@/components/dashboard/ModelTelemetryWidget';
import { CloudVaultCard } from '@/components/dashboard/CloudVaultCard';
import { QuickEnginesGrid } from '@/components/dashboard/QuickEnginesGrid';
import { UniversalLauncher } from '@/components/dashboard/UniversalLauncher';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Cpu, 
  Layers, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Server
} from 'lucide-react';

export default function DashboardPage() {
  const { t, isRtl, lang, settings, isAdmin, user, history } = useApp();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-8 py-4 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Cockpit Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-200 dark:border-white/[0.1] shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {lang === 'ug' ? 'سۈنئىي ئىدراك باشقۇرۇش تاختىسى (Dashboard)' : 'AI System Cockpit & Dashboard'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-indigo-200/70 mt-1 max-w-2xl leading-relaxed">
                {lang === 'ug' 
                  ? 'سۈنئىي ئەقىل تور سۈرئىتى، ماتورلارنىڭ دەل ۋاقتىدىكى ساغلاملىقى، بۇلۇت ئۇلىنىشى ۋە ئورتاق مەشغۇلات مەركىزى.' 
                  : 'Real-time telemetry, model latencies, cloud persistence, and neural engine command center.'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md shadow-purple-600/30 shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'ug' ? 'باشقۇرغۇچى مەركىزى' : 'Master Admin'}</span>
            </Link>
          )}
        </div>

        {/* Quick System Metric Badges */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{lang === 'ug' ? 'تور سۈرئىتى: 38ms تېز ئىنكاس' : 'Latency: 38ms High-Speed'}</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-200">
            <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">{lang === 'ug' ? 'قوش يادرو: OpenRouter + Gemini' : 'Dual-Engine: OpenRouter & Gemini'}</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-200">
            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">{history.length} {lang === 'ug' ? 'ئەسەر ساقلانغان' : 'Creations Cached'}</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-200">
            <Server className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">{lang === 'ug' ? 'Cloudflare Edge قوغدالغان' : 'Cloudflare Edge Active'}</span>
          </div>
        </div>
      </div>

      {/* Universal Omni-Box Launcher */}
      <UniversalLauncher />

      {/* Twin Cockpit Cards: Telemetry & Cloud Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModelTelemetryWidget />
        <CloudVaultCard />
      </div>

      {/* Quick Core Engines Section */}
      <QuickEnginesGrid />
    </div>
  );
}
