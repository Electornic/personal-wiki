"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { DiscoveryControls } from "@/components/discovery-controls";
import { MyLibraryCard } from "@/components/my-library-card";
import {
  applyDiscoveryState,
  parseDiscoveryState,
} from "@/lib/wiki/discovery";
import type { LibraryTab } from "@/lib/wiki/library";
import type { WikiDocumentPreview } from "@/entities/record/model/types";

type MyLibraryBrowserProps = {
  activeTab: LibraryTab;
  records: WikiDocumentPreview[];
  availableTags: string[];
  reactionTotals: Record<string, number>;
};

function MyLibraryIcon({ className = "h-12 w-12" }: { className?: string }) {
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

function buildReactionTotalsMap(reactionTotals: Record<string, number>) {
  return new Map(
    Object.entries(reactionTotals).map(([recordId, total]) => [recordId, Number(total)]),
  );
}

export function MyLibraryBrowser({
  activeTab,
  records,
  availableTags,
  reactionTotals,
}: MyLibraryBrowserProps) {
  const searchParams = useSearchParams();
  const discoveryState = parseDiscoveryState(searchParams);
  const filteredRecords = applyDiscoveryState(
    records,
    discoveryState,
    buildReactionTotalsMap(reactionTotals),
  );

  return (
    <>
      <DiscoveryControls
        className="mt-10"
        availableTags={availableTags}
        query={discoveryState.query}
        sort={discoveryState.sort}
        source={discoveryState.source}
        tags={discoveryState.tags}
        filtersOpen={discoveryState.filtersOpen}
        preserveParams={{ tab: activeTab }}
      />

      {filteredRecords.length ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {filteredRecords.map((record) => (
            <MyLibraryCard key={record.id} document={record} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center text-[#b7b0a2]">
            <MyLibraryIcon />
          </div>
          <h2 className="mt-5 text-[20px] leading-7 font-semibold text-[#2a2419]">
            {records.length === 0
              ? activeTab === "bookmarks"
                ? "No bookmarks yet"
                : "No likes yet"
              : "No matching records found"}
          </h2>
          <p className="mx-auto mt-3 max-w-[360px] text-[18px] leading-[32.4px] text-[#6b6354]">
            {records.length === 0
              ? activeTab === "bookmarks"
                ? "Bookmark records you want to return to later"
                : "Like records that resonate with you"
              : "Adjust your search or filters to see more records."}
          </p>
          {records.length === 0 ? (
            <Link href="/#library" className="mt-10 inline-flex text-[14px] leading-5 text-[#2a2419]">
              Browse the library
            </Link>
          ) : null}
        </div>
      )}
    </>
  );
}
