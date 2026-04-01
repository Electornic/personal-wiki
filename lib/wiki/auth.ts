import { redirect } from "next/navigation";
import { cache } from "react";

import { getServerSupabaseClient } from "@/shared/api/supabase/server";
import { hasAuthoringEnv } from "@/shared/config/env";

function getUserNameFromMetadata(
  user: { user_metadata?: { user_name?: unknown; name?: unknown } } | null,
) {
  const candidate = user?.user_metadata?.user_name ?? user?.user_metadata?.name;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}

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

export const getViewerAccess = cache(async function getViewerAccess() {
  const { configured, user } = await getVerifiedAuthUser();

  return {
    configured,
    isAuthenticated: Boolean(user),
    userId: user?.id ?? null,
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
  const metadataUserName = getUserNameFromMetadata(user);

  return {
    configured: true,
    isAuthenticated: Boolean(user),
    userId: user?.id ?? null,
    userEmail: email,
    userName: metadataUserName,
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
