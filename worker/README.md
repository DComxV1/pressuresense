# PressureSense push Worker

Cloudflare Worker that stores push subscriptions and sends scheduled pre-flare
web-push alerts. Web push is implemented with the Web Crypto API (RFC 8291
`aes128gcm` + RFC 8292 VAPID) — no Node-only dependencies.

**Live:** https://pressuresense-push.delfin-cuevas.workers.dev

## Endpoints
- `POST /subscribe` — `{ subscription, location:{latitude,longitude,label}, sensitivity }`
- `POST /unsubscribe` — `{ endpoint }`
- `POST /test` — `{ subscription }` → sends a real push immediately (verification)
- `GET /health`

## Schedule
Cron `0 * * * *` (hourly). Each subscriber stores their IANA `tz` plus a
`morningHour` and `eveningHour` (local). On each run, a subscriber is considered
only when their local hour matches one of those:
- **Morning** sends a "good day, keep it good" note, but only when today is green.
- **Evening** sends tomorrow's heads-up, but only when tomorrow is not green.

So good days get a gentle morning note and tough days get an evening prep, at the
user's own local times (DST handled via `Intl`), deduped per slot via
`lastMorning` / `lastEvening`. Expired subscriptions (404/410) are pruned.

## Config / secrets
- `wrangler.toml`: KV binding `SUBS`, `VAPID_PUBLIC`, `VAPID_SUBJECT`, `APP_URL`.
- Secret: `VAPID_PRIVATE_JWK` (the EC private key as JSON). Set with
  `wrangler secret put VAPID_PRIVATE_JWK`. **Never commit this.**
- The matching `VAPID_PUBLIC` is also in the app at `src/lib/pushConfig.js`.

## Deploy
```
cd worker
wrangler deploy
```

## Rotating VAPID keys
Generate a new EC P-256 keypair, update `VAPID_PUBLIC` in both `wrangler.toml`
and `src/lib/pushConfig.js`, set the new `VAPID_PRIVATE_JWK` secret, redeploy.
All existing subscriptions must re-subscribe after a rotation.
