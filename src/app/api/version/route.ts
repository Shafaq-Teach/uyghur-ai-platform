import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const versionInfo = {
    version: '1.0.1',
    build: 101,
    min_supported_version: '1.0.1',
    force_update: true,
    release_date: '2026-10-07',
    apk_url: '/uyghur-ai-v1.0.1.apk',
    title: 'ئۇيغۇر AI 1.0.1 رەسمىي يېڭىلانغان نەشرى',
    changelog: [
      'تېلېفون ئاستىدىكى قوراللار تىزىملىكىدە پاراڭ، تەرجىمە، ئاۋاز، رەسىم، فىلىمدىن ئىبارەت 5 خىل قورال يېرىم يايسىمان كۆرۈنۈشكە ئۆزگەرتىلدى.',
      'ھەقسىز 100 تەڭگە سوۋغىسى: بارلىق يېڭى ۋە كونا ئەزالارغا 100 تەڭگە تولۇقلاندى، ئابۇنىت ئىسمى ئاستىدا ئېنىق كۆرسىتىلدى.',
      'تەڭگە تۇتۇش سىستېمىسى: رەسىم ۋە ۋىدېيوغا 25 تەڭگە، چات، تەرجىمە ۋە ئاۋازغا 15 تەڭگە بەلگىلەندى.',
      'باشقۇرۇش سۇپىسىغا ئەزالارنىڭ تەڭگىسىنى قوشۇش ۋە ئېلىۋېتىش ئىقتىدارى مۇكەممەللەشتۈرۈلدى.',
      'ئەپ ئىچىدىكى ئارتۇقچە ئەپ قاچىلاش بەلگىلىرى ئېلىۋېتىلىپ، ئاپتوماتىك مەجبۇرىي يېڭىلاش كۈچەيتىلدى.'
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
