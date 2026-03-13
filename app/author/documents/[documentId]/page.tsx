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
    <main className="mx-auto w-full max-w-[1096px] px-4 pb-20 pt-[154px] sm:px-4 md:px-4 lg:px-8">
      <AuthorDocumentForm document={document} />
    </main>
  );
}
