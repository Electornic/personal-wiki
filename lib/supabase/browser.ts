"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv, hasSupabaseEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

export function getBrowserSupabaseClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (!browserClient) {
    const env = getSupabasePublicEnv();

    browserClient = createBrowserClient(env.url!, env.anonKey!);
  }

  return browserClient;
}
