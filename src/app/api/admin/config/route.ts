import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { invalidateSystemConfigCache } from '@/lib/serverConfig';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch system_config
    const { data: config, error: configError } = await supabase
      .from('system_config')
      .select('*')
      .eq('id', 'global')
      .single();

    if (configError && configError.code !== 'PGRST116') {
      console.error('Config fetch error:', configError);
    }

    // 2. Fetch stats & registered profiles via RPC with direct fallback
    let userCount = 0;
    let historyCount = 0;
    let userList: any[] = [];

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_dashboard_stats');
      if (!rpcError && rpcData) {
        userCount = Number(rpcData.user_count) || 0;
        historyCount = Number(rpcData.history_count) || 0;
        userList = Array.isArray(rpcData.users) ? rpcData.users : [];
      }
    } catch (e) {
      console.warn('RPC get_admin_dashboard_stats failed, falling back:', e);
    }

    if (userList.length === 0) {
      const { count: uCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (uCount) userCount = uCount;

      const { count: hCount } = await supabase
        .from('ai_history')
        .select('*', { count: 'exact', head: true });
      if (hCount) historyCount = hCount;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, role, coins, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (profiles && profiles.length > 0) {
        userList = profiles;
        if (!userCount) userCount = profiles.length;
      }
    }

    // 3. Fetch recent AI generation activity stream
    let recentActivities: any[] = [];
    try {
      const { data: recentHistory } = await supabase
        .from('ai_history')
        .select('id, type, title, preview, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(20);

      if (recentHistory) {
        const userMap = new Map<string, string>();
        userList.forEach(u => {
          userMap.set(u.id, u.full_name || u.email?.split('@')[0] || 'ئابۇنىت');
        });
        recentActivities = recentHistory.map(h => ({
          ...h,
          userName: userMap.get(h.user_id) || 'ئابۇنىت',
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch recent activities:', e);
    }

    // Always invalidate cache when admin inspects config to ensure live sync with Supabase changes
    invalidateSystemConfigCache();

    const hasOpenRouter = Boolean(config?.master_openrouter_key && config.master_openrouter_key.length > 5);
    const hasGemini = Boolean(config?.master_gemini_key && config.master_gemini_key.length > 5);

    const quota = config?.quota_settings || {};

    return NextResponse.json({
      config: {
        activeModels: config?.active_models || {
          chat: 'google/gemini-2.5-flash',
          translate: 'google/gemini-2.5-flash',
          image: 'black-forest-labs/flux-1-schnell',
          tts: 'openai/tts-1',
          video: 'google/gemini-2.5-flash',
        },
        fallbackModels: quota.fallback_models || {
          chat: 'deepseek/deepseek-chat',
          translate: 'google/gemini-2.5-flash',
        },
        quotaSettings: {
          dailyUserLimit: quota.daily_user_limit || 50,
          imageLimit: quota.image_limit || 10,
        },
        announcement: quota.announcement || {
          enabled: false,
          text: '',
          type: 'info',
        },
        maintenanceMode: Boolean(quota.maintenance_mode),
        hasOpenRouter,
        hasGemini,
      },
      stats: {
        userCount: userCount || userList.length,
        historyCount: historyCount || 0,
        activeEnginesCount: 5,
      },
      users: userList,
      recentActivities,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle user role update
    if (body.updateUserRole) {
      const { userId, role } = body.updateUserRole;
      if (!userId || !role) {
        return NextResponse.json({ error: 'userId ۋە role تەلەپ قىلىنىدۇ' }, { status: 400 });
      }
      const { error: roleErr } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (roleErr) {
        return NextResponse.json({ error: roleErr.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'رول مۇۋەپپەقىيەتلىك ئۆزگەرتىلدى' });
    }

    // Handle user coins adjustment (add / subtract)
    if (body.adjustUserCoins) {
      const { userId, amount, mode } = body.adjustUserCoins;
      if (!userId || !amount || !mode) {
        return NextResponse.json({ error: 'userId, amount ۋە mode تەلەپ قىلىنىدۇ' }, { status: 400 });
      }

      const numAmount = Math.abs(parseInt(String(amount), 10)) || 0;
      if (numAmount <= 0) {
        return NextResponse.json({ error: 'مۇسبەت سان كىرگۈزۈڭ' }, { status: 400 });
      }

      // Fetch current profile coins
      const { data: prof, error: getErr } = await supabase
        .from('profiles')
        .select('id, coins')
        .eq('id', userId)
        .single();

      if (getErr || !prof) {
        return NextResponse.json({ error: 'ئىشلەتكۈچى تېپىلمىدى' }, { status: 404 });
      }

      const currentCoins = typeof prof.coins === 'number' ? prof.coins : 100;
      const targetCoins = mode === 'add'
        ? currentCoins + numAmount
        : Math.max(0, currentCoins - numAmount);

      const { error: updErr } = await supabase
        .from('profiles')
        .update({ coins: targetCoins, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        coins: targetCoins,
        message: mode === 'add' ? `${numAmount} تەڭگە قوشۇلدى` : `${numAmount} تەڭگە ئېلىۋېتىلدى`,
      });
    }

    const { activeModels, fallbackModels, quotaSettings, announcement, maintenanceMode } = body;

    // Get existing quota settings to merge
    const { data: existing } = await supabase
      .from('system_config')
      .select('quota_settings')
      .eq('id', 'global')
      .single();

    const mergedQuota = {
      ...(existing?.quota_settings || {}),
      ...(quotaSettings ? {
        daily_user_limit: quotaSettings.dailyUserLimit,
        image_limit: quotaSettings.imageLimit,
      } : {}),
      ...(fallbackModels !== undefined ? { fallback_models: fallbackModels } : {}),
      ...(announcement !== undefined ? { announcement } : {}),
      ...(maintenanceMode !== undefined ? { maintenance_mode: maintenanceMode } : {}),
    };

    const updatePayload: any = {
      quota_settings: mergedQuota,
      updated_at: new Date().toISOString(),
    };

    if (activeModels) {
      updatePayload.active_models = activeModels;
    }

    const { data, error } = await supabase
      .from('system_config')
      .upsert({
        id: 'global',
        ...updatePayload,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Invalidate local memory cache
    invalidateSystemConfigCache();

    return NextResponse.json({ success: true, config: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
