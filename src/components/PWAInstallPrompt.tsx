'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Download, Smartphone } from 'lucide-react';

export function PWAInstallPrompt() {
  const { lang, isRtl } = useApp();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isApp = 
        typeof window !== 'undefined' && (
          !!(window as any)?.Capacitor ||
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true ||
          /wv|Android.*Version\/[0-9.]+|Capacitor|UyghurAIApp/i.test(window.navigator.userAgent) ||
          window.location.search.includes('is_app=true') ||
          window.location.search.includes('app_version=')
        );
      setIsStandalone(Boolean(isApp));
    };

    checkStandalone();
  }, []);

  // If already running inside native app or standalone PWA, do not show button
  if (isStandalone) {
    return null;
  }

  const downloadUrl = '/uyghur-ai-v1.0.5.apk';

  return (
    <div 
      className="fixed bottom-6 start-6 z-40 animate-fade-in"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'UKIJ Ekran', 'ALKatip Basma', sans-serif" }}
    >
      <a
        href={downloadUrl}
        download="uyghur-ai-v1.0.5.apk"
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-950/50 hover:shadow-indigo-500/30 border border-white/20 backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
        title={lang === 'ug' ? 'ئاندىرويىد ئەپنى چۈشۈرۈش' : 'Download Android App'}
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
          <Download className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="tracking-wide">
          {lang === 'ug' ? 'دىتالىنى چۈشۈرۈڭ' : 'Download App'}
        </span>
      </a>
    </div>
  );
}
