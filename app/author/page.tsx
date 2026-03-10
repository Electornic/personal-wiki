import Link from "next/link";

import { deleteDocument, signOut } from "@/app/author/actions";
import { getOwnerEmail, hasSupabaseEnv } from "@/lib/env";
import { getAuthorAccess } from "@/lib/wiki/auth";
import { listAuthorDocuments } from "@/lib/wiki/documents";

export default async function AuthorPage() {
  const access = await getAuthorAccess();
  const documents = access.isOwner ? await listAuthorDocuments() : [];

  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12 md:px-10">
        <p className="section-kicker">Author workspace</p>
        <div className="rounded-[2rem] border border-amber-300 bg-amber-50 p-8">
          <h1 className="text-3xl text-stone-900">Supabase setup required</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
            `.env.example`에 있는 값을 채우면 author 로그인과 저장 기능이 활성화됩니다.
            public reading surface는 현재 demo data로 미리 볼 수 있습니다.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-stone-600">
            <li>`NEXT_PUBLIC_SUPABASE_URL`</li>
            <li>`NEXT_PUBLIC_SUPABASE_ANON_KEY`</li>
            <li>`SUPABASE_SERVICE_ROLE_KEY`</li>
            <li>`SUPABASE_OWNER_EMAIL`</li>
          </ul>
        </div>
      </main>
    );
  }

  if (!access.isOwner) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12 md:px-10">
        <p className="section-kicker">Author workspace</p>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)]">
          <h1 className="text-4xl text-stone-900">Author sign-in required</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
            이 영역은 `SUPABASE_OWNER_EMAIL`에 지정한 author만 사용할 수 있습니다.
          </p>
          <Link className="button-primary mt-6 inline-flex" href="/author/sign-in">
            sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10 md:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Author workspace</p>
          <h1 className="section-title">책과 아티클 기록 관리</h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Signed in as {access.userEmail ?? getOwnerEmail()}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="button-primary" href="/author/documents/new">
            new document
          </Link>
          <form action={signOut}>
            <button className="button-secondary" type="submit">
              sign out
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4">
        {documents.map((document) => (
          <article
            key={document.id}
            className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-6 shadow-[0_24px_64px_rgba(51,39,18,0.06)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em] text-stone-500">
                  <span>{document.visibility}</span>
                  <span>{document.sourceType}</span>
                </div>
                <h2 className="text-2xl text-stone-900">{document.title}</h2>
                <p className="text-sm leading-7 text-stone-600">{document.intro}</p>
              </div>
              <div className="flex gap-3">
                <Link className="button-secondary" href={`/library/${document.slug}`}>
                  preview
                </Link>
                <Link className="button-primary" href={`/author/documents/${document.id}`}>
                  edit
                </Link>
                <form action={deleteDocument}>
                  <input type="hidden" name="documentId" value={document.id} />
                  <button className="button-secondary" type="submit">
                    delete
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
