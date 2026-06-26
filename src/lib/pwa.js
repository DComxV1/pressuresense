// PWA + notification helpers. Phase 1: install + permission + local test
// notification (via the service worker). Phase 2 will add push subscription
// and hand the subscription to the backend sender.

export const BASE = import.meta.env.BASE_URL

export function isIOS() {
  const ua = navigator.userAgent || ''
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

// Running as an installed app (home screen / standalone window)?
export function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function notificationsSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

export function notificationPermission() {
  return 'Notification' in window ? Notification.permission : 'unsupported'
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register(BASE + 'sw.js', { scope: BASE })
  } catch (e) {
    console.warn('Service worker registration failed:', e)
    return null
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  let perm = Notification.permission
  if (perm === 'default') perm = await Notification.requestPermission()
  return perm
}

// Fire a local notification through the SW (works on mobile, unlike `new
// Notification()`), so the user can confirm the pipeline end to end.
export async function showTestNotification() {
  const reg = await navigator.serviceWorker.ready
  await reg.showNotification('PressureSense', {
    body: 'Notifications are on. We’ll tap you on the shoulder when a tougher day is on the way.',
    icon: BASE + 'icon-192.png',
    badge: BASE + 'icon-192.png',
    tag: 'pressuresense-test',
  })
}
