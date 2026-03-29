import { createSlug } from "@/lib/wiki/slugs";

export const RECORD_IMAGE_BUCKET = "record-images";
export const RECORD_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const RECORD_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const RECORD_IMAGE_MAX_TOTAL_BYTES = 20 * 1024 * 1024;

const STORAGE_TOKEN_PREFIX = `storage://${RECORD_IMAGE_BUCKET}/`;
const LOCAL_IMAGE_TOKEN_PREFIX = "local-image://";

const MIME_EXTENSION_MAP: Record<(typeof RECORD_IMAGE_ALLOWED_MIME_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isRecordImageMimeType(value: string): value is (typeof RECORD_IMAGE_ALLOWED_MIME_TYPES)[number] {
  return RECORD_IMAGE_ALLOWED_MIME_TYPES.includes(
    value as (typeof RECORD_IMAGE_ALLOWED_MIME_TYPES)[number],
  );
}

export function getRecordImageExtension(mimeType: string) {
  return isRecordImageMimeType(mimeType) ? MIME_EXTENSION_MAP[mimeType] : null;
}

export function buildRecordImagePath(userId: string, mimeType: string) {
  const extension = getRecordImageExtension(mimeType);

  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  return `${userId}/${crypto.randomUUID()}.${extension}`;
}

export function buildStagedImageFileName(id: string, mimeType: string) {
  const extension = getRecordImageExtension(mimeType);

  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  return `${id}.${extension}`;
}

export function buildRecordImageToken(path: string) {
  return `${STORAGE_TOKEN_PREFIX}${path}`;
}

export function buildLocalImageToken(id: string) {
  return `${LOCAL_IMAGE_TOKEN_PREFIX}${id}`;
}

export function parseRecordImageToken(value: string) {
  if (!value.startsWith(STORAGE_TOKEN_PREFIX)) {
    return null;
  }

  const path = value.slice(STORAGE_TOKEN_PREFIX.length).trim();

  if (!path) {
    return null;
  }

  return {
    bucket: RECORD_IMAGE_BUCKET,
    path,
    token: `${STORAGE_TOKEN_PREFIX}${path}`,
  };
}

export function isRecordImageToken(value?: string | null) {
  return Boolean(value && parseRecordImageToken(value));
}

export function parseLocalImageToken(value: string) {
  if (!value.startsWith(LOCAL_IMAGE_TOKEN_PREFIX)) {
    return null;
  }

  const id = value.slice(LOCAL_IMAGE_TOKEN_PREFIX.length).trim();

  if (!id) {
    return null;
  }

  return {
    id,
    token: `${LOCAL_IMAGE_TOKEN_PREFIX}${id}`,
  };
}

export function isLocalImageToken(value?: string | null) {
  return Boolean(value && parseLocalImageToken(value));
}

export function extractRecordImageTokens(contents: string) {
  const matches = contents.match(/storage:\/\/record-images\/[^\s)]+/g) ?? [];
  return [...new Set(matches.map((token) => token.trim()).filter(Boolean))];
}

export function extractLocalImageTokens(contents: string) {
  const matches = contents.match(/local-image:\/\/[^\s)]+/g) ?? [];
  return [...new Set(matches.map((token) => token.trim()).filter(Boolean))];
}

export function buildRecordImageProxyUrl(token: string) {
  return `/api/record-images?token=${encodeURIComponent(token)}`;
}

export function getRecordImageAltText(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "").trim();

  if (!baseName) {
    return "Uploaded image";
  }

  return createSlug(baseName).replace(/-/g, " ") || "Uploaded image";
}

export function getRemovedRecordImageTokens(previousContents: string, nextContents: string) {
  const previousTokens = new Set(extractRecordImageTokens(previousContents));
  const nextTokens = new Set(extractRecordImageTokens(nextContents));

  return [...previousTokens].filter((token) => !nextTokens.has(token));
}
