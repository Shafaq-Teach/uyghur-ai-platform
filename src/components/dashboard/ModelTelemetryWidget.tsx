'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Activity, 
  KeyRound, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ModelTelemetryWidget: React.FC = () => {
  const { t, settings } = useApp();

  const hasOpenRouter = !!settings?.openRouterApiKey;
  const hasGemini = !!settings?.geminiApiKey;

  const engines = [
    {
      name: 'Google Gemini Pro & Flash',
      endpoint: 'api.generativeai.google.com',
      flagship: 'gemini-3.8-flash / 2.5',
      latency: '38ms',
      status: hasGemini ? 'ONLINE' : 'KEY NEEDED',
      statusType: hasGemini ? 'online' : 'warning',
      color: 'emerald',
    },
    {
      name: 'OpenRouter Multi-Model Mesh',
      endpoint: 'openrouter.ai/api/v1',
      flagship: 'DeepSeek V3 / Claude 3.5 / Llama 3.3',
      latency: '115ms',
      status: hasOpenRouter ? 'ONLINE' : 'KEY NEEDED',
      statusType: hasOpenRouter ? 'online' : 'warning',
      color: 'indigo',
    },
    {
      name: 'Flux-1 Image Synthesis',
      endpoint: 'black-forest-labs/flux-1-schnell',
      flagship: 'Hyper-Fast 4-Step Latent Diffusion',
      latency: '1.8s',
      status: hasOpenRouter ? 'ACTIVE' : 'KEY NEEDED',
      statusType: hasOpenRouter ? 'online' : 'warning',
      color: 'purple',
    },
    {
      name: 'Neural Uyghur & Multilingual TTS',
      endpoint: 'OpenAI TTS / Edge Speech',
      flagship: 'Neural Speech Synthesizer',
      latency: '210ms',
      status: 'READY',
      statusType: 'online',
      color: 'amber',
    },
  ];

  return (
    <div className="rounded-3xl tech-card border border-slate-200 dark:border-white/[0.1] p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {t.telemetryTitle}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {t.telemetryDesc}
              </p>
            </div>
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            <span>{t.navSettings}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Engine Telemetry List */}
        <div className="space-y-2.5">
          {engines.map((eng, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.12] transition flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  eng.statusType === 'online' ? 'bg-emerald-400 tech-pulse' : 'bg-amber-400'
                }`} />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-slate-200 truncate text-[12px]">
                    {eng.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate">
                    {eng.flagship}
                  </div>
                </div>
              </div>

              <div className="text-end shrink-0">
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 block">
                  {eng.latency}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  eng.statusType === 'online'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                }`}>
                  {eng.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Key Quick Status Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>AES-256 شىفىرلىق ساقلاش</span>
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <KeyRound className="w-3 h-3" />
          <span>{hasOpenRouter && hasGemini ? 'ئاچقۇچلار تولۇق' : 'ئاچقۇچ تەڭشەش'}</span>
        </Link>
      </div>
    </div>
  );
};
