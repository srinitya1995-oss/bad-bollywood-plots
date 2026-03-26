const CACHE = 'bbp-v3';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Install: cache core assets
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting(); // activate immediately, don't wait
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // take control of all pages immediately
});

// Fetch: network-first for HTML, cache-first for everything else
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    // Network-first for HTML — always get latest
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first for other assets (fonts, images)
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
