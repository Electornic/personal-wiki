"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getBrowserSupabaseClient } from "@/shared/api/supabase/browser";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

type SiteHeaderClientProps = {
  initialAuthStatus: AuthStatus;
};

function HomeIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M2.667 8L8 3.333 13.333 8M4 7v5.333A1.333 1.333 0 0 0 5.333 13.667h5.334A1.333 1.333 0 0 0 12 12.333V7"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function WorkspaceIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}


export function SiteHeaderClient({ initialAuthStatus }: SiteHeaderClientProps) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(initialAuthStatus);

  useEffect(() => {
    setAuthStatus(initialAuthStatus);
  }, [initialAuthStatus]);

  useEffect(() => {
    let isActive = true;
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    const syncAuthState = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      if (error) {
        setAuthStatus("anonymous");
        return;
      }

      setAuthStatus(data.session ? "authenticated" : "anonymous");
    };

    void syncAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) {
        return;
      }

      setAuthStatus(session?.user ? "authenticated" : "anonymous");
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(247,243,237,0.8)] backdrop-blur-sm">
      <div className="site-shell flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-[20px] leading-7 font-semibold tracking-[-0.5px] text-[var(--foreground)] transition-opacity hover:opacity-70"
        >
          Personal Wiki
        </Link>

        <nav className="flex items-center gap-3">
          {authStatus === "authenticated" ? (
            <>
              <Link
                href="/"
                className="inline-flex h-8 items-center justify-center rounded-[4px] px-2 text-[var(--foreground)] transition hover:bg-[var(--surface-hover)] md:gap-2 md:px-[10px]"
              >
                <HomeIcon />
                <span className="hidden text-[14px] leading-5 font-medium md:inline">
                  Home
                </span>
              </Link>
              <Link
                href="/author"
                className="inline-flex h-8 items-center justify-center rounded-[4px] px-2 text-[var(--foreground)] transition hover:bg-[var(--surface-hover)] md:gap-2 md:px-[10px]"
              >
                <WorkspaceIcon />
                <span className="hidden text-[14px] leading-5 font-medium md:inline">
                  Workspace
                </span>
              </Link>
            </>
          ) : authStatus === "anonymous" ? (
            <Link
              href="/author/sign-in"
              className="inline-flex h-8 min-w-[70px] items-center justify-center rounded-[4px] bg-[var(--accent)] px-3 text-[14px] leading-5 font-medium text-[var(--accent-text)] no-underline transition hover:bg-[var(--accent-hover)]"
            >
              Sign In
            </Link>
          ) : (
            <div className="h-8 min-w-[70px]" aria-hidden="true" />
          )}
        </nav>
      </div>
    </header>
  );
}
