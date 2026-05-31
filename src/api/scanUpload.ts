/** Maps device MIME types to values accepted by `POST /scans/upload-url`. */
export function normalizeScanContentType(mime: string | null | undefined): string {
  const m = (mime ?? "image/jpeg").toLowerCase();
  if (m === "image/jpg") {
    return "image/jpeg";
  }
  if (m === "image/heif") {
    return "image/heic";
  }
  return m;
}

export function scanApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}
