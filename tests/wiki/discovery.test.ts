import { describe, expect, it } from "vitest";

import { toDocumentPreview } from "@/entities/record/model/content";
import { applyDiscoveryState, isDefaultDiscoveryState } from "@/lib/wiki/discovery";
import { demoDocuments } from "@/lib/wiki/demo-data";

describe("applyDiscoveryState", () => {
  it("prefers published dates for newest sorting when available", () => {
    const sorted = applyDiscoveryState(
      [
        {
          ...demoDocuments[0],
          publishedAt: "2026-01-01",
          updatedAt: "2026-03-01T00:00:00.000Z",
        },
        {
          ...demoDocuments[1],
          publishedAt: "2026-02-01",
          updatedAt: "2026-02-15T00:00:00.000Z",
        },
      ],
      {
        query: "",
        sort: "newest",
        source: "all",
        tags: [],
        filtersOpen: false,
      },
    );

    expect(sorted[0]?.publishedAt).toBe("2026-02-01");
  });

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

  it("detects the default discovery state", () => {
    expect(
      isDefaultDiscoveryState({
        query: "",
        sort: "newest",
        source: "all",
        tags: [],
        filtersOpen: false,
      }),
    ).toBe(true);

    expect(
      isDefaultDiscoveryState({
        query: "design",
        sort: "newest",
        source: "all",
        tags: [],
        filtersOpen: false,
      }),
    ).toBe(false);
  });
});
