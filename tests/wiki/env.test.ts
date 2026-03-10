import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("hasAuthoringEnv", () => {
  it("requires service role and owner email", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("SUPABASE_OWNER_EMAIL", "owner@example.com");

    const { hasAuthoringEnv } = await import("@/lib/env");

    expect(hasAuthoringEnv()).toBe(false);
  });

  it("returns true when the full authoring contract exists", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
    vi.stubEnv("SUPABASE_OWNER_EMAIL", "owner@example.com");

    const { hasAuthoringEnv } = await import("@/lib/env");

    expect(hasAuthoringEnv()).toBe(true);
  });
});
