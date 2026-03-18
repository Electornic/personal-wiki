import Link from "next/link";
import { redirect } from "next/navigation";

import { MyLibraryBrowser } from "@/components/my-library-browser";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import {
  getAvailableTags,
  parseDiscoveryState,
} from "@/lib/wiki/discovery";
import { listMyLibraryPreview, type LibraryTab } from "@/lib/wiki/library";
import { listReactionTotalsForRecords } from "@/lib/wiki/reactions";

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

function LikeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 16 16">
      <path
        d="M8 13.333 2.667 8.667a3.052 3.052 0 0 1 0-4.334A2.92 2.92 0 0 1 6.8 4.32L8 5.5l1.2-1.18a2.92 2.92 0 0 1 4.133.013 3.052 3.052 0 0 1 0 4.334L8 13.333Z"
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
  const tab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab;
  const activeTab: LibraryTab = tab === "likes" ? "likes" : "bookmarks";
  const initialDiscoveryState = parseDiscoveryState(resolvedSearchParams);
  const records = await listMyLibraryPreview(activeTab);
  const reactionTotals = await listReactionTotalsForRecords(records.map((record) => record.id));
  const availableTags = getAvailableTags(records);

  return (
    <main className="site-shell pb-20 pt-12">
      <section className="w-full">
        <h1 className="text-[36px] leading-10 font-semibold tracking-[-0.72px] text-[#2a2419]">
          My Library
        </h1>
        <p className="mt-3 text-[18px] leading-7 text-[#6b6354]">
          Your personal collection of saved reading
        </p>
      </section>

      <section className="mt-10 w-full">
        <div className="w-full max-w-[448px] rounded-[10px] bg-[#e8e3db] p-[3px]">
          <div className="grid grid-cols-2 gap-0.5">
            <Link
              href="/me/library?tab=bookmarks"
              className={`inline-flex h-[29px] items-center justify-center gap-2 rounded-[10px] px-[9px] text-[14px] leading-5 font-medium ${
                activeTab === "bookmarks" ? "bg-white text-[#2a2419]" : "text-[#2a2419]"
              }`}
            >
              <MyLibraryIcon />
              Bookmarks
            </Link>
            <Link
              href="/me/library?tab=likes"
              className={`inline-flex h-[29px] items-center justify-center gap-2 rounded-[10px] px-[9px] text-[14px] leading-5 font-medium ${
                activeTab === "likes" ? "bg-white text-[#2a2419]" : "text-[#2a2419]"
              }`}
            >
              <LikeIcon />
              Likes
            </Link>
          </div>
        </div>

        <MyLibraryBrowser
          activeTab={activeTab}
          records={records}
          availableTags={availableTags}
          initialState={initialDiscoveryState}
          reactionTotals={Object.fromEntries(reactionTotals)}
        />
      </section>
    </main>
  );
}
