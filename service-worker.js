const CACHE = 'peve-v3';
const OFFLINE_URL = './offline.html';
const PRECACHE = ['./','./index.html','./manifest.webmanifest','./assets/style.css','./assets/app.js','./offline.html'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(()=>caches.match(OFFLINE_URL)));
    return;
  }
  event.respondWith(
    caches.match(req).then(match => {
      if (match) return match;
      return fetch(req).then(resp => {
        const copy = resp.clone();
        try {
          const scope = self.registration ? new URL(self.registration.scope) : null;
          if (scope && req.url.startsWith(scope.href) && ['basic','cors'].includes(resp.type)) {
            caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
          }
        } catch(e){}
        return resp;
      }).catch(() => caches.match('./index.html')));
    })
  );
});
