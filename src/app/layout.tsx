import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export const metadata: Metadata = {
  title: 'سۈنئىي ئىدراك سۇپىسى — Uyghur AI Platform',
  description: 'OpenRouter & Gemini powered multimodal platform for Uyghur & English: Chat, Translation, Image Studio, TTS, and Ad Video.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ئۇيغۇر AI',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#08090d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ug" dir="rtl" className="dark w-full max-w-full overflow-x-hidden" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ئۇيغۇر AI" />
        <meta name="application-name" content="ئۇيغۇر AI" />
        <link rel="preload" href="/fonts/UKIJEkran.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/UKIJKa3D.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const s = localStorage.getItem('uyghur_ai_settings');
                const t = s ? JSON.parse(s).theme || 'dark' : 'dark';
                document.documentElement.setAttribute('data-theme-setting', t);
                if (t === 'system') {
                  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                  if (prefersDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } else {
                  document.documentElement.setAttribute('data-theme', t);
                  if (t === 'light' || t === 'warm') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen relative w-full max-w-full overflow-x-hidden transition-colors duration-200" suppressHydrationWarning>
        {/* Subtle top ambient cyber glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[320px] bg-gradient-to-b from-sky-300/15 via-teal-200/10 to-transparent dark:from-indigo-500/10 dark:via-purple-500/5 blur-3xl pointer-events-none -z-10 overflow-hidden" />
        
        <AppProvider>
          <Header />
          <PWAInstallPrompt />
          <main className="flex-1 w-full max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-20 md:pb-6 relative z-10 min-w-0 overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
