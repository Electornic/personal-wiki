import { describe, expect, it } from "vitest";

import { sanitizeNextPath } from "@/lib/wiki/navigation";

describe("sanitizeNextPath", () => {
  it("keeps safe relative paths", () => {
    expect(sanitizeNextPath("/author/documents/new")).toBe("/author/documents/new");
  });

  it("rejects absolute or protocol-relative redirects", () => {
    expect(sanitizeNextPath("https://evil.example.com")).toBe("/author");
    expect(sanitizeNextPath("//evil.example.com")).toBe("/author");
  });

  it("falls back for empty values", () => {
    expect(sanitizeNextPath("")).toBe("/author");
    expect(sanitizeNextPath(null)).toBe("/author");
  });
});
