/* PressureSense service worker.
   - Network-first so deploys/HMR never serve stale code; cache is an offline
     fallback only.
   - push + notificationclick handlers power the pre-flare alerts (the sender
     is the Phase 2 backend; this side just shows what it receives). */

const CACHE = 'pressuresense-v1'
// Derive the app base from the SW's own location, so it works at both
// "/" (local dev) and "/pressuresense/" (GitHub Pages).
const BASE = new URL('./', self.location).pathname

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll([BASE, BASE + 'index.html', BASE + 'manifest.webmanifest', BASE + 'icon-192.png']))
      .catch(() => {}),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
        }
        return res
      })
      .catch(async () => {
        const cached = await caches.match(req)
        if (cached) return cached
        if (req.mode === 'navigate') return caches.match(BASE + 'index.html')
        throw new Error('offline and not cached')
      }),
  )
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data && event.data.text() }
  }
  const title = data.title || 'PressureSense'
  const options = {
    body: data.body || '',
    icon: BASE + 'icon-192.png',
    badge: BASE + 'icon-192.png',
    tag: data.tag || 'pressuresense',
    data: { url: data.url || BASE },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || BASE
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of all) {
        if (client.url.includes(BASE) && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })(),
  )
})
