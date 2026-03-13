import { redirect } from "next/navigation";

import { AuthorDocumentForm } from "@/components/author-document-form";
import { requireAuthorAccess } from "@/lib/wiki/auth";

export default async function NewAuthorDocumentPage() {
  const access = await requireAuthorAccess();

  if (!access.configured) {
    redirect("/author");
  }

  return (
    <main className="mx-auto w-full max-w-[1096px] px-4 pb-20 pt-[154px] sm:px-4 md:px-4 lg:px-8">
      <AuthorDocumentForm />
    </main>
  );
}
