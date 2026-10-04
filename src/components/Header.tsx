'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Sparkles, 
  MessageSquare, 
  Languages, 
  Image as ImageIcon, 
  Volume2, 
  Video, 
  History, 
  Sun, 
  Moon, 
  Globe, 
  Menu, 
  X,
  KeyRound,
  LogIn,
  LogOut,
  User,
  Cloud,
  ChevronDown,
  Palette,
  Sunset,
  ShieldCheck
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

export const Header: React.FC = () => {
  const { lang, setLang, t, isRtl, theme, setTheme, cycleTheme, settings, user, isAdmin, isCloudSynced, signOut } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { href: '/', label: t.navHome, icon: Sparkles },
    { href: '/chat', label: t.navChat, icon: MessageSquare },
    { href: '/translate', label: t.navTranslate, icon: Languages },
    { href: '/image', label: t.navImage, icon: ImageIcon },
    { href: '/tts', label: t.navTts, icon: Volume2 },
    { href: '/ad-video', label: t.navVideo, icon: Video },
    { href: '/history', label: t.navHistory, icon: History },
  ];

  const hasKeys = !!settings?.openRouterApiKey || !!settings?.geminiApiKey;

  return (
    <>
    <header className="sticky top-0 z-40 w-full tech-glass-header transition-colors">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo with Tech Badge */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300">
              <img 
                src="/logo_icon.png" 
                alt="Uyghur Platform AI" 
                className="w-full h-full rounded-[14px] object-cover" 
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-[#08090d] rounded-full tech-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-100 dark:to-slate-300 bg-clip-text text-transparent">
                {t.siteTitle}
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                PRO
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav with High-Tech Pill tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-white/[0.03] p-1 rounded-2xl border border-slate-200 dark:border-white/[0.06]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-indigo-700 border border-slate-200/90 shadow-sm dark:bg-gradient-to-r dark:from-indigo-600/30 dark:to-purple-600/20 dark:text-indigo-300 dark:border-indigo-500/40 dark:shadow-indigo-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions HUD */}
        <div className="flex items-center gap-2">
          {/* User Auth Profile or Login Button */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 ps-2.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] transition text-xs shadow-sm"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-semibold text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                  {user.fullName || user.email?.split('@')[0]}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Supabase بۇلۇت ئۇلاندى" />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute end-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-white/[0.1] shadow-2xl p-3 z-50 space-y-2 animate-fade-in"
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="text-xs font-bold text-white truncate">{user.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                      <Cloud className="w-3 h-3 shrink-0" />
                      <span>Supabase بۇلۇت ساقلىغۇچ ئۇلاندى</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/sensiz520"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-500/20 transition border border-purple-500/30 mb-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>باشقۇرۇش سۇپىسى (Admin)</span>
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>API ئاچقۇچ تەڭشىكى</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => { setUserDropdownOpen(false); signOut(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ھېساباتتىن چېكىنىش</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>كىرىش</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ug' ? 'en' : 'ug')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] transition shadow-sm hover:bg-slate-100 dark:hover:bg-white/[0.08]"
            title="Switch Language / تىل ئالماشتۇرۇش"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="font-semibold">{lang === 'ug' ? 'EN' : 'ئۇيغۇرچە'}</span>
          </button>

          {/* 4-Theme 1-Click Cycler */}
          {(() => {
            const themeConfig = {
              dark: {
                icon: Moon,
                color: 'text-indigo-400',
                badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
                label: t.themeDark,
                dot: 'bg-indigo-400',
              },
              light: {
                icon: Sun,
                color: 'text-amber-500',
                badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40',
                label: t.themeLight,
                dot: 'bg-amber-400',
              },
              midnight: {
                icon: Sparkles,
                color: 'text-cyan-400',
                badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                label: t.themeMidnight,
                dot: 'bg-cyan-400',
              },
              warm: {
                icon: Sunset,
                color: 'text-orange-500',
                badge: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40',
                label: t.themeWarm,
                dot: 'bg-orange-400',
              },
            };
            const current = themeConfig[theme] || themeConfig.dark;
            const IconComponent = current.icon;

            return (
              <button
                type="button"
                onClick={cycleTheme}
                className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-400 dark:hover:border-indigo-500/40 transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                title={`${t.themeToggleTooltip}: ${current.label}`}
              >
                <IconComponent className={`w-4 h-4 ${current.color} transition-transform group-hover:rotate-12`} />
                <span className="hidden md:inline text-[11px] font-medium text-slate-700 dark:text-slate-300 max-w-[85px] truncate">
                  {current.label.split(' ')[0]}
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${current.dot} tech-pulse`} />
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                    {theme === 'dark' ? '1/4' : theme === 'light' ? '2/4' : theme === 'midnight' ? '3/4' : '4/4'}
                  </span>
                </span>
              </button>
            );
          })()}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-4 space-y-1 animate-fade-in shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-600/20 dark:text-indigo-400 dark:border-indigo-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>

    {/* Auth Modal */}
    <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
