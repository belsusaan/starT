const CACHE_NAME = 'star-t-cache-v19';
const ASSETS = [
  './',
  './index.html',
  './assets/css/index.css',
  './assets/js/app.js',
  './manifest.json',
  './assets/images/logo.svg',
  './assets/images/asleep.svg',
  './assets/images/start-t logo.jpg'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => console.warn('Cache skip:', url, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event (Delete old caches immediately)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network-First with Cache Fallback for instant updates)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Bypass API requests to always fetch live data
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Only handle GET requests from the same origin
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-First: Always try to get latest from network; fallback to cache offline
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
