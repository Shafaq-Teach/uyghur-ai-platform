'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/context/AppContext';
import { X, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialTab = 'signin' }) => {
  const { isRtl, signInWithGoogle, signInWithEmail, signUpWithEmail } = useApp();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !mounted) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const res = await signInWithGoogle();
    if (res.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (tab === 'signin') {
      const res = await signInWithEmail(email.trim(), password);
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setLoading(false);
        onClose();
      }
    } else {
      const res = await signUpWithEmail(email.trim(), password, fullName.trim());
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setLoading(false);
        if (res.message) {
          setSuccessMsg(res.message);
          setTab('signin');
        } else {
          onClose();
        }
      }
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-sm sm:max-w-md my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.15] rounded-3xl shadow-2xl overflow-hidden relative"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header - Compact & Clean */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-950/60 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {tab === 'signin' ? 'ھېساباتقا كىرىش' : 'يېڭى ھېسابات ئېچىش'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                سۈنئىي ئىدراك سۇپىسى
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/[0.08] transition"
            title="تاقاش"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                tab === 'signin'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              كىرىش (Login)
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                tab === 'signup'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              تىزىملىتىش (Sign Up)
            </button>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Primary Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">ئىسمىڭىز</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute start-3 top-2.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مەسىلەن: sersan353"
                    className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-white/[0.1] rounded-xl ps-9 pe-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">ئېلخەت ئادرېسى (Gmail ياكى باشقا ئېلخەت)</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute start-3 top-2.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-white/[0.1] rounded-xl ps-9 pe-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">پارول</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute start-3 top-2.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-[#0d0f17] border border-slate-200 dark:border-white/[0.1] rounded-xl ps-9 pe-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'بىر تەرەپ قىلىنىۋاتىدۇ...' : tab === 'signin' ? 'كىرىش' : 'ھېسابات قۇرۇش'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Optional Divider & Google button */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] space-y-2.5">
            <div className="text-center text-[10px] text-slate-500">
              ياكى Google كىملىكى بىلەن
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white dark:hover:bg-slate-100 text-slate-900 font-medium text-xs border border-slate-200 dark:border-transparent transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google ئارقىلىق كىرىش</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.06] text-center text-[10px] text-slate-500 dark:text-slate-400">
          <span>🔒 API ئاچقۇچلىرىڭىز ۋە سۈنئىي ئەقىل خاتىرىلىرىڭىز بۇلۇتقا بىخەتەر ساقلىنىدۇ</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
