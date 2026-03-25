import { redirect } from "next/navigation";
import { cache } from "react";

import { getServerSupabaseClient } from "@/shared/api/supabase/server";
import { hasAuthoringEnv } from "@/shared/config/env";
import { getProfileForUser } from "@/lib/wiki/profiles";

const getVerifiedAuthUser = cache(async function getVerifiedAuthUser() {
  if (!hasAuthoringEnv()) {
    return {
      configured: false,
      user: null,
    };
  }

  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return {
      configured: false,
      user: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    configured: true,
    user: user ?? null,
  };
});

export const getAuthStatus = cache(async function getAuthStatus() {
  const { configured, user } = await getVerifiedAuthUser();

  return {
    configured,
    isAuthenticated: Boolean(user),
  };
});

export const getAuthorAccess = cache(async function getAuthorAccess() {
  const { configured, user } = await getVerifiedAuthUser();

  if (!configured) {
    return {
      configured: false,
      isAuthenticated: false,
      userId: null as string | null,
      userEmail: null as string | null,
      userName: null as string | null,
    };
  }

  const email = user?.email?.toLowerCase() ?? null;
  const supabase = user ? await getServerSupabaseClient() : null;
  const profile = user && supabase ? await getProfileForUser(supabase, user.id) : null;

  return {
    configured: true,
    isAuthenticated: Boolean(user),
    userId: user?.id ?? null,
    userEmail: email,
    userName: profile?.user_name ?? null,
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
