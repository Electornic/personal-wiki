import { describe, expect, it } from "vitest";

import { decodeRouteSegment, encodeRouteSegment } from "@/lib/wiki/routes";

describe("route segment helpers", () => {
  it("encodes unicode route segments safely", () => {
    expect(encodeRouteSegment("칸나")).toBe("%EC%B9%B8%EB%82%98");
  });

  it("decodes encoded unicode route segments", () => {
    expect(decodeRouteSegment("%EC%B9%B8%EB%82%98")).toBe("칸나");
  });

  it("returns the original value when decoding fails", () => {
    expect(decodeRouteSegment("%E0%A4%A")).toBe("%E0%A4%A");
  });
});
