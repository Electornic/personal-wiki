"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { MyLibraryCard } from "@/components/my-library-card";
import type { WikiDocumentPreview } from "@/entities/record/model/types";

type MyLibraryBrowserProps = {
  records: WikiDocumentPreview[];
  totalCount: number;
  controlsSlot?: ReactNode;
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

export function MyLibraryBrowser({
  records,
  totalCount,
  controlsSlot,
}: MyLibraryBrowserProps) {
  const hasAnyBookmarks = totalCount > 0;

  return (
    <>
      {controlsSlot}

      {records.length ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {records.map((record) => (
            <MyLibraryCard key={record.id} document={record} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center text-[#b7b0a2]">
            <MyLibraryIcon />
          </div>
          <h2 className="mt-5 text-[20px] leading-7 font-semibold text-[var(--foreground)]">
            {hasAnyBookmarks ? "No matching records found" : "No bookmarks yet"}
          </h2>
          <p className="mx-auto mt-3 max-w-[360px] text-[18px] leading-[32.4px] text-[var(--muted)]">
            {hasAnyBookmarks
              ? "Adjust your search or filters to see more records."
              : "Bookmark public records you want to return to later."}
          </p>
          {!hasAnyBookmarks && (
            <Link href="/library" className="mt-10 inline-flex text-[14px] leading-5 text-[var(--foreground)]">
              Browse the library
            </Link>
          )}
        </div>
      )}
    </>
  );
}
