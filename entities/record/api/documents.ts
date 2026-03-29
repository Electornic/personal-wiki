import {
  getAdminSupabaseClient,
  getPublicSupabaseClient,
  getServerSupabaseClient,
} from "@/shared/api/supabase/server";
import { cache } from "react";
import { hasSupabaseEnv } from "@/shared/config/env";
import { demoDocuments } from "@/lib/wiki/demo-data";
import { getExcerpt } from "@/entities/record/model/content";
import type { DiscoveryState } from "@/lib/wiki/discovery";
import {
  applyDiscoveryState,
  isDefaultDiscoveryState,
  sortDiscoveryDocuments,
} from "@/lib/wiki/discovery";
import { getRelatedDocuments } from "@/lib/wiki/recommendations";
import { decodeRouteSegment } from "@/lib/wiki/routes";
import { createSlug } from "@/lib/wiki/slugs";
import type {
  DocumentVisibility,
  SourceType,
  WikiDocument,
  WikiDocumentListItem,
} from "@/entities/record/model/types";
import { listLikeTotalsForRecords } from "@/entities/reaction/api/reactions";
import { filterReadableDocuments } from "@/lib/wiki/visibility";

export const AUTHOR_WORKSPACE_PAGE_SIZE = 8;
export const PUBLIC_LIBRARY_PAGE_SIZE = 8;

const RECORD_DETAIL_SELECT = [
  "id",
  "slug",
  "title",
  "contents",
  "source_type",
  "book_title",
  "visibility",
  "author_name",
  "published_at",
  "created_at",
  "updated_at",
].join(", ");

const RECORD_LIST_SELECT = [
  "id",
  "slug",
  "title",
  "excerpt",
  "source_type",
  "book_title",
  "author_name",
  "published_at",
  "updated_at",
  "reaction_count",
].join(", ");

type RecordRow = {
  id: string;
  slug: string;
  title: string;
  contents?: string | null;
  excerpt?: string | null;
  source_type: SourceType;
  book_title?: string | null;
  visibility?: DocumentVisibility;
  author_name?: string | null;
  writer_user_id?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at: string;
  reaction_count?: number | null;
};

type PaginatedDocuments<T> = {
  documents: T[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

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

function sortListItemsByRecentDocumentDate(documents: WikiDocumentListItem[]) {
  return [...documents].sort((left, right) => {
    return getDocumentSortTime(right) - getDocumentSortTime(left);
  });
}

function normalizeRouteSlug(slug: string) {
  return decodeRouteSegment(slug);
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

function paginateDocuments<T>(
  documents: T[],
  page: number,
  pageSize: number,
): PaginatedDocuments<T> {
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

function emptyPaginatedDocuments<T>(pageSize: number): PaginatedDocuments<T> {
  return {
    documents: [] as T[],
    totalCount: 0,
    totalPages: 1,
    page: 1,
    pageSize: Math.max(1, Math.floor(pageSize)),
  };
}

function mapRecordToDocument(row: RecordRow, tags: string[]): WikiDocument {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    contents: String(row.contents ?? "").trim() || String(row.title),
    sourceType: row.source_type,
    bookTitle: row.book_title ?? (row.source_type === "book" ? String(row.title) : null),
    visibility: row.visibility ?? "public",
    writerName: String(row.author_name ?? "unknown"),
    publishedAt: row.published_at ?? null,
    tags,
    createdAt: String(row.created_at ?? row.updated_at),
    updatedAt: String(row.updated_at),
  } satisfies WikiDocument;
}

function mapRecordToListItem(
  row: RecordRow,
  tags: string[],
): WikiDocumentListItem {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? "").trim() || getExcerpt(String(row.contents ?? row.title)),
    sourceType: row.source_type,
    bookTitle: row.book_title ?? (row.source_type === "book" ? String(row.title) : null),
    writerName: String(row.author_name ?? "unknown"),
    publishedAt: row.published_at ?? null,
    tags,
    updatedAt: String(row.updated_at),
  } satisfies WikiDocumentListItem;
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

async function mapRowsToDocuments(
  recordRows: RecordRow[],
  tagRows: RecordTagRow[],
) {
  const tagMap = buildTagMap(tagRows);
  return recordRows.map((row) => mapRecordToDocument(row, tagMap.get(String(row.id)) ?? []));
}

async function mapRowsToListItems(
  recordRows: RecordRow[],
  tagRows: RecordTagRow[],
) {
  const tagMap = buildTagMap(tagRows);
  return recordRows.map((row) => mapRecordToListItem(row, tagMap.get(String(row.id)) ?? []));
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
    .select(RECORD_DETAIL_SELECT)
    .eq("visibility", "public")
    .order("updated_at", { ascending: false });

  if (recordsError || !recordRows) {
    return null;
  }

  const typedRecordRows = recordRows as unknown as RecordRow[];
  const tagRows = await fetchTagRowsForRecordIds(
    typedRecordRows.map((row) => String(row.id)),
  );

  return await mapRowsToDocuments(typedRecordRows, tagRows);
});

function mapDocumentToListItem(document: WikiDocument): WikiDocumentListItem {
  return {
    id: document.id,
    slug: document.slug,
    title: document.title,
    excerpt: getExcerpt(document.contents),
    sourceType: document.sourceType,
    bookTitle: document.bookTitle ?? null,
    writerName: document.writerName,
    publishedAt: document.publishedAt ?? null,
    tags: document.tags,
    updatedAt: document.updatedAt,
  } satisfies WikiDocumentListItem;
}

function emptyPaginatedListItems(pageSize: number) {
  return emptyPaginatedDocuments<WikiDocumentListItem>(pageSize);
}

function applyListSortOrder<
  T extends {
    order: (
      column: string,
      options?: { ascending?: boolean; nullsFirst?: boolean },
    ) => T;
  },
>(
  query: T,
  sort: DiscoveryState["sort"],
) {
  if (sort === "oldest") {
    return query
      .order("published_at", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: true });
  }

  if (sort === "title-asc") {
    return query.order("title", { ascending: true });
  }

  if (sort === "title-desc") {
    return query.order("title", { ascending: false });
  }

  if (sort === "most-reacted") {
    return query
      .order("reaction_count", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false });
  }

  return query
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });
}

