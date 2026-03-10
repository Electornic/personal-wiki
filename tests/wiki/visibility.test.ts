import { describe, expect, it } from "vitest";

import { demoDocuments } from "@/lib/wiki/demo-data";
import {
  canReadDocument,
  filterReadableDocuments,
  isPublicVisibility,
} from "@/lib/wiki/visibility";

describe("visibility helpers", () => {
  it("treats public visibility as readable", () => {
    expect(isPublicVisibility("public")).toBe(true);
    expect(canReadDocument(demoDocuments[0])).toBe(true);
  });

  it("filters private documents from public surfaces", () => {
    const readableDocuments = filterReadableDocuments(demoDocuments);

    expect(
      readableDocuments.every((document) => document.visibility === "public"),
    ).toBe(true);
    expect(readableDocuments).toHaveLength(3);
  });
});
