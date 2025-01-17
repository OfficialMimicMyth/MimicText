const CACHE_NAME = 'mimictext-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './splash.png',
  'https://db.onlinewebfonts.com/t/e991cc888d4fb544fe0a88d065ab6efc.woff2',
  'https://db.onlinewebfonts.com/t/e991cc888d4fb544fe0a88d065ab6efc.woff'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event with network-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseClone = response.clone();
        
        // Open cache
        caches.open(CACHE_NAME)
          .then(cache => {
            // Add response to cache
            cache.put(event.request, responseClone);
          });

        return response;
      })
      .catch(() => {
        // If network request fails, try to get it from cache
        return caches.match(event.request)
          .then(response => {
            return response || Promise.reject('no-match');
          });
      })
  );
});
