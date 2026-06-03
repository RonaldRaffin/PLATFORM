const CACHE_NAME = 'toko-pwa-v4';
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
// ACTIVATE (hapus cache lama)
// ==============================
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
    }).then(() => self.clients.claim())
  );
});

// ==============================
// FETCH — Network First
// Selalu ambil dari server dulu.
// Kalau offline/gagal, baru pakai cache.
// ==============================
self.addEventListener('fetch', event => {
  const url = event.request.url.toLowerCase();

  // Skip semua request ke API (PHP) — jangan pernah di-cache
  if (url.includes('/api-toko/') || url.includes('.php')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Berhasil ambil dari network → update cache sekalian
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // Gagal (offline) → pakai cache sebagai fallback
        return caches.match(event.request);
      })
  );
});