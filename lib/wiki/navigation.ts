export function sanitizeNextPath(next: string | null | undefined) {
  if (!next) {
    return "/author";
  }

  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/author";
  }

  return next;
}
