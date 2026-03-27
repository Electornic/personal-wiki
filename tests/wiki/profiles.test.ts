import { describe, expect, it } from "vitest";

import { normalizeUserName } from "@/lib/wiki/profiles";

describe("normalizeUserName", () => {
  it("normalizes spacing and lowercases the value", () => {
    expect(normalizeUserName("My Name")).toBe("my_name");
  });

  it("keeps unicode letters and strips unsupported symbols", () => {
    expect(normalizeUserName("준_Lee!!")).toBe("준_lee");
  });

  it("removes unsupported punctuation while preserving readable unicode text", () => {
    expect(normalizeUserName("마크다운/리딩 노트✨")).toBe("마크다운리딩_노트");
  });
});
