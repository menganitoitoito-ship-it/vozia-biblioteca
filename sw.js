// Audioteka Service Worker — v2
// Handles: offline caching, background audio keep-alive, push notifications

const CACHE_NAME = 'audioteka-v3';

// Assets to precache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  // If your GitHub Pages repo name is a subdirectory, adjust start_url in manifest too
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Try to cache the main page; don't fail install if CDN assets miss
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    })
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH — Stale-while-revalidate for app shell, network-first for CDN ─────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Bypass cache completely for localhost/development
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    e.respondWith(fetch(e.request));
    return;
  }

  // CDN resources (fonts, pdf.js, jszip, etc.) — network first, fall back to cache
  if (url.hostname !== self.location.hostname) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // App shell (same origin) — cache first, then network
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

// ── MESSAGES ─────────────────────────────────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data === 'keepAlive') {
    // Respond to keep-alive pings (maintains SW alive during background audio)
    e.source?.postMessage('swReady');
    return;
  }
  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// ── BACKGROUND SYNC (optional future use) ────────────────────────────────────
self.addEventListener('sync', e => {
  console.log('[SW] Background sync:', e.tag);
});
