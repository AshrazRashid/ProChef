# ProChef Backend API Endpoints

Single reference document for all currently implemented backend endpoints.

## Base Info

- Base URL (local): `http://localhost:4000`
- JSON header: `Content-Type: application/json`
- Auth header for protected routes: `Authorization: Bearer <access_token>`
- Access token is returned by auth endpoints.

---

## Health

### `GET /health`
- Auth: No
- Response `200`:
```json
{
  "status": "ok",
  "service": "prochef-backend"
}
```

### `GET /health/ready`
- Auth: No
- Purpose: readiness (PostgreSQL + Redis). Use behind load balancers; not for cheap liveness-only pings.
- Response `200` when dependencies are reachable:
```json
{
  "status": "ready",
  "checks": { "db": true, "redis": true }
}
```
- Response `503` if Postgres or Redis fails: `{ "status": "not_ready", "checks": { ... } }`

---

## Auth (`/auth`)

### `POST /auth/signup`
- Auth: No
- Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Responses:
  - `201`: `{ user, accessToken, refreshToken }`
  - `400`: invalid payload
  - `409`: email already in use

### `POST /auth/login`
- Auth: No
- Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- Responses:
  - `200`: `{ user, accessToken, refreshToken }`
  - `400`: invalid payload
  - `401`: invalid credentials

---

## Profile (`/`)

### `GET /me`
- Auth: Yes
- Response `200`: current user with `dietProfile` and `goals`

### `PATCH /me`
- Auth: Yes
- Body (all optional):
```json
{
  "displayName": "John",
  "age": 28,
  "heightCm": 178,
  "weightKg": 74
}
```
- Responses:
  - `200`: updated user
  - `400`: invalid payload

### `PUT /me/diet-profile`
- Auth: Yes
- Body:
```json
{
  "calorieTarget": 2200,
  "proteinG": 140,
  "carbG": 240,
  "fatG": 70,
  "dietType": "balanced"
}
```
- Responses:
  - `200`: saved diet profile
  - `400`: invalid payload

### `PUT /me/goals`
- Auth: Yes
- Body:
```json
{
  "goalType": "weight_loss",
  "targetWeightKg": 68,
  "targetDate": "2026-08-01T00:00:00.000Z"
}
```
- Responses:
  - `201`: created goal
  - `400`: invalid payload

---

## Pantry (`/pantry`)

### `GET /pantry/items`
- Auth: Yes
- Response `200`:
```json
{
  "items": []
}
```

### `POST /pantry/items`
- Auth: Yes
- Body:
```json
{
  "ingredientId": "uuid",
  "quantity": 2,
  "unit": "unit",
  "expiresAt": "2026-04-30T00:00:00.000Z"
}
```
- Responses:
  - `201`: created pantry item
  - `400`: invalid payload

### `PATCH /pantry/items/:itemId`
- Auth: Yes
- Body: any subset of `ingredientId`, `quantity`, `unit`, `expiresAt`
- Responses:
  - `200`: updated pantry item
  - `400`: invalid payload
  - `404`: pantry item not found

### `DELETE /pantry/items/:itemId`
- Auth: Yes
- Responses:
  - `204`: deleted
  - `404`: pantry item not found

### `GET /pantry/items/expiring?days=3`
- Auth: Yes
- Query:
  - `days` optional, default `3`
- Response `200`:
```json
{
  "items": [],
  "days": 3
}
```

---

## Scans (`/scans`)

### `POST /scans/upload-url`
- Auth: Yes
- Purpose: create scan session + pre-signed S3 upload URL
- Body:
```json
{
  "contentType": "image/jpeg"
}
```
- Response `200`:
```json
{
  "scanSessionId": "uuid",
  "objectKey": "scans/<userId>/<uuid>.jpg",
  "uploadUrl": "https://...signed-url...",
  "expiresInSeconds": 900
}
```

### `POST /scans`
- Auth: Yes
- Purpose: queue async scan processing
- Preferred body:
```json
{
  "scanSessionId": "uuid"
}
```
- Legacy-compatible body:
```json
{
  "objectKey": "scans/<userId>/<uuid>.jpg",
  "contentType": "image/jpeg"
}
```
- Responses:
  - `202`: queued scan session
  - `400`: invalid payload or image not uploaded yet
  - `404`: scan session not found
  - `409`: already processing/completed

### `GET /scans/:scanId`
- Auth: Yes
- Response `200`: scan session with `detections`
- Response `404`: scan not found

### `POST /scans/:scanId/confirm`
- Auth: Yes
- Purpose: create pantry items from detections
- Response `201`:
```json
{
  "created": 2
}
```
- Response `404`: scan not found

### Scan Status Values
- `uploading`
- `queued`
- `processing`
- `completed`
- `failed`

---

## Recipes (`/recipes`)

