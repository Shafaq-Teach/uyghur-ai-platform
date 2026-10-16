'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured Client Exception:', error);

    // Auto-recover from stale Webpack chunks after a new Cloudflare deployment
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Cannot find module');

    if (isChunkError && typeof window !== 'undefined') {
      const reloadKey = 'uyghur_ai_last_chunk_reload';
      const lastReload = parseInt(sessionStorage.getItem(reloadKey) || '0', 10);
      const now = Date.now();
      // If we haven't auto-reloaded in the last 15 seconds, auto reload cleanly
      if (now - lastReload > 15000) {
        sessionStorage.setItem(reloadKey, now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div 
      className="min-h-[70vh] flex items-center justify-center p-4" 
      dir="rtl"
      style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}
    >
      <div className="w-full max-w-md bg-white dark:bg-[#0c0f1a] border border-slate-200 dark:border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-fade-in">
        {/* Glow & Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            تور بەتنى يۈكلەشتە كاشىلا كۆرۈلدى
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            سىستېما يېڭىلانغانلىقتىن تور كۆرگۈڭىزدىكى كونا كېش بىلەن سۈركىلىش كۆرۈلگەن بولۇشى مۇمكىن. «قايتا يۈكلەش» نى بېسىپ نورمال ئىشلىتىڭ.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>قايتا يۈكلەش</span>
          </button>

          <Link
            href="/"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm border border-slate-200 dark:border-white/[0.08] transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>باش بەتكە قايتىش</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
