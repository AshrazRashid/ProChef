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
