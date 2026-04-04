import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { AuthorDocumentForm } from "@/components/author-document-form";
import { requireAuthorAccess } from "@/lib/wiki/auth";

export default function NewAuthorDocumentPage() {
  return (
    <div className="px-6 py-8 lg:px-10">
      <Suspense fallback={<EditorFormSkeleton />}>
        <NewDocumentContent />
      </Suspense>
    </div>
  );
}

async function NewDocumentContent() {
  await connection();

  const access = await requireAuthorAccess();

  if (!access.configured) {
    redirect("/author");
  }

  return <AuthorDocumentForm />;
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
