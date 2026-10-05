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
        .select('id, email, full_name, avatar_url, role, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (profiles && profiles.length > 0) {
        userList = profiles;
        if (!userCount) userCount = profiles.length;
      }
    }

    // Always invalidate cache when admin inspects config to ensure live sync with Supabase changes
    invalidateSystemConfigCache();

    const hasOpenRouter = Boolean(config?.master_openrouter_key && config.master_openrouter_key.length > 5);
    const hasGemini = Boolean(config?.master_gemini_key && config.master_gemini_key.length > 5);

    return NextResponse.json({
      config: {
        activeModels: config?.active_models || {
          chat: 'google/gemini-2.5-flash',
          translate: 'google/gemini-2.5-flash',
          image: 'black-forest-labs/flux-1-schnell',
          tts: 'openai/tts-1',
          video: 'google/gemini-2.5-flash',
        },
        quotaSettings: config?.quota_settings || { dailyUserLimit: 50, imageLimit: 10 },
        hasOpenRouter,
        hasGemini,
      },
      stats: {
        userCount: userCount || userList.length,
        historyCount: historyCount || 0,
        activeEnginesCount: 5,
      },
      users: userList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { activeModels, quotaSettings } = body;

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (activeModels) {
      updatePayload.active_models = activeModels;
    }
    if (quotaSettings) {
      updatePayload.quota_settings = quotaSettings;
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
