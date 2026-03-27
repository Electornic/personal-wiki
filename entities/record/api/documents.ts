import {
  getAdminSupabaseClient,
  getPublicSupabaseClient,
  getServerSupabaseClient,
} from "@/shared/api/supabase/server";
import { cache } from "react";
import { hasSupabaseEnv } from "@/shared/config/env";
import { demoDocuments } from "@/lib/wiki/demo-data";
import type { DiscoveryState } from "@/lib/wiki/discovery";
import {
  applyDiscoveryState,
  isDefaultDiscoveryState,
  sortDiscoveryDocuments,
} from "@/lib/wiki/discovery";
import { getProfilesForUsers } from "@/lib/wiki/profiles";
import { getRelatedDocuments } from "@/lib/wiki/recommendations";
import { createSlug } from "@/lib/wiki/slugs";
import type {
  DocumentVisibility,
  SourceType,
  WikiDocument,
} from "@/entities/record/model/types";
import { listLikeTotalsForRecords } from "@/entities/reaction/api/reactions";
import { filterReadableDocuments } from "@/lib/wiki/visibility";

export const AUTHOR_WORKSPACE_PAGE_SIZE = 8;
export const PUBLIC_LIBRARY_PAGE_SIZE = 8;

function getDocumentSortTime(document: Pick<WikiDocument, "publishedAt" | "updatedAt">) {
  return new Date(document.publishedAt ?? document.updatedAt).getTime();
}

function sortByUpdatedAt(documents: WikiDocument[]) {
  return [...documents].sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function sortByRecentDocumentDate(documents: WikiDocument[]) {
  return [...documents].sort((left, right) => {
    return getDocumentSortTime(right) - getDocumentSortTime(left);
  });
}

function normalizeRouteSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function normalizePage(page: number) {
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function normalizeDiscoveryTag(tag: string) {
  return tag.trim().toLowerCase();
}

function paginateDocuments(
  documents: WikiDocument[],
  page: number,
  pageSize: number,
) {
  const resolvedPage = normalizePage(page);
  const resolvedPageSize = Math.max(1, Math.floor(pageSize));
  const totalCount = documents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPageSize));
  const currentPage = Math.min(resolvedPage, totalPages);
  const startIndex = (currentPage - 1) * resolvedPageSize;

  return {
    documents: documents.slice(startIndex, startIndex + resolvedPageSize),
    totalCount,
    totalPages,
    page: currentPage,
    pageSize: resolvedPageSize,
  };
}

function paginateIds(
  ids: string[],
  page: number,
  pageSize: number,
) {
  const resolvedPage = normalizePage(page);
  const resolvedPageSize = Math.max(1, Math.floor(pageSize));
  const totalCount = ids.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPageSize));
  const currentPage = Math.min(resolvedPage, totalPages);
  const startIndex = (currentPage - 1) * resolvedPageSize;

  return {
    ids: ids.slice(startIndex, startIndex + resolvedPageSize),
    totalCount,
    totalPages,
    page: currentPage,
    pageSize: resolvedPageSize,
  };
}

function emptyPaginatedDocuments(pageSize: number) {
  return {
    documents: [] as WikiDocument[],
    totalCount: 0,
    totalPages: 1,
    page: 1,
    pageSize: Math.max(1, Math.floor(pageSize)),
  };
}

