'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/context/AppContext';
import { X, Sparkles, UserPlus, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const RegisterPromptModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const { isRtl } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-white dark:bg-[#0f121a] border border-slate-200 dark:border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden relative animate-scale-up"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Top ambient glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08] transition z-10"
          title="تاقاش"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 text-center space-y-5">
          {/* Icon Badge */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <UserPlus className="w-8 h-8 text-indigo-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-500 tech-pulse" />
          </div>

          {/* Prompt Messages */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3 h-3" />
              <span>تىزىملىتىش ئەسكەرتىشى</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              تىزىملىتىڭ، ئاندىن ئىشلىتەلەيسىز
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300/90 leading-relaxed max-w-xs mx-auto">
              سۈنئىي ئىدراك ئىقتىدارلىرىدىن تولۇق ھەم ئەركىن بەھرىمەن بولۇش ئۈچۈن، ئاۋۋال ھەقسىز ھېسابات ئېچىۋېلىڭ ياكى كىرىڭ.
            </p>
          </div>

          {/* Action Buttons: ھەئە & ياق */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            {/* Yes Button */}
            <button
              onClick={onConfirm}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-white/20 flex items-center justify-center gap-2"
            >
              <span>ھەئە</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>

            {/* No Button */}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-white/[0.08] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>ياق</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
