'use client';

import React from 'react';
import { FeatureModels } from '@/types';
import { useApp } from '@/context/AppContext';
import { Lock } from 'lucide-react';

interface Props {
  feature: keyof FeatureModels;
  featureTitle?: string;
}

export const ModelBar: React.FC<Props> = ({ feature, featureTitle }) => {
  const { settings, user } = useApp();
  const isLocked = Boolean(settings.lockedFeatures?.[feature]);
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'yulgun353@gmail.com';

  if (!isLocked) return null;

  return (
    <div className="w-full mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-3 shadow-lg shadow-rose-950/20 animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{featureTitle || 'بۇ ئىقتىدار'} باشقۇرغۇچى تەرىپىدىن ۋاقىتلىق قۇلۇپلاندى</span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                سىز باشقۇرغۇچى (سىناق ھوقۇقى بار)
              </span>
            )}
          </h4>
          <p className="text-xs text-rose-200/80 mt-0.5">
            نۆۋەتتە بۇ بۆلەكتە تېخنىكىلىق ئاسراش ياكى مودېل يېڭىلاش ئېلىپ بېرىلىۋاتىدۇ. پات ئارىدا قايتا ئېچىلىدۇ.
          </p>
        </div>
      </div>
    </div>
  );
};
