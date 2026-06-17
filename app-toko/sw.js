const CACHE_NAME = 'toko-pwa-v6';

const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './tambah_barang.html'
];

// ==============================
// INSTALL
// ==============================
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ==============================
// ACTIVATE
// Hapus cache lama
// ==============================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ==============================
// FETCH
// Network First Strategy
// ==============================
self.addEventListener('fetch', event => {

  const request = event.request;
  const url = request.url;

  // Hanya handle GET request
  if (request.method !== 'GET') {
    return;
  }

  // Skip request extension browser
  if (
    url.startsWith('chrome-extension://') ||
    url.startsWith('moz-extension://') ||
    url.startsWith('edge-extension://')
  ) {
    return;
  }

  // Skip API / PHP
  if (
    url.includes('/api-toko/') ||
    url.includes('.php')
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(networkResponse => {

        // Jangan cache response error
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseClone);
            })
            .catch(err => {
              console.warn('Cache gagal:', err);
            });
        }

        return networkResponse;
      })
      .catch(() => {
        return caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // fallback jika file tidak ada di cache
            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});