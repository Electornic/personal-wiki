"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getBrowserSupabaseClient } from "@/shared/api/supabase/browser";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

type SiteHeaderClientProps = {
  initialAuthStatus: AuthStatus;
};

function LibraryIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path d="M2 3h12M2 7h12M2 11h8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13 9l1 1-1 1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function SignInIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="5.333" r="2.667" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.333 14c0-2.577 2.09-4.667 4.667-4.667s4.667 2.09 4.667 4.667" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

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
    <header className="sticky top-0 z-50 border-b border-[var(--glass-border)] bg-[rgba(44,30,14,0.95)] backdrop-blur-[16px] md:bg-[rgba(44,30,14,0.85)]">
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
                className="inline-flex h-8 items-center justify-center rounded-[4px] px-2 !text-[var(--foreground-strong)] transition hover:bg-[var(--surface-hover)] md:gap-2 md:px-[10px]"
              >
                <HomeIcon />
                <span className="hidden text-[14px] leading-5 font-medium md:inline">
                  Home
                </span>
              </Link>
              <Link
                href="/library"
                className="inline-flex h-8 items-center justify-center rounded-[4px] px-2 !text-[var(--foreground-strong)] transition hover:bg-[var(--surface-hover)] md:gap-2 md:px-[10px]"
              >
                <LibraryIcon />
                <span className="hidden text-[14px] leading-5 font-medium md:inline">
                  Library
                </span>
              </Link>
              <Link
                href="/author"
                className="inline-flex h-8 items-center justify-center rounded-[4px] px-2 !text-[var(--foreground-strong)] transition hover:bg-[var(--surface-hover)] md:gap-2 md:px-[10px]"
              >
                <WorkspaceIcon />
                <span className="hidden text-[14px] leading-5 font-medium md:inline">
                  Workspace
                </span>
              </Link>
            </>
          ) : authStatus === "anonymous" ? (
            <>
              <Link
                href="/library"
                className="inline-flex h-8 items-center justify-center rounded-[4px] px-2 !text-[var(--foreground-strong)] transition hover:bg-[var(--surface-hover)] md:gap-2 md:px-[10px]"
              >
                <LibraryIcon />
                <span className="hidden text-[14px] leading-5 font-medium md:inline">
                  Library
                </span>
              </Link>
              <Link
                href="/author/sign-in"
                className="inline-flex h-8 items-center justify-center rounded-[4px] px-2 !text-[var(--foreground-strong)] transition hover:bg-[var(--surface-hover)] md:gap-2 md:px-[10px]"
              >
                <SignInIcon />
                <span className="hidden text-[14px] leading-5 font-medium md:inline">
                  Sign In
                </span>
              </Link>
            </>
          ) : (
            <div className="h-8 min-w-[70px]" aria-hidden="true" />
          )}
        </nav>
      </div>
    </header>
  );
}
