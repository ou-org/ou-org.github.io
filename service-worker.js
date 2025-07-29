const CACHE_NAME = 'ou-pwa-cache-v1';

self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Save copy to cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // If fetch fails (e.g. offline), try cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // fallback to index.html for SPA/PWA
          return caches.match('index.html');
        });
      })
  );
});