async function listPublicRecordIdsForSelectedTags(selectedTags: string[]) {
  const supabase = getPublicSupabaseClient();
  const tagSlugs = [...new Set(
    selectedTags
      .map((tag) => createSlug(tag))
      .filter(Boolean),
  )];

  if (!supabase || tagSlugs.length === 0) {
    return [] as string[];
  }

  const { data: tagRows, error: tagsError } = await supabase
    .from("tags")
    .select("id, slug")
    .in("slug", tagSlugs);

  if (tagsError || !tagRows || tagRows.length === 0) {
    return [];
  }

  if (tagRows.length !== tagSlugs.length) {
    return [];
  }

  const tagIds = tagRows.map((row) => String(row.id));
  const { data, error } = await supabase
    .from("record_tags")
    .select("record_id, tag_id")
    .in("tag_id", tagIds);

  if (error || !data) {
    return [] as string[];
  }

  const counts = new Map<string, Set<string>>();

  for (const row of data as Array<{ record_id?: string; tag_id?: string }>) {
    const recordId = String(row.record_id ?? "");
    const tagId = String(row.tag_id ?? "");

    if (!recordId || !tagId) {
      continue;
    }

    const current = counts.get(recordId) ?? new Set<string>();
    current.add(tagId);
    counts.set(recordId, current);
  }

  return [...counts.entries()]
    .filter(([, recordTagIds]) => recordTagIds.size === tagIds.length)
    .map(([recordId]) => recordId);
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

  if (!useServerClient) {
    const rpcResult = await supabase.rpc("search_public_records", {
      search_query: trimmedQuery,
    });

    if (!rpcResult.error && Array.isArray(rpcResult.data)) {
      const matchedIds = new Set(
        rpcResult.data.map((row) => String((row as { id?: string }).id ?? "")).filter(Boolean),
      );

      return uniqueRecordIds.filter((recordId) => matchedIds.has(recordId));
    }
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

  const { data: authorMatches } = await supabase
    .from("records")
    .select("id")
    .in("id", uniqueRecordIds)
    .ilike("author_name", pattern);

  (authorMatches ?? []).forEach((row) => matchedIds.add(String(row.id)));

  return uniqueRecordIds.filter((recordId) => matchedIds.has(recordId));
}

async function resolvePublicDiscoveryRecordIds(state: DiscoveryState) {
  let candidateIds: string[] | null = null;

  if (state.tags.length > 0) {
    candidateIds = await listPublicRecordIdsForSelectedTags(state.tags);

    if (candidateIds.length === 0) {
      return [];
    }
  }

  if (state.query) {
    const querySupersetIds = candidateIds ?? (await listPublicRecordIds());
    const queryMatchedIds = await listRecordIdsMatchingDiscoveryQuery(
      querySupersetIds,
      state.query,
      false,
    );

    candidateIds = candidateIds
      ? candidateIds.filter((recordId) => queryMatchedIds.includes(recordId))
      : queryMatchedIds;
  }

  return candidateIds;
}

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

async function listPublicRecordListPage(
  state: Pick<DiscoveryState, "sort" | "source">,
  page: number,
  pageSize: number,
  candidateIds?: string[] | null,
): Promise<PaginatedDocuments<WikiDocumentListItem>> {
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return emptyPaginatedListItems(pageSize);
  }

  const uniqueCandidateIds = candidateIds
    ? [...new Set(candidateIds.filter(Boolean))]
    : null;

  if (uniqueCandidateIds && uniqueCandidateIds.length === 0) {
    return emptyPaginatedListItems(pageSize);
  }

  const resolvedPage = normalizePage(page);
  const resolvedPageSize = Math.max(1, Math.floor(pageSize));
  let countQuery = supabase
    .from("records")
    .select("id", { count: "exact", head: true })
    .eq("visibility", "public");

  if (state.source !== "all") {
    countQuery = countQuery.eq("source_type", state.source);
  }

  if (uniqueCandidateIds) {
    countQuery = countQuery.in("id", uniqueCandidateIds);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    return emptyPaginatedListItems(resolvedPageSize);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedPageSize));
  const currentPage = Math.min(resolvedPage, totalPages);

  let rowsQuery = supabase
    .from("records")
    .select(RECORD_LIST_SELECT)
    .eq("visibility", "public");

  if (state.source !== "all") {
    rowsQuery = rowsQuery.eq("source_type", state.source);
  }

  if (uniqueCandidateIds) {
    rowsQuery = rowsQuery.in("id", uniqueCandidateIds);
  }

  const { data: recordRows, error: recordsError } = await applyListSortOrder(
    rowsQuery,
    state.sort,
  ).range(
    (currentPage - 1) * resolvedPageSize,
    currentPage * resolvedPageSize - 1,
  );

  if (recordsError || !recordRows) {
    return emptyPaginatedListItems(resolvedPageSize);
  }

  const typedRecordRows = recordRows as unknown as RecordRow[];
  const tagRows = await fetchTagRowsForRecordIds(
    typedRecordRows.map((row) => String(row.id)),
  );

  return {
    documents: await mapRowsToListItems(typedRecordRows, tagRows),
    totalCount,
    totalPages,
    page: currentPage,
    pageSize: resolvedPageSize,
  };
}

