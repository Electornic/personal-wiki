"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import type { DiscoverySort, DiscoverySource } from "@/lib/wiki/discovery";

type DiscoveryControlsProps = {
  availableTags: string[];
  query: string;
  sort: DiscoverySort;
  source: DiscoverySource;
  tags: string[];
  filtersOpen: boolean;
  preserveParams?: Record<string, string>;
  className?: string;
};

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path d="M2.667 4h10.666" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.667 8h6.666" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.667 12h2.666" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[34px] items-center justify-center rounded-full border px-[13px] text-[14px] leading-5 font-medium ${
        active
          ? "border-[#2a2419] bg-[#2a2419] text-[#faf8f5]"
          : "border-[rgba(42,36,25,0.1)] bg-[#faf8f5] text-[#2a2419]"
      }`}
    >
      {label}
    </button>
  );
}

export function DiscoveryControls({
  availableTags,
  query,
  sort,
  source,
  tags,
  filtersOpen,
  preserveParams,
  className,
}: DiscoveryControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [queryValue, setQueryValue] = useState(query);

  useEffect(() => {
    setQueryValue(query);
  }, [query]);

  function buildParams(
    updates: Partial<{
      q: string;
      sort: string;
      source: string;
      tags: string[];
      filters: string | null;
    }>,
  ) {
    const params = new URLSearchParams(searchParams.toString());

    if (preserveParams) {
      for (const [key, value] of Object.entries(preserveParams)) {
        params.set(key, value);
      }
    }

    if (updates.q !== undefined) {
      const trimmed = updates.q.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
    }

    if (updates.sort !== undefined) {
      if (updates.sort && updates.sort !== "newest") {
        params.set("sort", updates.sort);
      } else {
        params.delete("sort");
      }
    }

    if (updates.source !== undefined) {
      if (updates.source && updates.source !== "all") {
        params.set("source", updates.source);
      } else {
        params.delete("source");
      }
    }

    if (updates.tags !== undefined) {
      if (updates.tags.length > 0) {
        params.set("tags", updates.tags.join(","));
      } else {
        params.delete("tags");
      }
    }

    if (updates.filters !== undefined) {
      if (updates.filters) {
        params.set("filters", updates.filters);
      } else {
        params.delete("filters");
      }
    }

    return params.toString() ? `${pathname}?${params.toString()}` : pathname;
  }

  function navigate(url: string) {
    window.history.pushState(null, "", url);
  }

  const showPanel =
    filtersOpen || sort !== "newest" || source !== "all" || tags.length > 0;

  function toggleTag(tag: string) {
    const normalized = tag.toLowerCase();
    const nextTags = tags.includes(normalized)
      ? tags.filter((value) => value !== normalized)
      : [...tags, normalized];

    navigate(buildParams({ tags: nextTags, filters: "open" }));
  }

  return (
    <section className={className}>
      <div className="flex items-stretch gap-3">
        <form
          className="relative flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(buildParams({ q: queryValue }));
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-[#8f8778]">
            <SearchIcon />
          </div>
          <input
            name="q"
            value={queryValue}
            onChange={(event) => setQueryValue(event.currentTarget.value)}
            placeholder="Search records..."
            className="h-[42px] w-full rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[#faf8f5] pl-10 pr-4 text-[14px] leading-5 text-[#2a2419] placeholder:text-[rgba(42,36,25,0.5)]"
          />
        </form>

        <button
          type="button"
          onClick={() =>
            navigate(buildParams({ filters: showPanel ? null : "open" }))
          }
          className={`inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-[6px] px-3 text-[14px] leading-5 font-medium ${
            showPanel
              ? "border border-[#2a2419] bg-[#2a2419] text-[#faf8f5]"
              : "border border-[rgba(42,36,25,0.1)] bg-[#faf8f5] text-[#2a2419]"
          }`}
        >
          <FilterIcon />
          <span className="hidden md:inline">Filters</span>
        </button>
      </div>

      {showPanel ? (
        <div className="mt-4 rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.2)] px-4 py-[17px] md:px-[17px]">
          <div className="space-y-4">
            <div>
              <p className="text-[14px] leading-5 font-medium font-[Inter] text-[#2a2419]">
                Sort by
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <FilterChip
                  active={sort === "newest"}
                  label="Newest first"
                  onClick={() => navigate(buildParams({ sort: "newest", filters: "open" }))}
                />
                <FilterChip
                  active={sort === "oldest"}
                  label="Oldest first"
                  onClick={() => navigate(buildParams({ sort: "oldest", filters: "open" }))}
                />
                <FilterChip
                  active={sort === "title-asc"}
                  label="Title A-Z"
                  onClick={() =>
                    navigate(buildParams({ sort: "title-asc", filters: "open" }))
                  }
                />
                <FilterChip
                  active={sort === "title-desc"}
                  label="Title Z-A"
                  onClick={() =>
                    navigate(buildParams({ sort: "title-desc", filters: "open" }))
                  }
                />
                <FilterChip
                  active={sort === "most-reacted"}
                  label="Most reacted"
                  onClick={() =>
                    navigate(buildParams({ sort: "most-reacted", filters: "open" }))
                  }
                />
              </div>
            </div>

            <div>
              <p className="text-[14px] leading-5 font-medium font-[Inter] text-[#2a2419]">
                Source type
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <FilterChip
                  active={source === "all"}
                  label="All"
                  onClick={() => navigate(buildParams({ source: "all", filters: "open" }))}
                />
                <FilterChip
                  active={source === "article"}
                  label="Articles"
                  onClick={() =>
                    navigate(buildParams({ source: "article", filters: "open" }))
                  }
                />
                <FilterChip
                  active={source === "book"}
                  label="Books"
                  onClick={() =>
                    navigate(buildParams({ source: "book", filters: "open" }))
                  }
                />
              </div>
            </div>

            <div>
              <p className="text-[14px] leading-5 font-medium font-[Inter] text-[#2a2419]">
                Filter by tags
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <FilterChip
                    key={tag}
                    active={tags.includes(tag.toLowerCase())}
                    label={tag}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
