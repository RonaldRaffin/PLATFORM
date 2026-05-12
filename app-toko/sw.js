const CACHE_NAME = 'toko-pwa-v2';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json'
];

// INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();
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

// FETCH
self.addEventListener('fetch', event => {
  const url = event.request.url.toLowerCase(); // ← lowercase dulu

  // Skip semua request ke API (PHP)
  if (url.includes('/api-toko/') || url.includes('.php')) {
    return; // biarkan browser fetch langsung, tanpa cache
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});