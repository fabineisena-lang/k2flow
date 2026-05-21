/* K2 Flow — Service Worker v1.0 */
const CACHE = 'k2flow-v1';
const STATIC = [
  '/index.html',
  '/app.html',
  '/master.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

/* Instala e faz cache dos arquivos estáticos */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

/* Ativa e limpa caches antigos */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Estratégia: Network first, cache como fallback */
self.addEventListener('fetch', e => {
  /* Ignora requests de API — nunca cachear */
  if (e.request.url.includes('/ev-api/') ||
      e.request.url.includes('anthropic.com') ||
      e.request.url.includes('openai.com') ||
      e.request.url.includes('supabase.co') ||
      e.request.url.includes('n8n')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(r => {
        /* Salva cópia no cache */
        if (r.status === 200) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

/* Push notifications (futuro) */
self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();
  self.registration.showNotification(data.title || 'K2 Flow', {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/app.html' }
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/app.html'));
});
