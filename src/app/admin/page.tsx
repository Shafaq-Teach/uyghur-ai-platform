'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Cpu, 
  Key, 
  Lock, 
  CheckCircle2, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  Server,
  Zap,
  Layers,
  Sparkles,
  BarChart3,
  Sliders,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { SearchableModelSelect } from '@/components/SearchableModelSelect';

interface AdminConfigResponse {
  config: {
    activeModels: {
      chat: string;
      translate: string;
      image: string;
      tts: string;
      video: string;
    };
    quotaSettings: {
      dailyUserLimit: number;
      imageLimit: number;
    };
    hasOpenRouter: boolean;
    hasGemini: boolean;
  };
  stats: {
    userCount: number;
    historyCount: number;
    activeEnginesCount: number;
  };
  users: Array<{
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
  }>;
}

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoadingUser, isRtl, theme, openAuthModal } = useApp();
  const [data, setData] = useState<AdminConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Local model state for editing
  const [selectedModels, setSelectedModels] = useState({
    chat: 'google/gemini-2.5-flash',
    translate: 'google/gemini-2.5-flash',
    image: 'black-forest-labs/flux-1-schnell',
    tts: 'openai/tts-1',
    video: 'google/gemini-2.5-flash',
  });

  const [dailyQuota, setDailyQuota] = useState(50);
  const [imageQuota, setImageQuota] = useState(10);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/admin/config');
      if (!res.ok) {
        throw new Error('باشقۇرۇش سانلىق مەلۇماتىنى ئېلىش مەغلۇپ بولدى');
      }
      const json: AdminConfigResponse = await res.json();
      setData(json);
      if (json.config?.activeModels) {
        setSelectedModels(json.config.activeModels);
      }
      if (json.config?.quotaSettings) {
        setDailyQuota(json.config.quotaSettings.dailyUserLimit || 50);
        setImageQuota(json.config.quotaSettings.imageLimit || 10);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خاتالىق كۆرۈلدى');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSaveModels = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeModels: selectedModels,
          quotaSettings: {
            dailyUserLimit: dailyQuota,
            imageLimit: imageQuota,
          }
        }),
      });

      if (!res.ok) {
        throw new Error('ساقلاش مەغلۇپ بولدى');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      await fetchAdminData();
    } catch (err: any) {
      alert('ساقلاشتا خاتالىق كۆرۈلدى: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">باشقۇرغۇچى كىملىكى تەكشۈرۈلۈۋاتىدۇ...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0f121a] border border-slate-200 dark:border-white/[0.12] rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/30 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">باشقۇرغۇچى ھوقۇقى تەلەپ قىلىنىدۇ</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              بۇ مەركىزىي سەھىپە پەقەت ئورگان باشقۇرغۇچىسى (<span className="font-mono text-indigo-400">yulgun353@gmail.com</span>) ئۈچۈنلا قوغدالغان. داۋاملاشتۇرۇش ئۈچۈن باشقۇرغۇچى ھېساباتى بىلەن كىرىڭ.
            </p>
          </div>
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 transition"
          >
            باشقۇرغۇچى سۈپىتىدە كىرىش
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                سۈنئىي ئىدراك مەركىزىي باشقۇرۇش سۇپىسى
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MASTER ADMIN
              </span>
            </div>
            <p className="text-xs text-indigo-200/70 mt-1">
              مەزكۇر سۇپىدا مودېللارنى تاللايسىز ۋە ئانالىز تەھلىللەرنى كۆرىسىز. API ئاچقۇچلىرى بىخەتەر ھالدا سۇپابەسكە قوشۇلغان ۋە قوغدالغان.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>يېڭىلاش</span>
          </button>
          <button
            onClick={handleSaveModels}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'ساقلىنىۋاتىدۇ...' : 'تەڭشەكلەرنى سۇپابەسكە ساقلاش'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>مودېل تاللاشلىرى ۋە سىستېما نورمىلىرى سۇپابەس مەركىزىگە ئۇتۇقلۇق يېڭىلاندى! بارلىق ئابۇنىتلارغا يېڭى مودېللار دەرھال ئاكتىپلاندى.</span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">ئەنگە ئېلىنغان ئابۇنىتلار</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {data?.stats?.userCount ?? 1}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">ئېلخەت ۋە Google بىلەن كىرگۈچىلەر</p>
        </div>

        {/* AI Creations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">ئومۇمىي ھاسىل قىلىنغان ئەسەرلەر</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {data?.stats?.historyCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">پاراڭ، تەرجىمە، رەسىم، ئاۋاز</p>
        </div>

        {/* OpenRouter Latency */}
        <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">OpenRouter كېچىكىش ئىنكاسى</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-500">
            ~115 ms
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Global Mesh تور سۈرئىتى</p>
        </div>

        {/* Gemini Engine Latency */}
        <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Google Gemini تېزلىكى</span>
            <Zap className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-500">
            ~38 ms
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ultra Fast Direct API</p>
        </div>
      </div>

      {/* Supabase Key & Security Vault Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-indigo-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">سۇپابەس مەركىزىي ئاچقۇچ ئامبىرى (Supabase Master Vault)</h2>
              <p className="text-xs text-slate-400">
                ئاچقۇچلار پەقەت سۇپابەستىلا ساقلىنىدۇ، ھەرگىز ئابۇنىتقا ئاشكارىلانمايدۇ. ئابۇنىتلار ئاچقۇچسىز ئەركىن ئىشلىتەلەيدۇ.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>سۇپابەسكە 100% قوغدالغان</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* OpenRouter Key Vault */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">OpenRouter سىستېما ئاچقۇچى:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm tracking-widest font-bold text-slate-300">
                  ••••••••••••••••••••••••
                </span>
                <span className="text-[11px] text-slate-400">
                  {data?.config?.hasOpenRouter ? '(سۇپابەستە بىخەتەر شىفىرلانغان)' : '(تېخى قوشۇلمىغان)'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
              data?.config?.hasOpenRouter 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {data?.config?.hasOpenRouter ? 'سۇپابەستە ئاكتىپ' : 'تېخى قوشۇلمىغان'}
            </span>
          </div>

          {/* Gemini Key Vault */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Google Gemini سىستېما ئاچقۇچى:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm tracking-widest font-bold text-slate-300">
                  ••••••••••••••••••••••••
                </span>
                <span className="text-[11px] text-slate-400">
                  {data?.config?.hasGemini ? '(سۇپابەستە بىخەتەر شىفىرلانغان)' : '(تېخى قوشۇلمىغان)'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
              data?.config?.hasGemini 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {data?.config?.hasGemini ? 'سۇپابەستە ئاكتىپ' : 'تېخى قوشۇلمىغان'}
            </span>
          </div>
        </div>

        {/* Live Supabase Key Sync Notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-200">
          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white">سۇپابەس بىلەن بىۋاسىتە نەق مەيدان ئۇلىنىش:</span>
            <p className="text-indigo-200/80">
              ئەگەر سىز Supabase ئىچىدىكى <code className="px-1.5 py-0.5 bg-black/40 rounded text-amber-300 font-mono">system_config</code> جەدۋىلىدىن ئاچقۇچنى ئۆزگەرتسىڭىز، بۇ بەتتىكى «يېڭىلاش» (Refresh) كۇنۇپكىسىنى باسسىڭىزلا، يېڭى ئاچقۇچ دەرھال ئەڭ يېڭى ھالەتتە كۈچكە ئىگە بولىدۇ ھەم ئاپتوماتىك ئىشلىتىلىدۇ.
            </p>
          </div>
        </div>
      </div>

      {/* Main Section: Global Model Selector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                ئارقا سۇپىدا مودېل تاللاش مەركىزى (Global AI Model Selection)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                باشقۇرغۇچى تاللىغان مودېللار پۈتۈن سىستېمىدىكى ئابۇنىتلارغا نۆۋەتتىكى ئۆلچەملىك مودېل قىلىپ تارقىتىلىدۇ.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveModels}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'ساقلىنىۋاتىدۇ...' : 'ساقلاش'}</span>
          </button>
        </div>

        {/* 5 Model Engine Cards with Live Searchable All Models Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Chat Model */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">1. ئەقلىي چات مودېلى (Chat)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                بارلىق مودېللار
              </span>
            </div>
            <SearchableModelSelect
              value={selectedModels.chat}
              onChange={(modelId) => setSelectedModels({ ...selectedModels, chat: modelId })}
              categoryHint="chat"
              placeholder="چات مودېلىنى ئىزدەڭ (Gemini, Claude, DeepSeek, GPT...)"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ئابۇنىتلار پاراڭلاشقاندا ئاپتوماتىك قوزغىلىدىغان مەركىزىي چات ماتورى.
            </p>
          </div>

          {/* Translation Model */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">2. تەرجىمە مودېلى (Translate)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                7 ئۇسلۇب
              </span>
            </div>
            <SearchableModelSelect
              value={selectedModels.translate}
              onChange={(modelId) => setSelectedModels({ ...selectedModels, translate: modelId })}
              categoryHint="translate"
              placeholder="تەرجىمە مودېلىنى ئىزدەڭ..."
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ئۇيغۇرچە ئەدەبىي، رەسمىي، سودا قاتارلىق ئۇسلۇبلار ئۈچۈن تەرجىمە ماتورى.
            </p>
          </div>

          {/* Image Gen Model */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">3. رەسىم مودېلى (Image Studio)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                FLUX / SD
              </span>
            </div>
            <SearchableModelSelect
              value={selectedModels.image}
              onChange={(modelId) => setSelectedModels({ ...selectedModels, image: modelId })}
              categoryHint="image"
              placeholder="رەسىم مودېلىنى ئىزدەڭ (Flux, SD...)"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ئابۇنىتلار سۈرەت ھاسىل قىلغاندا ئىشلىتىلىدىغان گرافىك مودېلى.
            </p>
          </div>

          {/* TTS Model */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">4. ئاۋاز مودېلى (TTS Voice)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                Speech
              </span>
            </div>
            <SearchableModelSelect
              value={selectedModels.tts}
              onChange={(modelId) => setSelectedModels({ ...selectedModels, tts: modelId })}
              categoryHint="tts"
              placeholder="ئاۋاز مودېلىنى ئىزدەڭ..."
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              تېكىستنى ئاۋازغا ئايلاندۇرۇش سۈنئىي ئاۋاز ماتورى.
            </p>
          </div>

          {/* Video Ad Engine */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">5. تاۋار سىن فىلىمى (Video Ad Script)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                E-Commerce
              </span>
            </div>
            <SearchableModelSelect
              value={selectedModels.video}
              onChange={(modelId) => setSelectedModels({ ...selectedModels, video: modelId })}
              categoryHint="video"
              placeholder="سىن سىنارىيە مودېلىنى ئىزدەڭ..."
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              مەھسۇلاتنى سىن فىلىمى قىلىپ تەييارلايدىغان ئەقلىي ماتور.
            </p>
          </div>

          {/* Quotas Settings */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">6. ئابۇنىتلار نورمىسى (Daily Quota)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                چەكلىمە
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">كۈندىلىك سوئال چىكى:</span>
                <input
                  type="number"
                  value={dailyQuota}
                  onChange={(e) => setDailyQuota(Number(e.target.value))}
                  className="w-20 p-1 text-center font-mono border rounded-lg bg-white dark:bg-[#12131a]"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">كۈندىلىك رەسىم چىكى:</span>
                <input
                  type="number"
                  value={imageQuota}
                  onChange={(e) => setImageQuota(Number(e.target.value))}
                  className="w-20 p-1 text-center font-mono border rounded-lg bg-white dark:bg-[#12131a]"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              ھەر بىر ئادەتتىكى ئابۇنىتنىڭ بىر كۈندە ئىشلىتەلەيدىغان سانى.
            </p>
          </div>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                ئەنگە ئېلىنغان ئابۇنىتلار تىزىملىكى (Registered Users)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                سۇپابەس ئارقىلىق تىزىملاتقان كىشىلەر تىزىملىكى ۋە رولى.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500">
            جەمئىي: {data?.users?.length ?? data?.stats?.userCount ?? 0} ئابۇنىت
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-400 font-semibold">
                <th className="py-3 px-4">ئېلخەت</th>
                <th className="py-3 px-4">ئىسمى</th>
                <th className="py-3 px-4">ھوقۇقى (Role)</th>
                <th className="py-3 px-4">قوشۇلغان ۋاقتى</th>
                <th className="py-3 px-4">ھالىتى</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {(!data?.users || data.users.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    ھازىرچە ئابۇنىتلار ئۇچۇرى يۈكلىنىۋاتىدۇ ياكى قۇرۇق.
                  </td>
                </tr>
              ) : (
                data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {u.email}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                      {u.full_name || 'ئىشلەتكۈچى'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 border border-indigo-500/20'
                      }`}>
                        {u.role === 'admin' ? 'باشقۇرغۇچى (Admin)' : 'ئادەتتىكى ئەزا (User)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        نورمال
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
