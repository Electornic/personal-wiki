import { DocumentCard } from "@/components/document-card";
import { listPublicDocuments } from "@/lib/wiki/documents";

export default async function Home() {
  const documents = await listPublicDocuments();
  const publicRecords = documents.filter((record) => record.visibility === "public");

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

      <section id="library" className="mt-16 md:mt-[112px]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[30px] leading-9 font-semibold tracking-[-0.3px] text-[#2a2419]">
            Recent Entries
          </h2>
          <span className="text-[14px] leading-5 text-[#6b6354]">
            {publicRecords.length} {publicRecords.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="grid gap-6">
          {publicRecords.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>

        {publicRecords.length === 0 ? (
          <div className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-6 py-12 text-center text-[18px] leading-8 text-[#6b6354]">
            No public entries yet.
          </div>
        ) : null}
      </section>
    </main>
  );
}
