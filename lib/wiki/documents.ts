import {
  getAdminSupabaseClient,
  getPublicSupabaseClient,
  getServerSupabaseClient,
} from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { demoDocuments } from "@/lib/wiki/demo-data";
import { getRelatedDocuments } from "@/lib/wiki/recommendations";
import { createSlug } from "@/lib/wiki/slugs";
import type {
  DocumentVisibility,
  SourceType,
  WikiDocument,
} from "@/lib/wiki/types";
import { filterReadableDocuments } from "@/lib/wiki/visibility";

function sortByUpdatedAt(documents: WikiDocument[]) {
  return [...documents].sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function normalizeRouteSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function mapRecord(row: Record<string, unknown>, tags: string[]) {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    contents: String(row.contents ?? "").trim() || String(row.title),
    sourceType: row.source_type as SourceType,
    bookTitle:
      (row.book_title as string | null) ??
      (row.source_type === "book" ? ((row.source_title as string | null) ?? null) : null),
    visibility: row.visibility as DocumentVisibility,
    writerName: String(row.author_name ?? "unknown"),
    publishedAt: (row.published_at as string | null) ?? null,
    tags,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  } satisfies WikiDocument;
}

async function fetchRecordsFromSupabase() {
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return null;
  }

  const [{ data: recordRows, error: recordsError }, { data: tagRows, error: tagsError }] =
    await Promise.all([
      supabase
        .from("records")
        .select("*")
        .order("updated_at", { ascending: false }),
      supabase
        .from("record_tags")
        .select("record_id, tags(name)"),
    ]);

  if (recordsError || tagsError || !recordRows) {
    return null;
  }

  return recordRows.map((row) => {
    const tags = (tagRows ?? [])
      .filter((tagRow) => tagRow.record_id === row.id)
      .map((tagRow) => {
        const tag = Array.isArray(tagRow.tags) ? tagRow.tags[0] : tagRow.tags;

        return typeof tag?.name === "string" ? tag.name : null;
      })
      .filter((tag): tag is string => Boolean(tag));

    return mapRecord(row, tags);
  });
}

export async function listPublicDocuments() {
  if (!hasSupabaseEnv()) {
    return sortByUpdatedAt(filterReadableDocuments(demoDocuments));
  }

  const documents = await fetchRecordsFromSupabase();

  if (!documents) {
    return [];
  }

  return sortByUpdatedAt(filterReadableDocuments(documents));
}

export async function listAuthorDocuments() {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return sortByUpdatedAt(demoDocuments);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const [{ data: recordRows, error: recordsError }, { data: tagRows, error: tagsError }] =
    await Promise.all([
      supabase
        .from("records")
        .select("*")
        .eq("writer_user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("record_tags")
        .select("record_id, tags(name)"),
    ]);

  if (recordsError || tagsError || !recordRows) {
    return [];
  }

  return sortByUpdatedAt(
    recordRows.map((row) => {
      const tags = (tagRows ?? [])
        .filter((tagRow) => tagRow.record_id === row.id)
        .map((tagRow) => {
          const tag = Array.isArray(tagRow.tags) ? tagRow.tags[0] : tagRow.tags;

          return typeof tag?.name === "string" ? tag.name : null;
        })
        .filter((tag): tag is string => Boolean(tag));

      return mapRecord(row, tags);
    }),
  );
}

export async function getPublicDocumentBySlug(slug: string) {
  const documents = await listPublicDocuments();
  const normalizedSlug = normalizeRouteSlug(slug);

  return documents.find((document) => document.slug === normalizedSlug) ?? null;
}

export async function getAuthorDocumentById(documentId: string) {
  const documents = await listAuthorDocuments();

  return documents.find((document) => document.id === documentId) ?? null;
}

export async function listRelatedDocuments(slug: string, limit = 3) {
  const documents = await listPublicDocuments();
  const normalizedSlug = normalizeRouteSlug(slug);
  const document = documents.find((candidate) => candidate.slug === normalizedSlug);

  if (!document) {
    return [];
  }

  return getRelatedDocuments(document, documents, limit);
}

type UpsertDocumentInput = {
  documentId?: string;
  title: string;
  contents: string;
  sourceType: SourceType;
  bookTitle?: string | null;
  visibility: DocumentVisibility;
  tags: string[];
};

export async function upsertDocument(input: UpsertDocumentInput) {
  const supabase = await getServerSupabaseClient();
  const adminSupabase = getAdminSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase server configuration is missing.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to save a document.");
  }

  const slug = createSlug(input.title);
  const payload = {
    writer_user_id: user.id,
    slug,
    title: input.title,
    contents: input.contents,
    source_type: input.sourceType,
    book_title: input.sourceType === "book" ? input.bookTitle || null : null,
    visibility: input.visibility,
    author_name: user.user_metadata?.user_name || user.email || "unknown",
    source_title: input.sourceType === "book" ? input.bookTitle || input.title : input.title,
    source_url: null,
    isbn: null,
    published_at: new Date().toISOString().slice(0, 10),
    intro: null,
  };

  const { data: savedDocument, error: saveDocumentError } = input.documentId
    ? await supabase
        .from("records")
        .update(payload)
        .eq("id", input.documentId)
        .eq("writer_user_id", user.id)
        .select("id, slug")
        .single()
    : await supabase
        .from("records")
        .insert(payload)
        .select("id, slug")
        .single();

  if (saveDocumentError || !savedDocument) {
    throw new Error(saveDocumentError?.message ?? "Failed to save document.");
  }

  const documentId = savedDocument.id;

  await supabase.from("record_tags").delete().eq("record_id", documentId);

  if (input.tags.length > 0) {
    const normalizedTags = [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))];
    const tagsClient = adminSupabase ?? supabase;
    const tagRecords = await Promise.all(
      normalizedTags.map(async (tag) => {
        const slugValue = createSlug(tag);
        const { data, error } = await tagsClient
          .from("tags")
          .upsert({ name: tag, slug: slugValue }, { onConflict: "slug" })
          .select("id")
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to save tag.");
        }

        return data;
      }),
    );

    const { error: tagsLinkError } = await supabase.from("record_tags").insert(
      tagRecords.map((tagRecord) => ({
        record_id: documentId,
        tag_id: tagRecord.id,
      })),
    );

    if (tagsLinkError) {
      throw new Error(tagsLinkError.message);
    }
  }

  return savedDocument.slug;
}

export async function deleteDocumentById(documentId: string) {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase server configuration is missing.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to delete a document.");
  }

  const { error } = await supabase
    .from("records")
    .delete()
    .eq("id", documentId)
    .eq("writer_user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
