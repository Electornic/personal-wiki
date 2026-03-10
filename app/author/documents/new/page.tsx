import { redirect } from "next/navigation";

import { AuthorDocumentForm } from "@/components/author-document-form";
import { requireAuthorAccess } from "@/lib/wiki/auth";

export default async function NewAuthorDocumentPage() {
  const access = await requireAuthorAccess();

  if (!access.configured) {
    redirect("/author");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10 md:px-10">
      <p className="section-kicker">Author workspace</p>
      <h1 className="section-title">New record</h1>
      <AuthorDocumentForm />
    </main>
  );
}
