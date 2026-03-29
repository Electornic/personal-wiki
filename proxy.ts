import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { getSupabasePublicEnv, hasSupabaseEnv } from "@/shared/config/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const isServerActionRequest = request.headers.has("next-action");
  const isMutationRequest =
    request.method !== "GET" && request.method !== "HEAD";

  // Server Action multipart requests can contain non-ASCII form content.
  // Bypass proxy/session refresh on mutations to avoid request cloning issues.
  if (isServerActionRequest || isMutationRequest) {
    return response;
  }

  if (!hasSupabaseEnv()) {
    return response;
  }

  const env = getSupabasePublicEnv();
  const supabase = createServerClient(env.url!, env.anonKey!, {
    cookies: {
      encode: "tokens-only",
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