async function listDiscoveryDocumentsPageFromIds(
  recordIds: string[],
  state: DiscoveryState,
  page: number,
  pageSize: number,
  useServerClient = false,
) {
  const uniqueRecordIds = [...new Set(recordIds.filter(Boolean))];

  if (uniqueRecordIds.length === 0) {
    return emptyPaginatedDocuments<WikiDocument>(pageSize);
  }

  const supabase = useServerClient
    ? await getServerSupabaseClient()
    : getPublicSupabaseClient();
  let reactionTotals: Map<string, number> | undefined;

  if (!supabase) {
    const documents = await listDocumentsByIds(uniqueRecordIds, useServerClient);
    reactionTotals = state.sort === "most-reacted"
      ? await listLikeTotalsForRecords(uniqueRecordIds)
      : undefined;
    const filteredDocuments = applyDiscoveryState(documents, state, reactionTotals);

    return paginateDocuments(filteredDocuments, page, pageSize);
  }

  const sortRowsResult = await supabase
    .from("records")
    .select("id, title, published_at, updated_at, reaction_count")
    .in("id", uniqueRecordIds);
  let sortRows = sortRowsResult.data;

  if (sortRowsResult.error || !sortRows) {
    const legacySortResult = await supabase
      .from("records")
      .select("id, title, published_at, updated_at")
      .in("id", uniqueRecordIds);

    if (legacySortResult.error || !legacySortResult.data) {
      return emptyPaginatedDocuments<WikiDocument>(pageSize);
    }

    sortRows = legacySortResult.data.map((row) => ({
      ...row,
      reaction_count: null,
    }));
    reactionTotals = state.sort === "most-reacted"
      ? await listLikeTotalsForRecords(uniqueRecordIds)
      : undefined;
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
    reactionTotals,
  ).map((row) => row.id);
  const paginated = paginateIds(sortedRecordIds, page, pageSize);
  const documents = await listDocumentsByIds(paginated.ids, useServerClient);

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

export const listAvailableTagsForPublicDocuments = cache(async function listAvailableTagsForPublicDocuments() {
  if (!hasSupabaseEnv()) {
    return [...new Set(filterReadableDocuments(demoDocuments).flatMap((document) => document.tags))]
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right));
  }

  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data: tagRows, error } = await supabase
    .from("tags")
    .select("name")
    .order("name", { ascending: true });

  if (error || !tagRows) {
    return [];
  }

  return [...new Set(
    tagRows
      .map((row) => String(row.name ?? "").trim())
      .filter(Boolean),
  )].sort((left, right) => left.localeCompare(right));
});

