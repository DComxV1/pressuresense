import { useEffect, useState } from 'react'
import {
  isIOS,
  isStandalone,
  notificationsSupported,
  notificationPermission,
  requestNotificationPermission,
  showTestNotification,
  registerServiceWorker,
} from '../lib/pwa.js'

// Phase 1 of push: install the app + grant notification permission + fire a
// local test. (Sending real pre-flare alerts when the app is closed is Phase 2,
// the backend sender.)
export default function NotificationsCard() {
  const [perm, setPerm] = useState(notificationPermission())
  const [installEvent, setInstallEvent] = useState(null)
  const [installed, setInstalled] = useState(isStandalone())
  const [busy, setBusy] = useState(false)

  const supported = notificationsSupported()
  const ios = isIOS()
  const iosNeedsInstall = ios && !installed

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setInstallEvent(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function enable() {
    setBusy(true)
    try {
      await registerServiceWorker()
      const result = await requestNotificationPermission()
      setPerm(result)
      if (result === 'granted') await showTestNotification()
    } finally {
      setBusy(false)
    }
  }

  async function install() {
    if (!installEvent) return
    installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallEvent(null)
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-sm font-medium text-text">Alerts &amp; install</div>
      <p className="mt-1 text-sm text-muted">
        Get a heads-up before a tougher day, and add PressureSense to your home screen.
      </p>

      {/* Install affordance */}
      {!installed && installEvent && (
        <button
          onClick={install}
          className="mt-3 min-h-touch rounded-lg bg-accent px-4 text-sm font-medium text-white"
        >
          Install app
        </button>
      )}

      {/* Notifications */}
      <div className="mt-4">
        {!supported && (
          <p className="text-sm text-muted">This browser doesn’t support notifications.</p>
        )}

        {supported && iosNeedsInstall && (
          <div className="rounded-lg bg-surface-2 p-3 text-sm leading-relaxed text-muted">
            <span className="font-medium text-text">On iPhone, add it to your Home Screen first.</span>{' '}
            Tap the Share button, choose <span className="font-medium text-text">Add to Home Screen</span>,
            then open PressureSense from its new icon and turn on alerts here.
          </div>
        )}

        {supported && !iosNeedsInstall && perm === 'granted' && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-good-ink">
              <span aria-hidden>✓</span> Notifications are on.
            </span>
            <button
              onClick={showTestNotification}
              className="min-h-touch rounded-lg border border-border px-3 text-sm text-text hover:bg-surface-2"
            >
              Send a test alert
            </button>
          </div>
        )}

        {supported && !iosNeedsInstall && perm === 'denied' && (
          <p className="text-sm text-muted">
            Notifications are blocked. Turn them back on for this site in your browser settings, then reload.
          </p>
        )}

        {supported && !iosNeedsInstall && perm === 'default' && (
          <button
            onClick={enable}
            disabled={busy}
            className="min-h-touch rounded-lg bg-accent px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? 'Enabling…' : 'Enable notifications'}
          </button>
        )}
      </div>
    </div>
  )
}
