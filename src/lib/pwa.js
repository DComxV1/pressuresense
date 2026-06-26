// PWA + notification helpers: install, permission, local test, and (Phase 2)
// push subscription registered with the backend sender.

import { WORKER_URL, VAPID_PUBLIC } from './pushConfig.js'

export const BASE = import.meta.env.BASE_URL

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

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

// Subscribe to push and register the subscription with the backend (which
// sends the alerts) — along with location, sensitivity, the device timezone,
// and the user's chosen morning/evening hours.
export async function subscribeToPush({ location, sensitivity, morningHour, eveningHour }) {
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    })
  }
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  await fetch(`${WORKER_URL}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub.toJSON(), location, sensitivity, tz, morningHour, eveningHour }),
  })
  return sub
}

// Ask the backend to send a real push right now (verifies the full pipeline).
// Always resolves (never hangs the UI) — times out and reports errors instead.
export async function sendServerTest() {
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return { ok: false, error: 'not subscribed' }
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 12000)
    const res = await fetch(`${WORKER_URL}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON() }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    return await res.json().catch(() => ({ ok: false, status: res.status }))
  } catch (e) {
    return { ok: false, error: e?.name === 'AbortError' ? 'timed out' : String(e?.message || e) }
  }
}

export async function unsubscribeFromPush() {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (!sub) return
  await fetch(`${WORKER_URL}/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => {})
  await sub.unsubscribe()
}

export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator)) return false
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return false
  return !!(await reg.pushManager.getSubscription())
}
