import {
  getAdminSupabaseClient,
  getServerSupabaseClient,
} from "@/lib/supabase/server";
import { getProfilesForUsers } from "@/lib/wiki/profiles";

export type RecordComment = {
  id: string;
  recordId: string;
  userId: string;
  userName: string;
  contents: string;
  parentCommentId?: string | null;
  depth: number;
  createdAt: string;
  updatedAt: string;
  replies: RecordComment[];
};

type CommentRow = {
  id: string;
  record_id: string;
  user_id: string;
  parent_comment_id: string | null;
  depth: number;
  contents: string;
  created_at: string;
  updated_at: string;
};

export async function listCommentsForRecord(recordId: string) {
  const supabase = await getServerSupabaseClient();
  const adminSupabase = getAdminSupabaseClient();

  if (!supabase) {
    return [] as RecordComment[];
  }

  const { data, error } = await supabase
    .from("record_comments")
    .select("id, record_id, user_id, parent_comment_id, depth, contents, created_at, updated_at")
    .eq("record_id", recordId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [] as RecordComment[];
  }

  const rows = data as CommentRow[];
  const uniqueUserIds = [...new Set(rows.map((row) => row.user_id))];
  const profiles = adminSupabase
    ? await getProfilesForUsers(adminSupabase, uniqueUserIds)
    : await getProfilesForUsers(supabase, uniqueUserIds);

  const comments = rows.map<RecordComment>((row) => ({
    id: row.id,
    recordId: row.record_id,
    userId: row.user_id,
    userName: profiles.get(row.user_id)?.user_name ?? "unknown",
    contents: row.contents,
    parentCommentId: row.parent_comment_id,
    depth: row.depth,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    replies: [],
  }));

  const byId = new Map(comments.map((comment) => [comment.id, comment]));
  const roots: RecordComment[] = [];

  for (const comment of comments) {
    if (comment.parentCommentId) {
      const parent = byId.get(comment.parentCommentId);

      if (parent) {
        parent.replies.push(comment);
        continue;
      }
    }

    roots.push(comment);
  }

  return roots;
}

export async function createCommentForRecord(input: {
  recordId: string;
  contents: string;
  parentCommentId?: string | null;
}) {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase server configuration is missing.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to comment.");
  }

  const trimmedContents = input.contents.trim();

  if (!trimmedContents) {
    throw new Error("Comment contents are required.");
  }

  let depth = 0;

  if (input.parentCommentId) {
    const parentResult = await supabase
      .from("record_comments")
      .select("id, depth, record_id")
      .eq("id", input.parentCommentId)
      .maybeSingle();

    if (parentResult.error || !parentResult.data) {
      throw new Error("Parent comment does not exist.");
    }

    if (parentResult.data.record_id !== input.recordId) {
      throw new Error("Parent comment belongs to a different record.");
    }

    depth = Number(parentResult.data.depth) + 1;

    if (depth > 5) {
      throw new Error("Comment reply depth cannot exceed 5.");
    }
  }

  const { error } = await supabase.from("record_comments").insert({
    record_id: input.recordId,
    user_id: user.id,
    parent_comment_id: input.parentCommentId ?? null,
    depth,
    contents: trimmedContents,
  });

  if (error) {
    throw new Error(error.message);
  }
}
