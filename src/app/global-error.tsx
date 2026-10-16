'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured Global Exception:', error);

    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch dynamically imported module');

    if (isChunkError && typeof window !== 'undefined') {
      const reloadKey = 'uyghur_ai_last_global_reload';
      const lastReload = parseInt(sessionStorage.getItem(reloadKey) || '0', 10);
      const now = Date.now();
      if (now - lastReload > 15000) {
        sessionStorage.setItem(reloadKey, now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html lang="ug" dir="rtl" className="dark">
      <body className="min-h-screen bg-[#08090d] text-slate-100 flex items-center justify-center p-4" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
        <div className="w-full max-w-md bg-[#0c0f1a] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-fade-in">
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-white">
              سۇپىنى يۈكلەشتە كاشىلا كۆرۈلدى
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              سىستېما يېڭىلانغانلىقتىن تور كۆرگۈڭىزدىكى كونا كېش بىلەن ئۈزۈلۈش بولغان بولۇشى مۇمكىن. «قايتا يۈكلەش» نى بېسىپ نورمال ھالەتكە كەلتۈرۈڭ.
            </p>
          </div>

          <div className="pt-2">
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
          </div>
        </div>
      </body>
    </html>
  );
}
