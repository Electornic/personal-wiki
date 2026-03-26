import { Suspense } from "react";
import Link from "next/link";

import { PublicLibraryBrowser } from "@/components/public-library-browser";
import { toDocumentPreview } from "@/entities/record/model/content";
import {
  DISCOVERY_PAGE_SIZE,
  parseDiscoveryState,
} from "@/lib/wiki/discovery";
import {
  listAvailableTagsForPublicDocuments,
  listPublicDiscoveryPage,
} from "@/entities/record/api/documents";
import { listLikeTotalsForRecords } from "@/entities/reaction/api/reactions";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="site-shell pb-16 pt-12 md:pb-20 md:pt-16">
      <section className="mx-auto max-w-[768px] text-center">
        <h1 className="mx-auto max-w-[604px] text-[48px] leading-[1] font-semibold tracking-[-0.02em] text-[#2a2419] md:text-[60px] md:leading-[60px] md:tracking-[-1.2px]">
          A Space for Reading &amp; Reflection
        </h1>
        <p className="mx-auto mt-6 max-w-[748px] text-[20px] leading-[32.5px] text-[rgba(42,36,25,0.7)]">
          Thoughtful essays, book notes, and explorations on literature, design,
          philosophy, and the art of attention.
        </p>
      </section>

      <section id="library" className="mt-16 md:mt-20">
        <Suspense fallback={<HomeLibraryFallback />}>
          <HomeLibrarySection searchParams={resolvedSearchParams} />
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
  return query ? `/?${query}#library` : "/#library";
}

async function HomeLibrarySection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const discoveryState = parseDiscoveryState(searchParams);
  const currentPage = getPageNumber(searchParams);
  const paginated = await listPublicDiscoveryPage(
    discoveryState,
    currentPage,
    DISCOVERY_PAGE_SIZE,
  );
  const publicRecords = paginated.documents;
  const previews = publicRecords.map((record) => toDocumentPreview(record));
  const reactionTotals = await listLikeTotalsForRecords(
    publicRecords.map((record) => record.id),
  );
  const availableTags = await listAvailableTagsForPublicDocuments();

  return (
    <>
      <PublicLibraryBrowser
        records={previews}
        availableTags={availableTags}
        reactionTotals={Object.fromEntries(reactionTotals)}
        recordCount={paginated.totalCount}
      />

      {paginated.totalPages > 1 ? (
        <nav className="mt-8 flex items-center justify-between gap-4 border-t border-[rgba(42,36,25,0.1)] pt-6">
          <Link
            href={buildPageHref(searchParams, Math.max(paginated.page - 1, 1))}
            aria-disabled={paginated.page === 1}
            className={`inline-flex h-[42px] items-center justify-center rounded-[4px] border px-4 text-[14px] leading-5 font-medium ${
              paginated.page === 1
                ? "pointer-events-none border-[rgba(42,36,25,0.08)] text-[rgba(42,36,25,0.35)]"
                : "border-[rgba(42,36,25,0.1)] bg-white text-[#2a2419]"
            }`}
          >
            Previous
          </Link>
          <Link
            href={buildPageHref(
              searchParams,
              Math.min(paginated.page + 1, paginated.totalPages),
            )}
            aria-disabled={paginated.page === paginated.totalPages}
            className={`inline-flex h-[42px] items-center justify-center rounded-[4px] border px-4 text-[14px] leading-5 font-medium ${
              paginated.page === paginated.totalPages
                ? "pointer-events-none border-[rgba(42,36,25,0.08)] text-[rgba(42,36,25,0.35)]"
                : "border-[rgba(42,36,25,0.1)] bg-white text-[#2a2419]"
            }`}
          >
            Next
          </Link>
        </nav>
      ) : null}
    </>
  );
}

function HomeLibraryFallback() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-9 w-48 animate-pulse rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
        <div className="h-5 w-20 animate-pulse rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
      </div>

      <div className="h-[42px] w-full animate-pulse rounded-[6px] bg-[rgba(42,36,25,0.08)]" />

      <div className="mt-8 grid gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-6 py-6"
          >
            <div className="h-8 w-2/5 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-4 h-5 w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-3 h-5 w-4/5 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          </div>
        ))}
      </div>
    </>
  );
}
