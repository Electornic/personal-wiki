import { CurationShelf } from "@/components/curation-shelf";
import { PublicLibraryBrowser } from "@/components/public-library-browser";
import {
  buildHomeCurationShelves,
  getAvailableTags,
  parseDiscoveryState,
} from "@/lib/wiki/discovery";
import { listPublicDocuments } from "@/lib/wiki/documents";
import { listReactionTotalsForRecords } from "@/lib/wiki/reactions";
import { listPublicCurationShelves } from "@/lib/wiki/shelves";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const initialDiscoveryState = parseDiscoveryState(await searchParams);
  const documents = await listPublicDocuments();
  const publicRecords = documents.filter((record) => record.visibility === "public");
  const [reactionTotals, authoredShelves] = await Promise.all([
    listReactionTotalsForRecords(publicRecords.map((record) => record.id)),
    listPublicCurationShelves("home"),
  ]);
  const availableTags = getAvailableTags(publicRecords);
  const shelves =
    authoredShelves.length > 0
      ? authoredShelves
      : buildHomeCurationShelves(publicRecords);

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

      <section id="library" className="mt-16 md:mt-20">
        <PublicLibraryBrowser
          records={publicRecords}
          availableTags={availableTags}
          initialState={initialDiscoveryState}
          reactionTotals={Object.fromEntries(reactionTotals)}
        />
      </section>
    </main>
  );
}
