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
