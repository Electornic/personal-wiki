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

export async function getProfilesForUsers(
  supabase: SupabaseClient,
  userIds: string[],
) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueUserIds.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const result = await supabase
    .from("profiles")
    .select("id, email, user_name")
    .in("id", uniqueUserIds);

  if (result.error || !result.data) {
    return new Map<string, ProfileRow>();
  }

  return new Map(
    (result.data as ProfileRow[]).map((profile) => [profile.id, profile]),
  );
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
  let normalizedUserName: string;

  if (input.userName) {
    normalizedUserName = normalizeUserName(input.userName);
  } else {
    const existingProfile = await getProfileForUser(supabase, input.id);
    normalizedUserName = normalizeUserName(
      existingProfile?.user_name || fallbackUserName(input.email),
    );
  }

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
