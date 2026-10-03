import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { openRouterKey, geminiKey } = body;

    const cleanOpenRouterKey = (openRouterKey || process.env.OPENROUTER_API_KEY || '').trim();
    const cleanGeminiKey = (geminiKey || process.env.GEMINI_API_KEY || '').trim();

    let openRouterStatus: { ok: boolean; message: string; details?: any } | null = null;
    let geminiStatus: { ok: boolean; message: string } | null = null;

    // Test OpenRouter via server
    if (cleanOpenRouterKey) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
          headers: {
            'Authorization': `Bearer ${cleanOpenRouterKey}`,
            'HTTP-Referer': 'https://uyghur-ai.local',
            'X-Title': 'Uyghur AI Platform',
          },
        });

        if (res.ok) {
          const data = await res.json();
          openRouterStatus = {
            ok: true,
            message: 'OpenRouter ئاچقۇچى تامامەن توغرا ۋە ئىناۋەتلىك!',
            details: data?.data,
          };
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `خاتالىق كودى: ${res.status}`;
          openRouterStatus = {
            ok: false,
            message: `OpenRouter ئاچقۇچى رەت قىلىندى (${errMsg})`,
          };
        }
      } catch (err: any) {
        openRouterStatus = {
          ok: false,
          message: `OpenRouter تور ئۇلىنىش خاتالىقى: ${err.message}`,
        };
      }
    }

    // Test Gemini via server
    if (cleanGeminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanGeminiKey}`);
        if (res.ok) {
          geminiStatus = {
            ok: true,
            message: 'Google Gemini ئاچقۇچى تامامەن توغرا ۋە كۈچكە ئىگە!',
          };
        } else {
          geminiStatus = {
            ok: false,
            message: `Gemini ئاچقۇچى ئىناۋەتسىز (كود: ${res.status})`,
          };
        }
      } catch (err: any) {
        geminiStatus = {
          ok: false,
          message: `Gemini تور ئۇلىنىش خاتالىقى: ${err.message}`,
        };
      }
    }

    return NextResponse.json({
      openRouter: openRouterStatus,
      gemini: geminiStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
