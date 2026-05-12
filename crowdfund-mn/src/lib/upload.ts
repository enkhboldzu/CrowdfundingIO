export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const ACCEPTED_IMAGE_TYPE_SET = new Set<string>(ACCEPTED_IMAGE_TYPES);
export const ACCEPTED_IMAGE_INPUT = ACCEPTED_IMAGE_TYPES.join(",");

export const MAX_IMAGE_UPLOAD_MB = 20;
export const MAX_IMAGE_UPLOAD_BYTES = MAX_IMAGE_UPLOAD_MB * 1024 * 1024;

export const IMAGE_EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export const ACCEPTED_DOCUMENT_TYPE_SET = new Set<string>(ACCEPTED_DOCUMENT_TYPES);
export const ACCEPTED_DOCUMENT_INPUT = [
  ".pdf",
  ".doc",
  ".docx",
  "image/png",
  "image/jpeg",
  "image/webp",
].join(",");

export const MAX_DOCUMENT_UPLOAD_MB = 20;
export const MAX_DOCUMENT_UPLOAD_BYTES = MAX_DOCUMENT_UPLOAD_MB * 1024 * 1024;

export const DOCUMENT_EXTENSION_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
