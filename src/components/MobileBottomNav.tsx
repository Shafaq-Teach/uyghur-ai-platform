'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Home, 
  MessageSquare, 
  LayoutGrid, 
  History, 
  Settings,
  Languages,
  Image as ImageIcon,
  Volume2,
  Video,
  X
} from 'lucide-react';

interface ArcTool {
  href: string;
  label: string;
  icon: any;
  color: string;
  bgGrad: string;
  angle: number; // in degrees
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { lang, isRtl } = useApp();
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  // 5 Arc Tools distributed along a semi-circle arc above the center button
  // Angles: +68, +34, 0, -34, -68 (or mirrored for LTR)
  const arcTools: ArcTool[] = [
    {
      href: '/chat',
      label: 'پاراڭ',
      icon: MessageSquare,
      color: 'text-indigo-400',
      bgGrad: 'from-indigo-600 to-blue-600',
      angle: isRtl ? 68 : -68,
    },
    {
      href: '/translate',
      label: 'تەرجىمە',
      icon: Languages,
      color: 'text-cyan-400',
      bgGrad: 'from-cyan-600 to-teal-600',
      angle: isRtl ? 34 : -34,
    },
    {
      href: '/tts',
      label: 'ئاۋاز',
      icon: Volume2,
      color: 'text-amber-400',
      bgGrad: 'from-amber-600 to-orange-600',
      angle: 0,
    },
    {
      href: '/image',
      label: 'رەسىم',
      icon: ImageIcon,
      color: 'text-fuchsia-400',
      bgGrad: 'from-purple-600 to-pink-600',
      angle: isRtl ? -34 : 34,
    },
    {
      href: '/ad-video',
      label: 'فىلىم',
      icon: Video,
      color: 'text-rose-400',
      bgGrad: 'from-rose-600 to-red-600',
      angle: isRtl ? -68 : 68,
    },
  ];

  const radius = 105; // radius in px

  const isToolActive = ['/chat', '/translate', '/tts', '/image', '/ad-video'].includes(pathname);

  return (
    <>
      {/* Backdrop for Arc Tools Menu */}
      {isToolsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setIsToolsOpen(false)}
        />
      )}

      {/* Floating Arc Container positioned directly above the center Tools button */}
      <div 
        className="md:hidden fixed bottom-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="relative w-0 h-0">
          {arcTools.map((tool, idx) => {
            const Icon = tool.icon;
            const isCurrent = pathname === tool.href;
            const rad = (tool.angle * Math.PI) / 180;
            const x = Math.round(radius * Math.sin(rad));
            const y = -Math.round(radius * Math.cos(rad));

            return (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setIsToolsOpen(false)}
                style={{
                  transform: isToolsOpen
                    ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`
                    : `translate(-50%, -50%) scale(0)`,
                  opacity: isToolsOpen ? 1 : 0,
                  transitionDelay: isToolsOpen ? `${idx * 40}ms` : '0ms',
                }}
                className={`absolute left-0 top-0 pointer-events-auto flex flex-col items-center justify-center w-12 h-14 rounded-2xl bg-[#0e1322]/95 dark:bg-[#0b0f1e]/95 backdrop-blur-xl border ${
                  isCurrent
                    ? 'border-indigo-400 ring-2 ring-indigo-500/40 shadow-indigo-500/30'
                    : 'border-white/15 hover:border-indigo-400/60'
                } shadow-2xl transition-all duration-300 ease-out active:scale-95 group`}
              >
                <div
                  className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${tool.bgGrad} flex items-center justify-center text-white shadow-md shadow-black/40 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span
                  className="text-[10px] font-bold text-slate-200 mt-1 leading-tight tracking-tight whitespace-nowrap"
                  style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}
                >
                  {tool.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Bottom Nav Bar */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#090b14]/95 backdrop-blur-2xl border-t border-slate-200/90 dark:border-white/10 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.55)] px-2 pt-1 pb-safe transition-colors"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Home */}
          <Link
            href="/"
            onClick={() => setIsToolsOpen(false)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 min-w-[56px] ${
              pathname === '/'
                ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${pathname === '/' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 scale-105' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 leading-tight font-medium" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
              {lang === 'ug' ? 'باش بەت' : 'Home'}
            </span>
          </Link>

          {/* Chat */}
          <Link
            href="/chat"
            onClick={() => setIsToolsOpen(false)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 min-w-[56px] ${
              pathname === '/chat'
                ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${pathname === '/chat' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 scale-105' : ''}`}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 leading-tight font-medium" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
              {lang === 'ug' ? 'پاراڭ' : 'Chat'}
            </span>
          </Link>

          {/* Center Tools Button (Toggles Semi-Circular Arc) */}
          <button
            type="button"
            onClick={() => setIsToolsOpen((prev) => !prev)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 min-w-[56px] relative ${
              isToolsOpen || isToolActive
                ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div
              className={`relative p-2 rounded-2xl transition-all duration-300 ${
                isToolsOpen
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 scale-110 -translate-y-1'
                  : isToolActive
                  ? 'bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 scale-105'
                  : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300'
              }`}
            >
              {isToolsOpen ? (
                <X className="w-5 h-5 animate-spin-fast" />
              ) : (
                <LayoutGrid className="w-5 h-5" />
              )}
              {isToolActive && !isToolsOpen && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
              )}
            </div>
            <span
              className="text-[10px] mt-0.5 leading-tight tracking-tight font-bold"
              style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}
            >
              {lang === 'ug' ? 'قوراللار' : 'Tools'}
            </span>
          </button>

          {/* History */}
          <Link
            href="/history"
            onClick={() => setIsToolsOpen(false)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 min-w-[56px] ${
              pathname === '/history'
                ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${pathname === '/history' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 scale-105' : ''}`}>
              <History className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 leading-tight font-medium" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
              {lang === 'ug' ? 'تارىخ' : 'History'}
            </span>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            onClick={() => setIsToolsOpen(false)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 min-w-[56px] ${
              pathname === '/settings'
                ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${pathname === '/settings' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 scale-105' : ''}`}>
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 leading-tight font-medium" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
              {lang === 'ug' ? 'تەڭشەك' : 'Settings'}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
