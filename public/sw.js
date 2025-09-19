const CACHE_NAME = "redefine-me-v1";
const OFFLINE_URL = "/";

// Install event
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(self.clients.claim());
});

// Fetch event - Cache strategy
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// Push notification handling
self.addEventListener('push', event => {
  console.log('[SW] Push Received');
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Redefine Me', body: event.data ? event.data.text() : 'New notification' };
  }

  const title = data.title || 'Redefine Me';
  const options = {
    body: data.message || data.body || 'You have a new notification',
    icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68ac5b58346cf469a3ecdd69/63091d88b_redefine-me-transparent.png',
    badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68ac5b58346cf469a3ecdd69/63091d88b_redefine-me-transparent.png',
    data: { url: data.url || '/' },
    requireInteraction: true,
    tag: 'redefine-me-notification'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click received');
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
