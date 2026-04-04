"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { createCommentForRecord } from "@/entities/comment/api/comments";
import {
  ReactionAccessError,
  ReactionAuthError,
  toggleBookmarkForRecord,
  toggleLikeForRecord,
} from "@/entities/reaction/api/reactions";
import { buildLibraryHref, buildRecordCacheTag } from "@/lib/wiki/routes";

export async function createCommentAction(
  _previousState: { error?: string },
  formData: FormData,
) {
  const recordId = String(formData.get("recordId") ?? "").trim();
  const recordSlug = String(formData.get("recordSlug") ?? "").trim();
  const parentCommentId = String(formData.get("parentCommentId") ?? "").trim();
  const contents = String(formData.get("contents") ?? "").trim();

  if (!recordId || !contents) {
    return { error: "recordId and contents are required." };
  }

  try {
    await createCommentForRecord({
      recordId,
      contents,
      parentCommentId: parentCommentId || null,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to create comment.",
    };
  }

  revalidatePath("/");
  if (recordSlug) {
    revalidatePath(buildLibraryHref(recordSlug));
    revalidateTag(buildRecordCacheTag(recordSlug), "max");
  }
  return {};
}

function getReactionPayload(formData: FormData) {
  const recordId = String(formData.get("recordId") ?? "").trim();
  const recordSlug = String(formData.get("recordSlug") ?? "").trim();

  if (!recordId) {
    throw new Error("recordId is required.");
  }

  return {
    recordId,
    recordSlug,
  };
}

export async function toggleBookmarkAction(formData: FormData) {
  const { recordId, recordSlug } = getReactionPayload(formData);

  try {
    await toggleBookmarkForRecord(recordId);
  } catch (error) {
    if (error instanceof ReactionAuthError) {
      redirect("/author/sign-in");
    }

    if (error instanceof ReactionAccessError) {
    if (recordSlug) {
        redirect(buildLibraryHref(recordSlug));
      }

      redirect("/");
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/author/library");
  if (recordSlug) {
    revalidatePath(buildLibraryHref(recordSlug));
    revalidateTag(buildRecordCacheTag(recordSlug), "max");
  }
}

export async function toggleLikeAction(formData: FormData) {
  const { recordId, recordSlug } = getReactionPayload(formData);

  try {
    await toggleLikeForRecord(recordId);
  } catch (error) {
    if (error instanceof ReactionAuthError) {
      redirect("/author/sign-in");
    }

    if (error instanceof ReactionAccessError) {
    if (recordSlug) {
        redirect(buildLibraryHref(recordSlug));
      }

      redirect("/");
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/author/library");
  revalidateTag("public-discovery", "max");
  if (recordSlug) {
    revalidatePath(buildLibraryHref(recordSlug));
    revalidateTag(buildRecordCacheTag(recordSlug), "max");
  }
}
