import { describe, expect, it } from "vitest";

import {
  buildTopicHref,
  decodeRouteSegment,
  encodeRouteSegment,
} from "@/lib/wiki/routes";

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

  it("builds topic hrefs from unicode labels", () => {
    expect(buildTopicHref("칸나 리딩")).toBe("/topics/%EC%B9%B8%EB%82%98%20%EB%A6%AC%EB%94%A9");
  });
});
