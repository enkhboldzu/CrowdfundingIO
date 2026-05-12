const LEGACY_UPLOAD_PREFIX = "/uploads/";
const OLD_UPLOAD_API_PREFIX = "/api/uploads/";
const UPLOAD_API_PREFIX = "/api/media/";

export function uploadedDocumentUrl(filename: string): string {
  return `${UPLOAD_API_PREFIX}${encodeURIComponent(filename)}`;
}

export function normalizeDocumentSrc(src: string | null | undefined): string | null {
  const value = src?.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith(UPLOAD_API_PREFIX)) return value;

  if (value.startsWith(LEGACY_UPLOAD_PREFIX) || value.startsWith(OLD_UPLOAD_API_PREFIX)) {
    const prefix = value.startsWith(LEGACY_UPLOAD_PREFIX)
      ? LEGACY_UPLOAD_PREFIX
      : OLD_UPLOAD_API_PREFIX;
    const path = value
      .slice(prefix.length)
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
      .join("/");

    return path ? `${UPLOAD_API_PREFIX}${path}` : null;
  }

  return value.startsWith("/") ? value : null;
}

export function normalizeDocumentList(documents: string[] | null | undefined): string[] {
  if (!documents?.length) return [];

  return Array.from(
    new Set(documents.map(normalizeDocumentSrc).filter((src): src is string => Boolean(src)))
  );
}
