"use client";

import { useSearchParams } from "next/navigation";

import { DiscoveryControls } from "@/components/discovery-controls";
import { DocumentCard } from "@/components/document-card";
import {
  applyDiscoveryState,
  parseDiscoveryState,
  type DiscoveryState,
} from "@/lib/wiki/discovery";
import type { WikiDocument } from "@/lib/wiki/types";

type PublicLibraryBrowserProps = {
  records: WikiDocument[];
  availableTags: string[];
  initialState: DiscoveryState;
  reactionTotals: Record<string, number>;
};

function buildReactionTotalsMap(reactionTotals: Record<string, number>) {
  return new Map(
    Object.entries(reactionTotals).map(([recordId, total]) => [recordId, Number(total)]),
  );
}

export function PublicLibraryBrowser({
  records,
  availableTags,
  initialState,
  reactionTotals,
}: PublicLibraryBrowserProps) {
  const searchParams = useSearchParams();
  const discoveryState = searchParams.toString()
    ? parseDiscoveryState(searchParams)
    : initialState;
  const filteredRecords = applyDiscoveryState(
    records,
    discoveryState,
    buildReactionTotalsMap(reactionTotals),
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[30px] leading-9 font-semibold tracking-[-0.3px] text-[#2a2419]">
          Browse Library
        </h2>
        <span className="text-[14px] leading-5 text-[#6b6354]">
          {filteredRecords.length} {filteredRecords.length === 1 ? "record" : "records"}
        </span>
      </div>

      <DiscoveryControls
        availableTags={availableTags}
        query={discoveryState.query}
        sort={discoveryState.sort}
        source={discoveryState.source}
        tags={discoveryState.tags}
        filtersOpen={discoveryState.filtersOpen}
      />

      <div className="mt-8 grid gap-6">
        {filteredRecords.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-6 py-12 text-center text-[18px] leading-8 text-[#6b6354]">
          No matching records found.
        </div>
      ) : null}
    </>
  );
}
