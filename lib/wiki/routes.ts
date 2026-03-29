export function decodeRouteSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function encodeRouteSegment(value: string) {
  return encodeURIComponent(value.trim());
}

export function buildTopicHref(topic: string) {
  return `/topics/${encodeRouteSegment(topic)}`;
}

export function buildLibraryHref(slug: string, options?: { preview?: boolean }) {
  const path = `/library/${encodeRouteSegment(slug)}`;

  if (options?.preview) {
    return `${path}?preview=1`;
  }

  return path;
}

export function buildRecordCacheTag(slug: string) {
  return `record:${encodeRouteSegment(slug)}`;
}
