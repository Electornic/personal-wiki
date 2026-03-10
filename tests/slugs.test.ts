import { describe, expect, it } from "vitest";

import { createSlug } from "@/lib/wiki/slugs";

describe("createSlug", () => {
  it("normalizes spaces and strips unsupported characters", () => {
    expect(createSlug("Atomic Habits! 101")).toBe("atomic-habits-101");
  });
});
