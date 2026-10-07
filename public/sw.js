// Uyghur AI Platform PWA Service Worker
const APP_VERSION = '1.0.0';
const CACHE_NAME = `uyghur-ai-pwa-v${APP_VERSION}`;
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/version.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo_icon.png',
  '/fonts/UKIJEkran.ttf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA cache addAll error:', err);
      });
    })
  );
  // Allow immediate activation when requested
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  // Always fetch version.json and API routes directly from network
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('/api/') || 
    event.request.url.includes('/version.json')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});
