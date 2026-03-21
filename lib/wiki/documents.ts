import {
  getAdminSupabaseClient,
  getPublicSupabaseClient,
  getServerSupabaseClient,
} from "@/lib/supabase/server";
import { cache } from "react";
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

function mapRecord(row: Record<string, unknown>, tags: string[]): WikiDocument {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    contents: String(row.contents ?? "").trim() || String(row.title),
    sourceType: row.source_type as SourceType,
    bookTitle: (row.book_title as string | null) ?? (row.source_type === "book" ? String(row.title) : null),
    visibility: row.visibility as DocumentVisibility,
    writerName: String(row.author_name ?? "unknown"),
    publishedAt: (row.published_at as string | null) ?? null,
    tags,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  } satisfies WikiDocument;
}

type RecordTagRow = {
  record_id: string;
  tag_id?: string;
  tags?: { name?: string | null } | Array<{ name?: string | null }> | null;
};

function getTagNameFromRow(tagRow: RecordTagRow) {
  const tag = Array.isArray(tagRow.tags) ? tagRow.tags[0] : tagRow.tags;
  return typeof tag?.name === "string" ? tag.name : null;
}

function buildTagMap(tagRows: RecordTagRow[]) {
  const tagMap = new Map<string, string[]>();

  for (const tagRow of tagRows) {
    const tagName = getTagNameFromRow(tagRow);

    if (!tagName) {
      continue;
    }

    const current = tagMap.get(tagRow.record_id) ?? [];
    current.push(tagName);
    tagMap.set(tagRow.record_id, current);
  }

  return tagMap;
}

function mapRowsToDocuments(
  recordRows: Array<Record<string, unknown>>,
  tagRows: RecordTagRow[],
) {
  const tagMap = buildTagMap(tagRows);

  return recordRows.map((row) => mapRecord(row, tagMap.get(String(row.id)) ?? []));
}

async function fetchTagRowsForRecordIds(
  recordIds: string[],
  useServerClient = false,
) {
  const uniqueRecordIds = [...new Set(recordIds.filter(Boolean))];

  if (uniqueRecordIds.length === 0) {
    return [] as RecordTagRow[];
  }

  const supabase = useServerClient
    ? await getServerSupabaseClient()
    : getPublicSupabaseClient();

  if (!supabase) {
    return [] as RecordTagRow[];
  }

  const { data, error } = await supabase
    .from("record_tags")
    .select("record_id, tag_id, tags(name)")
    .in("record_id", uniqueRecordIds);

  if (error || !data) {
    return [] as RecordTagRow[];
  }

  return data as RecordTagRow[];
}

const fetchRecordsFromSupabase = cache(async function fetchRecordsFromSupabase() {
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: recordRows, error: recordsError } = await supabase
    .from("records")
    .select("*")
    .eq("visibility", "public")
    .order("updated_at", { ascending: false });

  if (recordsError || !recordRows) {
    return null;
  }

  const tagRows = await fetchTagRowsForRecordIds(recordRows.map((row) => String(row.id)));

  return mapRowsToDocuments(recordRows, tagRows);
});

export const listPublicDocuments = cache(async function listPublicDocuments() {
  if (!hasSupabaseEnv()) {
    return sortByUpdatedAt(filterReadableDocuments(demoDocuments));
  }

  const documents = await fetchRecordsFromSupabase();

  if (!documents) {
    return [];
  }

  return sortByUpdatedAt(filterReadableDocuments(documents));
});

export const listAuthorDocuments = cache(async function listAuthorDocuments() {
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

  const { data: recordRows, error: recordsError } = await supabase
    .from("records")
    .select("*")
    .eq("writer_user_id", user.id)
    .order("updated_at", { ascending: false });

  if (recordsError || !recordRows) {
    return [];
  }

  const tagRows = await fetchTagRowsForRecordIds(
    recordRows.map((row) => String(row.id)),
    true,
  );

  return sortByUpdatedAt(mapRowsToDocuments(recordRows, tagRows));
});

