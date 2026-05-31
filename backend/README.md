# ProChef Backend

Modular monolith backend for the ProChef mobile app.

## Modules

- Auth & Identity
- User Profile & Diet Preferences
- Pantry & Scan Processing
- Recipes & Recommendations
- Meal Planning
- Shopping List
- Subscriptions/Billing
- Notifications

## Phase 7: Hardening

- **Rate limits:** Redis-backed global + stricter `/auth` limits (see [`docs/hardening-phase7.md`](./docs/hardening-phase7.md)).
- **Observability:** JSON request logs (pino), `X-Request-Id`, `GET /health/ready`, graceful `SIGTERM`/`SIGINT` shutdown.
- **Load tests:** `npm run loadtest` (autocannon; API must be running). Optional: `npm run loadtest:k6` with [k6](https://k6.io/) installed.
- **Backups / drills:** [`docs/backup-restore.md`](./docs/backup-restore.md) and `scripts/db-backup.sh` / `scripts/db-restore.sh`.

## Scan Phase 2

See [`docs/scan-phase2-api.md`](./docs/scan-phase2-api.md) for the S3 presigned upload + async scan contract.

## Meal planning (Phase 4)

- `POST /meal-plans` — generate weekly slots from recommendations (or all recipes)
- `GET /meal-plans/current` — latest plan with recipe details per slot
- `POST /shopping-lists/generate` — aggregate ingredients, optional pantry subtraction
- `GET /shopping-lists/current`, `PATCH /shopping-lists/items/:itemId`
- Seed recipes: `npm run prisma:seed` (ingredients + sample recipes)

Optional local S3/Redis: `docker compose -f ../docker-compose.dev.yml up -d` from repo root.

## Local Setup

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:
   - `cd backend && npm install`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Run migrations:
   - `npm run prisma:migrate`
5. Start API:
   - `npm run dev`
6. Start workers in another terminal:
   - `npm run worker`

## Initial Endpoints

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /me`
- `PATCH /me`
- `PUT /me/diet-profile`
- `PUT /me/goals`
- `GET/POST/PATCH/DELETE /pantry/items`
- `GET /pantry/items/expiring`
- `POST /scans/upload-url`
- `POST /scans`
- `GET /scans/:scanId`
- `POST /scans/:scanId/confirm`
- `GET /recipes`
- `GET /recipes/:recipeId`
- `POST /recommendations/meals`
- `GET /dashboard/summary`
- `POST /meal-plans`
- `GET /meal-plans/current`
- `GET /shopping-lists/current`
- `POST /shopping-lists/generate`
- `GET /billing/plans`
- `POST /billing/checkout-session`
- `GET /billing/entitlements`
- `POST /billing/webhooks/stripe`
- `GET/PUT /notifications/preferences`
- `GET /notifications/expiry-alerts`
- `POST /notifications/expiry-alerts/dispatch`
