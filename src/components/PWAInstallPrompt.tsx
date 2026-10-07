'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Download, Smartphone, X, CheckCircle2, Sparkles, Share2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const { lang, isRtl } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already running as installed standalone app or native Capacitor / WebView
    const checkStandalone = () => {
      const isCapacitor = 
        typeof window !== 'undefined' && (
          !!(window as any)?.Capacitor ||
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true ||
          /wv|Android.*Version\/[0-9.]+|Capacitor/i.test(window.navigator.userAgent) ||
          window.location.search.includes('is_app=true')
        );
      setIsStandalone(Boolean(isCapacitor));

      try {
        if (localStorage.getItem('pwa_banner_dismissed') === 'true') {
          setIsDismissed(true);
        }
      } catch (_) {}
    };

    checkStandalone();

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for Android / Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Unregister legacy Service Workers to prevent stale cache in WebView
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If already running in standalone app mode, don't show prompt
  if (isStandalone) {
    return null;
  }

  // If successfully installed
  if (installedSuccess) {
    return (
      <div 
        className="fixed top-20 start-4 end-4 sm:start-auto sm:end-6 sm:w-96 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 backdrop-blur-xl text-white shadow-2xl animate-fade-in flex items-center gap-3"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-extrabold" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
            {lang === 'ug' ? 'ئەپ مۇۋەپپەقىيەتلىك قاچىلاندى!' : 'App Installed Successfully!'}
          </h4>
          <p className="text-[11px] text-emerald-300/80 mt-0.5" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
            {lang === 'ug' ? 'يانفون باش ئېكرانىدىن بىۋاسىتە ئېچىپ ئىشلەتسىڭىز بولىدۇ.' : 'You can now launch it directly from your home screen.'}
          </p>
        </div>
      </div>
    );
  }

  // Show banner if deferredPrompt is available OR on mobile before dismissal
  if (isDismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Premium Install Banner */}
      <aside 
        aria-label="PWA Install Promotion"
        className="relative z-40 w-full max-w-5xl mx-auto px-3 sm:px-6 pt-2 mb-2 animate-fade-in"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="rounded-2xl p-3 sm:p-4 bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-purple-950/90 border border-purple-500/40 dark:border-purple-500/30 shadow-xl shadow-purple-950/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-purple-500/30">
                <img 
                  src="/icon-192.png" 
                  alt="App Icon" 
                  className="w-full h-full rounded-[14px] object-cover" 
                />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-purple-950 rounded-full tech-pulse" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-white" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                  {lang === 'ug' ? '📱 بۇ سۇپىنى تېلېفونغا ئەپ قىلىپ قاچىلاڭ' : '📱 Install as Mobile App'}
                </h4>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Android & iOS
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug truncate" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                {lang === 'ug' 
                  ? 'تور كۆرگۈچسىز، تولۇق ئېكرانلىق ۋە چاققان ئەپ تەسىراتى' 
                  : 'Fast, standalone fullscreen app experience with native feel'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 flex-wrap">
            <a
              href="/uyghur-ai-v1.0.1.apk"
              download="uyghur-ai-v1.0.1.apk"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-400/40 text-cyan-200 text-xs font-black shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}
              title="Android APK ھۆججىتىنى بىۋاسىتە چۈشۈرۈش"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>{lang === 'ug' ? 'APK چۈشۈرۈش (v1.0.1)' : 'Download APK'}</span>
            </a>
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ug' ? 'تېلېفونغا قاچىلاش' : 'Install App'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDismissed(true);
                try {
                  localStorage.setItem('pwa_banner_dismissed', 'true');
                } catch (_) {}
              }}
              className="p-2 rounded-xl text-white/50 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition"
              title="Close / ياپ"
              aria-label="Close install prompt"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Add-to-Home-Screen Instructions Modal */}
      {showIOSGuide && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-fade-in"
          dir={isRtl ? 'rtl' : 'ltr'}
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            className="w-full max-w-sm rounded-[26px] bg-[#0d101a] border border-white/[0.15] p-5 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                  {lang === 'ug' ? 'iPhone غا قاچىلاش ئۇسۇلى' : 'How to install on iPhone'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <span>Safari تور كۆرگۈچىنىڭ ئاستىدىكى ھەمبەھىرلەش <Share2 className="inline w-3.5 h-3.5 text-cyan-400 mx-1" /> سىنبەلگىسىنى بېسىڭ.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <span>تىزىملىكتىن <strong>«باش ئېكرانغا قوشۇش» (Add to Home Screen)</strong> تاللانمىسىنى تاللاڭ.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                <span>ئوڭ ئۈستىدىكى «قوشۇش» (Add) كۇنۇپكىسىنى باسسىڭىز، تېلېفونىڭىزغا مۇستەقىل ئەپ بولۇپ قاچىلىنىدۇ.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs"
              style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}
            >
              {lang === 'ug' ? 'چۈشەندىم' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
