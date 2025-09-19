const CACHE_NAME = 'redefine-me-v1';
const OFFLINE_URL = '/';

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
  console.log('[SW] Push received');
  
  const options = {
    body: 'You have a new notification!',
    icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68ac5b58346cf469a3ecdd69/63091d88b_redefine-me-transparent.png',
    badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68ac5b58346cf469a3ecdd69/63091d88b_redefine-me-transparent.png',
    data: { url: '/' },
    tag: 'redefine-notification'
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || data.message || options.body;
    options.data.url = data.url || '/';
  }

  event.waitUntil(
    self.registration.showNotification('Redefine Me', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
File: public/manifest.json

{
  "name": "Redefine Me",
  "short_name": "RedefineMe",
  "description": "Connect with like-minded students",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f9fafb",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68ac5b58346cf469a3ecdd69/63091d88b_redefine-me-transparent.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68ac5b58346cf469a3ecdd69/63091d88b_redefine-me-transparent.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
