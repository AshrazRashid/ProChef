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
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic"
};

function getExtension(contentType: string) {
  return extensionByContentType[contentType.toLowerCase()] ?? "jpg";
}

export function buildScanObjectKey(userId: string, contentType: string) {
  const scanId = randomUUID();
  return `scans/${userId}/${scanId}.${getExtension(contentType)}`;
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
