import { redirect } from "next/navigation";
import { cache } from "react";

import { hasAuthoringEnv } from "@/lib/env";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { getProfileForUser } from "@/lib/wiki/profiles";

export const getAuthorAccess = cache(async function getAuthorAccess() {
  if (!hasAuthoringEnv()) {
    return {
      configured: false,
      isAuthenticated: false,
      userId: null as string | null,
      userEmail: null as string | null,
      userName: null as string | null,
    };
  }

  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return {
      configured: false,
      isAuthenticated: false,
      userId: null as string | null,
      userEmail: null as string | null,
      userName: null as string | null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase() ?? null;
  const profile = user ? await getProfileForUser(supabase, user.id) : null;

  return {
    configured: true,
    isAuthenticated: Boolean(user),
    userId: user?.id ?? null,
    userEmail: email,
    userName: profile?.user_name ?? null,
  };
});

export const getHeaderAuthState = cache(async function getHeaderAuthState() {
  if (!hasAuthoringEnv()) {
    return {
      configured: false,
      isAuthenticated: false,
    };
  }

  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return {
      configured: false,
      isAuthenticated: false,
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    configured: true,
    isAuthenticated: Boolean(session?.user),
  };
});

export async function requireAuthorAccess() {
  const access = await getAuthorAccess();

  if (!access.configured) {
    return access;
  }

  if (!access.isAuthenticated) {
    redirect("/author/sign-in");
  }

  return access;
}
