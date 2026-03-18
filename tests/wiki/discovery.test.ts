import { describe, expect, it } from "vitest";

import { applyDiscoveryState } from "@/lib/wiki/discovery";
import { toDocumentPreview } from "@/lib/wiki/content";
import { demoDocuments } from "@/lib/wiki/demo-data";

describe("applyDiscoveryState", () => {
  it("sorts by reaction totals when requested", () => {
    const totals = new Map<string, number>([
      [demoDocuments[0].id, 1],
      [demoDocuments[1].id, 4],
      [demoDocuments[2].id, 2],
    ]);

    const sorted = applyDiscoveryState(
      demoDocuments.filter((document) => document.visibility === "public"),
      {
        query: "",
        sort: "most-reacted",
        source: "all",
        tags: [],
        filtersOpen: true,
      },
      totals,
    );

    expect(sorted[0]?.id).toBe(demoDocuments[1].id);
    expect(sorted[1]?.id).toBe(demoDocuments[2].id);
  });

  it("filters by source and tag together", () => {
    const filtered = applyDiscoveryState(
      demoDocuments.filter((document) => document.visibility === "public"),
      {
        query: "",
        sort: "newest",
        source: "article",
        tags: ["design"],
        filtersOpen: true,
      },
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe("seeing-like-a-designer");
  });

  it("supports preview records without full contents", () => {
    const previews = demoDocuments
      .filter((document) => document.visibility === "public")
      .map((document) => toDocumentPreview(document));

    const filtered = applyDiscoveryState(previews, {
      query: "추천 모듈",
      sort: "newest",
      source: "all",
      tags: [],
      filtersOpen: false,
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe("seeing-like-a-designer");
  });
});
