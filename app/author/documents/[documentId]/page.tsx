import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { AuthorDocumentForm } from "@/components/author-document-form";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import { getAuthorDocumentById } from "@/entities/record/api/documents";

type PageProps = {
  params: Promise<{ documentId: string }>;
};

export default function EditAuthorDocumentPage({ params }: PageProps) {
  return (
    <main className="site-shell pb-20 pt-[154px]">
      <Suspense fallback={<EditorFormSkeleton />}>
        <EditDocumentContent params={params} />
      </Suspense>
    </main>
  );
}

async function EditDocumentContent({ params }: { params: Promise<{ documentId: string }> }) {
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

  return <AuthorDocumentForm document={fetchedDocument} />;
}

function EditorFormSkeleton() {
  return (
    <div className="grid gap-8 animate-pulse">
      <div className="rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-[24px] py-[24px] shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
        <div className="space-y-5">
          <div className="h-6 w-24 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          <div className="h-10 w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-18 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="h-18 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          </div>
          <div className="h-[360px] w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
        </div>
      </div>
    </div>
  );
}
