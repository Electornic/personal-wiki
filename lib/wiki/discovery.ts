import type { SourceType, WikiDocument } from "@/lib/wiki/types";

export type DiscoverySort = "newest" | "oldest" | "title-asc" | "title-desc";
export type DiscoverySource = "all" | SourceType;

export type DiscoveryState = {
  query: string;
  sort: DiscoverySort;
  source: DiscoverySource;
  tags: string[];
  filtersOpen: boolean;
};

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
  const filtersParam = getValue(searchParams, "filters");
  const query = getValue(searchParams, "q")?.trim() ?? "";
  const tags = parseTags(getValue(searchParams, "tags"));

  const sort: DiscoverySort =
    sortParam === "oldest" ||
    sortParam === "title-asc" ||
    sortParam === "title-desc"
      ? sortParam
      : "newest";

  const source: DiscoverySource =
    sourceParam === "article" || sourceParam === "book" ? sourceParam : "all";

  return {
    query,
    sort,
    source,
    tags,
    filtersOpen: filtersParam === "open",
  };
}

export function getAvailableTags(documents: WikiDocument[]) {
  return [...new Set(documents.flatMap((document) => document.tags))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
}

export function applyDiscoveryState(documents: WikiDocument[], state: DiscoveryState) {
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
      document.contents,
      ...document.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  return filtered.sort((left, right) => {
    if (state.sort === "oldest") {
      return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime();
    }

    if (state.sort === "title-asc") {
      return left.title.localeCompare(right.title);
    }

    if (state.sort === "title-desc") {
      return right.title.localeCompare(left.title);
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

type CurationShelf = {
  title: string;
  description: string;
  documents: WikiDocument[];
};

const shelfDefinitions = [
  {
    title: "Start Here",
    description: "Essential readings for understanding the core themes of this library",
    preferredTags: ["design", "reading", "attention", "craftsmanship", "philosophy"],
    limit: 2,
  },
  {
    title: "On Slowness and Attention",
    description: "Records exploring mindfulness, craft, and the value of taking time",
    preferredTags: ["mindfulness", "meditation", "walking", "attention", "philosophy"],
    limit: 3,
  },
] as const;

function scoreDocumentForShelf(document: WikiDocument, preferredTags: readonly string[]) {
  const normalizedTags = document.tags.map((tag) => normalizeTag(tag));
  let score = 0;

  for (const tag of preferredTags) {
    if (normalizedTags.includes(tag)) {
      score += 2;
    }
  }

  if (document.sourceType === "book") {
    score += 1;
  }

  return score;
}

export function buildHomeCurationShelves(documents: WikiDocument[]): CurationShelf[] {
  const usedIds = new Set<string>();

  return shelfDefinitions.map((definition) => {
    const ranked = [...documents]
      .sort((left, right) => {
        const scoreDelta =
          scoreDocumentForShelf(right, definition.preferredTags) -
          scoreDocumentForShelf(left, definition.preferredTags);

        if (scoreDelta !== 0) {
          return scoreDelta;
        }

        return (
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        );
      })
      .filter((document) => !usedIds.has(document.id));

    const selected = ranked.slice(0, definition.limit);

    for (const document of selected) {
      usedIds.add(document.id);
    }

    return {
      title: definition.title,
      description: definition.description,
      documents: selected,
    };
  });
}
