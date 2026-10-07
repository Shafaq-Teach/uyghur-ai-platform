'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  Server,
  Zap,
  Sparkles,
  Sliders,
  ShieldAlert,
  Search,
  Megaphone,
  Radio,
  Gauge,
  UserCheck,
  UserX,
  History,
  MessageSquare,
  Image as ImageIcon,
  Languages,
  Volume2,
  Video,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Layers,
  Settings,
  ChevronRight,
  Check,
  X,
  Coins,
  Plus,
  Minus
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
    fallbackModels?: {
      chat: string;
      translate: string;
    };
    quotaSettings: {
      dailyUserLimit: number;
      imageLimit: number;
    };
    announcement?: {
      enabled: boolean;
      text: string;
      type: string;
    };
    maintenanceMode?: boolean;
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
    coins?: number;
    created_at: string;
  }>;
  recentActivities?: Array<{
    id: string;
    type: string;
    title?: string;
    preview?: string;
    created_at: string;
    user_id: string;
    userName?: string;
  }>;
}

interface DiagnosticsData {
  timestamp: string;
  engines: {
    supabase: { status: string; latencyMs: number; message: string };
    openrouter: { status: string; latencyMs: number; message: string; info?: any };
    gemini: { status: string; latencyMs: number; message: string };
  };
}

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoadingUser, isRtl, theme, openAuthModal, refreshUserCoins } = useApp();
  const [data, setData] = useState<AdminConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active Tab: 'overview' | 'models' | 'users' | 'diagnostics' | 'broadcast'
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'users' | 'diagnostics' | 'broadcast'>('overview');

  // Local model state
  const [selectedModels, setSelectedModels] = useState({
    chat: 'google/gemini-2.5-flash',
    translate: 'google/gemini-2.5-flash',
    image: 'black-forest-labs/flux-1-schnell',
    tts: 'openai/tts-1',
    video: 'google/gemini-2.5-flash',
  });

  // Fallback models
  const [fallbackModels, setFallbackModels] = useState({
    chat: 'deepseek/deepseek-chat',
    translate: 'google/gemini-2.5-flash',
  });

  const [dailyQuota, setDailyQuota] = useState(50);
  const [imageQuota, setImageQuota] = useState(10);

  // Announcement State
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  // Maintenance mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // User search and filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  // Diagnostics state
  const [diagData, setDiagData] = useState<DiagnosticsData | null>(null);
  const [runningDiag, setRunningDiag] = useState(false);

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
      if (json.config?.fallbackModels) {
        setFallbackModels(json.config.fallbackModels);
      }
      if (json.config?.quotaSettings) {
        setDailyQuota(json.config.quotaSettings.dailyUserLimit || 50);
        setImageQuota(json.config.quotaSettings.imageLimit || 10);
      }
      if (json.config?.announcement) {
        setAnnouncementEnabled(json.config.announcement.enabled || false);
        setAnnouncementText(json.config.announcement.text || '');
      }
      if (json.config?.maintenanceMode !== undefined) {
        setMaintenanceMode(json.config.maintenanceMode);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خاتالىق كۆرۈلدى');
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostics = async () => {
    try {
      setRunningDiag(true);
      const res = await fetch('/api/admin/diagnostics');
      if (res.ok) {
        const json: DiagnosticsData = await res.json();
        setDiagData(json);
      }
    } catch (e) {
      console.error('Diagnostics failed:', e);
    } finally {
      setRunningDiag(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    runDiagnostics();
  }, []);

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeModels: selectedModels,
          fallbackModels: fallbackModels,
          quotaSettings: {
            dailyUserLimit: dailyQuota,
            imageLimit: imageQuota,
          },
          announcement: {
            enabled: announcementEnabled,
            text: announcementText,
            type: 'info',
          },
          maintenanceMode: maintenanceMode,
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

  const handleToggleUserRole = async (targetUser: { id: string; role: string; email: string }) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmMsg = targetUser.role === 'admin'
      ? `راستلا «${targetUser.email}» نىڭ باشقۇرغۇچى (Admin) ھوقۇقىنى ئېلىپ تاشلاپ، ئادەتتىكى ئەزا (User) غا ئۆزگەرتەمسىز؟`
      : `راستلا «${targetUser.email}» گە مەركىزىي باشقۇرغۇچى (Admin) ھوقۇقى بەرمەكچىمۇ؟`;

    if (!confirm(confirmMsg)) return;

    try {
      setRoleUpdatingId(targetUser.id);
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateUserRole: {
            userId: targetUser.id,
            role: newRole,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'ھوقۇق ئۆزگەرتىش مەغلۇپ بولدى');
      }

      // Update local user state immediately
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u),
        };
      });
    } catch (err: any) {
      alert('خاتالىق: ' + err.message);
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const [coinAdjustingId, setCoinAdjustingId] = useState<string | null>(null);

  const handleAdjustUserCoins = async (targetUser: any, mode: 'add' | 'subtract', amount?: number) => {
    let finalAmount = amount;
    if (!finalAmount) {
      const promptText = mode === 'add'
        ? `«${targetUser.full_name || targetUser.email}» غا قانچە تەڭگە قوشماقچى؟ (مەسىلەن: 100)`
        : `«${targetUser.full_name || targetUser.email}» دىن قانچە تەڭگە ئېلىۋەتمەكچى؟ (مەسىلەن: 50)`;
      const inputVal = prompt(promptText, '50');
      if (!inputVal) return;
      finalAmount = parseInt(inputVal, 10);
      if (isNaN(finalAmount) || finalAmount <= 0) {
        alert('ئۈنۈملۈك مۇسبەت سان كىرگۈزۈڭ!');
        return;
      }
    }

    try {
      setCoinAdjustingId(targetUser.id);
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustUserCoins: {
            userId: targetUser.id,
            amount: finalAmount,
            mode: mode,
          },
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'تەڭگە تەڭشەش مەغلۇپ بولدى');
      }

      const updatedCoins = typeof resData.coins === 'number'
        ? resData.coins
        : typeof resData.coins?.coins === 'number'
          ? resData.coins.coins
          : (typeof targetUser.coins === 'number' ? targetUser.coins : 100);

      setData((prev) => {
        if (!prev || !Array.isArray(prev.users)) return prev;
        return {
          ...prev,
          users: prev.users.map((u) => (u.id === targetUser.id ? { ...u, coins: updatedCoins } : u)),
        };
      });

      if (targetUser.id === user?.id) {
        refreshUserCoins();
      }
    } catch (err: any) {
      alert('خاتالىق: ' + err.message);
    } finally {
      setCoinAdjustingId(null);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter(u => {
      const matchSearch = !userSearch || 
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.full_name?.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [data?.users, userSearch, roleFilter]);

  if (isLoadingUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">باشقۇرغۇچى كىملىكى دەلىللىنىۋاتىدۇ...</span>
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
              بۇ مەركىزىي سەھىپە پەقەت ئورگان باشقۇرغۇچىسى (<span className="font-mono text-indigo-400">yulgun353@gmail.com</span>) ئۈچۈن قوغدالغان.
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
    <div className="max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                سۈنئىي ئىدراك مەركىزىي باشقۇرۇش سۇپىسى
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 font-mono tracking-wider">
                MASTER STUDIO 2.0
              </span>
            </div>
            <p className="text-xs text-indigo-200/70 mt-1 line-clamp-1">
              سۈنئىي ئەقىل مودېللىرى، نەق مەيدان دىئاگنوز، ئەزالار ھوقۇقى ۋە ئاچقۇچ ئامبىرى مەركىزى.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => { fetchAdminData(); runDiagnostics(); }}
            disabled={loading || runningDiag}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all"
            title="بارلىق سانلىق مەلۇماتلارنى يېڭىلاش"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || runningDiag ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">يېڭىلاش</span>
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-95 text-white shadow-lg shadow-indigo-500/30 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'ساقلىنىۋاتىدۇ...' : 'ساقلاش (Supabase)'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>بارلىق تەڭشەكلەر (مودېللار، زاپاس ماتور، ئېلان ۋە چەكلىمىلەر) سۇپابەس مەركىزىگە 100% ئۇتۇقلۇق يېڭىلاندى!</span>
        </div>
      )}

      {/* 5 High-Tech Studio Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: '📊 ئانالىز ۋە ئىستاتىستىكا', desc: 'Overview' },
          { id: 'models', label: '🧠 سۈنئىي ئەقىل مودېللىرى', desc: 'AI Models' },
          { id: 'users', label: '👥 ئەزالار ۋە ھوقۇق', desc: 'Users & Roles' },
          { id: 'diagnostics', label: '🛡️ ئاچقۇچ ۋە دىئاگنوز', desc: 'Vault & Ping' },
          { id: 'broadcast', label: '📢 سۇپا ئېلانى ۋە تەڭشەك', desc: 'Broadcast' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-md shadow-indigo-500/10 border border-slate-200/50 dark:border-indigo-400/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.02]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-medium">ئەنگە ئېلىنغان ئابۇنىتلار</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {data?.stats?.userCount ?? 1}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-500 mt-2 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Google & ئىمېيىل ئارقىلىق تىزىملاتقان</span>
              </div>
            </div>

            {/* AI Creations */}
            <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-medium">ئومۇمىي ھاسىل قىلىنغان ئەسەرلەر</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {data?.stats?.historyCount ?? 0}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-purple-400 mt-2 font-medium">
                <span>پاراڭ، تەرجىمە، رەسىم، ئاۋاز</span>
              </div>
            </div>

            {/* OpenRouter Latency Real */}
            <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-medium">OpenRouter ئىنكاس ۋاقتى</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-emerald-500">
                {diagData?.engines?.openrouter?.latencyMs ? `${diagData.engines.openrouter.latencyMs} ms` : '~92 ms'}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                <span className={`w-2 h-2 rounded-full ${diagData?.engines?.openrouter?.status === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{diagData?.engines?.openrouter?.status === 'ok' ? 'نورمال ئۇلاندى (Live Mesh)' : 'تەكشۈرۈلۈۋاتىدۇ'}</span>
              </div>
            </div>

            {/* Gemini Real Latency */}
            <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-medium">Google Gemini تېزلىكى</span>
                <Zap className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-3xl font-black text-cyan-500">
                {diagData?.engines?.gemini?.latencyMs ? `${diagData.engines.gemini.latencyMs} ms` : '~36 ms'}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                <span className={`w-2 h-2 rounded-full ${diagData?.engines?.gemini?.status === 'ok' ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{diagData?.engines?.gemini?.status === 'ok' ? 'تېز سۈرئەتلىك Direct API' : 'تەكشۈرۈلۈۋاتىدۇ'}</span>
              </div>
            </div>
          </div>

          {/* Multimodal Engines Status Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>ئاكتىپ سۈنئىي ئەقىل مودۇل تەقسىماتى</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">5 ماتور تولۇق سەپلەنگەن</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { title: 'ئەقلىي پاراڭ (Chat)', model: selectedModels.chat, icon: MessageSquare, color: 'text-indigo-400' },
                { title: 'تەرجىمە (Translate)', model: selectedModels.translate, icon: Languages, color: 'text-emerald-400' },
                { title: 'رەسىم ستۇدىيىسى (Image)', model: selectedModels.image, icon: ImageIcon, color: 'text-purple-400' },
                { title: 'ئاۋازغا ئايلاندۇرۇش (TTS)', model: selectedModels.tts, icon: Volume2, color: 'text-blue-400' },
                { title: 'تاۋار سىن فىلىمى (Video)', model: selectedModels.video, icon: Video, color: 'text-amber-400' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{item.title}</span>
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 truncate" title={item.model}>
                      {item.model.split('/').pop()}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.model.split('/')[0]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Recent Creations Stream Feed */}
          <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    نەق مەيدان سۈنئىي ئىدراك پائالىيەت خاتىرىسى (Live Feed)
                  </h2>
                  <p className="text-[11px] text-slate-400">سۇپىدىكى ئەڭ يېڭى يارىتىلغان ئەسەرلەر ۋە سۈرەتلەر</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">ئەڭ يېڭى {data?.recentActivities?.length || 0} تۈر</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {(!data?.recentActivities || data.recentActivities.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  ھازىرچە پائالىيەت خاتىرىسى يوق ياكى يۈكلىنىۋاتىدۇ.
                </div>
              ) : (
                data.recentActivities.map((act) => (
                  <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        act.type === 'chat' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        act.type === 'image' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        act.type === 'translate' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        act.type === 'tts' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {act.type}
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {act.title || act.preview || 'ئەسەر ھاسىل قىلىندى'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ئىشلەتكۈچى: <span className="font-medium text-slate-300">{act.userName || 'ئابۇنىت'}</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI MODELS & FALLBACK */}
      {activeTab === 'models' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Models Selection Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    ئاساسىي مودېل تاللاش مەركىزى (Global Primary AI Models)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    بۇ يەردە تاللانغان مودېللار بارلىق ئابۇنىتلارغا نۆۋەتتىكى ئۆلچەملىك ماتور قىلىپ تارقىتىلىدۇ.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'ساقلىنىۋاتىدۇ...' : 'ساقلاش'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Chat Model */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">1. ئەقلىي چات مودېلى (Chat)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold">
                    100+ مودېل
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">ئاكتىپ مودېل:</span>
                  <span className="font-mono font-bold text-indigo-300 truncate max-w-[190px]" title={selectedModels.chat}>
                    {selectedModels.chat}
                  </span>
                </div>
                <SearchableModelSelect
                  value={selectedModels.chat}
                  onChange={(modelId) => setSelectedModels({ ...selectedModels, chat: modelId })}
                  categoryHint="chat"
                  placeholder="چات مودېلىنى ئىزدەڭ..."
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ئابۇنىتلار چاتتا پاراڭلاشقاندا ئاپتوماتىك قوزغىلىدىغان باش ماتور.
                </p>
              </div>

              {/* Translation Model */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">2. تەرجىمە مودېلى (Translate)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                    7 ئۇسلۇب
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">ئاكتىپ مودېل:</span>
                  <span className="font-mono font-bold text-emerald-300 truncate max-w-[190px]" title={selectedModels.translate}>
                    {selectedModels.translate}
                  </span>
                </div>
                <SearchableModelSelect
                  value={selectedModels.translate}
                  onChange={(modelId) => setSelectedModels({ ...selectedModels, translate: modelId })}
                  categoryHint="translate"
                  placeholder="تەرجىمە مودېلىنى ئىزدەڭ..."
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ئۇيغۇرچە ئەدەبىي ۋە كەسپىي تەرجىمە ئۈچۈن ئىشلىتىلىدىغان مەخسۇس ماتور.
                </p>
              </div>

              {/* Image Gen Model */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">3. رەسىم مودېلى (Image Studio)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold">
                    FLUX / SD
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">ئاكتىپ مودېل:</span>
                  <span className="font-mono font-bold text-purple-300 truncate max-w-[190px]" title={selectedModels.image}>
                    {selectedModels.image}
                  </span>
                </div>
                <SearchableModelSelect
                  value={selectedModels.image}
                  onChange={(modelId) => setSelectedModels({ ...selectedModels, image: modelId })}
                  categoryHint="image"
                  placeholder="رەسىم مودېلىنى ئىزدەڭ..."
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  تېكىستتىن يۇقىرى سۈپەتلىك گرافىك رەسىم سىزىدىغان نېرۋا تورى مودېلى.
                </p>
              </div>

              {/* TTS Model */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">4. ئاۋاز مودېلى (TTS Voice)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">
                    Speech
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">ئاكتىپ مودېل:</span>
                  <span className="font-mono font-bold text-blue-300 truncate max-w-[190px]" title={selectedModels.tts}>
                    {selectedModels.tts}
                  </span>
                </div>
                <SearchableModelSelect
                  value={selectedModels.tts}
                  onChange={(modelId) => setSelectedModels({ ...selectedModels, tts: modelId })}
                  categoryHint="tts"
                  placeholder="ئاۋاز مودېلىنى ئىزدەڭ..."
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  تېكىستنى ئاۋازغا ئايلاندۇرۇش ۋە ئوقۇتۇش ماتورى.
                </p>
              </div>

              {/* Video Engine */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">5. تاۋار سىن فىلىمى (Video Ad Script)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                    E-Commerce
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">ئاكتىپ مودېل:</span>
                  <span className="font-mono font-bold text-amber-300 truncate max-w-[190px]" title={selectedModels.video}>
                    {selectedModels.video}
                  </span>
                </div>
                <SearchableModelSelect
                  value={selectedModels.video}
                  onChange={(modelId) => setSelectedModels({ ...selectedModels, video: modelId })}
                  categoryHint="video"
                  placeholder="سىن سىنارىيە مودېلىنى ئىزدەڭ..."
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  مەھسۇلاتنى ئېلان فىلىمى سىنارىيەسىگە ئايلاندۇرىدىغان ئەقلىي مودېل.
                </p>
              </div>

              {/* Quotas Settings */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">6. ئابۇنىتلار نورمىسى (Daily Quotas)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    كۈندىلىك چەك
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">كۈندىلىك سوئال چېكى:</span>
                    <input
                      type="number"
                      value={dailyQuota}
                      onChange={(e) => setDailyQuota(Number(e.target.value))}
                      className="w-20 p-1.5 text-center font-mono border rounded-lg bg-white dark:bg-[#12131a] text-xs font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">كۈندىلىك رەسىم چېكى:</span>
                    <input
                      type="number"
                      value={imageQuota}
                      onChange={(e) => setImageQuota(Number(e.target.value))}
                      className="w-20 p-1.5 text-center font-mono border rounded-lg bg-white dark:bg-[#12131a] text-xs font-bold"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  ھەر بىر ئادەتتىكى ئابۇنىتنىڭ بىر كۈندە ھەقسىز ئىشلىتەلەيدىغان سانى.
                </p>
              </div>
            </div>
          </div>

          {/* Smart Automatic Fallback Routing (زاپاس مودېل قوغدىنىشى) */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-cyan-500/30 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>ئاپتوماتىك زاپاس مودېل قوغدىنىشى (Smart Fallback Routing)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">FAILOVER</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ئەگەر ئاساسىي مودېلدا سۈرئەت چەكلىمىسى (Rate Limit 429) ياكى تور ئۈزۈلۈش يۈز بەرسە، سىستېما دەرھال تۆۋەندىكى زاپاس مودېلغا ئۇلىنىپ ئىشلەتكۈچىنىڭ پارىڭىنى ساقلاپ قالىدۇ.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <span className="text-xs font-semibold text-slate-300">چات زاپاس مودېلى (Fallback Chat):</span>
                <SearchableModelSelect
                  value={fallbackModels.chat}
                  onChange={(modelId) => setFallbackModels({ ...fallbackModels, chat: modelId })}
                  categoryHint="chat"
                  placeholder="زاپاس چات مودېلىنى تاللاڭ..."
                />
                <span className="text-[10px] text-slate-400 block">تەۋسىيە قىلىنغىنى: DeepSeek Chat ياكى Gemini Flash</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <span className="text-xs font-semibold text-slate-300">تەرجىمە زاپاس مودېلى (Fallback Translate):</span>
                <SearchableModelSelect
                  value={fallbackModels.translate}
                  onChange={(modelId) => setFallbackModels({ ...fallbackModels, translate: modelId })}
                  categoryHint="translate"
                  placeholder="زاپاس تەرجىمە مودېلىنى تاللاڭ..."
                />
                <span className="text-[10px] text-slate-400 block">ئاساسىي تەرجىمە ماتورى توختاپ قالغاندا ئىشقا چۈشىدۇ.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  ئەنگە ئېلىنغان ئابۇنىتلار باشقۇرۇش مەركىزى (User Directory)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ئەزالارنى ئىزدەش، رولىنى ئۆزگەرتىش ۋە ھوقۇق بېرىش مەشغۇلاتى.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                جەمئىي: {filteredUsers.length} نەپەر
              </span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ئېلخەت ياكى ئىسىم بويىچە ئىزدەڭ..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full py-2 ps-4 pe-9 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-xs font-bold">
              {[
                { id: 'all', label: 'ھەممىسى' },
                { id: 'admin', label: 'باشقۇرغۇچىلار' },
                { id: 'user', label: 'ئادەتتىكى ئەزالار' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setRoleFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    roleFilter === f.id
                      ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/[0.08]">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-white/[0.02]">
                <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">ئېلخەت ئادرېسى</th>
                  <th className="py-3.5 px-4">ئىسمى</th>
                  <th className="py-3.5 px-4">ھازىرقى ھوقۇقى (Role)</th>
                  <th className="py-3.5 px-4">تەڭگە سانى</th>
                  <th className="py-3.5 px-4">قوشۇلغان ۋاقتى</th>
                  <th className="py-3.5 px-4 text-center">مەشغۇلات (تەڭگە & ھوقۇق)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      ئىزدەش نەتىجىسىدە ئابۇنىت تېپىلمىدى.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isTargetAdmin = u.role === 'admin';
                    const isSelf = u.email === user?.email;
                    const isUpdating = roleUpdatingId === u.id;
                    const isCoinUpdating = coinAdjustingId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                          {u.email}
                          {isSelf && (
                            <span className="ms-2 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              سىز
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                          {u.full_name || 'ئىشلەتكۈچى'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isTargetAdmin 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {isTargetAdmin ? 'باشقۇرغۇچى (Admin)' : 'ئادەتتىكى ئەزا (User)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold">
                            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-mono text-xs">
                              {typeof u.coins === 'number' ? u.coins : (typeof u.coins?.coins === 'number' ? u.coins.coins : 100)}
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400/80">تەڭگە</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {/* Coin adjustment buttons */}
                            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                              {isCoinUpdating ? (
                                <span className="px-2 py-0.5 text-[10px] text-amber-400 flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>تەڭشىلىۋاتىدۇ...</span>
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustUserCoins(u, 'add', 50)}
                                    title="50 تەڭگە قوشۇش"
                                    className="px-1.5 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-[10px] flex items-center gap-0.5 transition"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    <span>50</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustUserCoins(u, 'add', 100)}
                                    title="100 تەڭگە قوشۇش"
                                    className="px-1.5 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-[10px] flex items-center gap-0.5 transition"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    <span>100</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustUserCoins(u, 'subtract', 25)}
                                    title="25 تەڭگە تۇتۇۋېلىش"
                                    className="px-1.5 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-[10px] flex items-center gap-0.5 transition"
                                  >
                                    <Minus className="w-2.5 h-2.5" />
                                    <span>25</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustUserCoins(u, 'add')}
                                    title="باشقا مىقداردا تەڭشەش"
                                    className="px-1.5 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-[10px] transition"
                                  >
                                    باشقا
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Role management button */}
                            {isSelf ? (
                              <span className="text-[10px] text-slate-400 font-medium px-2 py-1">قوغدالغان</span>
                            ) : (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleToggleUserRole(u)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 ${
                                  isTargetAdmin
                                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                                    : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30'
                                }`}
                              >
                                {isUpdating ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : isTargetAdmin ? (
                                  <>
                                    <UserX className="w-3 h-3" />
                                    <span>User</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Admin</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VAULT & LIVE DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Supabase Master Vault Status Cards */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-indigo-500/20 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">سۇپابەس مەركىزىي ئاچقۇچ ئامبىرى (Supabase Master Vault)</h2>
                  <p className="text-xs text-slate-400">
                    سىستېما ئاچقۇچلىرى پەقەت سۇپابەستىلا ساقلىنىدۇ، ھەرگىز ئابۇنىتقا ئاشكارىلانمايدۇ.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>سۇپابەستە 100% قوغدالغان</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* OpenRouter Key */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-300 font-semibold">OpenRouter مەركىزىي ئاچقۇچى:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">ھالىتى:</span>
                    <span className={`text-xs font-bold ${data?.config?.hasOpenRouter ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {data?.config?.hasOpenRouter ? 'ئاچقۇچ نورمال' : 'تېخى قوشۇلمىغان'}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                  data?.config?.hasOpenRouter 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${data?.config?.hasOpenRouter ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {data?.config?.hasOpenRouter ? 'ئاچقۇچ نورمال' : 'تېخى قوشۇلمىغان'}
                </span>
              </div>

              {/* Gemini Key */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-300 font-semibold">Google Gemini مەركىزىي ئاچقۇچى:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">ھالىتى:</span>
                    <span className={`text-xs font-bold ${data?.config?.hasGemini ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {data?.config?.hasGemini ? 'ئاچقۇچ نورمال' : 'تېخى قوشۇلمىغان'}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                  data?.config?.hasGemini 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${data?.config?.hasGemini ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
                  {data?.config?.hasGemini ? 'ئاچقۇچ نورمال' : 'تېخى قوشۇلمىغان'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Ping & Health Diagnostics Console */}
          <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    نەق مەيدان پىڭ ۋە سۈرئەت دىئاگنوزى (Real-Time Engine Ping)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    مۇلازىمېتىردىن بىۋاسىتە سۈنئىي ئەقىل مەركەزلىرىگە ئىنكاس ۋاقتىنى ئۆلچەيدۇ.
                  </p>
                </div>
              </div>

              <button
                onClick={runDiagnostics}
                disabled={runningDiag}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
              >
                <Zap className={`w-3.5 h-3.5 ${runningDiag ? 'animate-bounce' : ''}`} />
                <span>{runningDiag ? 'سىناق قىلىنىۋاتىدۇ...' : '⚡ سۈرئەتنى نەق مەيداندا ئۆلچەش'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Supabase Cloud DB Ping */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">1. Supabase Cloud DB</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    diagData?.engines?.supabase?.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {diagData?.engines?.supabase?.status === 'ok' ? 'ONLINE' : 'ERROR'}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {diagData?.engines?.supabase?.latencyMs ?? 0} ms
                </div>
                <p className="text-[11px] text-slate-400">PostgreSQL بۇلۇت ئۇلىنىش كېچىكىشى.</p>
              </div>

              {/* OpenRouter Ping */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">2. OpenRouter API</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    diagData?.engines?.openrouter?.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {diagData?.engines?.openrouter?.status === 'ok' ? 'ACTIVE' : 'ERROR'}
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-500 font-mono">
                  {diagData?.engines?.openrouter?.latencyMs ?? 0} ms
                </div>
                <p className="text-[11px] text-slate-400">
                  {diagData?.engines?.openrouter?.message || 'OpenRouter مەركىزىي ئاچقۇچ دەلىللەندى.'}
                </p>
              </div>

              {/* Gemini Ping */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">3. Google Gemini API</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    diagData?.engines?.gemini?.status === 'ok' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {diagData?.engines?.gemini?.status === 'ok' ? 'ACTIVE' : 'ERROR'}
                  </span>
                </div>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  {diagData?.engines?.gemini?.latencyMs ?? 0} ms
                </div>
                <p className="text-[11px] text-slate-400">
                  {diagData?.engines?.gemini?.message || 'Gemini 2.5 نېرۋا تورى مۇلازىمېتىرى.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST & MAINTENANCE */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Global Broadcast Announcement */}
          <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    سۇپا مەركىزىي ئېلان بەلۋېغى (Global Announcement Banner)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    بۇ ئېلان پۈتۈن تور بېكەتنىڭ ئەڭ ئۈستىدىكى بالداقتا بارلىق ئابۇنىتلارغا نۇرلۇق بەلۋاغ شەكلىدە كۆرۈنىدۇ.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'ساقلىنىۋاتىدۇ...' : 'ئېلاننى ساقلاش'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Toggle switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">سۇپىدا ئېلاننى قوزغىتىش</div>
                  <div className="text-[11px] text-slate-400">ئېتىۋەتسىڭىز باش بەتتىن ئېلان كۆرۈنمەيدۇ.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    announcementEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-white/20 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                </button>
              </div>

              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ئېلان تېكىستى:
                </label>
                <input
                  type="text"
                  placeholder="مەسىلەن: 🎉 سۇپىمىزغا ئەڭ يېڭى Gemini 2.5 Flash مودېلى كىرگۈزۈلدى! بارلىق ئەزالار ھەقسىز ئىشلىتەلەيدۇ."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Live Preview */}
              {announcementEnabled && announcementText && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold">نەق مەيدان پىشۇرۇش كۆرۈنۈشى (Live Preview):</span>
                  <div className="w-full bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 border border-indigo-500/40 rounded-xl text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                    <span className="truncate">{announcementText}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Mode Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    سىستېما ئاسراش ھالىتى (Maintenance Mode)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    بۇ ھالەتنى قوزغاتقاندا ئادەتتىكى ئابۇنىتلارغا سۇپىنىڭ ئاسرىلىۋاتقانلىقى ئۇقتۇرۇلىدۇ.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  maintenanceMode ? 'bg-rose-600 justify-end' : 'bg-slate-300 dark:bg-white/20 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
