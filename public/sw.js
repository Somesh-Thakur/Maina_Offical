// Maina Service Worker
// Enables background operation and PWA offline shell

const CACHE = 'maina-v1';
const SHELL = [
  '/',
  '/search',
  '/library',
  '/manifest.json',
  '/favicon.svg',
];

// ── Install: pre-cache the app shell ─────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for API, cache-first for shell ───────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, cross-origin, and YouTube/JioSaavn API calls
  if (
    event.request.method !== 'GET' ||
    !url.origin.includes(self.location.origin) ||
    url.pathname.startsWith('/api/')
  ) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(res => {
        // Update cache with fresh response
        if (res.ok && SHELL.includes(url.pathname)) {
          caches.open(CACHE).then(c => c.put(event.request, res.clone()));
        }
        return res;
      }).catch(err => {
        console.warn('SW Fetch Failed:', err);
        // Fallback for failed network requests
        return new Response('Network error or offline', { status: 503, statusText: 'Service Unavailable' });
      });
      // Return cached immediately if available, background-refresh
      return cached || network;
    })
  );
});

// ── Keep alive: respond to background sync ────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
