import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { signInWithPassword, signUpWithPassword } from "@/app/author/actions";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { getAuthorAccess } from "@/lib/wiki/auth";
import { hasAuthoringEnv } from "@/shared/config/env";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    tab?: string;
  }>;
};

function getAuthErrorMessage(error?: string) {
  switch (error) {
    case "user-name-taken":
      return "That user name is already taken.";
    case "weak-password":
      return "Password must be at least 8 characters.";
    case "missing-signup-fields":
    case "missing-login-fields":
      return "Fill in all required fields.";
    case "config":
      return "Authentication is not configured yet.";
    default:
      return error
        ? "Authentication failed. Check the form values and Supabase settings."
        : null;
  }
}

export default function AuthorSignInPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] px-4 py-8 md:px-0 md:py-16">
      <div className="mx-auto flex min-h-full w-full max-w-[1096px] items-center justify-center px-0 md:px-[324px]">
        <Suspense fallback={<SignInFormSkeleton />}>
          <SignInContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function SignInContent({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ error?: string; success?: string; tab?: string }>;
}) {
  await connection();

  const access = await getAuthorAccess();

  if (access.isAuthenticated) {
    redirect("/author");
  }

  const { error, success, tab } = await searchParamsPromise;
  const activeTab = tab === "signup" ? "signup" : "signin";
  const isSignUp = activeTab === "signup";
  const errorMessage = getAuthErrorMessage(error);

  return (
    <>
        <div className="w-full max-w-[448px]">
          <Link
            href="/"
            className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 font-medium text-[#2a2419] transition-all duration-200 hover:-translate-y-px hover:bg-[rgba(232,227,219,0.45)]"
          >
            <span aria-hidden="true" className="text-[18px] leading-none">
              ←
            </span>
            Back to Library
          </Link>

          <div className="mt-8 rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-[32px] py-[32px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.1)] transition-shadow duration-200 md:px-[33px] md:py-[33px] hover:shadow-[0px_18px_40px_rgba(42,36,25,0.08)]">
            <div className="text-center">
              <h1 className="text-[30px] leading-9 font-semibold tracking-[-0.6px] text-[#2a2419]">
                Welcome
              </h1>
              <p className="mt-3 text-[16px] leading-6 text-[#6b6354]">
                Sign in to write and share your thoughts
              </p>
            </div>

            <div className="mt-8 rounded-[10px] bg-[#e8e3db] p-[3px]">
              <div className="grid grid-cols-2 gap-0.5">
                <Link
                  href="/author/sign-in?tab=signin"
                  className={`inline-flex h-[29px] items-center justify-center rounded-[10px] px-[9px] text-[14px] leading-5 font-medium transition-all duration-200 ${
                    !isSignUp
                      ? "bg-white text-[#2a2419] shadow-[0_4px_12px_rgba(42,36,25,0.08)]"
                      : "text-[#2a2419] hover:bg-[rgba(255,255,255,0.45)]"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/author/sign-in?tab=signup"
                  className={`inline-flex h-[29px] items-center justify-center rounded-[10px] px-[9px] text-[14px] leading-5 font-medium transition-all duration-200 ${
                    isSignUp
                      ? "bg-white text-[#2a2419] shadow-[0_4px_12px_rgba(42,36,25,0.08)]"
                      : "text-[#2a2419] hover:bg-[rgba(255,255,255,0.45)]"
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            </div>

            {success ? (
              <p className="mt-6 rounded-[6px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
                Account created. If email confirmation is enabled, verify the email
                and then log in.
              </p>
            ) : null}

            {errorMessage ? (
              <p className="mt-6 rounded-[6px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
                {errorMessage}
              </p>
            ) : null}

            {isSignUp ? (
              <form action={signUpWithPassword} className="mt-8 space-y-4">
                <input type="hidden" name="tab" value="signup" />
                <label className="block">
                  <span className="block text-[14px] leading-[14px] font-medium text-[#2a2419]">
                    Name
                  </span>
                  <input
                    name="userName"
                    required
                    placeholder="Your name"
                    className="mt-2 h-10 w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[#faf8f5] px-3 py-1 text-[16px] leading-normal text-[#2a2419] placeholder:text-[#6b6354] transition-all duration-200 outline-none focus:border-[#2a2419] focus:bg-white focus:shadow-[0_0_0_3px_rgba(42,36,25,0.08)]"
                  />
                </label>
                <label className="block">
                  <span className="block text-[14px] leading-[14px] font-medium text-[#2a2419]">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="mt-2 h-10 w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[#faf8f5] px-3 py-1 text-[16px] leading-normal text-[#2a2419] placeholder:text-[#6b6354] transition-all duration-200 outline-none focus:border-[#2a2419] focus:bg-white focus:shadow-[0_0_0_3px_rgba(42,36,25,0.08)]"
                  />
                </label>
                <label className="block">
                  <span className="block text-[14px] leading-[14px] font-medium text-[#2a2419]">
                    Password
                  </span>
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    placeholder="••••••••"
                    className="mt-2 h-10 w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[#faf8f5] px-3 py-1 text-[16px] leading-normal text-[#2a2419] placeholder:text-[#6b6354] transition-all duration-200 outline-none focus:border-[#2a2419] focus:bg-white focus:shadow-[0_0_0_3px_rgba(42,36,25,0.08)]"
                  />
                </label>
                <AuthSubmitButton
                  idleLabel="Create Account"
                  pendingLabel="Creating Account..."
                />
              </form>
            ) : (
              <form action={signInWithPassword} className="mt-8 space-y-4">
                <input type="hidden" name="tab" value="signin" />
                <label className="block">
                  <span className="block text-[14px] leading-[14px] font-medium text-[#2a2419]">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="mt-2 h-10 w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[#faf8f5] px-3 py-1 text-[16px] leading-normal text-[#2a2419] placeholder:text-[#6b6354] transition-all duration-200 outline-none focus:border-[#2a2419] focus:bg-white focus:shadow-[0_0_0_3px_rgba(42,36,25,0.08)]"
                  />
                </label>
                <label className="block">
                  <span className="block text-[14px] leading-[14px] font-medium text-[#2a2419]">
                    Password
                  </span>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="mt-2 h-10 w-full rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-[#faf8f5] px-3 py-1 text-[16px] leading-normal text-[#2a2419] placeholder:text-[#6b6354] transition-all duration-200 outline-none focus:border-[#2a2419] focus:bg-white focus:shadow-[0_0_0_3px_rgba(42,36,25,0.08)]"
                  />
                </label>
                <AuthSubmitButton idleLabel="Sign In" pendingLabel="Signing In..." />
              </form>
            )}
          </div>

          <p className="mx-auto mt-6 max-w-[344px] text-center text-[14px] leading-5 text-[#6b6354] md:max-w-none">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {!hasAuthoringEnv() ? (
          <div className="mt-6 rounded-[6px] border border-amber-300 bg-amber-50 px-5 py-5 text-sm leading-7 text-stone-700">
            Signup/login requires `NEXT_PUBLIC_SUPABASE_URL`,
            `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
          </div>
        ) : null}
    </>
  );
}

function SignInFormSkeleton() {
  return (
    <div className="w-full max-w-[448px] animate-pulse">
      <div className="h-8 w-32 rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
      <div className="mt-8 rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-[32px] py-[32px]">
        <div className="mx-auto h-9 w-32 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
        <div className="mx-auto mt-3 h-5 w-56 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
        <div className="mt-8 h-9 w-full rounded-[10px] bg-[rgba(42,36,25,0.08)]" />
        <div className="mt-8 space-y-4">
          <div className="h-[54px] w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          <div className="h-[54px] w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          <div className="h-9 w-full rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
        </div>
      </div>
    </div>
  );
}
