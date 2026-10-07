import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const versionInfo = {
    version: '1.0.0',
    build: 100,
    min_supported_version: '1.0.0',
    force_update: true,
    release_date: '2026-10-07',
    title: 'ئۇيغۇر AI 1.0.0 ئالىي دەرىجىلىك رەسمىي نەشرى',
    changelog: [
      'ئالىي دەرىجىلىك يانفون ئەپ كۆرۈنمە يۈزى (Premium Mobile App) تولۇق تەتبىقلاندى.',
      'UKIJ Ekran يۇقىرى ئېنىقلىقتىكى ئۇيغۇرچە مەتبەئە خېتى ئاساسىي فونت قىلىندى.',
      'كېچە، كۈندۈز ۋە سىستېما تەڭشىكىگە ئەگىشىدىغان 3 خىل رەڭ مودى قوشۇلدى.',
      'ئەپ ئىچىدىن ئاپتوماتىك مەجبۇرىي يېڭىلاش ۋە 360 گىرادۇسلۇق ئايلانما ئىلگىرىلەش كۆرسەتكۈچى كىرگۈزۈلدى.'
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
