"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCommentForRecord } from "@/lib/wiki/comments";
import { toggleBookmarkForRecord, toggleLikeForRecord } from "@/lib/wiki/reactions";

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
    revalidatePath(`/library/${recordSlug}`);
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
  } catch {
    redirect("/author/sign-in");
  }

  revalidatePath("/");
  revalidatePath("/me/library");
  if (recordSlug) {
    revalidatePath(`/library/${recordSlug}`);
  }
}

export async function toggleLikeAction(formData: FormData) {
  const { recordId, recordSlug } = getReactionPayload(formData);

  try {
    await toggleLikeForRecord(recordId);
  } catch {
    redirect("/author/sign-in");
  }

  revalidatePath("/");
  revalidatePath("/me/library");
  if (recordSlug) {
    revalidatePath(`/library/${recordSlug}`);
  }
}
