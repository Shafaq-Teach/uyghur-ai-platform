'use client';

import React, { useState, useEffect } from 'react';
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
  Monitor,
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
  ShieldCheck,
  Coins
} from 'lucide-react';

export const Header: React.FC = () => {
  const { lang, setLang, t, isRtl, theme, setTheme, cycleTheme, settings, user, isAdmin, isCloudSynced, signOut, openAuthModal } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const [announcement, setAnnouncement] = useState<{ enabled: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => res.json())
      .then((d) => {
        if (d?.config?.announcement?.enabled && d?.config?.announcement?.text) {
          setAnnouncement(d.config.announcement);
        }
      })
      .catch(() => {});
  }, []);

  const hasKeys = !!settings?.openRouterApiKey || !!settings?.geminiApiKey;

  return (
    <>
      {announcement?.enabled && announcement?.text && (
        <aside aria-label="System announcement" className="w-full bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 border-b border-indigo-500/30 text-white text-[11px] sm:text-xs py-2 px-3 sm:px-4 text-center font-medium flex items-center justify-center gap-2 relative z-50 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
          <span className="truncate max-w-[85vw]">{announcement.text}</span>
          <button 
            type="button"
            onClick={() => setAnnouncement(null)}
            className="ms-2 text-white/60 hover:text-white p-0.5 rounded transition shrink-0"
            aria-label="Close announcement"
          >
            <X className="w-3 h-3" />
          </button>
        </aside>
      )}
      <header className="sticky top-0 z-40 w-full tech-glass-header transition-colors">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 w-full min-w-0">
        {/* Logo with Tech Badge */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-md sm:shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300">
              <img 
                src="/logo_icon.png" 
                alt="Uyghur Platform AI" 
                className="w-full h-full rounded-[10px] sm:rounded-[14px] object-cover" 
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 border-2 border-white dark:border-[#08090d] rounded-full tech-pulse" />
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-extrabold text-sm sm:text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-100 dark:to-slate-300 bg-clip-text text-transparent truncate">
              {t.siteTitle}
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 shrink-0">
              v1.0.1
            </span>
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
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* User Auth Profile or Login Button */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:ps-2.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] transition text-xs shadow-sm"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-start leading-tight">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                    {user.fullName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                    <Coins className="w-2.5 h-2.5 text-amber-500" />
                    <span>{user.coins ?? 100} تەڭگە</span>
                  </span>
                </div>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shrink-0" />
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute end-0 mt-2 w-52 rounded-2xl bg-[#0f121a] border border-white/[0.1] shadow-2xl p-2.5 z-50 space-y-2 animate-fade-in"
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  {/* Name and Coins */}
                  <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-center space-y-1.5">
                    <div className="text-sm font-extrabold text-white truncate">
                      {user.fullName || user.email?.split('@')[0]}
                    </div>
                    <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>{user.coins ?? 100} تەڭگە</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/sensiz520"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-500/20 transition border border-purple-500/30"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>باشقۇرۇش سۇپىسى (Admin)</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => { setUserDropdownOpen(false); signOut(); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition border border-rose-500/20"
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
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">كىرىش</span>
            </button>
          )}

          {/* Desktop Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ug' ? 'en' : 'ug')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] transition shadow-sm hover:bg-slate-100 dark:hover:bg-white/[0.08]"
            title="Switch Language / تىل ئالماشتۇرۇش"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="font-semibold">{lang === 'ug' ? 'EN' : 'ئۇيغۇرچە'}</span>
          </button>

          {/* 3-Theme 1-Click Cycler (Dark, Light, System) */}
          {(() => {
            const themeConfig: Record<string, any> = {
              dark: {
                icon: Moon,
                color: 'text-indigo-400',
                badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
                label: lang === 'ug' ? 'كېچە' : 'Dark',
                dot: 'bg-indigo-400',
                index: '1/3',
              },
              light: {
                icon: Sun,
                color: 'text-amber-500',
                badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40',
                label: lang === 'ug' ? 'كۈندۈز' : 'Light',
                dot: 'bg-amber-400',
                index: '2/3',
              },
              system: {
                icon: Monitor,
                color: 'text-cyan-400',
                badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                label: lang === 'ug' ? 'سىستېما' : 'System',
                dot: 'bg-cyan-400',
                index: '3/3',
              },
              midnight: {
                icon: Sparkles,
                color: 'text-cyan-400',
                badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                label: t.themeMidnight,
                dot: 'bg-cyan-400',
                index: 'Custom',
              },
              warm: {
                icon: Sunset,
                color: 'text-orange-500',
                badge: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40',
                label: t.themeWarm,
                dot: 'bg-orange-400',
                index: 'Custom',
              },
            };
            const current = themeConfig[theme] || themeConfig.dark;
            const IconComponent = current.icon;

            return (
              <button
                type="button"
                onClick={cycleTheme}
                className="group relative flex items-center gap-1 sm:gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-400 dark:hover:border-indigo-500/40 transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                title={`${t.themeToggleTooltip}: ${current.label}`}
              >
                <IconComponent className={`w-4 h-4 ${current.color} transition-transform group-hover:rotate-12`} />
                <span className="hidden md:inline text-[11px] font-medium text-slate-700 dark:text-slate-300 max-w-[85px] truncate">
                  {current.label}
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${current.dot} tech-pulse`} />
                  <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]">
                    {current.index}
                  </span>
                </span>
              </button>
            );
          })()}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] transition shadow-sm"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#090b10]/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-3 animate-fade-in shadow-2xl">
          {/* Quick Controls Card (Language & Themes) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-inner">
            {/* Language Pill Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>تىل تاللاش / Language</span>
              </span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/80 dark:bg-white/[0.06] text-xs font-bold font-mono">
                <button
                  type="button"
                  onClick={() => setLang('ug')}
                  className={`px-3 py-1 rounded-lg transition ${
                    lang === 'ug' 
                      ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm font-black' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ئۇيغۇرچە
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded-lg transition ${
                    lang === 'en' 
                      ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm font-black' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* 4-Theme Selector Grid */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-white/[0.05]">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>كۆرۈنۈش ئۇسلۇبى / Themes</span>
              </span>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { id: 'dark', label: lang === 'ug' ? 'كېچە' : 'Dark', icon: Moon, color: 'text-indigo-400', desc: 'Dark Mode' },
                  { id: 'light', label: lang === 'ug' ? 'كۈندۈز' : 'Light', icon: Sun, color: 'text-amber-500', desc: 'Light Mode' },
                  { id: 'system', label: lang === 'ug' ? 'سىستېما' : 'System', icon: Monitor, color: 'text-cyan-400', desc: 'Auto Mode' },
                ].map((th) => {
                  const Icon = th.icon;
                  const isSelected = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setTheme(th.id as any)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-medium transition text-center ${
                        isSelected
                          ? 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                          : 'bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${th.color} mb-1`} />
                      <div className="truncate font-semibold text-[11px]">{th.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-200/70 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 ${isRtl ? 'rotate-90' : '-rotate-90'}`} />
                </Link>
              );
            })}
          </div>

          {/* User Profile / Admin Link in Drawer */}
          {user ? (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {(user.fullName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.fullName || user.email?.split('@')[0]}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-0.5">
                      <Coins className="w-3 h-3 text-amber-500" />
                      <span>{user.coins ?? 100} تەڭگە</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); signOut(); }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5 inline me-1" />
                  <span>چېكىنىش</span>
                </button>
              </div>

              {isAdmin && (
                <Link
                  href="/sensiz520"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold text-xs hover:bg-purple-500/25 transition mt-1"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>باشقۇرۇش سۇپىسى (Admin Panel)</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openAuthModal('signin'); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>ھېساباتقا كىرىش / تىزىملىتىش</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
    </>
  );
};
