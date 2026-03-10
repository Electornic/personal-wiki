import { notFound, redirect } from "next/navigation";

import { AuthorDocumentForm } from "@/components/author-document-form";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import { getAuthorDocumentById } from "@/lib/wiki/documents";

type PageProps = {
  params: Promise<{ documentId: string }>;
};

export default async function EditAuthorDocumentPage({ params }: PageProps) {
  const access = await requireAuthorAccess();

  if (!access.configured) {
    redirect("/author");
  }

  const { documentId } = await params;
  const document = await getAuthorDocumentById(documentId);

  if (!document) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10 md:px-10">
      <p className="section-kicker">Author workspace</p>
      <h1 className="section-title">Edit record</h1>
      <AuthorDocumentForm document={document} />
    </main>
  );
}
