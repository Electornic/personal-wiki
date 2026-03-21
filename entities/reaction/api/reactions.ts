import {
  getAdminSupabaseClient,
  getServerSupabaseClient,
} from "@/shared/api/supabase/server";
import type { LibraryTab } from "@/lib/wiki/library";
import type { RecordReactionState } from "@/entities/record/model/types";

export class ReactionAuthError extends Error {
  constructor(message = "You must be signed in to react.") {
    super(message);
    this.name = "ReactionAuthError";
  }
}

function emptyReactionState(): RecordReactionState {
  return {
    isBookmarked: false,
    isLiked: false,
  };
}

export async function getReactionStateForRecord(
  recordId: string,
  userId?: string | null,
) {
  const states = await listReactionStatesForRecords([recordId], userId);
  return states.get(recordId) ?? emptyReactionState();
}

export async function listReactionStatesForRecords(
  recordIds: string[],
  userId?: string | null,
) {
  const uniqueRecordIds = [...new Set(recordIds.filter(Boolean))];
  const stateMap = new Map<string, RecordReactionState>();

  for (const recordId of uniqueRecordIds) {
    stateMap.set(recordId, emptyReactionState());
  }

  if (uniqueRecordIds.length === 0) {
    return stateMap;
  }

  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return stateMap;
  }

  const resolvedUserId =
    userId !== undefined
      ? userId
      : (
          await supabase.auth.getUser()
        ).data.user?.id ?? null;

  if (!resolvedUserId) {
    return stateMap;
  }

  const [{ data: bookmarks }, { data: likes }] = await Promise.all([
    supabase
      .from("record_bookmarks")
      .select("record_id")
      .eq("user_id", resolvedUserId)
      .in("record_id", uniqueRecordIds),
    supabase
      .from("record_likes")
      .select("record_id")
      .eq("user_id", resolvedUserId)
      .in("record_id", uniqueRecordIds),
  ]);

  for (const bookmark of bookmarks ?? []) {
    const current = stateMap.get(bookmark.record_id) ?? emptyReactionState();
    stateMap.set(bookmark.record_id, {
      ...current,
      isBookmarked: true,
    });
  }

  for (const like of likes ?? []) {
    const current = stateMap.get(like.record_id) ?? emptyReactionState();
    stateMap.set(like.record_id, {
      ...current,
      isLiked: true,
    });
  }

  return stateMap;
}

export async function toggleBookmarkForRecord(recordId: string) {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase server configuration is missing.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ReactionAuthError("You must be signed in to bookmark.");
  }

  const existing = await supabase
    .from("record_bookmarks")
    .select("record_id")
    .eq("record_id", recordId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.data) {
    const { error } = await supabase
      .from("record_bookmarks")
      .delete()
      .eq("record_id", recordId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    return { active: false };
  }

  const { error } = await supabase.from("record_bookmarks").insert({
    record_id: recordId,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { active: true };
}

export async function toggleLikeForRecord(recordId: string) {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase server configuration is missing.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ReactionAuthError("You must be signed in to like.");
  }

  const existing = await supabase
    .from("record_likes")
    .select("record_id")
    .eq("record_id", recordId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.data) {
    const { error } = await supabase
      .from("record_likes")
      .delete()
      .eq("record_id", recordId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    return { active: false };
  }

  const { error } = await supabase.from("record_likes").insert({
    record_id: recordId,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { active: true };
}

export async function listReactionRecordIds(tab: LibraryTab) {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  if (!userId) {
    return [];
  }

  const table = tab === "likes" ? "record_likes" : "record_bookmarks";
  const result = await supabase
    .from(table)
    .select("record_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (result.error || !result.data) {
    return [];
  }

  return result.data.map((row) => row.record_id);
}

export async function listReactionTotalsForRecords(recordIds: string[]) {
  const uniqueRecordIds = [...new Set(recordIds.filter(Boolean))];
  const totals = new Map<string, number>();

  for (const recordId of uniqueRecordIds) {
    totals.set(recordId, 0);
  }

  if (uniqueRecordIds.length === 0) {
    return totals;
  }

  const adminSupabase = getAdminSupabaseClient();

  if (!adminSupabase) {
    return totals;
  }

  const [{ data: bookmarks }, { data: likes }] = await Promise.all([
    adminSupabase
      .from("record_bookmarks")
      .select("record_id")
      .in("record_id", uniqueRecordIds),
    adminSupabase
      .from("record_likes")
      .select("record_id")
      .in("record_id", uniqueRecordIds),
  ]);

  for (const bookmark of bookmarks ?? []) {
    totals.set(bookmark.record_id, (totals.get(bookmark.record_id) ?? 0) + 1);
  }

  for (const like of likes ?? []) {
    totals.set(like.record_id, (totals.get(like.record_id) ?? 0) + 1);
  }

  return totals;
}
