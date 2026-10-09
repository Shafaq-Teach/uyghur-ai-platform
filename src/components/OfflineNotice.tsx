'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineNotice() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(window.navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 flex items-center gap-2.5 text-xs font-semibold max-w-[90vw]">
      {!isOnline ? (
        <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-xl">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>تور ئۇلىنىشى ئۈزۈلۈپ قالدى. تورىڭىزنى تەكشۈرۈڭ.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>تور ئۇلىنىشى ئەسلىگە كەلدى.</span>
        </div>
      )}
    </div>
  );
}
