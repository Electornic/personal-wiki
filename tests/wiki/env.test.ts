import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("hasAuthoringEnv", () => {
  it("requires the service role in addition to public env", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const { hasAuthoringEnv } = await import("@/shared/config/env");

    expect(hasAuthoringEnv()).toBe(false);
  });

  it("returns true when public env and service role exist", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");

    const { hasAuthoringEnv } = await import("@/shared/config/env");

    expect(hasAuthoringEnv()).toBe(true);
  });
});
