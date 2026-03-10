import { redirect } from "next/navigation";

import { getOwnerEmail, hasSupabaseEnv } from "@/lib/env";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function getAuthorAccess() {
  if (!hasSupabaseEnv()) {
    return {
      configured: false,
      isOwner: false,
      userEmail: null as string | null,
    };
  }

  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return {
      configured: false,
      isOwner: false,
      userEmail: null as string | null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase() ?? null;
  const ownerEmail = getOwnerEmail();

  return {
    configured: true,
    isOwner: Boolean(email && ownerEmail && email === ownerEmail),
    userEmail: email,
  };
}

export async function requireAuthorAccess() {
  const access = await getAuthorAccess();

  if (!access.configured) {
    return access;
  }

  if (!access.isOwner) {
    redirect("/author/sign-in");
  }

  return access;
}
