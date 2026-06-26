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
Crons `0 11 * * *` and `0 23 * * *` (UTC ≈ morning/evening ET). Each run computes
the relevant day's risk band per subscriber and sends a daily briefing for every
band — good, moderate, or tough — with band-appropriate guidance (deduped to one
per day via `lastNotified`). Expired subscriptions (404/410) are pruned.

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
