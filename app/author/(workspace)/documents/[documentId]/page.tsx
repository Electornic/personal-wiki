import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { AuthorDocumentView } from "@/app/author/(workspace)/documents/[documentId]/_components/author-document-view";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import { getAuthorDocumentById } from "@/entities/record/api/documents";

type PageProps = {
  params: Promise<{ documentId: string }>;
};

export default function AuthorDocumentPage({ params }: PageProps) {
  return (
    <div className="px-6 py-8 lg:px-10">
      <Suspense fallback={<DocumentSkeleton />}>
        <DocumentContent params={params} />
      </Suspense>
    </div>
  );
}

async function DocumentContent({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  await connection();

  const access = await requireAuthorAccess();

  if (!access.configured) {
    redirect("/author");
  }

  const fetchedDocument = await getAuthorDocumentById(documentId);

  if (!fetchedDocument) {
    notFound();
  }

  return <AuthorDocumentView doc={fetchedDocument} />;
}

function DocumentSkeleton() {
  return (
    <div className="grid gap-8 animate-pulse">
      <div className="h-8 w-32 rounded-[6px] bg-[var(--surface-warm)]" />
      <div className="space-y-4">
        <div className="h-12 w-3/4 rounded-[6px] bg-[var(--surface-warm)]" />
        <div className="h-5 w-1/3 rounded-[6px] bg-[var(--surface-warm)]" />
        <div className="mt-8 space-y-3">
          <div className="h-5 w-full rounded-[6px] bg-[var(--surface-warm)]" />
          <div className="h-5 w-5/6 rounded-[6px] bg-[var(--surface-warm)]" />
          <div className="h-5 w-4/6 rounded-[6px] bg-[var(--surface-warm)]" />
        </div>
      </div>
    </div>
  );
}
