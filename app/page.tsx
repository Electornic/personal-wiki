import Link from "next/link";

import { DocumentCard } from "@/components/document-card";
import { listPublicDocuments } from "@/lib/wiki/documents";

export default async function Home() {
  const documents = await listPublicDocuments();
  const publicRecords = documents.filter((record) => record.visibility === "public");

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto mb-16 max-w-3xl text-center">
        <h1 className="text-5xl sm:text-6xl mb-6">
          A Space for Reading &amp; Reflection
        </h1>
        <p className="text-xl text-foreground/70 leading-relaxed">
          Thoughtful essays, book notes, and explorations on literature, design,
          philosophy, and the art of attention.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/author" className="button-primary">
            Open workspace
          </Link>
          <Link href="#library" className="button-secondary">
            Browse entries
          </Link>
        </div>
      </section>

      <section id="library" className="space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl">Recent Entries</h2>
          <span className="text-sm text-muted-foreground">
            {publicRecords.length} {publicRecords.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="grid gap-6">
          {publicRecords.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      </section>
    </main>
  );
}
