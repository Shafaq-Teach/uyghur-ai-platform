import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const versionInfo = {
    version: '1.0.5',
    build: 105,
    min_supported_version: '1.0.5',
    force_update: true,
    release_date: '2026-10-08',
    apk_url: '/uyghur-ai-v1.0.5.apk',
    title: 'ئۇيغۇر AI 1.0.5 رەسمىي يېڭىلانغان نەشرى',
    changelog: [
      'باشقۇرغۇچى ئېلخەت ئادرېسى سىستېمىدىن تولۇق يوشۇرۇن قىلىنىپ مەخپىيەتلىك كاپالەتلەندۈرۈلدى.',
      'توربەتكە چىرايلىق، ئاددىي ۋە قولايلىق «دىتالىنى چۈشۈرۈڭ» لەيلىمە كۇنۇپكىسى ئورنىتىلدى.',
      'باشقۇرۇش كۆزنىكىگە ئەزالارنى چەكلەش ۋە ئېچىش (Ban/Unban) تولۇق قوشۇلدى.',
      'ئەپ ئۈستىگە بىۋاسىتە قاپلاپ قاچىلاش ۋە يېڭىلاش ماتورى پۈتۈنلەي مۇقىملاشتۇرۇلدى.'
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
