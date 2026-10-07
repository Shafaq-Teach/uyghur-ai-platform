'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { RefreshCw, Download, CheckCircle2, XCircle } from 'lucide-react';

export const CURRENT_APP_VERSION = '1.0.1';
export const CURRENT_BUILD_NUMBER = 101;

interface VersionData {
  version: string;
  build: number;
  min_supported_version?: string;
  force_update: boolean;
  release_date?: string;
  apk_url?: string;
  update_url?: string;
  title?: string;
  changelog?: string[];
}

export function AppUpdateManager() {
  const { lang, isRtl } = useApp();
  const [remoteVersion, setRemoteVersion] = useState<VersionData | null>(null);
  const [installedVersion, setInstalledVersion] = useState<{ version: string; build: number }>({
    version: CURRENT_APP_VERSION,
    build: CURRENT_BUILD_NUMBER,
  });
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const checkedRef = useRef(false);

  // Compare semantic versions (returns: 1 if vA > vB, -1 if vA < vB, 0 if equal)
  const compareVersions = (vA: string, vB: string) => {
    const partsA = vA.split('.').map((n) => parseInt(n, 10) || 0);
    const partsB = vB.split('.').map((n) => parseInt(n, 10) || 0);
    const maxLen = Math.max(partsA.length, partsB.length);
    for (let i = 0; i < maxLen; i++) {
      const a = partsA[i] || 0;
      const b = partsB[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  };

  const getInstalledAppVersion = async (): Promise<{ version: string; build: number }> => {
    if (typeof window === 'undefined') {
      return { version: CURRENT_APP_VERSION, build: CURRENT_BUILD_NUMBER };
    }

    // 1. Check Capacitor global plugin bridge if available
    try {
      const capApp = (window as any).Capacitor?.Plugins?.App;
      if (capApp) {
        const info = await capApp.getInfo();
        if (info?.version) {
          return { version: info.version, build: parseInt(info.build, 10) || 100 };
        }
      }
    } catch (_) {}

    // 2. URL search param ?app_version=...&build=...
    try {
      const params = new URLSearchParams(window.location.search);
      const urlVersion = params.get('app_version');
      const urlBuild = params.get('build');
      if (urlVersion) {
        return { version: urlVersion, build: urlBuild ? parseInt(urlBuild, 10) : 101 };
      }
    } catch (_) {}

    // 3. User-Agent e.g. UyghurAIApp/1.0.1
    const uaMatch = window.navigator.userAgent.match(/UyghurAIApp\/([0-9.]+)/i);
    if (uaMatch && uaMatch[1]) {
      return { version: uaMatch[1], build: 101 };
    }

    // 4. Native Android Capacitor detection
    const isNativeCapacitor = Boolean(
      (window as any).Capacitor?.isNativePlatform?.() ||
      (window as any).Capacitor?.getPlatform?.() === 'android' ||
      /wv|Android.*Version\/[0-9.]+|Capacitor/i.test(window.navigator.userAgent)
    );

    if (isNativeCapacitor) {
      // The 1.0.0 APK was built without app_version query or UA.
      // Therefore, any native app without 1.0.1+ identifiers is the legacy 1.0.0 APK!
      return { version: '1.0.0', build: 100 };
    }

    return { version: CURRENT_APP_VERSION, build: CURRENT_BUILD_NUMBER };
  };

  const checkForUpdates = useCallback(async () => {
    try {
      const res = await fetch(`/api/version?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data: VersionData = await res.json();
      
      const current = await getInstalledAppVersion();
      setInstalledVersion(current);

      const isNewer = compareVersions(data.version, current.version) > 0 || (data.build && data.build > current.build);
      
      if (isNewer) {
        setRemoteVersion(data);
        setNeedsUpdate(true);
      }
    } catch (err) {
      console.warn('Update check failed:', err);
    }
  }, []);

  useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true;
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [checkForUpdates]);

  // Periodic background check every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpdates();
    }, 60000);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  // Exit app handler when user clicks "ياق" (No)
  const handleExitApp = () => {
    try {
      if ((window as any).Capacitor?.Plugins?.App?.exitApp) {
        (window as any).Capacitor.Plugins.App.exitApp();
        return;
      }
    } catch (_) {}

    try {
      if ((navigator as any).app?.exitApp) {
        (navigator as any).app.exitApp();
        return;
      }
    } catch (_) {}

    try {
      window.close();
    } catch (_) {}

    setHasExited(true);
  };

  // Perform in-app update with 360 circular progress and APK download trigger
  const handleConfirmUpdate = () => {
    setIsUpdating(true);
    setProgress(0);
    setIsCompleted(false);

    const fullApkUrl = 'https://uyghur-ai-platform.pages.dev/uyghur-ai-v1.0.1.apk';

    // Trigger download through all available Android/Capacitor channels
    try {
      window.open(fullApkUrl, '_system');
    } catch (_) {}

    try {
      const a = document.createElement('a');
      a.href = fullApkUrl;
      a.download = 'uyghur-ai-v1.0.1.apk';
      a.target = '_system';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_) {}

    try {
      if (/Android/i.test(navigator.userAgent)) {
        const intentUrl = 'intent://uyghur-ai-platform.pages.dev/uyghur-ai-v1.0.1.apk#Intent;scheme=https;action=android.intent.action.VIEW;end;';
        window.location.href = intentUrl;
      }
    } catch (_) {}

    // Smooth 360-degree animation
    let cur = 0;
    const interval = setInterval(async () => {
      cur += Math.floor(Math.random() * 9) + 5;
      if (cur >= 100) {
        cur = 100;
        clearInterval(interval);
        setProgress(100);
        setIsCompleted(true);

        // Clear web caches
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const r of regs) {
              await r.update();
            }
          }
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
        } catch (_) {}

        // If not in native APK wrapper, reload
        const isNative = Boolean(
          (window as any).Capacitor?.isNativePlatform?.() ||
          /wv|Android.*Version\/[0-9.]+|Capacitor/i.test(window.navigator.userAgent)
        );
        if (!isNative) {
          setTimeout(() => {
            window.location.reload();
          }, 800);
        }
      } else {
        setProgress(cur);
      }
    }, 85);
  };

  // If no update needed, do not render modal
  if (!needsUpdate) {
    return null;
  }

  // If user clicked "ياق" and app couldn't self-kill in standard browser
  if (hasExited) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-[#07090e] flex items-center justify-center p-6 text-center select-none"
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{ fontFamily: "'UKIJ Ekran', 'ALKatip Basma', sans-serif" }}
      >
        <div className="max-w-xs w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
            <XCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">مەجبۇرىي يېڭىلاش بولغانلىقى ئۈچۈن ئەپ تاقالدى</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            1.0.1 نەشرىگە يېڭىلاش مەجبۇرىي بولغاچقا، ئەپنى داۋاملىق ئىشلەتكىلى بولمايدۇ. قايتا ئېچىپ يېڭىلاڭ.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-bold transition"
          >
            قايتا قوزغىتىش
          </button>
        </div>
      </div>
    );
  }

  // 360 Degree SVG Circular Progress Math
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const newVersionText = remoteVersion?.version || '1.0.1';

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-5 select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'UKIJ Ekran', 'ALKatip Basma', sans-serif" }}
    >
      {/* Background Ambient Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-600/25 to-purple-600/20 blur-3xl pointer-events-none" />

      {/* Main Clean Modal Container */}
      <div className="relative w-full max-w-sm rounded-[32px] bg-[#0c0e17] border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/80 text-white text-center flex flex-col items-center">
        
        {/* App Logo or 360 Progress Ring */}
        <div className="relative my-4 flex items-center justify-center">
          {isUpdating ? (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 132 132">
                {/* Background Ring */}
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-white/[0.08]"
                  fill="transparent"
                />
                {/* Active 360 Ring */}
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-[stroke-dashoffset] duration-150 ease-linear"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black font-mono tracking-tight bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                  {progress}%
                </span>
                <span className="text-[10px] text-cyan-300 font-bold mt-0.5">360° يېڭىلاش</span>
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500/30 via-indigo-500/20 to-purple-500/30 p-1 border border-cyan-400/30 shadow-2xl shadow-cyan-500/20 flex items-center justify-center">
              <img 
                src="/logo_icon.png" 
                alt="Uyghur AI" 
                className="w-full h-full rounded-[22px] object-cover" 
              />
            </div>
          )}
        </div>

        {/* Question Text */}
        <h3 className="text-lg sm:text-xl font-black text-white mt-3 leading-snug">
          {isUpdating ? (
            isCompleted ? (
              <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 inline" />
                {newVersionText} نەشرى چۈشۈرۈلدى!
              </span>
            ) : (
              <span>يېڭىلىنىۋاتىدۇ...</span>
            )
          ) : (
            <span>{newVersionText} نەشرى چىقتى، يېڭىلامسىز؟</span>
          )}
        </h3>

        {/* Action Controls */}
        <div className="w-full mt-6">
          {!isUpdating ? (
            <div className="grid grid-cols-2 gap-3 w-full">
              {/* ھەئە Button */}
              <button
                type="button"
                onClick={handleConfirmUpdate}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-indigo-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                ھەئە
              </button>

              {/* ياق Button */}
              <button
                type="button"
                onClick={handleExitApp}
                className="w-full py-3.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                ياق
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3">
              {isCompleted ? (
                <>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    يېڭى 1.0.1 نۇسخا تېلېفونىڭىزغا چۈشۈرۈلدى. چۈشۈرۈش ئۇقتۇرۇشى ياكى ئاستىدىكى كۇنۇپكىنى بېسىپ قاچىلاشنى تاماملاڭ.
                  </p>
                  <a
                    href="https://uyghur-ai-platform.pages.dev/uyghur-ai-v1.0.1.apk"
                    target="_system"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>APK نى قاچىلاش (1.0.1)</span>
                  </a>
                </>
              ) : (
                <div className="py-2 flex items-center justify-center gap-2 text-xs text-cyan-300 font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ھۆججەتلەر چۈشۈرۈلۈۋاتىدۇ ({progress}%)...</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
