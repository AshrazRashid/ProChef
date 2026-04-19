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
- `POST /recommendations/meals`
- `POST /meal-plans`
- `GET /meal-plans/current`
- `GET /shopping-lists/current`
- `GET /billing/plans`
- `POST /billing/checkout-session`
- `GET/PUT /notifications/preferences`
