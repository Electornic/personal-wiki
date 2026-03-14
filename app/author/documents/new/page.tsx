import { redirect } from "next/navigation";

import { AuthorDocumentForm } from "@/components/author-document-form";
import { requireAuthorAccess } from "@/lib/wiki/auth";

export default async function NewAuthorDocumentPage() {
  const access = await requireAuthorAccess();

  if (!access.configured) {
    redirect("/author");
  }

  return (
    <main className="site-shell pb-20 pt-[154px]">
      <AuthorDocumentForm />
    </main>
  );
}
