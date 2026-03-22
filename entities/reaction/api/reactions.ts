import {
  getAdminSupabaseClient,
  getServerSupabaseClient,
} from "@/shared/api/supabase/server";
import type { RecordReactionState } from "@/entities/record/model/types";

export class ReactionAuthError extends Error {
  constructor(message = "You must be signed in to react.") {
    super(message);
    this.name = "ReactionAuthError";
  }
}

export class ReactionAccessError extends Error {
  constructor(message = "Reactions are available on public records only.") {
    super(message);
    this.name = "ReactionAccessError";
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

export async function getLikeCountForRecord(recordId: string) {
  const totals = await listLikeTotalsForRecords([recordId]);
  return totals.get(recordId) ?? 0;
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

  await assertPublicRecordForReaction(recordId);

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

  await assertPublicRecordForReaction(recordId);

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

async function assertPublicRecordForReaction(recordId: string) {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase server configuration is missing.");
  }

  const { data: record, error } = await supabase
    .from("records")
    .select("visibility")
    .eq("id", recordId)
    .maybeSingle();

  if (error || !record) {
    throw new Error(error?.message ?? "Record could not be found.");
  }

  if (record.visibility !== "public") {
    throw new ReactionAccessError();
  }
}

export async function listBookmarkRecordIds() {
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

  const result = await supabase
    .from("record_bookmarks")
    .select("record_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (result.error || !result.data) {
    return [];
  }

  return result.data.map((row) => row.record_id);
}

export async function listLikeTotalsForRecords(recordIds: string[]) {
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

  const { data: likes } = await adminSupabase
      .from("record_likes")
      .select("record_id")
      .in("record_id", uniqueRecordIds);

  for (const like of likes ?? []) {
    totals.set(like.record_id, (totals.get(like.record_id) ?? 0) + 1);
  }

  return totals;
}
