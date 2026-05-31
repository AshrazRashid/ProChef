# Scan Phase 2 API (S3 Upload + Async Processing)

Presigned S3 upload, scan session lifecycle, and BullMQ-backed processing.

## Base

- Base URL: `http://localhost:4000` (or your deployed API)
- Auth: Bearer token on all `/scans/*` endpoints
- Entitlement: **Pro** subscription required (`requireProEntitlement`)
- Header: `Authorization: Bearer <access_token>`

## Allowed image content types

`image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/heic`

---

## 1) Create upload URL + scan session

Creates a `ScanSession` in `uploading` state and returns a pre-signed S3 `PUT` URL.

- **Endpoint:** `POST /scans/upload-url`
- **Body:**

```json
{
  "contentType": "image/jpeg"
}
```

- **Response `200`:**

```json
{
  "scanSessionId": "uuid",
  "objectKey": "scans/<userId>/<uuid>.jpg",
  "uploadUrl": "https://...",
  "expiresInSeconds": 900
}
```

- **Errors:** `400` unsupported content type; `402` not Pro

---

## 2) Upload image to S3 (client)

`PUT` the file bytes to `uploadUrl` with the same `Content-Type` as step 1.

```http
PUT <uploadUrl>
Content-Type: image/jpeg

<binary body>
```

---

## 3) Queue async processing

Verifies the object exists in S3 (with retries), sets status `queued`, enqueues worker job.

- **Endpoint:** `POST /scans`
- **Preferred body:**

```json
{
  "scanSessionId": "uuid"
}
```

- **Legacy body** (creates session if you uploaded with a known key):

```json
{
  "objectKey": "scans/<userId>/<uuid>.jpg",
  "contentType": "image/jpeg"
}
```

- **Response `202`:** scan session JSON (`status: "queued"`)
- **Errors:**
  - `400` — invalid payload or image not in S3 yet
  - `404` — session not found
  - `409` — already queued, processing, or completed

---

## 4) Poll scan status + detections

- **Endpoint:** `GET /scans/:scanId`
- **Response `200`:** session with `detections[]` (each includes `ingredient`)
- **Response `404`:** not found

### Status values

| Status | Meaning |
|--------|---------|
| `uploading` | Session created; waiting for S3 PUT + queue |
| `queued` | Job enqueued |
| `processing` | Worker running |
| `completed` | Detections written |
| `failed` | Worker error (retry may have been attempted) |

Poll every 1–2s until `completed` or `failed`.

---

## 5) Confirm → pantry

Creates pantry items from detections (`source: "scan"`).

- **Endpoint:** `POST /scans/:scanId/confirm`
- **Response `201`:** `{ "created": 2 }`
- **Errors:**
  - `404` — scan not found
  - `409` — scan not `completed` yet

---

## Client sequence (mobile)

1. `POST /scans/upload-url` → `scanSessionId`, `uploadUrl`
2. `PUT` image to `uploadUrl`
3. `POST /scans` with `{ scanSessionId }`
4. Navigate to ingredients UI; `GET /scans/:scanId` until `completed`
5. `POST /scans/:scanId/confirm` → optional `POST /recommendations/meals`

## Local infrastructure

Run Redis + MinIO:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Set in `backend/.env`:

```env
REDIS_URL=redis://127.0.0.1:6379
S3_ENDPOINT=http://127.0.0.1:9000
S3_REGION=us-east-1
S3_BUCKET=prochef-scans
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
```

Create the bucket once (MinIO console: http://127.0.0.1:9001 or `mc` CLI).

Run API + worker:

```bash
cd backend && npm run dev:all
```