export async function listPublicDocumentsPage(
  page = 1,
  pageSize = PUBLIC_LIBRARY_PAGE_SIZE,
) {
  if (!hasSupabaseEnv()) {
    return paginateDocuments(
      sortListItemsByRecentDocumentDate(
        filterReadableDocuments(demoDocuments).map(mapDocumentToListItem),
      ),
      page,
      pageSize,
    );
  }

  return listPublicRecordListPage(
    {
      sort: "newest",
      source: "all",
    },
    page,
    pageSize,
  );
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
      applyDiscoveryState(documents, state, reactionTotals).map(mapDocumentToListItem),
      page,
      pageSize,
    );
  }

  const candidateIds = await resolvePublicDiscoveryRecordIds(state);
  return listPublicRecordListPage(state, page, pageSize, candidateIds);
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
    const supabase = useServerClient
      ? await getServerSupabaseClient()
      : getPublicSupabaseClient();

    if (!supabase) {
      return emptyPaginatedDocuments<WikiDocument>(pageSize);
    }

    const { data, error } = await supabase
      .from("records")
      .select("id")
      .in("id", candidateIds)
      .eq("source_type", state.source);

    if (error || !data) {
      return emptyPaginatedDocuments<WikiDocument>(pageSize);
    }

    candidateIds = data.map((row) => String(row.id));
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

  return listDiscoveryDocumentsPageFromIds(
    candidateIds,
    state,
    page,
    pageSize,
    useServerClient,
  );
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
    .select(RECORD_DETAIL_SELECT)
    .eq("writer_user_id", user.id)
    .order("updated_at", { ascending: false });

  if (recordsError || !recordRows) {
    return [];
  }

  const typedRecordRows = recordRows as unknown as RecordRow[];
  const tagRows = await fetchTagRowsForRecordIds(
    typedRecordRows.map((row) => String(row.id)),
    true,
  );

  return sortByUpdatedAt(await mapRowsToDocuments(typedRecordRows, tagRows));
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
    .select(RECORD_DETAIL_SELECT)
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

  const typedRecordRows = recordRows as unknown as RecordRow[];
  const tagRows = await fetchTagRowsForRecordIds(
    typedRecordRows.map((row) => String(row.id)),
    true,
  );

  return {
    documents: sortByUpdatedAt(await mapRowsToDocuments(typedRecordRows, tagRows)),
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
    .select(RECORD_DETAIL_SELECT)
    .eq("slug", normalizedSlug)
    .eq("visibility", "public")
    .maybeSingle();

  if (error || !row) {
    return null;
  }

  const typedRow = row as unknown as RecordRow;
  const tagRows = await fetchTagRowsForRecordIds([String(typedRow.id)]);
  return (await mapRowsToDocuments([typedRow], tagRows))[0] ?? null;
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
    .select(RECORD_DETAIL_SELECT)
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (error || !row) {
    return null;
  }

  const typedRow = row as unknown as RecordRow;
  const tagRows = await fetchTagRowsForRecordIds([String(typedRow.id)], true);
  return (await mapRowsToDocuments([typedRow], tagRows))[0] ?? null;
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
    .select(RECORD_DETAIL_SELECT)
    .eq("id", documentId)
    .eq("writer_user_id", user.id)
    .maybeSingle();

  if (error || !row) {
    return null;
  }

  const typedRow = row as unknown as RecordRow;
  const tagRows = await fetchTagRowsForRecordIds([String(typedRow.id)], true);
  return (await mapRowsToDocuments([typedRow], tagRows))[0] ?? null;
});

export async function listPublicDocumentsByTag(tag: string) {
  const normalizedTag = normalizeDiscoveryTag(tag);

  if (!hasSupabaseEnv()) {
    return sortListItemsByRecentDocumentDate(
      filterReadableDocuments(demoDocuments)
        .filter((document) =>
          document.tags.some((currentTag) => normalizeDiscoveryTag(currentTag) === normalizedTag),
        )
        .map(mapDocumentToListItem),
    );
  }

  const candidateIds = await listPublicRecordIdsForSelectedTags([normalizedTag]);

  if (candidateIds.length === 0) {
    return [] as WikiDocumentListItem[];
  }

  const page = await listPublicRecordListPage(
    {
      sort: "newest",
      source: "all",
    },
    1,
    candidateIds.length,
    candidateIds,
  );

  return page.documents;
}

