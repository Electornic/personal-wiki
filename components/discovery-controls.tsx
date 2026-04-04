"use client";

import { useEffect, useEffectEvent, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { DiscoverySort, DiscoverySource } from "@/lib/wiki/discovery";

type DiscoveryControlsProps = {
  tagOptions: string[];
  query: string;
  sort: DiscoverySort;
  source: DiscoverySource;
  selectedTags: string[];
  popularTagLimit?: number;
  preserveParams?: Record<string, string>;
  className?: string;
};

const DEFAULT_POPULAR_LIMIT = 8;

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 12 12">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3 text-[var(--muted)]" fill="none" viewBox="0 0 12 12">
      <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function DiscoveryControls({
  tagOptions,
  query,
  sort,
  source,
  selectedTags,
  popularTagLimit = DEFAULT_POPULAR_LIMIT,
  preserveParams,
  className,
}: DiscoveryControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
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
    }>,
  ) {
    const params = new URLSearchParams(searchParams.toString());

    if (
      updates.q !== undefined ||
      updates.sort !== undefined ||
      updates.source !== undefined ||
      updates.tags !== undefined
    ) {
      params.delete("page");
    }

    params.delete("filters");

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

    return params.toString() ? `${pathname}?${params.toString()}` : pathname;
  }

  function navigate(url: string, mode: "push" | "replace" = "push") {
    startTransition(() => {
      if (mode === "replace") {
        router.replace(url, { scroll: false });
        return;
      }

      router.push(url, { scroll: false });
    });
  }

  const commitQuery = useEffectEvent((nextQuery: string) => {
    navigate(buildParams({ q: nextQuery }), "replace");
  });

  useEffect(() => {
    const normalizedQuery = query.trim();
    const normalizedInput = queryValue.trim();

    if (normalizedInput === normalizedQuery) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      commitQuery(queryValue);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query, queryValue]);

  function toggleTag(tag: string) {
    const normalized = tag.toLowerCase();
    const nextTags = selectedTags.includes(normalized)
      ? selectedTags.filter((value) => value !== normalized)
      : [...selectedTags, normalized];

    navigate(buildParams({ tags: nextTags }));
  }

  function removeTag(tag: string) {
    const nextTags = selectedTags.filter((value) => value !== tag);
    navigate(buildParams({ tags: nextTags }));
  }

  const visibleTags = tagOptions.slice(0, popularTagLimit);

  return (
    <section className={className}>
      {/* Row 1: Search + Sort + Source */}
      <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
        <form
          className="relative flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(buildParams({ q: queryValue }), "replace");
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#8f8778]">
            <SearchIcon />
          </div>
          <input
            name="q"
            value={queryValue}
            onChange={(event) => setQueryValue(event.currentTarget.value)}
            placeholder="Search records..."
            aria-busy={isPending}
            className="h-[42px] w-full rounded-[6px] border border-[var(--border)] bg-[var(--background)] pl-4 pr-[42px] text-[14px] leading-5 text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </form>

        <div className="flex flex-1 gap-2 md:flex-none">
          <div className="relative flex-1 md:flex-none">
            <select
              value={sort}
              onChange={(event) =>
                navigate(buildParams({ sort: event.target.value }))
              }
              className="h-[44px] w-full appearance-none rounded-[6px] border border-[var(--border)] bg-[var(--background)] pl-3 pr-8 font-[Inter,system-ui,sans-serif] text-[16px] leading-5 font-medium text-[var(--foreground)] md:h-[42px] md:w-auto md:min-w-[120px] md:text-[14px]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="most-reacted">Most liked</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
              <ChevronDownIcon />
            </span>
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              value={source}
              onChange={(event) =>
                navigate(buildParams({ source: event.target.value }))
              }
              className="h-[44px] w-full appearance-none rounded-[6px] border border-[var(--border)] bg-[var(--background)] pl-3 pr-8 font-[Inter,system-ui,sans-serif] text-[16px] leading-5 font-medium text-[var(--foreground)] md:h-[42px] md:w-auto md:min-w-[110px] md:text-[14px]"
            >
              <option value="all">All types</option>
              <option value="article">Articles</option>
              <option value="book">Books</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Tag pills */}
      {tagOptions.length > 0 ? (
        <div className="mt-3 flex max-h-[38px] flex-wrap items-center gap-2 overflow-hidden md:max-h-none">
          {visibleTags.map((tag) => {
            const active = selectedTags.includes(tag.toLowerCase());
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`inline-flex h-[30px] items-center rounded-full px-3 text-[13px] leading-5 font-medium transition ${
                  active
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Row 3: Selected tag chips */}
      {selectedTags.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] leading-4 text-[var(--muted)]">Filtered:</span>
          {selectedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="inline-flex h-[24px] items-center gap-1 rounded-full bg-[var(--tag-bg)] px-2.5 text-[12px] leading-4 font-medium text-[var(--tag-text)]"
            >
              {tag}
              <CloseIcon />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
