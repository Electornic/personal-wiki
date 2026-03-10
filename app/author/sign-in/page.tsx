import Link from "next/link";

import { requestMagicLink } from "@/app/author/actions";
import { getOwnerEmail, hasSupabaseEnv } from "@/lib/env";

type PageProps = {
  searchParams: Promise<{ error?: string; sent?: string }>;
};

export default async function AuthorSignInPage({ searchParams }: PageProps) {
  const { error, sent } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12 md:px-10">
      <Link href="/" className="text-sm text-stone-500 transition hover:text-stone-900">
        home
      </Link>
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)]">
        <p className="section-kicker">Author sign-in</p>
        <h1 className="mt-4 text-4xl text-stone-900">Magic link only for the owner</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
          공개 문서는 비로그인으로 읽을 수 있고, 작성/수정만 author 로그인으로 보호합니다.
        </p>

        {hasSupabaseEnv() ? (
          <form action={requestMagicLink} className="mt-8 space-y-4">
            <div className="rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-700">
              owner email: {getOwnerEmail() ?? "SUPABASE_OWNER_EMAIL not set"}
            </div>
            {sent ? (
              <p className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
                매직 링크를 보냈습니다. 메일에서 로그인 링크를 열어주세요.
              </p>
            ) : null}
            {error ? (
              <p className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
                로그인 링크를 보내지 못했습니다. 환경변수와 Supabase Auth 설정을 확인해주세요.
              </p>
            ) : null}
            <button className="button-primary" type="submit">
              send magic link
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-3xl border border-amber-300 bg-amber-50 px-5 py-5 text-sm leading-7 text-stone-700">
            Supabase 환경변수가 아직 없습니다. `.env.example`를 기준으로 설정을 먼저 채워주세요.
          </div>
        )}
      </section>
    </main>
  );
}
