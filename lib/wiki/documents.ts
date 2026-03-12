import {
  getPublicSupabaseClient,
  getServerSupabaseClient,
} from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { demoDocuments } from "@/lib/wiki/demo-data";
import { getRelatedDocuments } from "@/lib/wiki/recommendations";
import { createSlug } from "@/lib/wiki/slugs";
import type {
  DocumentNoteCard,
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

function mapDocument(row: Record<string, unknown>, topics: string[], noteCards: DocumentNoteCard[]) {
  const contentsFromCards = noteCards
    .map((noteCard) =>
      noteCard.heading
        ? `## ${noteCard.heading}\n${noteCard.content}`
        : noteCard.content,
    )
    .join("\n\n");

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    contents:
      String(row.contents ?? "").trim() ||
      String(row.intro ?? "").trim() ||
      contentsFromCards ||
      String(row.title),
    sourceType: row.source_type as SourceType,
    bookTitle:
      (row.book_title as string | null) ??
      (row.source_type === "book" ? ((row.source_title as string | null) ?? null) : null),
    visibility: row.visibility as DocumentVisibility,
    writerName: String(row.author_name ?? "unknown"),
    publishedAt: (row.published_at as string | null) ?? null,
    tags: topics,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  } satisfies WikiDocument;
}

async function fetchDocumentsFromSupabase() {
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return null;
  }

  const [{ data: documentRows, error: documentsError }, { data: topicRows, error: topicsError }, { data: noteCardRows, error: noteCardsError }] =
    await Promise.all([
      supabase
        .from("documents")
        .select("*")
        .order("updated_at", { ascending: false }),
      supabase
        .from("document_topics")
        .select("document_id, topics(name)"),
      supabase
        .from("document_note_cards")
        .select("*")
        .order("position", { ascending: true }),
    ]);

  if (documentsError || topicsError || noteCardsError || !documentRows) {
    return null;
  }

  return documentRows.map((row) => {
    const topics = (topicRows ?? [])
      .filter((topicRow) => topicRow.document_id === row.id)
      .map((topicRow) => {
        const topic = Array.isArray(topicRow.topics)
          ? topicRow.topics[0]
          : topicRow.topics;

        return typeof topic?.name === "string" ? topic.name : null;
      })
      .filter((topic): topic is string => Boolean(topic));

    const noteCards = (noteCardRows ?? [])
      .filter((noteCardRow) => noteCardRow.document_id === row.id)
      .map((noteCardRow) => ({
        id: noteCardRow.id,
        heading: noteCardRow.heading,
        content: noteCardRow.content,
        position: noteCardRow.position,
      }));

    return mapDocument(row, topics, noteCards);
  });
}

export async function listPublicDocuments() {
  if (!hasSupabaseEnv()) {
    return sortByUpdatedAt(filterReadableDocuments(demoDocuments));
  }

  const documents = await fetchDocumentsFromSupabase();

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

  const [{ data: documentRows, error: documentsError }, { data: topicRows, error: topicsError }, { data: noteCardRows, error: noteCardsError }] =
    await Promise.all([
      supabase
        .from("documents")
        .select("*")
        .eq("created_by", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("document_topics")
        .select("document_id, topics(name)"),
      supabase
        .from("document_note_cards")
        .select("*")
        .order("position", { ascending: true }),
    ]);

  if (documentsError || topicsError || noteCardsError || !documentRows) {
    return [];
  }

  return sortByUpdatedAt(
    documentRows.map((row) => {
      const topics = (topicRows ?? [])
        .filter((topicRow) => topicRow.document_id === row.id)
        .map((topicRow) => {
          const topic = Array.isArray(topicRow.topics)
            ? topicRow.topics[0]
            : topicRow.topics;

          return typeof topic?.name === "string" ? topic.name : null;
        })
        .filter((topic): topic is string => Boolean(topic));

      const noteCards = (noteCardRows ?? [])
        .filter((noteCardRow) => noteCardRow.document_id === row.id)
        .map((noteCardRow) => ({
          id: noteCardRow.id,
          heading: noteCardRow.heading,
          content: noteCardRow.content,
          position: noteCardRow.position,
        }));

      return mapDocument(row, topics, noteCards);
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
    created_by: user.id,
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
        .from("documents")
        .update(payload)
        .eq("id", input.documentId)
        .eq("created_by", user.id)
        .select("id, slug")
        .single()
    : await supabase
        .from("documents")
        .insert(payload)
        .select("id, slug")
        .single();

  if (saveDocumentError || !savedDocument) {
    throw new Error(saveDocumentError?.message ?? "Failed to save document.");
  }

  const documentId = savedDocument.id;

  await supabase.from("document_topics").delete().eq("document_id", documentId);
  await supabase.from("document_note_cards").delete().eq("document_id", documentId);

  if (input.tags.length > 0) {
    const normalizedTopics = [...new Set(input.tags.map((topic) => topic.trim()).filter(Boolean))];
    const topicRecords = await Promise.all(
      normalizedTopics.map(async (topic) => {
        const slugValue = createSlug(topic);
        const { data, error } = await supabase
          .from("topics")
          .upsert({ name: topic, slug: slugValue }, { onConflict: "slug" })
          .select("id")
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? "Failed to save topic.");
        }

        return data;
      }),
    );

    const { error: topicsLinkError } = await supabase.from("document_topics").insert(
      topicRecords.map((topicRecord) => ({
        document_id: documentId,
        topic_id: topicRecord.id,
      })),
    );

    if (topicsLinkError) {
      throw new Error(topicsLinkError.message);
    }
  }

  await supabase.from("document_note_cards").delete().eq("document_id", documentId);

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
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("created_by", user.id);

  if (error) {
    throw new Error(error.message);
  }
}
