import { redirect } from "next/navigation";

import { MyLibraryBrowser } from "@/components/my-library-browser";
import { PaginationNav } from "@/components/pagination-nav";
import { toDocumentPreview } from "@/entities/record/model/content";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import {
  DISCOVERY_PAGE_SIZE,
  parseDiscoveryState,
} from "@/lib/wiki/discovery";
import {
  listAvailableTagsForMyLibrary,
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

export default async function MyLibraryPage({ searchParams }: PageProps) {
  const access = await requireAuthorAccess();

  if (!access.configured) {
    redirect("/author");
  }

  const resolvedSearchParams = await searchParams;
  const discoveryState = parseDiscoveryState(resolvedSearchParams);
  const currentPage = getPageNumber(resolvedSearchParams);
  const paginated = await listMyLibraryDiscoveryPage(
    discoveryState,
    currentPage,
    DISCOVERY_PAGE_SIZE,
  );
  const records = paginated.documents;
  const previews = records.map((record) => toDocumentPreview(record));
  const availableTags = await listAvailableTagsForMyLibrary();

  return (
    <main className="site-shell pb-20 pt-12">
      <section className="w-full">
        <h1 className="text-[36px] leading-10 font-semibold tracking-[-0.72px] text-[#2a2419]">
          My Library
        </h1>
        <p className="mt-3 text-[18px] leading-7 text-[#6b6354]">
          Your personal collection of bookmarked reading
        </p>
      </section>

      <section className="mt-10 w-full">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.2)] px-4 py-2 text-[14px] leading-5 font-medium text-[#2a2419]">
          <MyLibraryIcon />
          Bookmarks
        </div>

        <MyLibraryBrowser
          records={previews}
          availableTags={availableTags}
          discoveryState={discoveryState}
        />

        <PaginationNav
          currentPage={paginated.page}
          totalPages={paginated.totalPages}
          buildHref={(page) => buildPageHref(resolvedSearchParams, page)}
        />
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
  return query ? `/me/library?${query}` : "/me/library";
}
