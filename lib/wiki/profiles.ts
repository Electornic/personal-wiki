import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileRow = {
  id: string;
  email: string;
  user_name?: string | null;
};

function fallbackUserName(email: string) {
  return email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}_-]+/gu, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeUserName(userName: string) {
  return userName
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}_ -]+/gu, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function getProfileForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const result = await supabase
    .from("profiles")
    .select("id, email, user_name")
    .eq("id", userId)
    .maybeSingle();

  if (result.error || !result.data) {
    return null;
  }

  return result.data as ProfileRow;
}

export async function profileUserNameTaken(
  supabase: SupabaseClient,
  userName: string,
) {
  const normalized = normalizeUserName(userName);

  const profilesResult = await supabase
    .from("profiles")
    .select("id")
    .eq("user_name", normalized)
    .limit(1);

  if (!profilesResult.error) {
    return Boolean(profilesResult.data?.length);
  }

  return false;
}

export async function upsertProfileRow(
  supabase: SupabaseClient,
  input: { id: string; email: string; userName?: string | null },
) {
  const normalizedUserName = normalizeUserName(
    input.userName || fallbackUserName(input.email),
  );

  const result = await supabase
    .from("profiles")
    .upsert(
      {
        id: input.id,
        email: input.email.toLowerCase(),
        user_name: normalizedUserName,
      },
      { onConflict: "id" },
    )
    .select("id, email, user_name")
    .single();

  if (result.error || !result.data) {
    throw new Error(result.error?.message ?? "Unable to upsert profile.");
  }

  return result.data as ProfileRow;
}
