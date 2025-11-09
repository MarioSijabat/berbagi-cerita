// service-worker.js
// service-worker.js (tambah ini)
const CACHE_NAME = 'berbagi-cerita-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // '/styles/styles.css',
  // '/scripts/index.js',
  // '/scripts/app.js',
  // '/scripts/config.js',
  // '/scripts/utils/index.js',
  // '/scripts/routes/routes.js',
  // '/scripts/routes/url-parser.js',
  // '/scripts/presenters/story-presenter.js',
  // '/scripts/data/api.js',
  // '/scripts/data/db.js',
  // '/scripts/pages/about/about-page.js',
  // '/scripts/pages/add-story/add-story-page.js',
  // '/scripts/pages/detail/detail-story-page.js',
  // '/scripts/pages/login/login-page.js',
  // '/scripts/pages/register/register-page.js',
  // '/scripts/pages/stories/stories-page.js',
  '/images/logo.png',
  // '/images/favicon.png',
  '/images/leaf-green.png',
  '/images/leaf-shadow.png',
  '/images/marker-icon.png',
  '/images/marker-icon-2x.png',
  '/images/marker-shadow.png',
  '/images/logo-192.png',
  '/images/logo-512.png',
  '/manifest.json',
  // Leaflet hosted (jika pakai CDN, cache via fetch)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim()); // WAJIB: kontrol halaman lama
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Handle test push dari console
  if (event.data?.title) {
    self.registration.showNotification(event.data.title, event.data.options || {});
  }
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', event => {
  let data = { title: 'Notifikasi', options: { body: 'Ada cerita baru!' } };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title, data.options)
  );
});