export const getPublicDocumentBySlug = cache(async function getPublicDocumentBySlug(
  slug: string,
) {
  const normalizedSlug = normalizeRouteSlug(slug);

  if (!hasSupabaseEnv()) {
    const documents = await listPublicDocuments();
    return documents.find((document) => document.slug === normalizedSlug) ?? null;
  }

  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: row, error } = await supabase
    .from("records")
    .select("*")
    .eq("slug", normalizedSlug)
    .eq("visibility", "public")
    .maybeSingle();

  if (error || !row) {
    return null;
  }

  const tagRows = await fetchTagRowsForRecordIds([String(row.id)]);
  return mapRowsToDocuments([row], tagRows)[0] ?? null;
});

export const getAuthorDocumentById = cache(async function getAuthorDocumentById(
  documentId: string,
) {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    const documents = await listAuthorDocuments();
    return documents.find((document) => document.id === documentId) ?? null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: row, error } = await supabase
    .from("records")
    .select("*")
    .eq("id", documentId)
    .eq("writer_user_id", user.id)
    .maybeSingle();

  if (error || !row) {
    return null;
  }

  const tagRows = await fetchTagRowsForRecordIds([String(row.id)], true);
  return mapRowsToDocuments([row], tagRows)[0] ?? null;
});

export async function listRelatedDocumentsForDocument(
  document: WikiDocument,
  limit = 3,
) {
  if (!hasSupabaseEnv()) {
    const documents = await listPublicDocuments();
    return getRelatedDocuments(document, documents, limit);
  }

  const supabase = getPublicSupabaseClient();

  if (!supabase || document.tags.length === 0) {
    return [];
  }

  const sourceTagRows = await fetchTagRowsForRecordIds([document.id]);
  const sourceTagIds = [...new Set(sourceTagRows.map((row) => row.tag_id).filter(Boolean))];

  if (sourceTagIds.length === 0) {
    return [];
  }

  const { data: candidateTagRows, error: candidateTagsError } = await supabase
    .from("record_tags")
    .select("record_id, tag_id, tags(name)")
    .in("tag_id", sourceTagIds)
    .neq("record_id", document.id);

  if (candidateTagsError || !candidateTagRows) {
    return [];
  }

  const candidateIds = [...new Set(candidateTagRows.map((row) => row.record_id).filter(Boolean))];

  if (candidateIds.length === 0) {
    return [];
  }

  const { data: candidateRows, error: candidatesError } = await supabase
    .from("records")
    .select("*")
    .in("id", candidateIds)
    .eq("visibility", "public");

  if (candidatesError || !candidateRows) {
    return [];
  }

  const candidateTagDetails = await fetchTagRowsForRecordIds(candidateIds);
  const candidateDocuments = mapRowsToDocuments(candidateRows, candidateTagDetails);

  return getRelatedDocuments(document, candidateDocuments, limit);
}

export async function listDocumentsByIds(recordIds: string[]) {
  const uniqueRecordIds = [...new Set(recordIds.filter(Boolean))];

  if (uniqueRecordIds.length === 0) {
    return [];
  }

  const serverSupabase = await getServerSupabaseClient();
  const publicSupabase = getPublicSupabaseClient();
  const supabase = serverSupabase ?? publicSupabase;

  if (!supabase) {
    return demoDocuments.filter((document) => uniqueRecordIds.includes(document.id));
  }

  const { data: recordRows, error: recordsError } = await supabase
    .from("records")
    .select("*")
    .in("id", uniqueRecordIds);

  if (recordsError || !recordRows) {
    return [];
  }

  const tagRows = await fetchTagRowsForRecordIds(uniqueRecordIds, Boolean(serverSupabase));
  const documents = mapRowsToDocuments(recordRows, tagRows);

  const orderedDocuments: WikiDocument[] = [];

  for (const recordId of uniqueRecordIds) {
    const document = documents.find((candidate) => candidate.id === recordId);

    if (document) {
      orderedDocuments.push(document);
    }
  }

  return orderedDocuments;
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
        .insert({
          ...payload,
          published_at: new Date().toISOString().slice(0, 10),
        })
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
