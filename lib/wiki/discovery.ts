import type {
  SourceType,
  WikiDocument,
  WikiDocumentPreview,
} from "@/entities/record/model/types";

export const DISCOVERY_PAGE_SIZE = 8;

export type DiscoverySort =
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "most-reacted";
export type DiscoverySource = "all" | SourceType;

export type DiscoveryState = {
  query: string;
  sort: DiscoverySort;
  source: DiscoverySource;
  tags: string[];
};

type DiscoveryDocument = Pick<
  WikiDocument,
  "id" | "title" | "writerName" | "bookTitle" | "sourceType" | "tags" | "publishedAt" | "updatedAt"
> & {
  contents?: string;
  excerpt?: string;
};

type DiscoverySortableDocument = Pick<
  WikiDocument,
  "id" | "title" | "publishedAt" | "updatedAt"
> & {
  reactionCount?: number;
};

function getDocumentSortTime(document: Pick<WikiDocument, "publishedAt" | "updatedAt">) {
  return new Date(document.publishedAt ?? document.updatedAt).getTime();
}

type SearchParamInput =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | undefined;

function getValue(input: SearchParamInput, key: string) {
  if (!input) {
    return undefined;
  }

  if (input instanceof URLSearchParams) {
    return input.get(key) ?? undefined;
  }

  const value = input[key];
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

function parseTags(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((tag) => normalizeTag(tag))
    .filter(Boolean);
}

export function parseDiscoveryState(searchParams?: SearchParamInput): DiscoveryState {
  const sortParam = getValue(searchParams, "sort");
  const sourceParam = getValue(searchParams, "source");
  const query = getValue(searchParams, "q")?.trim() ?? "";
  const tags = parseTags(getValue(searchParams, "tags"));

  const sort: DiscoverySort =
    sortParam === "oldest" ||
    sortParam === "title-asc" ||
    sortParam === "title-desc" ||
    sortParam === "most-reacted"
      ? sortParam
      : "newest";

  const source: DiscoverySource =
    sourceParam === "article" || sourceParam === "book" ? sourceParam : "all";

  return {
    query,
    sort,
    source,
    tags,
  };
}

export function isDefaultDiscoveryState(state: DiscoveryState) {
  return (
    !state.query &&
    state.sort === "newest" &&
    state.source === "all" &&
    state.tags.length === 0
  );
}

export function getAvailableTags(documents: WikiDocument[]) {
  return [...new Set(documents.flatMap((document) => document.tags))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
}

export function getAvailableTagsFromPreviews(documents: WikiDocumentPreview[]) {
  return [...new Set(documents.flatMap((document) => document.tags))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
}

export function sortDiscoveryDocuments<T extends DiscoverySortableDocument>(
  documents: T[],
  state: Pick<DiscoveryState, "sort">,
  reactionTotals?: Map<string, number>,
) {
  return [...documents].sort((left, right) => {
    if (state.sort === "oldest") {
      return getDocumentSortTime(left) - getDocumentSortTime(right);
    }

    if (state.sort === "title-asc") {
      return left.title.localeCompare(right.title);
    }

    if (state.sort === "title-desc") {
      return right.title.localeCompare(left.title);
    }

    if (state.sort === "most-reacted") {
      const totalDelta =
        (reactionTotals?.get(right.id) ?? right.reactionCount ?? 0) -
        (reactionTotals?.get(left.id) ?? left.reactionCount ?? 0);

      if (totalDelta !== 0) {
        return totalDelta;
      }
    }

    return getDocumentSortTime(right) - getDocumentSortTime(left);
  });
}

export function applyDiscoveryState<T extends DiscoveryDocument>(
  documents: T[],
  state: DiscoveryState,
  reactionTotals?: Map<string, number>,
) {
  const query = state.query.trim().toLowerCase();
  const selectedTags = state.tags.map((tag) => normalizeTag(tag));

  const filtered = documents.filter((document) => {
    if (state.source !== "all" && document.sourceType !== state.source) {
      return false;
    }

    const normalizedTags = document.tags.map((tag) => normalizeTag(tag));

    if (selectedTags.length > 0) {
      const matchesAllTags = selectedTags.every((tag) => normalizedTags.includes(tag));
      if (!matchesAllTags) {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    const haystack = [
      document.title,
      document.writerName,
      document.bookTitle ?? "",
      document.excerpt ?? document.contents ?? "",
      ...document.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  return sortDiscoveryDocuments(filtered, state, reactionTotals);
}
