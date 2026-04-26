# Phase 7: Hardening

Operational controls for rate limiting, logs, load testing, and database continuity.

## Rate limits

- **Global API** (Redis-backed): default **500 requests / 15 minutes** per client IP (`rl:global:` keys). Skips `GET /health` and `GET /health/ready` so probes do not consume quota. The Stripe webhook is registered **before** this middleware and is not subject to the global limiter (Stripe retries must succeed).
- **Auth** (`/auth/*`): default **20 requests / 15 minutes** per IP (`rl:auth:` keys).

Tune with optional environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `RATE_LIMIT_GLOBAL_MAX` | `500` | Max requests per window for global limiter |
| `RATE_LIMIT_GLOBAL_WINDOW_MS` | `900000` (15m) | Global window length |
| `RATE_LIMIT_AUTH_MAX` | `20` | Max auth attempts per window |
| `RATE_LIMIT_AUTH_WINDOW_MS` | `900000` (15m) | Auth window length |

**Production:** set `TRUST_PROXY=1` (or the number of trusted proxy hops) so `express-rate-limit` sees the real client IP behind a load balancer.

**Redis:** use **`maxmemory-policy noeviction`** for the instance used by BullMQ and rate limits. Eviction can drop queue jobs and rate-limit keys unpredictably.

## Observability

- **Structured logs:** JSON to stdout via **pino** / **pino-http** (one line per request with `responseTime`, `req.method`, `req.url`, status, etc.). Liveness `GET /health` is excluded from automatic request logs to reduce noise.
- **Request correlation:** Accepts inbound `X-Request-Id` (max 128 chars) or generates a UUID; echoes **`X-Request-Id`** on the response.
- **Secrets:** `Authorization` and `Cookie` headers are redacted in logs.
- **`LOG_LEVEL`:** `fatal` \| `error` \| `warn` \| `info` \| `debug` \| `trace` \| `silent` (default `info`).

**Readiness:** `GET /health/ready` returns **200** when PostgreSQL and Redis respond; **503** if either fails. Use for orchestration readiness probes (not for cheap liveness-only pings).

**Graceful shutdown:** `SIGTERM` / `SIGINT` stop accepting HTTP connections, then disconnect Prisma and Redis.

## Load tests

With the API running locally (`npm run dev`):

```bash
cd backend && npm run loadtest
```

This runs **autocannon** against `http://127.0.0.1:4000/health` (override with `LOADTEST_URL`).

**k6** (install separately from [k6.io](https://k6.io/docs/get-started/installation/)):

```bash
cd backend && k6 run load/k6-smoke.js
```

Override base URL: `API_BASE_URL=https://staging.example.com k6 run load/k6-smoke.js`

Interpret results: watch p95/p99 latency, error rate, and saturation of CPU/DB/Redis on the server while ramping connections.

## Backup and restore drills

See [backup-restore.md](./backup-restore.md) for `pg_dump` / `pg_restore`, Supabase notes, and a suggested **quarterly drill** checklist.
