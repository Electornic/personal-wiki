import Link from "next/link";

import { signInWithPassword, signUpWithPassword } from "@/app/author/actions";
import { hasAuthoringEnv } from "@/lib/env";

type PageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AuthorSignInPage({ searchParams }: PageProps) {
  const { error, success } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12 md:px-10">
      <Link href="/" className="text-sm text-stone-500 transition hover:text-stone-900">
        home
      </Link>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)]">
        <p className="section-kicker">Account access</p>
        <h1 className="mt-4 text-4xl text-stone-900">Sign up or log in</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
          공개 문서는 비로그인으로 읽을 수 있고, 기록 작성과 댓글 작성은 로그인한
          사용자 기준으로 동작합니다.
        </p>

        {success ? (
          <p className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
            Account created. If email confirmation is enabled, verify the email
            and then log in.
          </p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
            {error === "user-name-taken"
              ? "That user name is already taken."
              : error === "weak-password"
                ? "Password must be at least 8 characters."
                : error === "missing-signup-fields" ||
                    error === "missing-login-fields"
                  ? "Fill in all required fields."
                  : "Authentication failed. Check the form values and Supabase settings."}
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <form
          action={signUpWithPassword}
          className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)]"
        >
          <p className="section-kicker">Sign up</p>
          <div className="mt-6 grid gap-4">
            <label className="field">
              <span>email</span>
              <input name="email" type="email" required />
            </label>
            <label className="field">
              <span>password</span>
              <input name="password" type="password" minLength={8} required />
            </label>
            <label className="field">
              <span>user name</span>
              <input name="userName" required />
            </label>
          </div>
          <button className="button-primary mt-6" type="submit">
            create account
          </button>
        </form>

        <form
          action={signInWithPassword}
          className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)]"
        >
          <p className="section-kicker">Log in</p>
          <div className="mt-6 grid gap-4">
            <label className="field">
              <span>email</span>
              <input name="email" type="email" required />
            </label>
            <label className="field">
              <span>password</span>
              <input name="password" type="password" required />
            </label>
          </div>
          <button className="button-primary mt-6" type="submit">
            log in
          </button>
        </form>
      </section>

      {!hasAuthoringEnv() ? (
        <section className="rounded-3xl border border-amber-300 bg-amber-50 px-5 py-5 text-sm leading-7 text-stone-700">
          Signup/login requires `NEXT_PUBLIC_SUPABASE_URL`,
          `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
        </section>
      ) : null}
    </main>
  );
}
