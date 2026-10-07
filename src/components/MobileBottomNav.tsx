'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Home, 
  MessageSquare, 
  LayoutGrid, 
  History, 
  Settings 
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { lang, isRtl } = useApp();

  const navItems = [
    {
      href: '/',
      label: lang === 'ug' ? 'باش بەت' : 'Home',
      icon: Home,
    },
    {
      href: '/chat',
      label: lang === 'ug' ? 'پاراڭ' : 'Chat',
      icon: MessageSquare,
    },
    {
      href: '/translate',
      label: lang === 'ug' ? 'قوراللار' : 'Tools',
      icon: LayoutGrid,
    },
    {
      href: '/history',
      label: lang === 'ug' ? 'تارىخ' : 'History',
      icon: History,
    },
    {
      href: '/settings',
      label: lang === 'ug' ? 'تەڭشەك' : 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#090b14]/95 backdrop-blur-2xl border-t border-slate-200/90 dark:border-white/10 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.55)] px-2 pt-1 pb-safe transition-colors"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative group min-w-[56px] ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div 
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 scale-105 shadow-xs' 
                    : 'group-hover:bg-slate-100 dark:group-hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-tight tracking-tight font-medium" style={{ fontFamily: "'UKIJ Ekran', sans-serif" }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
