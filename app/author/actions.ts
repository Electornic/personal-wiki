"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthRedirectUrl, getOwnerEmail, hasAuthoringEnv } from "@/lib/env";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import { deleteDocumentById, upsertDocument } from "@/lib/wiki/documents";
import type { DocumentFormState, SourceType } from "@/lib/wiki/types";

type NoteCardDraft = {
  heading?: string;
  content?: string;
};

function parseDocumentPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const sourceTitle = String(formData.get("sourceTitle") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();
  const sourceType = String(formData.get("sourceType") ?? "book") as SourceType;
  const visibility = String(formData.get("visibility") ?? "private") as
    | "public"
    | "private";
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const isbn = String(formData.get("isbn") ?? "").trim();
  const publishedAt = String(formData.get("publishedAt") ?? "").trim();
  const intro = String(formData.get("intro") ?? "").trim();
  const topics = String(formData.get("topics") ?? "")
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean);
  const documentId = String(formData.get("documentId") ?? "").trim();

  const noteCards = new Map<number, NoteCardDraft>();

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^card(Heading|Content)-(\d+)$/);

    if (!match) {
      continue;
    }

    const field = match[1];
    const index = Number(match[2]);
    const current = noteCards.get(index) ?? {};

    if (field === "Heading") {
      current.heading = String(value).trim();
    }

    if (field === "Content") {
      current.content = String(value).trim();
    }

    noteCards.set(index, current);
  }

  return {
    documentId: documentId || undefined,
    title,
    sourceTitle,
    authorName,
    sourceType,
    visibility,
    sourceUrl: sourceUrl || null,
    isbn: isbn || null,
    publishedAt: publishedAt || null,
    intro: intro || null,
    topics,
    noteCards: [...noteCards.entries()]
      .sort((left, right) => left[0] - right[0])
      .map(([index, noteCard]) => ({
        position: index,
        heading: noteCard.heading || null,
        content: noteCard.content || "",
      }))
      .filter((noteCard) => noteCard.content.length > 0),
  };
}

export async function requestMagicLink() {
  if (!hasAuthoringEnv()) {
    redirect("/author/sign-in?error=config");
  }

  const supabase = await getServerSupabaseClient();
  const ownerEmail = getOwnerEmail();

  if (!supabase || !ownerEmail) {
    redirect("/author/sign-in?error=config");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: ownerEmail,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });

  if (error) {
    redirect("/author/sign-in?error=send");
  }

  redirect("/author/sign-in?sent=1");
}

export async function signOut() {
  const supabase = await getServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}

export async function saveDocument(
  _previousState: DocumentFormState,
  formData: FormData,
) {
  const access = await requireAuthorAccess();

  if (!access.configured) {
    return {
      error: "Supabase 환경변수가 없어 저장을 진행할 수 없습니다.",
    } satisfies DocumentFormState;
  }

  const payload = parseDocumentPayload(formData);

  if (!payload.title || !payload.sourceTitle || !payload.authorName) {
    return {
      error: "title, source title, author name은 필수입니다.",
    } satisfies DocumentFormState;
  }

  if (payload.topics.length === 0) {
    return {
      error: "적어도 하나의 태그를 입력해야 추천을 만들 수 있습니다.",
    } satisfies DocumentFormState;
  }

  if (payload.noteCards.length === 0) {
    return {
      error: "연결된 생각 카드가 최소 한 개는 필요합니다.",
    } satisfies DocumentFormState;
  }

  try {
    const slug = await upsertDocument(payload);

    revalidatePath("/");
    revalidatePath("/author");
    revalidatePath(`/library/${slug}`);

    redirect("/author?saved=1");
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "문서를 저장하지 못했습니다.",
    } satisfies DocumentFormState;
  }
}

export async function deleteDocument(formData: FormData) {
  const access = await requireAuthorAccess();

  if (!access.configured) {
    redirect("/author?error=config");
  }

  const documentId = String(formData.get("documentId") ?? "").trim();

  if (!documentId) {
    redirect("/author?error=missing-document");
  }

  try {
    await deleteDocumentById(documentId);

    revalidatePath("/");
    revalidatePath("/author");

    redirect("/author?deleted=1");
  } catch {
    redirect("/author?error=delete");
  }
}
