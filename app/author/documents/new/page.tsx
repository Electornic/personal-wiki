import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AuthorDocumentForm } from "@/components/author-document-form";
import { requireAuthorAccess } from "@/lib/wiki/auth";

export default async function NewAuthorDocumentPage() {
  await connection();

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
