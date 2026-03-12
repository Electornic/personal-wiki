import Link from "next/link";

import { signInWithPassword, signUpWithPassword } from "@/app/author/actions";
import { hasAuthoringEnv } from "@/lib/env";

type PageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AuthorSignInPage({ searchParams }: PageProps) {
  const { error, success } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="button-secondary">
            Back to Library
          </Link>
        </div>

        <div className="surface-card p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl mb-3">Welcome</h1>
            <p className="text-base text-muted-foreground">
              Sign in to write and share your thoughts
            </p>
          </div>

          {success ? (
            <p className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
              Account created. If email confirmation is enabled, verify the email
              and then log in.
            </p>
          ) : null}

          {error ? (
            <p className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
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

          <div className="grid gap-6">
            <form action={signInWithPassword} className="space-y-4">
              <p className="section-kicker">Sign In</p>
              <div className="space-y-2">
                <label className="field">
                  <span>Email</span>
                  <input name="email" type="email" required />
                </label>
              </div>
              <div className="space-y-2">
                <label className="field">
                  <span>Password</span>
                  <input name="password" type="password" required />
                </label>
              </div>
              <button className="button-primary w-full" type="submit">
                Sign In
              </button>
            </form>

            <div className="border-t border-border pt-6">
              <form action={signUpWithPassword} className="space-y-4">
                <p className="section-kicker">Sign Up</p>
                <div className="space-y-2">
                  <label className="field">
                    <span>Name</span>
                    <input name="userName" required />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="field">
                    <span>Email</span>
                    <input name="email" type="email" required />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="field">
                    <span>Password</span>
                    <input name="password" type="password" minLength={8} required />
                  </label>
                </div>
                <button className="button-primary w-full" type="submit">
                  Create Account
                </button>
              </form>
            </div>
          </div>
        </div>

        {!hasAuthoringEnv() ? (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-5 text-sm leading-7 text-stone-700">
            Signup/login requires `NEXT_PUBLIC_SUPABASE_URL`,
            `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
          </div>
        ) : null}
      </div>
    </div>
  );
}
