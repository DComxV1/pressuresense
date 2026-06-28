import { useEffect, useState } from 'react'
import {
  isIOS,
  isStandalone,
  notificationsSupported,
  notificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  sendServerTest,
  isPushSubscribed,
} from '../lib/pwa.js'

// Push, Phase 2: grant permission, subscribe with the backend (which sends the
// scheduled pre-flare alerts), and verify with a real server push. On iOS, web
// push only works once the PWA is installed to the Home Screen.
const HOURS = Array.from({ length: 24 }, (_, h) => h)
function hourLabel(h) {
  const ap = h < 12 ? 'AM' : 'PM'
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr} ${ap}`
}

export default function NotificationsCard({ location, sensitivity, morningHour, eveningHour, onHours }) {
  const [perm, setPerm] = useState(notificationPermission())
  const [installEvent, setInstallEvent] = useState(null)
  const [installed, setInstalled] = useState(isStandalone())
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [testMsg, setTestMsg] = useState(null)

  const supported = notificationsSupported()
  const iosNeedsInstall = isIOS() && !installed

  useEffect(() => {
    isPushSubscribed().then(setSubscribed)
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

  // Keep the backend's copy of location, sensitivity, and times fresh.
  useEffect(() => {
    if (subscribed && location)
      subscribeToPush({ location, sensitivity, morningHour, eveningHour }).catch(() => {})
  }, [subscribed, location?.latitude, location?.longitude, sensitivity, morningHour, eveningHour])

  async function enable() {
    setBusy(true)
    setTestMsg(null)
    try {
      await registerServiceWorker()
      const result = await requestNotificationPermission()
      setPerm(result)
      if (result === 'granted') {
        await subscribeToPush({ location, sensitivity, morningHour, eveningHour })
        setSubscribed(true)
      }
    } catch (e) {
      setTestMsg('Something went wrong turning on alerts.')
    } finally {
      setBusy(false)
    }
  }

  async function turnOff() {
    setBusy(true)
    try {
      await unsubscribeFromPush()
      setSubscribed(false)
      setTestMsg(null)
    } finally {
      setBusy(false)
    }
  }

  async function test() {
    setTestMsg('Sending…')
    const r = await sendServerTest()
    if (r?.ok) {
      setTestMsg('Sent. If you don’t see it, swipe to the Home Screen and check — iOS often hides the banner while the app is open.')
    } else {
      const why = r?.detail || r?.error || `status ${r?.status || '?'}`
      setTestMsg(`Couldn’t send (${why}).`)
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
        Get a short morning and evening heads-up on the day’s outlook, and add PressureSense to your home screen.
      </p>
      <p className="mt-2 rounded-lg bg-surface-2 p-3 text-xs leading-relaxed text-muted">
        Your daily logs stay on this device. If you turn on alerts, we send your approximate location and
        alert settings to our notification service so it can send your morning and evening reminders. You
        can turn alerts off anytime.
      </p>

      {!installed && installEvent && (
        <button
          onClick={install}
          className="mt-3 min-h-touch rounded-lg bg-accent px-4 text-sm font-medium text-white"
        >
          Install app
        </button>
      )}

      <div className="mt-4">
        {!supported && <p className="text-sm text-muted">This browser doesn’t support notifications.</p>}

        {supported && iosNeedsInstall && (
          <div className="rounded-lg bg-surface-2 p-3 text-sm leading-relaxed text-muted">
            <span className="font-medium text-text">On iPhone, add it to your Home Screen first.</span> Tap
            the Share button, choose <span className="font-medium text-text">Add to Home Screen</span>, then
            open PressureSense from its new icon and turn on alerts here.
          </div>
        )}

        {supported && !iosNeedsInstall && perm === 'granted' && subscribed && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-good-ink">
                <span aria-hidden>✓</span> Alerts are on.
              </span>
              <button
                onClick={test}
                className="min-h-touch rounded-lg border border-border px-3 text-sm text-text hover:bg-surface-2"
              >
                Send a test alert
              </button>
              <button
                onClick={turnOff}
                disabled={busy}
                className="inline-flex min-h-touch items-center text-sm text-muted underline underline-offset-4"
              >
                Turn off
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-muted">
                Morning reminder
                <select
                  value={morningHour}
                  onChange={(e) => onHours({ morningHour: Number(e.target.value) })}
                  className="mt-1 block w-full min-h-touch rounded-lg border border-border bg-surface-2 px-2 text-text"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-muted">
                Evening reminder
                <select
                  value={eveningHour}
                  onChange={(e) => onHours({ eveningHour: Number(e.target.value) })}
                  className="mt-1 block w-full min-h-touch rounded-lg border border-border bg-surface-2 px-2 text-text"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-xs text-muted">Times are in your local timezone.</p>

            {testMsg && <p className="text-sm text-muted">{testMsg}</p>}
          </div>
        )}

        {supported && !iosNeedsInstall && perm === 'denied' && (
          <p className="text-sm text-muted">
            Notifications are blocked. Turn them back on for this site in your settings, then reload.
          </p>
        )}

        {supported && !iosNeedsInstall && (perm === 'default' || (perm === 'granted' && !subscribed)) && (
          <button
            onClick={enable}
            disabled={busy}
            className="min-h-touch rounded-lg bg-accent px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? 'Turning on…' : 'Enable notifications'}
          </button>
        )}
      </div>
    </div>
  )
}
