import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { HomeDiscoveryControls } from "@/app/_components/home-discovery-controls";
import { PaginationNav } from "@/components/pagination-nav";
import { PublicLibraryBrowser } from "@/components/public-library-browser";
import {
  DISCOVERY_PAGE_SIZE,
  parseDiscoveryState,
} from "@/lib/wiki/discovery";
import {
  listPublicDiscoveryPage,
} from "@/entities/record/api/documents";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function LibraryPage({ searchParams }: PageProps) {
  return (
    <main className="site-shell pb-16 pt-12 md:pb-20 md:pt-16">
      <section>
        <h1 className="text-[32px] leading-[1.2] font-semibold tracking-[-0.02em] text-[var(--foreground)] md:text-[40px]">
          Library
        </h1>
        <p className="mt-2 text-[16px] text-[var(--muted)]">
          Public essays, book notes, and reflections.
        </p>
      </section>

      <section className="mt-10">
        <Suspense fallback={<LibraryFallback />}>
          <LibraryContent searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

function getPageNumber(searchParams: Record<string, string | string[] | undefined>) {
  const page = Number(
    Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page ?? "1",
  );

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function buildPageHref(
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      continue;
    }

    params.set(key, value);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/library?${query}` : "/library";
}

async function LibraryContent({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await searchParamsPromise;
  const discoveryState = parseDiscoveryState(searchParams);
  const currentPage = getPageNumber(searchParams);

  const paginated = await getCachedPublicDiscoveryPage(
    discoveryState,
    currentPage,
    DISCOVERY_PAGE_SIZE,
  );

  return (
    <>
      <PublicLibraryBrowser
        records={paginated.documents}
        recordCount={paginated.totalCount}
        controlsSlot={(
          <Suspense fallback={<DiscoveryControlsFallback />}>
            <HomeDiscoveryControls discoveryState={discoveryState} />
          </Suspense>
        )}
      />

      <PaginationNav
        currentPage={paginated.page}
        totalPages={paginated.totalPages}
        buildHref={(page) => buildPageHref(searchParams, page)}
      />
    </>
  );
}

async function getCachedPublicDiscoveryPage(
  discoveryState: ReturnType<typeof parseDiscoveryState>,
  currentPage: number,
  pageSize: number,
) {
  "use cache";

  cacheLife("minutes");
  cacheTag("public-discovery");

  return listPublicDiscoveryPage(discoveryState, currentPage, pageSize);
}

function DiscoveryControlsFallback() {
  return (
    <div className="h-[42px] w-full animate-pulse rounded-[6px] bg-[var(--surface-warm)]" />
  );
}

function LibraryFallback() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-9 w-48 animate-pulse rounded-[6px] bg-[var(--surface-warm)]" />
        <div className="h-5 w-20 animate-pulse rounded-[6px] bg-[var(--surface-warm)]" />
      </div>

      <div className="h-[42px] w-full animate-pulse rounded-[6px] bg-[var(--surface-warm)]" />

      <div className="mt-8 grid gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-6 py-6"
          >
            <div className="h-7 w-2/5 rounded bg-[var(--surface-warm)]" />
            <div className="mt-4 h-4 w-full rounded bg-[var(--surface-warm)]" />
            <div className="mt-3 h-4 w-3/4 rounded bg-[var(--surface-warm)]" />
          </div>
        ))}
      </div>
    </>
  );
}
