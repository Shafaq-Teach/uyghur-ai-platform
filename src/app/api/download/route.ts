import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigServer } from '@/lib/serverConfig';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  const filename = req.nextUrl.searchParams.get('filename') || `file-${Date.now()}`;
  const inline = req.nextUrl.searchParams.get('inline') === 'true';

  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  if (parsedUrl.protocol !== 'https:') {
    return new NextResponse('Only HTTPS URLs are allowed', { status: 403 });
  }
  const isStrictOpenRouter = parsedUrl.hostname === 'openrouter.ai' || parsedUrl.hostname.endsWith('.openrouter.ai');

  try {
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
    };

    if (isStrictOpenRouter) {
      const config = await getSystemConfigServer();
      const orKey = config.openRouterKey || process.env.OPENROUTER_API_KEY;
      if (orKey) {
        fetchHeaders['Authorization'] = `Bearer ${orKey}`;
      }
    }

    const upstreamRes = await fetch(url, {
      headers: fetchHeaders,
    });

    if (!upstreamRes.ok) {
      return new NextResponse(`Failed to fetch media file: ${upstreamRes.statusText}`, {
        status: upstreamRes.status,
      });
    }

    const contentType = upstreamRes.headers.get('content-type') || (url.includes('video') ? 'video/mp4' : 'application/octet-stream');
    const cleanFilename = filename.replace(/["\r\n\\]/g, '').trim() || 'download';
    const disposition = inline
      ? 'inline'
      : `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`;

    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Download error: ${err.message}`, { status: 500 });
  }
}
