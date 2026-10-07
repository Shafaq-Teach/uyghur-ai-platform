import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const versionInfo = {
    version: '1.0.3',
    build: 103,
    min_supported_version: '1.0.3',
    force_update: true,
    release_date: '2026-10-07',
    apk_url: '/uyghur-ai-v1.0.3.apk',
    title: 'ئۇيغۇر AI 1.0.3 رەسمىي يېڭىلانغان نەشرى',
    changelog: [
      'يانفون تىزىملىك كۆزنىكى (Drawer) ساپ ئۇيغۇرچىغا تەڭشەلدى، تىل ۋە كۆرۈنۈش كارتوچكىسى ئېلىۋېتىلدى.',
      'تىزىملىكنىڭ ئاستى تەرىپىدىكى زۆرۈر بولمىغان بۆلەكلەر تولۇق تازىلاندى.',
      'ئەپ ئىچىدىن 1.0.3 پۈتۈن APK چۈشۈرۈش ۋە قاچىلاش سىستېمىسى رەسمىي يېڭىلاندى.'
    ],
    timestamp: Date.now()
  };

  return NextResponse.json(versionInfo, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
