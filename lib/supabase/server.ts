import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseAdminEnv,
  getSupabasePublicEnv,
  hasSupabaseAdminEnv,
  hasSupabaseEnv,
} from "@/lib/env";

export async function getServerSupabaseClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const cookieStore = await cookies();
  const env = getSupabasePublicEnv();

  return createServerClient(env.url!, env.anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
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
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
