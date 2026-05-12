export const DEFAULT_PROJECT_COVER =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80";

const LEGACY_UPLOAD_PREFIX = "/uploads/";
const OLD_UPLOAD_API_PREFIX = "/api/uploads/";
const UPLOAD_API_PREFIX = "/api/media/";

export function uploadedImageUrl(filename: string): string {
  return `${UPLOAD_API_PREFIX}${encodeURIComponent(filename)}`;
}

export function normalizeImageSrc(src: string | null | undefined): string | null {
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

export function imageSrcOrFallback(
  src: string | null | undefined,
  fallback = DEFAULT_PROJECT_COVER
): string {
  return normalizeImageSrc(src) ?? fallback;
}

export function normalizeImageList(images: string[] | null | undefined): string[] {
  if (!images?.length) return [];

  return Array.from(
    new Set(images.map(normalizeImageSrc).filter((src): src is string => Boolean(src)))
  );
}