function mapRecord(
  row: Record<string, unknown>,
  tags: string[],
  writerName?: string | null,
): WikiDocument {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    contents: String(row.contents ?? "").trim() || String(row.title),
    sourceType: row.source_type as SourceType,
    bookTitle: (row.book_title as string | null) ?? (row.source_type === "book" ? String(row.title) : null),
    visibility: row.visibility as DocumentVisibility,
    writerName: writerName ?? String(row.author_name ?? "unknown"),
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

type DiscoverySortRow = {
  id: string;
  title: string;
  published_at: string | null;
  updated_at: string;
  reaction_count: number | null;
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

async function buildWriterNameMap(recordRows: Array<Record<string, unknown>>) {
  const adminSupabase = getAdminSupabaseClient();

  if (!adminSupabase) {
    return new Map<string, string>();
  }

  const writerIds = [
    ...new Set(
      recordRows
        .map((row) => String(row.writer_user_id ?? ""))
        .filter(Boolean),
    ),
  ];

  if (writerIds.length === 0) {
    return new Map<string, string>();
  }

  const profiles = await getProfilesForUsers(adminSupabase, writerIds);

  return new Map(
    writerIds
      .map((writerId) => [writerId, profiles.get(writerId)?.user_name])
      .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0),
  );
}

async function mapRowsToDocuments(
  recordRows: Array<Record<string, unknown>>,
  tagRows: RecordTagRow[],
) {
  const tagMap = buildTagMap(tagRows);
  const writerNameMap = await buildWriterNameMap(recordRows);

  return recordRows.map((row) =>
    mapRecord(
      row,
      tagMap.get(String(row.id)) ?? [],
      writerNameMap.get(String(row.writer_user_id ?? "")),
    ),
  );
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

  return await mapRowsToDocuments(recordRows, tagRows);
});

const listPublicRecordIds = cache(async function listPublicRecordIds() {
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return [] as string[];
  }

  const { data, error } = await supabase
    .from("records")
    .select("id")
    .eq("visibility", "public");

  if (error || !data) {
    return [] as string[];
  }

  return data.map((row) => String(row.id));
});

async function filterRecordIdsBySource(
  recordIds: string[],
  sourceType: SourceType,
  useServerClient = false,
) {
  const uniqueRecordIds = [...new Set(recordIds.filter(Boolean))];

  if (uniqueRecordIds.length === 0) {
    return [] as string[];
  }

  const supabase = useServerClient
    ? await getServerSupabaseClient()
    : getPublicSupabaseClient();

  if (!supabase) {
    return [] as string[];
  }

  const { data, error } = await supabase
    .from("records")
    .select("id")
    .in("id", uniqueRecordIds)
    .eq("source_type", sourceType);

  if (error || !data) {
    return [] as string[];
  }

  return data.map((row) => String(row.id));
}

async function filterRecordIdsBySelectedTags(
  recordIds: string[],
  selectedTags: string[],
  useServerClient = false,
) {
  const uniqueRecordIds = [...new Set(recordIds.filter(Boolean))];
  const normalizedTags = selectedTags.map((tag) => normalizeDiscoveryTag(tag)).filter(Boolean);

  if (uniqueRecordIds.length === 0 || normalizedTags.length === 0) {
    return uniqueRecordIds;
  }

  const tagRows = await fetchTagRowsForRecordIds(uniqueRecordIds, useServerClient);
  const tagMap = buildTagMap(tagRows);

  return uniqueRecordIds.filter((recordId) => {
    const tags = (tagMap.get(recordId) ?? []).map((tag) => normalizeDiscoveryTag(tag));
    return normalizedTags.every((tag) => tags.includes(tag));
  });
}

async function listRecordIdsMatchingDiscoveryQuery(
  recordIds: string[],
  query: string,
  useServerClient = false,
) {
  const uniqueRecordIds = [...new Set(recordIds.filter(Boolean))];
  const trimmedQuery = query.trim();

  if (uniqueRecordIds.length === 0 || !trimmedQuery) {
    return uniqueRecordIds;
  }

  const supabase = useServerClient
    ? await getServerSupabaseClient()
    : getPublicSupabaseClient();

  if (!supabase) {
    return [] as string[];
  }

  const pattern = `%${trimmedQuery}%`;
  const matchedIds = new Set<string>();
  const recordFieldQueries = ["title", "contents", "book_title"].map((field) =>
    supabase
      .from("records")
      .select("id")
      .in("id", uniqueRecordIds)
      .ilike(field, pattern),
  );

  const fieldResults = await Promise.all(recordFieldQueries);

  for (const result of fieldResults) {
    if (result.error || !result.data) {
      continue;
    }

    result.data.forEach((row) => matchedIds.add(String(row.id)));
  }

  const tagClient = supabase;
  const { data: tagMatches } = await tagClient
    .from("tags")
    .select("id")
    .ilike("name", pattern);

  const tagIds = [...new Set((tagMatches ?? []).map((row) => String(row.id)).filter(Boolean))];

  if (tagIds.length > 0) {
    const { data: recordTagMatches } = await tagClient
      .from("record_tags")
      .select("record_id")
      .in("record_id", uniqueRecordIds)
      .in("tag_id", tagIds);

    (recordTagMatches ?? []).forEach((row) => matchedIds.add(String(row.record_id)));
  }

  const profileClient = getAdminSupabaseClient() ?? supabase;
  const { data: profileMatches } = await profileClient
    .from("profiles")
    .select("id")
    .ilike("user_name", pattern);

  const writerIds = [...new Set((profileMatches ?? []).map((row) => String(row.id)).filter(Boolean))];

  if (writerIds.length > 0) {
    const { data: writerRecordMatches } = await supabase
      .from("records")
      .select("id")
      .in("id", uniqueRecordIds)
      .in("writer_user_id", writerIds);

    (writerRecordMatches ?? []).forEach((row) => matchedIds.add(String(row.id)));
  }

  return uniqueRecordIds.filter((recordId) => matchedIds.has(recordId));
}

