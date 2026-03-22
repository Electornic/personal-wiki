import { redirect } from "next/navigation";

import { MyLibraryBrowser } from "@/components/my-library-browser";
import { toDocumentPreview } from "@/entities/record/model/content";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import {
  getAvailableTagsFromPreviews,
} from "@/lib/wiki/discovery";
import { listMyLibraryPreview } from "@/lib/wiki/library";
import { listLikeTotalsForRecords } from "@/entities/reaction/api/reactions";

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

  await searchParams;
  const records = await listMyLibraryPreview();
  const previews = records.map((record) => toDocumentPreview(record));
  const reactionTotals = await listLikeTotalsForRecords(records.map((record) => record.id));
  const availableTags = getAvailableTagsFromPreviews(previews);

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
          reactionTotals={Object.fromEntries(reactionTotals)}
        />
      </section>
    </main>
  );
}
