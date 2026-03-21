import { notFound, redirect } from "next/navigation";

import { AuthorDocumentForm } from "@/components/author-document-form";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import { getAuthorDocumentById } from "@/entities/record/api/documents";

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
    <main className="site-shell pb-20 pt-[154px]">
      <AuthorDocumentForm document={document} />
    </main>
  );
}
