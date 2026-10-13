// Service worker — network-first so updates always show; cache is only an offline fallback.
const CACHE = 'mammovie-v2'

self.addEventListener('install', () => {
  // Activate this new worker immediately, replacing the old one.
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  // Network-first: always try the live version, fall back to cache only when offline.
  e.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
        return res
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
  )
})
