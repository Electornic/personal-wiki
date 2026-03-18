import { Suspense } from "react";

import { CurationShelf } from "@/components/curation-shelf";
import { PublicLibraryBrowser } from "@/components/public-library-browser";
import { toDocumentPreview } from "@/lib/wiki/content";
import {
  buildHomeCurationShelves,
  getAvailableTagsFromPreviews,
} from "@/lib/wiki/discovery";
import { listPublicDocuments } from "@/lib/wiki/documents";
import { listReactionTotalsForRecords } from "@/lib/wiki/reactions";
import { listPublicCurationShelves } from "@/lib/wiki/shelves";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  await searchParams;

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

      <Suspense fallback={<HomeShelvesFallback />}>
        <HomeShelvesSection />
      </Suspense>

      <section id="library" className="mt-16 md:mt-20">
        <Suspense fallback={<HomeLibraryFallback />}>
          <HomeLibrarySection />
        </Suspense>
      </section>
    </main>
  );
}

async function HomeShelvesSection() {
  const documents = await listPublicDocuments();
  const publicRecords = documents.filter((record) => record.visibility === "public");
  const authoredShelves = await listPublicCurationShelves("home");
  const shelves =
    authoredShelves.length > 0
      ? authoredShelves
      : buildHomeCurationShelves(publicRecords);

  return (
    <section className="mt-16 grid gap-12 md:mt-[112px]">
      {shelves.map((shelf) => (
        <CurationShelf
          key={shelf.title}
          title={shelf.title}
          description={shelf.description}
          documents={shelf.documents}
        />
      ))}
    </section>
  );
}

async function HomeLibrarySection() {
  const documents = await listPublicDocuments();
  const publicRecords = documents.filter((record) => record.visibility === "public");
  const previews = publicRecords.map((record) => toDocumentPreview(record));
  const reactionTotals = await listReactionTotalsForRecords(
    publicRecords.map((record) => record.id),
  );
  const availableTags = getAvailableTagsFromPreviews(previews);

  return (
    <PublicLibraryBrowser
      records={previews}
      availableTags={availableTags}
      reactionTotals={Object.fromEntries(reactionTotals)}
    />
  );
}

function HomeShelvesFallback() {
  return (
    <section className="mt-16 grid gap-12 md:mt-[112px]">
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <div key={sectionIndex}>
          <div className="h-8 w-48 animate-pulse rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          <div className="mt-2 h-6 w-80 animate-pulse rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          <div className="mt-6 grid gap-4">
            {Array.from({ length: 2 }).map((__, cardIndex) => (
              <div
                key={cardIndex}
                className="rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-5 py-5"
              >
                <div className="h-6 w-3/5 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
                <div className="mt-3 h-5 w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
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
