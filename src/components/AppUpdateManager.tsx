'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { RefreshCw, CheckCircle2, XCircle, Download, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

export const CURRENT_APP_VERSION = '1.0.5';
export const CURRENT_BUILD_NUMBER = 105;

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
  const { isRtl } = useApp();
  const [remoteVersion, setRemoteVersion] = useState<VersionData | null>(null);
  const [installedVersion, setInstalledVersion] = useState<{ version: string; build: number }>({
    version: '1.0.2',
    build: 102,
  });
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadInfo, setDownloadInfo] = useState<string>('0.0 MB / 11.1 MB');
  const [isCompleted, setIsCompleted] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const [downloadedBlobUrl, setDownloadedBlobUrl] = useState<string | null>(null);
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

    // 1. Native AndroidBridge inspection (highest precision)
    try {
      const bridge = (window as any).AndroidBridge;
      if (bridge?.getNativeVersionCode && bridge?.getNativeVersionName) {
        const build = bridge.getNativeVersionCode();
        const ver = bridge.getNativeVersionName();
        if (build > 0) {
          return { version: ver, build };
        }
      }
    } catch (_) {}

    // 2. Capacitor global plugin bridge if available
    try {
      const capApp = (window as any).Capacitor?.Plugins?.App;
      if (capApp) {
        const info = await capApp.getInfo();
        if (info?.version) {
          return { version: info.version, build: parseInt(info.build, 10) || 100 };
        }
      }
    } catch (_) {}

    // 3. URL search param ?app_version=...&build=...
    try {
      const params = new URLSearchParams(window.location.search);
      const paramVer = params.get('app_version');
      const paramBuild = params.get('build');
      if (paramVer) {
        return {
          version: paramVer,
          build: paramBuild ? parseInt(paramBuild, 10) : 100,
        };
      }
    } catch (_) {}

    // 4. User Agent inspection (e.g. UyghurAIApp/1.0.2)
    try {
      const ua = navigator.userAgent || '';
      const match = ua.match(/UyghurAIApp\/([0-9.]+)/i);
      if (match && match[1]) {
        const parts = match[1].split('.');
        const b = (parseInt(parts[0] || '1', 10) * 100) + (parseInt(parts[1] || '0', 10) * 10) + parseInt(parts[2] || '0', 10);
        return { version: match[1], build: b };
      }
    } catch (_) {}

    return { version: CURRENT_APP_VERSION, build: CURRENT_BUILD_NUMBER };
  };

  // Register native Android download bridge callbacks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as any).onNativeDownloadProgress = (pct: number, mbText: string) => {
      setProgress(pct);
      setDownloadInfo(mbText);
      setIsUpdating(true);
    };

    (window as any).onNativeDownloadComplete = () => {
      setProgress(100);
      setDownloadInfo('11.1 MB / 11.1 MB (100%)');
      setIsCompleted(true);
      setIsUpdating(false);
    };

    (window as any).onNativeDownloadError = (err: string) => {
      setDownloadError(err);
      setIsUpdating(false);
    };

    (window as any).onNativeRequirePermission = () => {
      setNeedsPermission(true);
    };

    return () => {
      delete (window as any).onNativeDownloadProgress;
      delete (window as any).onNativeDownloadComplete;
      delete (window as any).onNativeDownloadError;
      delete (window as any).onNativeRequirePermission;
    };
  }, []);

  const checkForUpdates = useCallback(async () => {
    try {
      const current = await getInstalledAppVersion();
      setInstalledVersion(current);

      const res = await fetch(`/api/version?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });

      if (!res.ok) return;

      const data: VersionData = await res.json();
      setRemoteVersion(data);

      const hasNewVersion =
        data.build > current.build || compareVersions(data.version, current.version) > 0;

      if (hasNewVersion) {
        setNeedsUpdate(true);
      } else {
        setNeedsUpdate(false);
      }
    } catch (err) {
      console.warn('Update check error:', err);
    }
  }, []);

  useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true;
      checkForUpdates();
    }
  }, [checkForUpdates]);

  // Periodic background check every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpdates();
    }, 60000);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

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

    setHasExited(true);
  };

  const targetVer = remoteVersion?.version || '1.0.5';
  const APK_DOWNLOAD_URL = remoteVersion?.apk_url
    ? (remoteVersion.apk_url.startsWith('http')
        ? remoteVersion.apk_url
        : `https://raw.githubusercontent.com/Shafaq-Teach/uyghur-ai-platform/main/public${remoteVersion.apk_url}`)
    : 'https://raw.githubusercontent.com/Shafaq-Teach/uyghur-ai-platform/main/public/uyghur-ai-v1.0.5.apk';

  // Real HTTP streaming download: 0% to 100% byte-by-byte
  const handleConfirmUpdate = async () => {
    setIsUpdating(true);
    setProgress(0);
    setDownloadInfo('0.0 MB / 11.1 MB (0%)');
    setIsCompleted(false);
    setDownloadError(null);

    // If native downloader is available, use it directly
    try {
      const bridge = (window as any).AndroidBridge;
      if (bridge?.startNativeDownload) {
        bridge.startNativeDownload(APK_DOWNLOAD_URL);
        return;
      }
    } catch (_) {}

    // Real JavaScript streaming download through Fetch & ReadableStream
    try {
      const response = await fetch(APK_DOWNLOAD_URL);
      if (!response.ok) {
        throw new Error(`چۈشۈرۈش مەغلۇپ بولدى (HTTP ${response.status})`);
      }

      const contentLengthHeader = response.headers.get('content-length');
      const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 11611445;
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('چۈشۈرۈش ئېقىمى قوزغالمىدى');
      }

      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          chunks.push(value);
          receivedBytes += value.length;

          const pct = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
          const readMb = (receivedBytes / (1024 * 1024)).toFixed(1);
          const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

          setProgress(pct);
          setDownloadInfo(`${readMb} MB / ${totalMb} MB (${pct}%)`);
        }
      }

      const blob = new Blob(chunks, { type: 'application/vnd.android.package-archive' });
      const blobUrl = URL.createObjectURL(blob);
      setDownloadedBlobUrl(blobUrl);

      setProgress(100);
      setDownloadInfo('11.1 MB / 11.1 MB (100%)');
      setIsCompleted(true);
      setIsUpdating(false);

    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadError(err?.message || 'تور ئۇلىنىشى ئۈزۈلۈپ قالدى، قايتا سىناڭ');
      setIsUpdating(false);
    }
  };

  // Called when user clicks «قاچىلاش»
  const handleInstall = () => {
    // 1. Try native install of pre-downloaded APK
    try {
      const bridge = (window as any).AndroidBridge;
      if (bridge?.installDownloadedApk) {
        bridge.installDownloadedApk();
        return;
      }
      if (bridge?.installApk) {
        bridge.installApk(APK_DOWNLOAD_URL);
        return;
      }
    } catch (_) {}

    // 2. Trigger downloaded Blob file
    if (downloadedBlobUrl) {
      try {
        const a = document.createElement('a');
        a.href = downloadedBlobUrl;
        a.download = `uyghur-ai-v${targetVer}.apk`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (_) {}
    }

    // 3. Fallback direct download
    try {
      window.location.href = APK_DOWNLOAD_URL;
    } catch (_) {
      window.open(APK_DOWNLOAD_URL, '_self');
    }
  };

  const handleOpenPermissionSettings = () => {
    try {
      const bridge = (window as any).AndroidBridge;
      if (bridge?.openInstallPermissionSettings) {
        bridge.openInstallPermissionSettings();
      }
    } catch (_) {}
  };

  if (!needsUpdate) {
    return null;
  }

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
          <h3 className="text-lg font-bold text-white mb-2">ئەپ تاقالدى</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {targetVer} نەشرىگە يېڭىلاش زۆرۈر بولغاچقا، ئەپنى داۋاملىق ئىشلەتكىلى بولمايدۇ.
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

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const newVersionText = remoteVersion?.version || targetVer;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-5 select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'UKIJ Ekran', 'ALKatip Basma', sans-serif" }}
    >
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-600/25 to-purple-600/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm rounded-[32px] bg-[#0c0e17] border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/80 text-white text-center flex flex-col items-center">
        
        {/* Progress Ring / Logo */}
        <div className="relative my-4 flex items-center justify-center">
          {isUpdating || isCompleted ? (
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 132 132">
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-white/[0.08]"
                  fill="transparent"
                />
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
                <span className="text-[11px] font-mono text-cyan-300/80 mt-1">
                  {downloadInfo.split(' ')[0]} {downloadInfo.split(' ')[1]}
                </span>
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

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-black text-white mt-3 leading-snug">
          {isUpdating ? (
            <span>ھەقىقىي چۈشۈرۈلۈۋاتىدۇ...</span>
          ) : isCompleted ? (
            <span className="text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 inline" />
              {newVersionText} نەشرى تولۇق چۈشۈرۈلدى!
            </span>
          ) : (
            <span>{newVersionText} نەشرى چىقتى، يېڭىلامسىز؟</span>
          )}
        </h3>

        {/* Detailed Byte Download Info */}
        {(isUpdating || isCompleted) && (
          <div className="mt-2 text-xs font-mono text-slate-300 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl">
            {downloadInfo}
          </div>
        )}

        {/* Error Display */}
        {downloadError && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-start">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{downloadError}</span>
          </div>
        )}

        {/* Permission Notice */}
        {needsPermission && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs text-start space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>نامەلۇم مەنبەدىن قاچىلاشقا رۇخسەت بېرىڭ</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              سىستېما تەڭشىكىدە ئەپ قاچىلاشقا بىر قېتىم رۇخسەت بەرسىڭىز، سىستېما بىۋاسىتە قاچىلاپ بېرىدۇ.
            </p>
            <button
              type="button"
              onClick={handleOpenPermissionSettings}
              className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-500/40 transition"
            >
              تەڭشەكنى ئېچىش
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="w-full mt-6">
          {!isUpdating && !isCompleted ? (
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={handleConfirmUpdate}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-indigo-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                ھەئە
              </button>
              <button
                type="button"
                onClick={handleExitApp}
                className="w-full py-3.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                ياق
              </button>
            </div>
          ) : isCompleted ? (
            <div className="space-y-3 animate-fade-in w-full">
              <button
                type="button"
                onClick={handleInstall}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>قاچىلاش</span>
              </button>

              <a
                href={APK_DOWNLOAD_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>ئەگەر قاچىلاش چىقمىسا بۇ يەرنى بېسىڭ</span>
              </a>
            </div>
          ) : (
            <div className="py-2 flex items-center justify-center gap-2 text-xs text-cyan-300 font-bold">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>ئەپ ئىچىدە چۈشۈرۈلۈۋاتىدۇ ({progress}%)...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
