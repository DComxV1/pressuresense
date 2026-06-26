// PressureSense push backend (Cloudflare Worker).
//
//  fetch:     POST /subscribe + /unsubscribe to manage push subscriptions in KV.
//  scheduled: a couple of times a day, fetch each subscriber's forecast, run the
//             risk model, and send a web-push when a tougher day is coming.
//
// Web push is implemented with the platform Web Crypto API (RFC 8291 aes128gcm
// + RFC 8292 VAPID), so there are no Node-only dependencies.

// ---------- small helpers ----------
const enc = new TextEncoder()

function concat(...arrs) {
  let len = 0
  for (const a of arrs) len += a.length
  const out = new Uint8Array(len)
  let o = 0
  for (const a of arrs) {
    out.set(a, o)
    o += a.length
  }
  return out
}
function b64urlFromBytes(buf) {
  let s = ''
  const b = new Uint8Array(buf)
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlFromStr(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  const bin = atob(s)
  const b = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i)
  return b
}
async function sha256Hex(str) {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(str))
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

// ---------- VAPID + payload encryption ----------
async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8)
  return new Uint8Array(bits)
}

async function vapidAuthHeader(endpoint, env) {
  const jwk = JSON.parse(env.VAPID_PRIVATE_JWK)
  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', d: jwk.d, x: jwk.x, y: jwk.y, ext: true },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  )
  const header = { typ: 'JWT', alg: 'ES256' }
  const payload = {
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: env.VAPID_SUBJECT,
  }
  const signingInput = b64urlFromStr(JSON.stringify(header)) + '.' + b64urlFromStr(JSON.stringify(payload))
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(signingInput))
  const jwt = signingInput + '.' + b64urlFromBytes(sig)
  return `vapid t=${jwt}, k=${env.VAPID_PUBLIC}`
}

async function encryptPayload(plaintext, p256dhB64, authB64) {
  const clientPub = b64urlToBytes(p256dhB64) // 65 bytes
  const authSecret = b64urlToBytes(authB64) // 16 bytes
  const salt = crypto.getRandomValues(new Uint8Array(16))

  const eph = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const ephPub = new Uint8Array(await crypto.subtle.exportKey('raw', eph.publicKey)) // 65 bytes
  const clientKey = await crypto.subtle.importKey('raw', clientPub, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
  const shared = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: clientKey }, eph.privateKey, 256),
  )

  // RFC 8291 key derivation
  const ikm = await hkdf(authSecret, shared, concat(enc.encode('WebPush: info\0'), clientPub, ephPub), 32)
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12)

  const record = concat(enc.encode(plaintext), new Uint8Array([2])) // 0x02 = last record delimiter
  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt'])
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, aesKey, record),
  )

  // aes128gcm header: salt(16) | rs(4=4096) | idlen(1) | keyid(ephPub)
  const rs = new Uint8Array([0, 0, 0x10, 0x00])
  const header = concat(salt, rs, new Uint8Array([ephPub.length]), ephPub)
  return concat(header, ciphertext)
}

async function sendPush(subscription, payload, env) {
  const body = await encryptPayload(payload, subscription.keys.p256dh, subscription.keys.auth)
  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      TTL: '86400',
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      Authorization: await vapidAuthHeader(subscription.endpoint, env),
    },
    body,
  })
  let detail = ''
  if (res.status >= 300) detail = (await res.text().catch(() => '')).slice(0, 300)
  return { status: res.status, detail }
}

// ---------- risk model (compact port of src/lib/risk.js, pressure-only) ----------
const CFG = { wAbs: 0.35, wRate: 0.65, comfMin: 1013, severeLow: 996, drop: -2, severeDrop: -8, yellow: 0.3, red: 0.6 }
const absF = (h) => (h >= CFG.comfMin ? 0 : h <= CFG.severeLow ? 1 : (CFG.comfMin - h) / (CFG.comfMin - CFG.severeLow))
const rateF = (r) =>
  r == null || r >= CFG.drop ? 0 : r <= CFG.severeDrop ? 1 : (CFG.drop - r) / (CFG.drop - CFG.severeDrop)
function bandFromScore(score, sensitivity) {
  const s = Math.max(0.4, Math.min(2, (sensitivity ?? 50) / 50))
  const y = Math.max(0.05, Math.min(0.95, CFG.yellow / s))
  const rd = Math.max(0.1, Math.min(0.97, CFG.red / s))
  return score >= rd ? 'red' : score >= y ? 'yellow' : 'green'
}