### `GET /recipes`
- Auth: Yes
- Response `200`:
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Tomato Omelette",
      "ingredients": [],
      "pantryMatch": {
        "requiredCount": 3,
        "matchedCount": 2,
        "missingCount": 1,
        "matchRatio": 0.6667
      }
    }
  ]
}
```

### `GET /recipes/:recipeId`
- Auth: Yes
- Response `200`: recipe with `ingredients` + `pantryMatch`
- Response `404`: recipe not found

---

## Recommendations (`/recommendations`)

### `POST /recommendations/meals`
- Auth: Yes
- Entitlement: Pro required
- Body (optional):
```json
{
  "limit": 20
}
```
- Response `200`:
```json
{
  "items": [
    {
      "recipeId": "uuid",
      "score": 0.91,
      "reasons": {},
      "recipe": {
        "title": "Tomato Omelette",
        "prepMinutes": 10,
        "cookMinutes": 8,
        "difficulty": "easy"
      }
    }
  ]
}
```
- Additional response:
  - `402`: Pro entitlement required
---

## Dashboard (`/dashboard`)

### `GET /dashboard/summary`
- Auth: Yes
- Response `200`:
```json
{
  "pantry": {
    "totalItems": 12,
    "expiringInDays": 3,
    "expiringSoonCount": 4
  },
  "scans": {
    "latestStatus": "completed",
    "latestScanAt": "2026-04-20T10:00:00.000Z"
  },
  "recommendations": {
    "total": 20,
    "top": []
  },
  "planning": {
    "currentMealPlanId": "uuid",
    "currentMealPlanWeekStartDate": "2026-04-20T00:00:00.000Z",
    "activeShoppingListId": "uuid",
    "uncheckedShoppingItems": 5
  }
}
```

---

## Meal Plans (`/meal-plans`)

### `POST /meal-plans`
- Auth: Yes
- Body:
```json
{
  "weekStartDate": "2026-04-20",
  "days": 7,
  "slotTypes": ["breakfast", "lunch", "dinner"],
  "useRecommendations": true
}
```
- Responses:
  - `201`: generated meal plan with slots
  - `400`: invalid payload
  - `409`: no recipes available

### `GET /meal-plans/current`
- Auth: Yes
- Response `200`: latest meal plan with `slots` (or `null`)

---

## Shopping Lists (`/shopping-lists`)

### `GET /shopping-lists/current`
- Auth: Yes
- Response `200`: latest shopping list with `items` (or `null`)

### `POST /shopping-lists/generate`
- Auth: Yes
- Body (all optional):
```json
{
  "mealPlanId": "uuid",
  "subtractPantry": true
}
```
- Behavior:
  - Uses provided meal plan, or latest plan for the user if omitted
  - Aggregates non-optional recipe ingredients from plan slots
  - Scales quantities by slot servings
  - Subtracts pantry quantities when `subtractPantry = true`
  - Archives previous active list and creates a new active list
- Responses:
  - `201`: generated shopping list with ingredient details
  - `400`: invalid payload
  - `404`: meal plan not found

---

## Billing (`/billing`)

### `GET /billing/plans`
- Auth: Yes
- Response `200`:
```json
{
  "plans": [
    {
      "code": "monthly_pro",
      "amount": 999,
      "currency": "usd",
      "interval": "month"
    },
    {
      "code": "yearly_pro",
      "amount": 7999,
      "currency": "usd",
      "interval": "year"
    }
  ]
}
```

### `POST /billing/checkout-session`
- Auth: Yes
- Body: none currently
- Response `200`:
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/...",
  "userId": "uuid"
}
```

### `GET /billing/entitlements`
- Auth: Yes
- Response `200`:
```json
{
  "hasPro": true,
  "planCode": "monthly_pro",
  "status": "active",
  "currentPeriodEnd": "2026-05-20T00:00:00.000Z"
}
```

### `POST /billing/webhooks/stripe`
- Auth: No (Stripe-signed webhook endpoint)
- Headers:
  - `stripe-signature` required
- Behavior:
  - Verifies Stripe signature using `STRIPE_WEBHOOK_SECRET`
  - Syncs local `Subscription` records for checkout/subscription events
- Responses:
  - `200`: `{ "received": true }`
  - `400`: missing/invalid signature
  - `503`: Stripe not configured

---

## Notifications (`/notifications`)

### `GET /notifications/preferences`
- Auth: Yes
- Response `200`:
  - existing saved preferences, or
  - defaults:
```json
{
  "expiryPushEnabled": true,
  "mealPushEnabled": true
}
```

### `PUT /notifications/preferences`
- Auth: Yes
- Body:
```json
{
  "expiryPushEnabled": true,
  "mealPushEnabled": false
}
```
- Responses:
  - `200`: saved preferences
  - `400`: invalid payload

### `GET /notifications/expiry-alerts?days=3`
- Auth: Yes
- Query:
  - `days` optional, default `3` (range `1..30`)
- Response `200`:
```json
{
  "enabled": true,
  "days": 3,
  "totalAlerts": 2,
  "alerts": [
    {
      "pantryItemId": "uuid",
      "ingredientId": "uuid",
      "ingredientName": "Tomato",
      "quantity": 4,
      "unit": "unit",
      "expiresAt": "2026-04-22T00:00:00.000Z",
      "daysUntilExpiry": 2
    }
  ]
}
```
- Responses:
  - `400`: invalid query parameter

### `POST /notifications/expiry-alerts/dispatch`
- Auth: Yes
- Body (optional):
```json
{
  "days": 3
}
```
- Behavior:
  - Checks user notification preferences
  - Queues an `expiry-notifications` background job
  - Worker resolves expiring pantry items and logs placeholder dispatch
- Responses:
  - `202`: queued successfully (`{ queued, jobId, days }`)
  - `400`: invalid payload
  - `409`: expiry notifications disabled for user

---

## Typical Auth Flow

1. `POST /auth/signup` or `POST /auth/login`
2. Store `accessToken`
3. Call protected endpoints using `Authorization: Bearer <accessToken>`