async function listDiscoveryDocumentsPageFromIds(
  recordIds: string[],
  state: DiscoveryState,
  page: number,
  pageSize: number,
) {
  const uniqueRecordIds = [...new Set(recordIds.filter(Boolean))];

  if (uniqueRecordIds.length === 0) {
    return emptyPaginatedDocuments(pageSize);
  }

  const publicSupabase = getPublicSupabaseClient();
  const serverSupabase = await getServerSupabaseClient();
  const supabase = serverSupabase ?? publicSupabase;

  if (!supabase) {
    const documents = await listDocumentsByIds(uniqueRecordIds);
    const reactionTotals = state.sort === "most-reacted"
      ? await listLikeTotalsForRecords(uniqueRecordIds)
      : undefined;
    const filteredDocuments = applyDiscoveryState(documents, state, reactionTotals);

    return paginateDocuments(filteredDocuments, page, pageSize);
  }

  const { data: sortRows, error: sortRowsError } = await supabase
    .from("records")
    .select("id, title, published_at, updated_at, reaction_count")
    .in("id", uniqueRecordIds);

  if (sortRowsError || !sortRows) {
    return emptyPaginatedDocuments(pageSize);
  }

  const sortedRecordIds = sortDiscoveryDocuments(
    (sortRows as DiscoverySortRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      reactionCount: row.reaction_count ?? 0,
    })),
    state,
  ).map((row) => row.id);
  const paginated = paginateIds(sortedRecordIds, page, pageSize);
  const documents = await listDocumentsByIds(paginated.ids);

  return {
    documents,
    totalCount: paginated.totalCount,
    totalPages: paginated.totalPages,
    page: paginated.page,
    pageSize: paginated.pageSize,
  };
}

export const listPublicDocuments = cache(async function listPublicDocuments() {
  if (!hasSupabaseEnv()) {
    return sortByRecentDocumentDate(filterReadableDocuments(demoDocuments));
  }

  const documents = await fetchRecordsFromSupabase();

  if (!documents) {
    return [];
  }

  return sortByRecentDocumentDate(filterReadableDocuments(documents));
});

export async function listAvailableTagsForRecordIds(
  recordIds: string[],
  useServerClient = false,
) {
  const tagRows = await fetchTagRowsForRecordIds(recordIds, useServerClient);

  const tagNames = tagRows
    .map((row) => getTagNameFromRow(row))
    .filter((tagName): tagName is string => Boolean(tagName));

  return [...new Set(tagNames)].sort((left, right) => left.localeCompare(right));
}

export async function listAvailableTagsForPublicDocuments() {
  if (!hasSupabaseEnv()) {
    return [...new Set(filterReadableDocuments(demoDocuments).flatMap((document) => document.tags))]
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right));
  }

  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data: recordRows, error } = await supabase
    .from("records")
    .select("id")
    .eq("visibility", "public");

  if (error || !recordRows) {
    return [];
  }

  return listAvailableTagsForRecordIds(recordRows.map((row) => String(row.id)));
}

