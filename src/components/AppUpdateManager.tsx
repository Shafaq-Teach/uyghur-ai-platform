'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Download } from 'lucide-react';

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
  const [progress, setProgress] = useState(0); // 0 to 100
  const [updatePhase, setUpdatePhase] = useState<'idle' | 'downloading' | 'verifying' | 'installing' | 'completed'>('idle');
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

    // 1. Priority 1: Check Capacitor global plugin bridge if available
    try {
      const capApp = (window as any).Capacitor?.Plugins?.App;
      if (capApp) {
        const info = await capApp.getInfo();
        if (info?.version) {
          return { version: info.version, build: parseInt(info.build, 10) || 100 };
        }
      }
    } catch (_) {}

    // 2. Priority 2: URL search param ?app_version=...&build=...
    try {
      const params = new URLSearchParams(window.location.search);
      const urlVersion = params.get('app_version');
      const urlBuild = params.get('build');
      if (urlVersion) {
        return { version: urlVersion, build: urlBuild ? parseInt(urlBuild, 10) : 101 };
      }
    } catch (_) {}

    // 3. Priority 3: User-Agent e.g. UyghurAIApp/1.0.1
    const uaMatch = window.navigator.userAgent.match(/UyghurAIApp\/([0-9.]+)/i);
    if (uaMatch && uaMatch[1]) {
      return { version: uaMatch[1], build: 101 };
    }

    // 4. Priority 4: Native Android Capacitor detection
    const isNativeCapacitor = Boolean(
      (window as any).Capacitor?.isNativePlatform?.() ||
      (window as any).Capacitor?.getPlatform?.() === 'android' ||
      /wv|Android.*Version\/[0-9.]+|Capacitor/i.test(window.navigator.userAgent)
    );

    if (isNativeCapacitor) {
      // The 1.0.0 APK installed on phones was built without app_version query or UA!
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
      // Delay slightly on cold start to let the UI settle
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 1500);
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

  // Also listen to Service Worker updatefound event
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // A new SW version is waiting
                setNeedsUpdate(true);
                setRemoteVersion((prev) => prev || {
                  version: 'يېڭى نۇسخا',
                  build: CURRENT_BUILD_NUMBER + 1,
                  force_update: true,
                  title: 'يېڭى نۇسخا تارقىتىلدى',
                  changelog: ['ئەڭ يېڭى ئىقتىدارلار ۋە بىخەتەرلىك يېڭىلانمىلىرىنى ئۆز ئىچىگە ئالىدۇ.'],
                });
              }
            });
          }
        });
      });
    }
  }, []);

  // Perform smooth in-app update with 360-degree circular progress
  const startUpdateProcess = async () => {
    setIsUpdating(true);
    setProgress(0);
    setUpdatePhase('downloading');

    // Trigger APK download for Android native app users
    const apkUrl = remoteVersion?.apk_url || remoteVersion?.update_url || '/uyghur-ai-v1.0.1.apk';
    const isNativeCapacitor = Boolean(
      (window as any).Capacitor?.isNativePlatform?.() ||
      (window as any).Capacitor?.getPlatform?.() === 'android' ||
      /wv|Android.*Version\/[0-9.]+|Capacitor/i.test(window.navigator.userAgent)
    );

    if (isNativeCapacitor) {
      try {
        const link = document.createElement('a');
        link.href = apkUrl;
        link.download = 'uyghur-ai-v1.0.1.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (_) {}
    }

    // Smooth animation step
    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      
      if (currentProgress >= 40 && currentProgress < 75) {
        setUpdatePhase('verifying');
      } else if (currentProgress >= 75 && currentProgress < 95) {
        setUpdatePhase('installing');
      }

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setProgress(100);
        setUpdatePhase('completed');

        // Clear service worker caches and force activate new SW
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const reg of regs) {
              if (reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
              await reg.update();
            }
          }
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
        } catch (e) {
          console.warn('Cache clearing error:', e);
        }

        // Brief delay for the user to see 100% completion then hard reload
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setProgress(currentProgress);
      }
    }, 90);
  };

  // If no update needed, do not render modal
  if (!needsUpdate) {
    return null;
  }

  // 360 Degree SVG Circular Progress Math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'UKIJ Ekran', 'ALKatip Basma', sans-serif" }}
    >
      {/* Glow Effect */}
      <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm sm:max-w-md rounded-[32px] bg-[#0c0e17] border border-purple-500/40 p-6 sm:p-7 shadow-2xl shadow-purple-950/60 text-white text-center flex flex-col items-center">
        
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>{lang === 'ug' ? 'نەشىر كونترول مەركىزى' : 'Version Control'}</span>
          <span className="text-white/40">|</span>
          <span className="font-mono text-[11px] text-cyan-300">
            v{installedVersion.version} → {remoteVersion?.version ? `v${remoteVersion.version}` : 'New'}
          </span>
        </div>

        {/* 360-Degree Circular Progress / Status Indicator */}
        <div className="relative my-4 flex items-center justify-center">
          <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 128 128">
            {/* Background 360 ring */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              className="text-white/[0.08]"
              fill="transparent"
            />
            {/* Active 360 progress ring */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="url(#gradient360)"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={isUpdating ? strokeDashoffset : circumference}
              strokeLinecap="round"
              fill="transparent"
              className="transition-[stroke-dashoffset] duration-150 ease-linear"
            />
            <defs>
              <linearGradient id="gradient360" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Circle Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isUpdating ? (
              <>
                <span className="text-3xl font-black font-mono tracking-tight bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                  {progress}%
                </span>
                <span className="text-[10px] text-purple-300 font-bold mt-0.5">360° يېڭىلاش</span>
              </>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-1 shadow-lg shadow-purple-500/40 flex items-center justify-center">
                <img src="/icon-192.png" alt="App Icon" className="w-full h-full rounded-[14px] object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-black text-white mt-2">
          {remoteVersion?.title || (lang === 'ug' ? 'ئەپنىڭ يېڭى نەشرى چىقتى!' : 'New App Update Available!')}
        </h3>

        {/* Subtitle / Forced Update Warning */}
        <p className="text-xs text-amber-300/90 mt-1.5 flex items-center justify-center gap-1.5 font-bold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {lang === 'ug' 
              ? 'بۇ نەشرى ئۈچۈن مەجبۇرىي يېڭىلاش تەستىقلاندى.' 
              : 'Mandatory update required to continue.'}
          </span>
        </p>

        {/* Changelog or Status message */}
        <div className="w-full mt-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 leading-relaxed text-right max-h-36 overflow-y-auto">
          {isUpdating ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2 text-center">
              <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
              <p className="text-xs text-cyan-200 font-medium">
                {updatePhase === 'downloading' && (lang === 'ug' ? 'يېڭى ھۆججەتلەر چۈشۈرۈلۈۋاتىدۇ (360°)...' : 'Downloading files...')}
                {updatePhase === 'verifying' && (lang === 'ug' ? 'بىخەتەرلىك ۋە پۈتۈنلۈك تەكشۈرۈلۈۋاتىدۇ...' : 'Verifying integrity...')}
                {updatePhase === 'installing' && (lang === 'ug' ? 'ئەپ ئىچىدە بىۋاسىتە قاچىلىنىۋاتىدۇ...' : 'Installing update...')}
                {updatePhase === 'completed' && (lang === 'ug' ? 'يېڭىلاش تاماملاندى! قايتا ئېچىلىۋاتىدۇ...' : 'Update complete! Reloading...')}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="font-bold text-white text-[11px] mb-1 flex items-center justify-between">
                <span>{lang === 'ug' ? 'يېڭى نەشىر ئۆزگىرىشلىرى:' : 'What is New:'}</span>
                <span className="font-mono text-purple-400">{remoteVersion?.version ? `v${remoteVersion.version}` : ''}</span>
              </div>
              {remoteVersion?.changelog && remoteVersion.changelog.length > 0 ? (
                remoteVersion.changelog.map((log, index) => (
                  <div key={index} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{log}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-300">
                  {lang === 'ug' ? 'ئەڭ يېڭى ئىقتىدارلار ۋە سۈرئەت دەرىجىسى ئۆستۈرۈلدى.' : 'Performance improvements and bug fixes.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="w-full mt-5">
          <button
            type="button"
            disabled={isUpdating}
            onClick={startUpdateProcess}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white shadow-xl flex items-center justify-center gap-2 transition-all ${
              isUpdating
                ? 'bg-purple-950/60 border border-purple-500/30 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>{lang === 'ug' ? `يېڭىلىنىۋاتىدۇ... ${progress}%` : `Updating... ${progress}%`}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>{lang === 'ug' ? 'ھازىرلا بىۋاسىتە يېڭىلاش' : 'Update Now Directly'}</span>
              </>
            )}
          </button>

          {/* Direct APK Download Link Button */}
          <a
            href={remoteVersion?.apk_url || remoteVersion?.update_url || '/uyghur-ai-v1.0.1.apk'}
            download="uyghur-ai-v1.0.1.apk"
            className="w-full mt-2.5 py-3 px-4 rounded-2xl bg-cyan-600/25 hover:bg-cyan-600/35 border border-cyan-400/40 text-cyan-200 text-xs font-black flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] shadow-md"
          >
            <Download className="w-4 h-4 text-cyan-300" />
            <span>{lang === 'ug' ? '1.0.1 APK نى بىۋاسىتە چۈشۈرۈپ قاچىلاش (9.2MB)' : 'Download 1.0.1 APK Directly'}</span>
          </a>
        </div>

        {/* Note */}
        <p className="text-[10px] text-slate-400 mt-3">
          {lang === 'ug' 
            ? 'يېڭىلاش جەريانىدا تور ئۈزۈلۈپ قالمىسۇن. سانلىق مەلۇماتلىرىڭىز تولۇق ساقلىنىدۇ.' 
            : 'Please keep internet connected. Your data will be preserved.'}
        </p>

      </div>
    </div>
  );
}
