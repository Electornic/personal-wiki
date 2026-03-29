import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseAdminEnv,
  getSupabasePublicEnv,
  hasSupabaseAdminEnv,
  hasSupabaseEnv,
  shouldLogSupabaseQueries,
} from "@/shared/config/env";

function getSupabaseDebugFetch(label: string): typeof fetch | undefined {
  if (!shouldLogSupabaseQueries()) {
    return undefined;
  }

  return async (input, init) => {
    const request = input instanceof URL
      ? input
      : typeof input === "string"
        ? new URL(input)
        : new URL(input.url);
    const isSupabaseQuery = request.pathname.includes("/rest/v1/") || request.pathname.includes("/rpc/");

    if (isSupabaseQuery) {
      const currentCount =
        ((globalThis as typeof globalThis & { __supabaseQueryCount?: number }).__supabaseQueryCount ?? 0) + 1;

      (globalThis as typeof globalThis & { __supabaseQueryCount?: number }).__supabaseQueryCount = currentCount;

      const queryTarget = `${request.pathname}${request.search}`;
      const method = init?.method ?? (
        typeof input === "string" || input instanceof URL
          ? "GET"
          : input.method || "GET"
      );

      console.log(`[supabase:${label}] #${currentCount} ${method} ${queryTarget}`);
    }

    return fetch(input, init);
  };
}

export async function getServerSupabaseClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const cookieStore = await cookies();
  const env = getSupabasePublicEnv();

  return createServerClient(env.url!, env.anonKey!, {
    cookies: {
      encode: "tokens-only",
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components cannot always mutate cookies. Route handlers and server actions persist sessions.
        }
      },
    },
    global: {
      fetch: getSupabaseDebugFetch("server"),
    },
  });
}

export function getPublicSupabaseClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const env = getSupabasePublicEnv();

  return createClient(env.url!, env.anonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: getSupabaseDebugFetch("public"),
    },
  });
}

export function getAdminSupabaseClient() {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const env = getSupabaseAdminEnv();

  return createClient(env.url!, env.serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: getSupabaseDebugFetch("admin"),
    },
  });
}

export function getRouteHandlerSupabaseClient(
  request: NextRequest,
  response: NextResponse,
) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const env = getSupabasePublicEnv();

  return createServerClient(env.url!, env.anonKey!, {
    cookies: {
      encode: "tokens-only",
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
    global: {
      fetch: getSupabaseDebugFetch("route"),
    },
  });
}
