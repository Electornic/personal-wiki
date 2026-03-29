"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteDocumentById,
  upsertDocument,
} from "@/entities/record/api/documents";
import type { DocumentFormState, SourceType } from "@/entities/record/model/types";
import { getAdminSupabaseClient, getServerSupabaseClient } from "@/shared/api/supabase/server";
import { getAuthRedirectUrl, hasAuthoringEnv } from "@/shared/config/env";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import { buildLibraryHref, buildRecordCacheTag } from "@/lib/wiki/routes";
import {
  normalizeUserName,
  profileUserNameTaken,
  upsertProfileRow,
} from "@/lib/wiki/profiles";

function getAuthTab(formData: FormData, fallback: "signin" | "signup") {
  const tab = String(formData.get("tab") ?? "").trim().toLowerCase();
  return tab === "signup" || tab === "signin" ? tab : fallback;
}

function authRedirect(tab: "signin" | "signup", params?: Record<string, string>) {
  const search = new URLSearchParams({ tab });

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      search.set(key, value);
    }
  }

  redirect(`/author/sign-in?${search.toString()}`);
}

function parseDocumentPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const sourceType = String(formData.get("sourceType") ?? "book") as SourceType;
  const visibility = String(formData.get("visibility") ?? "private") as
    | "public"
    | "private";
  const bookTitle = String(formData.get("bookTitle") ?? "").trim();
  const contents = String(formData.get("contents") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const documentId = String(formData.get("documentId") ?? "").trim();

  return {
    documentId: documentId || undefined,
    title,
    contents,
    sourceType,
    bookTitle: bookTitle || null,
    visibility,
    tags,
  };
}

function parseStagedImagePayload(formData: FormData) {
  const rawIds = String(formData.get("stagedImageIds") ?? "[]");
  let ids: string[] = [];

  try {
    const parsed = JSON.parse(rawIds);
    ids = Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    ids = [];
  }

  const files = formData
    .getAll("stagedImages")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  return {
    ids,
    files,
  };
}

export async function signUpWithPassword(formData: FormData) {
  const tab = getAuthTab(formData, "signup");

  if (!hasAuthoringEnv()) {
    authRedirect(tab, { error: "config" });
  }

  const supabase = await getServerSupabaseClient();
  const adminSupabase = getAdminSupabaseClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const userName = normalizeUserName(String(formData.get("userName") ?? ""));

  if (!supabase || !adminSupabase) {
    authRedirect(tab, { error: "config" });
  }

  const safeSupabase = supabase!;
  const safeAdminSupabase = adminSupabase!;

  if (!email || !password || !userName) {
    authRedirect(tab, { error: "missing-signup-fields" });
  }

  if (password.length < 8) {
    authRedirect(tab, { error: "weak-password" });
  }

  if (await profileUserNameTaken(safeAdminSupabase, userName)) {
    authRedirect(tab, { error: "user-name-taken" });
  }

  const { data, error } = await safeSupabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });

  if (error) {
    authRedirect(tab, {
      error: "signup-failed",
    });
  }

  if (data.user) {
    await upsertProfileRow(safeAdminSupabase, {
      id: data.user.id,
      email,
      userName,
    });
  }

  if (data.session) {
    redirect("/author");
  }

  authRedirect("signin", { success: "signed-up" });
}

export async function signInWithPassword(formData: FormData) {
  const tab = getAuthTab(formData, "signin");

  if (!hasAuthoringEnv()) {
    authRedirect(tab, { error: "config" });
  }

  const supabase = await getServerSupabaseClient();
  const adminSupabase = getAdminSupabaseClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!supabase || !adminSupabase) {
    authRedirect(tab, { error: "config" });
  }

  const safeSupabase = supabase!;
  const safeAdminSupabase = adminSupabase!;

  if (!email || !password) {
    authRedirect(tab, { error: "missing-login-fields" });
  }

  const { data, error } = await safeSupabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    authRedirect(tab, {
      error: "login-failed",
    });
  }

  if (data.user) {
    await upsertProfileRow(safeAdminSupabase, {
      id: data.user.id,
      email,
      userName: null,
    });
  }

  redirect("/author");
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
  const stagedImages = parseStagedImagePayload(formData);

  if (!payload.title || !payload.contents) {
    return {
      error: "title and contents are required.",
    } satisfies DocumentFormState;
  }

  if (payload.sourceType === "book" && !payload.bookTitle) {
    return {
      error: "book records require a book title.",
    } satisfies DocumentFormState;
  }

  if (payload.tags.length === 0) {
    return {
      error: "At least one tag is required for recommendations.",
    } satisfies DocumentFormState;
  }

  let slug: string;

  try {
    slug = await upsertDocument({
      ...payload,
      stagedImages,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "문서를 저장하지 못했습니다.",
    } satisfies DocumentFormState;
  }

  revalidatePath("/");
  revalidatePath("/author");
  revalidatePath(buildLibraryHref(slug));
  revalidateTag("public-discovery", "max");
  revalidateTag(buildRecordCacheTag(slug), "max");

  redirect("/author?saved=1");
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

  let deletedSlug: string | null = null;

  try {
    deletedSlug = await deleteDocumentById(documentId);
  } catch {
    redirect("/author?error=delete");
  }

  revalidatePath("/");
  revalidatePath("/author");
  revalidateTag("public-discovery", "max");

  if (deletedSlug) {
    revalidatePath(buildLibraryHref(deletedSlug));
    revalidateTag(buildRecordCacheTag(deletedSlug), "max");
  }

  redirect("/author?deleted=1");
}