export async function getPublicDiscoveryView(
  state: DiscoveryState,
  page = 1,
  pageSize = PUBLIC_LIBRARY_PAGE_SIZE,
) {
  const [paginated, availableTags] = await Promise.all([
    listPublicDiscoveryPage(state, page, pageSize),
    listAvailableTagsForPublicDocuments(),
  ]);

  return {
    ...paginated,
    availableTags,
  };
}

export async function listRelatedDocumentsForDocument(
  document: WikiDocument,
  limit = 3,
) {
  if (!hasSupabaseEnv()) {
    const documents = sortListItemsByRecentDocumentDate(
      filterReadableDocuments(demoDocuments).map(mapDocumentToListItem),
    );
    return getRelatedDocuments(document, documents, limit);
  }

  const useServerClient = document.visibility !== "public";
  const supabase = useServerClient
    ? await getServerSupabaseClient()
    : getPublicSupabaseClient();

  if (!supabase || document.tags.length === 0) {
    return [];
  }

  const sourceTagRows = await fetchTagRowsForRecordIds([document.id], useServerClient);
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

  let candidateQuery = supabase
    .from("records")
    .select(RECORD_LIST_SELECT)
    .in("id", candidateIds);

  if (!useServerClient) {
    candidateQuery = candidateQuery.eq("visibility", "public");
  }

  const { data: candidateRows, error: candidatesError } = await candidateQuery;

  if (candidatesError || !candidateRows) {
    return [];
  }

  const candidateTagDetails = await fetchTagRowsForRecordIds(
    candidateIds,
    useServerClient,
  );
  const candidateDocuments = await mapRowsToListItems(
    candidateRows as unknown as RecordRow[],
    candidateTagDetails,
  );

  return getRelatedDocuments(document, candidateDocuments, limit);
}

export async function listDocumentsByIds(
  recordIds: string[],
  useServerClient = false,
) {
  const uniqueRecordIds = [...new Set(recordIds.filter(Boolean))];

  if (uniqueRecordIds.length === 0) {
    return [];
  }

  const supabase = useServerClient
    ? await getServerSupabaseClient()
    : getPublicSupabaseClient();

  if (!supabase) {
    return demoDocuments.filter((document) => uniqueRecordIds.includes(document.id));
  }

  const { data: recordRows, error: recordsError } = await supabase
    .from("records")
    .select(RECORD_DETAIL_SELECT)
    .in("id", uniqueRecordIds);

  if (recordsError || !recordRows) {
    return [];
  }

  const typedRecordRows = recordRows as unknown as RecordRow[];
  const tagRows = await fetchTagRowsForRecordIds(uniqueRecordIds, useServerClient);
  const documents = await mapRowsToDocuments(typedRecordRows, tagRows);

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

function fallbackAuthorName(email?: string | null) {
  const trimmedEmail = email?.trim().toLowerCase() ?? "";

  if (!trimmedEmail.includes("@")) {
    return "unknown";
  }

  return trimmedEmail.split("@")[0] || "unknown";
}

function buildRecordPayload(
  input: UpsertDocumentInput,
  user: { id: string },
  authorName: string,
) {
  return {
    writer_user_id: user.id,
    slug: createSlug(input.title),
    title: input.title,
    contents: input.contents,
    source_type: input.sourceType,
    book_title: input.sourceType === "book" ? input.bookTitle || null : null,
    author_name: authorName,
    visibility: input.visibility,
  };
}

async function resolveAuthorNameForUser(
  user: { id: string; email?: string | null },
  supabase: NonNullable<Awaited<ReturnType<typeof getServerSupabaseClient>>>,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const userName = String(profile?.user_name ?? "").trim();

  if (userName) {
    return userName;
  }

  return fallbackAuthorName(profile?.email ?? user.email);
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

  const authorName = await resolveAuthorNameForUser(user, supabase);
  const payload = {
    ...buildRecordPayload(input, user, authorName),
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

  const { data: deletedRecord, error } = await supabase
    .from("records")
    .delete()
    .eq("id", documentId)
    .eq("writer_user_id", user.id)
    .select("slug")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return deletedRecord?.slug ? String(deletedRecord.slug) : null;
}
