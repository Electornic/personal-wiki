import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { MyLibraryDiscoveryControls } from "@/app/me/library/_components/my-library-discovery-controls";
import { MyLibraryBrowser } from "@/components/my-library-browser";
import { PaginationNav } from "@/components/pagination-nav";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import {
  DISCOVERY_PAGE_SIZE,
  parseDiscoveryState,
} from "@/lib/wiki/discovery";
import {
  listMyLibraryDiscoveryPage,
} from "@/lib/wiki/library";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function MyLibraryIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 16 16">
      <path
        d="M4.667 2.667h6.666A1.333 1.333 0 0 1 12.667 4v9.333L8 10.667l-4.667 2.666V4a1.333 1.333 0 0 1 1.334-1.333Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export default function MyLibraryPage({ searchParams }: PageProps) {
  return (
    <main className="surface-light site-shell mx-auto my-4 max-w-[1096px] rounded-[12px] border border-[var(--content-border)] bg-[var(--content-bg)] pb-20 pt-12 backdrop-blur-sm">
      <section className="w-full">
        <h1 className="text-[36px] leading-10 font-semibold tracking-[-0.72px] text-[var(--foreground)]">
          My Library
        </h1>
        <p className="mt-3 text-[18px] leading-7 text-[var(--muted)]">
          Your personal collection of bookmarked reading
        </p>
      </section>

      <Suspense fallback={<MyLibraryContentSkeleton />}>
        <MyLibraryContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function MyLibraryContent({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await searchParamsPromise;
  await connection();

  const access = await requireAuthorAccess();

  if (!access.configured) {
    redirect("/author");
  }

  const userId = access.userId ?? "";
  const discoveryState = parseDiscoveryState(searchParams);
  const currentPage = getPageNumber(searchParams);
  const paginated = await listMyLibraryDiscoveryPage(
    userId,
    discoveryState,
    currentPage,
    DISCOVERY_PAGE_SIZE,
  );

  return (
    <section className="mt-10 w-full">
      <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.2)] px-4 py-2 text-[14px] leading-5 font-medium text-[var(--foreground)]">
        <MyLibraryIcon />
        Bookmarks
      </div>

      <MyLibraryBrowser
        records={paginated.documents}
        controlsSlot={(
          <Suspense fallback={<MyLibraryDiscoveryControlsFallback />}>
            <MyLibraryDiscoveryControls discoveryState={discoveryState} userId={userId} />
          </Suspense>
        )}
      />

      <PaginationNav
        currentPage={paginated.page}
        totalPages={paginated.totalPages}
        buildHref={(page) => buildPageHref(searchParams, page)}
      />
    </section>
  );
}

function MyLibraryContentSkeleton() {
  return (
    <section className="mt-10 w-full animate-pulse">
      <div className="h-9 w-full max-w-[448px] rounded-[10px] bg-[rgba(42,36,25,0.08)]" />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-6 py-6"
          >
            <div className="h-8 w-3/5 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-4 h-5 w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-3 h-5 w-5/6 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-6 flex gap-2">
              <div className="h-6 w-16 rounded-[999px] bg-[rgba(42,36,25,0.08)]" />
              <div className="h-6 w-20 rounded-[999px] bg-[rgba(42,36,25,0.08)]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MyLibraryDiscoveryControlsFallback() {
  return (
    <div className="mt-10 h-[42px] w-full animate-pulse rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
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
  return query ? `/me/library?${query}` : "/me/library";
}
