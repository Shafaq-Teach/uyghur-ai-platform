import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const versionInfo = {
    version: '1.0.4',
    build: 104,
    min_supported_version: '1.0.4',
    force_update: true,
    release_date: '2026-10-08',
    apk_url: '/uyghur-ai-v1.0.4.apk',
    title: 'ئۇيغۇر AI 1.0.4 رەسمىي يېڭىلانغان نەشرى',
    changelog: [
      'كونا نەشرى بىلەن توقۇنۇشۇپ قېلىش مەسىلىسى V1 ۋە V2 قوش ئىمزا (Signature Scheme) ئارقىلىق 100% ھەل قىلىندى.',
      'كود ئۈستىگە ئورنىتىش كاپالەتلەندۈرۈلۈپ، كونىنى يۇيۇۋېتىش ھاجەتسىز قىلىندى.',
      'ئاندىرويىد ئەپ قۇرۇلمىسى مۇقىم API 34 دەرىجىسىگە تەڭشەلدى.'
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