export async function listPublicDocumentsPage(
  page = 1,
  pageSize = PUBLIC_LIBRARY_PAGE_SIZE,
) {
  if (!hasSupabaseEnv()) {
    return paginateDocuments(
      sortByRecentDocumentDate(filterReadableDocuments(demoDocuments)),
      page,
      pageSize,
    );
  }

  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return {
      documents: [] as WikiDocument[],
      totalCount: 0,
      totalPages: 1,
      page: 1,
      pageSize: Math.max(1, Math.floor(pageSize)),
    };
  }

  const resolvedPage = normalizePage(page);
  const resolvedPageSize = Math.max(1, Math.floor(pageSize));
  const { count, error: countError } = await supabase
    .from("records")
    .select("id", { count: "exact", head: true })
    .eq("visibility", "public");

  if (countError) {
    return {
      documents: [] as WikiDocument[],
      totalCount: 0,
      totalPages: 1,
      page: 1,
      pageSize: resolvedPageSize,
    };
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPageSize));
  const currentPage = Math.min(resolvedPage, totalPages);
  const { data: recordRows, error: recordsError } = await supabase
    .from("records")
    .select("*")
    .eq("visibility", "public")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .range(
      (currentPage - 1) * resolvedPageSize,
      currentPage * resolvedPageSize - 1,
    );

  if (recordsError || !recordRows) {
    return {
      documents: [] as WikiDocument[],
      totalCount: 0,
      totalPages: 1,
      page: 1,
      pageSize: resolvedPageSize,
    };
  }

  const tagRows = await fetchTagRowsForRecordIds(recordRows.map((row) => String(row.id)));

  return {
    documents: await mapRowsToDocuments(recordRows, tagRows),
    totalCount,
    totalPages,
    page: currentPage,
    pageSize: resolvedPageSize,
  };
}

export async function listPublicDiscoveryPage(
  state: DiscoveryState,
  page = 1,
  pageSize = PUBLIC_LIBRARY_PAGE_SIZE,
) {
  if (isDefaultDiscoveryState(state)) {
    return listPublicDocumentsPage(page, pageSize);
  }

  if (!hasSupabaseEnv()) {
    const documents = sortByRecentDocumentDate(filterReadableDocuments(demoDocuments));
    const reactionTotals = state.sort === "most-reacted"
      ? await listLikeTotalsForRecords(documents.map((document) => document.id))
      : undefined;

    return paginateDocuments(
      applyDiscoveryState(documents, state, reactionTotals),
      page,
      pageSize,
    );
  }

  let candidateIds = await listPublicRecordIds();

  if (state.source !== "all") {
    candidateIds = await filterRecordIdsBySource(candidateIds, state.source);
  }

  if (state.tags.length > 0) {
    candidateIds = await filterRecordIdsBySelectedTags(candidateIds, state.tags);
  }

  if (state.query) {
    candidateIds = await listRecordIdsMatchingDiscoveryQuery(candidateIds, state.query);
  }

  return listDiscoveryDocumentsPageFromIds(candidateIds, state, page, pageSize);
}

export async function listDiscoveryDocumentsPageForRecordIds(
  recordIds: string[],
  state: DiscoveryState,
  page: number,
  pageSize: number,
  useServerClient = false,
) {
  let candidateIds = [...new Set(recordIds.filter(Boolean))];

  if (state.source !== "all") {
    candidateIds = await filterRecordIdsBySource(
      candidateIds,
      state.source,
      useServerClient,
    );
  }

  if (state.tags.length > 0) {
    candidateIds = await filterRecordIdsBySelectedTags(
      candidateIds,
      state.tags,
      useServerClient,
    );
  }

  if (state.query) {
    candidateIds = await listRecordIdsMatchingDiscoveryQuery(
      candidateIds,
      state.query,
      useServerClient,
    );
  }

  return listDiscoveryDocumentsPageFromIds(candidateIds, state, page, pageSize);
}

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

  return sortByUpdatedAt(await mapRowsToDocuments(recordRows, tagRows));
});

