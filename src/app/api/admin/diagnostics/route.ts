import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSystemConfigServer } from '@/lib/serverConfig';
import { verifyAdmin } from '@/lib/serverAuth';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'باشقۇرغۇچى كىملىكى تەلەپ قىلىنىدۇ' }, { status: 401 });
    }

    const config = await getSystemConfigServer();

    // 1. Supabase Ping
    let supabaseStatus = 'error';
    let supabaseLatency = 0;
    let supabaseMsg = '';
    const sbStart = performance.now();
    try {
      const { data, error } = await supabase.from('system_config').select('id').limit(1);
      supabaseLatency = Math.round(performance.now() - sbStart);
      if (error) {
        supabaseMsg = error.message;
      } else {
        supabaseStatus = 'ok';
      }
    } catch (e: any) {
      supabaseLatency = Math.round(performance.now() - sbStart);
      supabaseMsg = e.message || 'Supabase connection failed';
    }

    // 2. OpenRouter Ping
    let openrouterStatus = 'no_key';
    let openrouterLatency = 0;
    let openrouterMsg = '';
    let openrouterInfo: any = null;

    if (config.openRouterKey && config.openRouterKey.length > 5) {
      const orStart = performance.now();
      try {
        const orRes = await fetch(`https://openrouter.ai/api/v1/auth/key?_t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${config.openRouterKey}`,
          },
        });
        openrouterLatency = Math.round(performance.now() - orStart);
        if (orRes.ok) {
          openrouterStatus = 'ok';
          openrouterInfo = {
            statusText: 'ئاچقۇچ نورمال',
            is_valid: true,
          };
        } else {
          openrouterStatus = 'error';
          openrouterMsg = `HTTP ${orRes.status} ${orRes.statusText}`;
        }
      } catch (e: any) {
        openrouterLatency = Math.round(performance.now() - orStart);
        openrouterStatus = 'error';
        openrouterMsg = e.message || 'OpenRouter timeout';
      }
    } else {
      openrouterMsg = 'ئاچقۇچ تەڭشەلمىگەن';
    }

    // 3. Gemini Ping
    let geminiStatus = 'no_key';
    let geminiLatency = 0;
    let geminiMsg = '';

    if (config.geminiKey && config.geminiKey.length > 5) {
      const gemStart = performance.now();
      try {
        const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.geminiKey}&_t=${Date.now()}`);
        geminiLatency = Math.round(performance.now() - gemStart);
        if (gemRes.ok) {
          geminiStatus = 'ok';
        } else {
          geminiStatus = 'error';
          geminiMsg = `HTTP ${gemRes.status} ${gemRes.statusText}`;
        }
      } catch (e: any) {
        geminiLatency = Math.round(performance.now() - gemStart);
        geminiStatus = 'error';
        geminiMsg = e.message || 'Gemini timeout';
      }
    } else {
      geminiMsg = 'ئاچقۇچ تەڭشەلمىگەن';
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      engines: {
        supabase: {
          status: supabaseStatus,
          latencyMs: supabaseLatency,
          message: supabaseMsg,
        },
        openrouter: {
          status: openrouterStatus,
          latencyMs: openrouterLatency,
          message: openrouterMsg,
          info: openrouterInfo,
        },
        gemini: {
          status: geminiStatus,
          latencyMs: geminiLatency,
          message: geminiMsg,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Diagnostics failed' }, { status: 500 });
  }
}
