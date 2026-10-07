import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const versionInfo = {
    version: '1.0.2',
    build: 102,
    min_supported_version: '1.0.2',
    force_update: true,
    release_date: '2026-10-07',
    apk_url: '/uyghur-ai-v1.0.2.apk',
    title: 'ئۇيغۇر AI 1.0.2 رەسمىي يېڭىلانغان نەشرى',
    changelog: [
      'ئەزا تىزىملاش ۋە كىرىش سىستېمىسى تولۇق ئەلالاشتۇرۇلدى: ئاپتوماتىك كىرىش ۋە ئۇيغۇرچە خاتالىق ئەسكەرتىشى قوشۇلدى.',
      'باشقۇرۇش سۇپىسىدا ئەزالارنىڭ تەڭگىسىنى قوشۇش ۋە ئېلىۋېتىش ھېساباتى 100% مۇكەممەللەشتۈرۈلدى.',
      'ئاندىرويىد ئەپ يېڭىلاش ماتورى 1.0.2 نەشرىگە كۆتۈرۈلۈپ، پۈتۈنلەي ئەپ ئىچىدىن چۈشۈرۈش ۋە قاچىلاش كاپالەتلەندۈرۈلدى.',
      'باش بەت ۋە سىستېمىدىكى نەشر نومۇرى v1.0.2 گە رەسمىي يېڭىلاندى.'
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
