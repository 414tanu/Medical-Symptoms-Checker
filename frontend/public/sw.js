/* ─── HealthCheck AI Service Worker ─────────────────────────────────────────
   Caches core app shell for offline use (critical for poor rural connectivity)
   ─────────────────────────────────────────────────────────────────────────── */

const CACHE_NAME = 'healthcheck-ai-v1';

// Core files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  // Leaflet tiles cached dynamically
];

// ─── Install: cache static shell ───────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.filter(Boolean));
    }).catch(() => {
      // Gracefully skip if some assets aren't available yet
    })
  );
  self.skipWaiting();
});

// ─── Activate: clean up old caches ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: Network-first for API, Cache-first for assets ──────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // API calls: network-first (don't cache POST/sensitive data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'You are offline. Please check your connection.',
            offline: true,
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // OpenStreetMap tiles: cache-first (saves mobile data)
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME + '-tiles').then((c) => c.put(request, clone));
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // App shell: Cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// ─── Push Notifications (medicine reminders) ───────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '💊 Medicine Reminder', {
      body: data.body || 'Time to take your medicine!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'medicine-reminder',
      renotify: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'taken', title: '✅ Taken' },
        { action: 'snooze', title: '⏰ Snooze 30 min' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'snooze') {
    setTimeout(() => {
      self.registration.showNotification('💊 Snooze Over — Take your medicine!', {
        body: event.notification.body,
        icon: '/favicon.ico',
      });
    }, 30 * 60 * 1000);
  }
});