async function forecastForDay(location, sensitivity, slot) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&hourly=pressure_msl&forecast_days=2&past_days=1&timezone=auto`
  const data = await fetch(url).then((r) => r.json())
  const times = data.hourly?.time || []
  const ps = data.hourly?.pressure_msl || []
  const hourly = times
    .map((t, i) => ({ date: t.slice(0, 10), hour: +t.slice(11, 13), hPa: ps[i] }))
    .filter((p) => typeof p.hPa === 'number')
  const dates = [...new Set(hourly.map((h) => h.date))].sort()
  // dates: [yesterday, today, tomorrow]
  const today = dates[1] || dates[0]
  const tomorrow = dates[2] || dates[1]
  const targetDate = slot === 'evening' ? tomorrow : today

  let worst = 0
  for (let i = 0; i < hourly.length; i++) {
    if (hourly[i].date !== targetDate) continue
    if (hourly[i].hour < 7 || hourly[i].hour > 22) continue
    const r6 = i >= 6 ? hourly[i].hPa - hourly[i - 6].hPa : null
    const score = Math.min(1, CFG.wAbs * absF(hourly[i].hPa) + CFG.wRate * rateF(r6))
    if (score > worst) worst = score
  }
  return { band: bandFromScore(worst, sensitivity), targetDate, isToday: targetDate === today }
}

function buildMessage(band, isToday) {
  const when = isToday ? 'Today' : 'Tomorrow'
  if (band === 'red') {
    return {
      title: `${when} looks like a tougher day`,
      body: `A sharp pressure drop is coming. Plan a gentler ${isToday ? 'day' : 'one'} and get ahead of it early with your anti-inflammatory routine, feet up when you rest, and plenty of water.`,
    }
  }
  if (band === 'yellow') {
    return {
      title: `${when} looks like a moderate day`,
      body: `Some pressure movement ahead. Stay ahead of it: keep hydrated, move in short bursts, and maybe pop on compression socks.`,
    }
  }
  return {
    title: `${when} looks like a good day`,
    body: `Pressure stays calm and steady. A good day to be active and keep your routine. Stay hydrated and bank some gentle movement while it's easy.`,
  }
}

// ---------- HTTP ----------
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS } })

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })
    if (url.pathname === '/' || url.pathname === '/health') return json({ ok: true })

    if (request.method === 'POST' && url.pathname === '/subscribe') {
      const data = await request.json().catch(() => null)
      if (!data?.subscription?.endpoint || !data.subscription.keys?.p256dh) return json({ error: 'bad subscription' }, 400)
      const key = await sha256Hex(data.subscription.endpoint)
      // Preserve send-history across re-subscribes (e.g. when prefs change), so
      // updating a time doesn't trigger a duplicate.
      const prev = JSON.parse((await env.SUBS.get(key)) || 'null') || {}
      const record = {
        subscription: data.subscription,
        location: data.location || null,
        sensitivity: data.sensitivity ?? 50,
        tz: data.tz || 'UTC',
        morningHour: clampHour(data.morningHour, 7),
        eveningHour: clampHour(data.eveningHour, 19),
        lastMorning: prev.lastMorning ?? null,
        lastEvening: prev.lastEvening ?? null,
      }
      await env.SUBS.put(key, JSON.stringify(record))
      return json({ ok: true })
    }

    // Send a real server push to the given subscription right now (so the user
    // can verify the full pipeline without waiting for the cron). Self-limited:
    // the caller can only push to a subscription they already hold the keys for.
    if (request.method === 'POST' && url.pathname === '/test') {
      const data = await request.json().catch(() => null)
      if (!data?.subscription?.endpoint) return json({ error: 'missing subscription' }, 400)
      const r = await sendPush(
        data.subscription,
        JSON.stringify({
          title: 'PressureSense',
          body: 'Test alert — notifications are working. We’ll only ping you when a tougher day is coming.',
          url: env.APP_URL,
        }),
        env,
      )
      console.log('test push ->', r.status, r.detail)
      return json({ ok: r.status >= 200 && r.status < 300, status: r.status, detail: r.detail })
    }

    if (request.method === 'POST' && url.pathname === '/unsubscribe') {
      const data = await request.json().catch(() => null)
      if (!data?.endpoint) return json({ error: 'missing endpoint' }, 400)
      await env.SUBS.delete(await sha256Hex(data.endpoint))
      return json({ ok: true })
    }

    return json({ error: 'not found' }, 404)
  },

  async scheduled(event, env) {
    const now = new Date(event.scheduledTime)
    const list = await env.SUBS.list()
    for (const k of list.keys) {
      const raw = await env.SUBS.get(k.name)
      if (!raw) continue
      const sub = JSON.parse(raw)
      if (!sub.location) continue

      // Notify only at the subscriber's own local morning/evening hour.
      const lh = localHour(sub.tz || 'UTC', now)
      let slot = null
      if (lh === (sub.morningHour ?? 7)) slot = 'morning'
      else if (lh === (sub.eveningHour ?? 19)) slot = 'evening'
      if (!slot) continue

      try {
        const f = await forecastForDay(sub.location, sub.sensitivity, slot)
        // Mornings carry the good-day "keep it good" note; evenings are the
        // heads-up for tomorrow, and only when tomorrow is not green.
        if (slot === 'morning' && f.band !== 'green') continue
        if (slot === 'evening' && f.band === 'green') continue
        const lastKey = slot === 'morning' ? 'lastMorning' : 'lastEvening'
        if (sub[lastKey] === f.targetDate) continue

        const m = buildMessage(f.band, f.isToday)
        const { status } = await sendPush(
          sub.subscription,
          JSON.stringify({ title: m.title, body: m.body, url: env.APP_URL }),
          env,
        )
        if (status === 404 || status === 410) {
          await env.SUBS.delete(k.name)
          continue
        }
        sub[lastKey] = f.targetDate
        await env.SUBS.put(k.name, JSON.stringify(sub))
      } catch {
        // skip this subscriber on error
      }
    }
  },
}

function clampHour(v, fallback) {
  const n = Math.round(Number(v))
  return Number.isFinite(n) && n >= 0 && n <= 23 ? n : fallback
}

// Current hour (0-23) in the given IANA timezone. Workers ship full ICU, so
// Intl handles the timezone (and DST) for us.
function localHour(tz, date) {
  try {
    const s = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(date)
    return parseInt(s, 10) % 24
  } catch {
    return date.getUTCHours()
  }
}