export async function listAuthorDocumentsPage(
  page = 1,
  pageSize = AUTHOR_WORKSPACE_PAGE_SIZE,
) {
  const resolvedPage = normalizePage(page);
  const resolvedPageSize = Math.max(1, Math.floor(pageSize));

  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return paginateDocuments(sortByUpdatedAt(demoDocuments), page, pageSize);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      documents: [] as WikiDocument[],
      totalCount: 0,
      totalPages: 1,
      page: 1,
      pageSize: resolvedPageSize,
    };
  }

  const { count, error: countError } = await supabase
    .from("records")
    .select("id", { count: "exact", head: true })
    .eq("writer_user_id", user.id);

  if (countError) {
    return {
      documents: [] as WikiDocument[],
      totalCount: 0,
      totalPages: 1,
      page: 1,
      pageSize: resolvedPageSize,
    };
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPageSize));
  const currentPage = Math.min(resolvedPage, totalPages);
  const { data: recordRows, error: recordsError } = await supabase
    .from("records")
    .select("*")
    .eq("writer_user_id", user.id)
    .order("updated_at", { ascending: false })
    .range(
      (currentPage - 1) * resolvedPageSize,
      currentPage * resolvedPageSize - 1,
    );

  if (recordsError || !recordRows) {
    return {
      documents: [] as WikiDocument[],
      totalCount: 0,
      totalPages: 1,
      page: 1,
      pageSize: resolvedPageSize,
    };
  }

  const tagRows = await fetchTagRowsForRecordIds(
    recordRows.map((row) => String(row.id)),
    true,
  );

  return {
    documents: sortByUpdatedAt(await mapRowsToDocuments(recordRows, tagRows)),
    totalCount,
    totalPages,
    page: currentPage,
    pageSize: resolvedPageSize,
  };
}

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
  return (await mapRowsToDocuments([row], tagRows))[0] ?? null;
});

export const getReadableDocumentBySlug = cache(async function getReadableDocumentBySlug(
  slug: string,
) {
  const normalizedSlug = normalizeRouteSlug(slug);

  if (!hasSupabaseEnv()) {
    const documents = await listPublicDocuments();
    return documents.find((document) => document.slug === normalizedSlug) ?? null;
  }

  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: row, error } = await supabase
    .from("records")
    .select("*")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (error || !row) {
    return null;
  }

  const tagRows = await fetchTagRowsForRecordIds([String(row.id)], true);
  return (await mapRowsToDocuments([row], tagRows))[0] ?? null;
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
  return (await mapRowsToDocuments([row], tagRows))[0] ?? null;
});

export async function listRelatedDocumentsForDocument(
  document: WikiDocument,
  limit = 3,
) {
  if (!hasSupabaseEnv()) {
    const documents = await listPublicDocuments();
    return getRelatedDocuments(document, documents, limit);
  }

  const serverSupabase = await getServerSupabaseClient();
  const publicSupabase = getPublicSupabaseClient();
  const supabase = serverSupabase ?? publicSupabase;

  if (!supabase || document.tags.length === 0) {
    return [];
  }

  const sourceTagRows = await fetchTagRowsForRecordIds([document.id], Boolean(serverSupabase));
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
    .in("id", candidateIds);

  if (candidatesError || !candidateRows) {
    return [];
  }

  const candidateTagDetails = await fetchTagRowsForRecordIds(
    candidateIds,
    Boolean(serverSupabase),
  );
  const candidateDocuments = await mapRowsToDocuments(candidateRows, candidateTagDetails);

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
  const documents = await mapRowsToDocuments(recordRows, tagRows);

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

function buildRecordPayload(
  input: UpsertDocumentInput,
  user: { id: string; email?: string | null; user_metadata?: { user_name?: unknown } },
) {
  return {
    writer_user_id: user.id,
    slug: createSlug(input.title),
    title: input.title,
    contents: input.contents,
    source_type: input.sourceType,
    book_title: input.sourceType === "book" ? input.bookTitle || null : null,
    visibility: input.visibility,
  };
}

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

  const payload = {
    ...buildRecordPayload(input, user),
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
