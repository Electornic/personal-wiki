import { describe, expect, it } from "vitest";

import { createSlug } from "@/lib/wiki/slugs";

describe("createSlug", () => {
  it("normalizes spaces and strips unsupported characters", () => {
    expect(createSlug("Atomic Habits! 101")).toBe("atomic-habits-101");
  });

  it("keeps non-latin letters when they are valid title characters", () => {
    expect(createSlug("첫번째 아티클")).toBe("첫번째-아티클");
  });

  it("falls back when a title has no usable characters", () => {
    expect(createSlug("!!!")).toBe("untitled-document");
  });
});
