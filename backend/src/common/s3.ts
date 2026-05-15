import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { env } from "./config.js";

const credentials =
  env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
    ? {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY
      }
    : undefined;

const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT || undefined,
  forcePathStyle: Boolean(env.S3_ENDPOINT),
  credentials
});

const extensionByContentType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic"
};

/** Content types allowed for pantry scan uploads (presigned PUT must match). */
export const SCAN_IMAGE_CONTENT_TYPES = new Set(Object.keys(extensionByContentType));

export function isAllowedScanImageContentType(contentType: string) {
  return SCAN_IMAGE_CONTENT_TYPES.has(contentType.toLowerCase());
}

function getExtension(contentType: string) {
  return extensionByContentType[contentType.toLowerCase()] ?? "jpg";
}

/**
 * Ensures `objectKey` is a scan object under this user (prevents queueing another user's key).
 */
export function assertOwnedScanObjectKey(userId: string, objectKey: string) {
  const prefix = `scans/${userId}/`;
  if (!objectKey.startsWith(prefix)) {
    throw new Error("object_key_must_be_under_user_scan_prefix");
  }
  const remainder = objectKey.slice(prefix.length);
  if (!remainder || remainder.includes("/") || remainder.includes("..")) {
    throw new Error("invalid_scan_object_key");
  }
}

export function buildScanObjectKey(userId: string, contentType: string) {
  const scanId = randomUUID();
  return `scans/${userId}/${scanId}.${getExtension(contentType)}`;
}

export function buildProgressPhotoObjectKey(userId: string, contentType: string) {
  const id = randomUUID();
  return `progress/${userId}/${id}.${getExtension(contentType)}`;
}

export async function createScanUploadUrl(params: { objectKey: string; contentType: string }) {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: params.objectKey,
    ContentType: params.contentType
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return { uploadUrl, expiresInSeconds: 900 };
}

export async function createProgressPhotoUploadUrl(params: { objectKey: string; contentType: string }) {
  return createScanUploadUrl(params);
}

export async function objectExists(objectKey: string) {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: objectKey
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * After a client PUT, S3 may briefly lag before HEAD succeeds. Used when queueing a scan.
 */
export async function objectExistsWithRetry(
  objectKey: string,
  options?: { attempts?: number; baseDelayMs?: number }
) {
  const attempts = Math.max(1, options?.attempts ?? 8);
  const baseDelayMs = Math.max(10, options?.baseDelayMs ?? 120);
  for (let i = 0; i < attempts; i++) {
    if (await objectExists(objectKey)) {
      return true;
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(1.4, i)));
    }
  }
  return false;
}

/** Throws if the object is not readable in the bucket (worker-side gate). */
export async function assertScanObjectReadable(objectKey: string) {
  const ok = await objectExistsWithRetry(objectKey, { attempts: 4, baseDelayMs: 200 });
  if (!ok) {
    throw new Error(`scan_image_not_found:${objectKey}`);
  }
}
