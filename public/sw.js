// Force cache bust & unregister for all clients
const CACHE_VERSION = 'v2.0.2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// Always bypass cache and fetch directly from network
self.addEventListener('fetch', (event) => {
  // Let the browser handle network requests naturally
  return;
});
