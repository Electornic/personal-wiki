import Link from "next/link";

type SiteHeaderProps = {
  isAuthenticated: boolean;
};

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

function MyLibraryIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M4.667 2.667h6.666A1.333 1.333 0 0 1 12.667 4v9.333L8 10.667l-4.667 2.666V4a1.333 1.333 0 0 1 1.334-1.333Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function WriteIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M10.667 2.667 13.333 5.333 6 12.667 3.333 13.333 4 10.667l6.667-8Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="m9.333 4 2.667 2.667" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function SiteHeader({ isAuthenticated }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(42,36,25,0.1)] bg-[rgba(255,255,255,0.5)] backdrop-blur-sm">
      <div className="site-shell flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-[20px] leading-7 font-semibold tracking-[-0.5px] text-[#2a2419] transition-opacity hover:opacity-70"
        >
          Personal Wiki
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/me/library"
                className="inline-flex h-8 items-center justify-center rounded-[4px] px-2 text-[#2a2419] transition hover:bg-[rgba(232,227,219,0.45)] md:gap-2 md:px-[10px]"
              >
                <MyLibraryIcon />
                <span className="hidden text-[14px] leading-5 font-medium md:inline">
                  My Library
                </span>
              </Link>
              <Link
                href="/author"
                className="inline-flex h-8 items-center justify-center rounded-[4px] px-2 text-[#2a2419] transition hover:bg-[rgba(232,227,219,0.45)] md:gap-2 md:px-[10px]"
              >
                <WorkspaceIcon />
                <span className="hidden text-[14px] leading-5 font-medium md:inline">
                  Workspace
                </span>
              </Link>
              <Link
                href="/author/documents/new"
                className="inline-flex h-8 items-center justify-center rounded-[4px] px-2 text-[#2a2419] transition hover:bg-[rgba(232,227,219,0.45)] md:gap-2 md:px-[10px]"
              >
                <WriteIcon />
                <span className="hidden text-[14px] leading-5 font-medium md:inline">
                  Write
                </span>
              </Link>
            </>
          ) : (
            <Link
              href="/author/sign-in"
              className="inline-flex h-8 min-w-[70px] items-center justify-center rounded-[4px] bg-[#2a2419] px-3 text-[14px] leading-5 font-medium text-[#faf8f5] no-underline"
            >
              <span className="text-[14px] leading-5 font-medium text-[#faf8f5]">
                Sign In
              </span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
