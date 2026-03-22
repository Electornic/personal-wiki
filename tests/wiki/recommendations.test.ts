import { describe, expect, it } from "vitest";

import { demoDocuments } from "@/lib/wiki/demo-data";
import { getRelatedDocuments } from "@/lib/wiki/recommendations";

describe("getRelatedDocuments", () => {
  it("ranks by shared tag count, then more recent document date, and excludes the source document", () => {
    const [source, ...candidates] = demoDocuments;

    const related = getRelatedDocuments(source, candidates, 3);

    expect(related[0]?.slug).toBe("seeing-like-a-designer");
    expect(related[1]?.slug).toBe("how-to-take-smart-notes");
    expect(related.some((document) => document.id === source.id)).toBe(false);
    expect(related.every((document) => document.sharedTagCount > 0)).toBe(true);
  });

  it("filters out private documents before scoring", () => {
    const source = demoDocuments[1];

    const related = getRelatedDocuments(source, demoDocuments, 5);

    expect(
      related.find((document) => document.slug === "private-reading-log"),
    ).toBeUndefined();
  });
});
