"use server";

import { revalidatePath } from "next/cache";

import { createCommentForRecord } from "@/lib/wiki/comments";

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
