const CACHE_NAME = 'toko-pwa-v2';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json'
];

// INSTALL
self.addEventListener('install', event => {
  self.skipWaiting(); // penting
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVATE (hapus cache lama)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH (JANGAN CACHE API!)
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // ❗ SKIP API (biar tidak kena cache)
  if (url.includes('/API-TOKO/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});