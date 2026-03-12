import Link from "next/link";

type SiteHeaderProps = {
  isAuthenticated: boolean;
};

export function SiteHeader({ isAuthenticated }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(42,36,25,0.1)] bg-[rgba(255,255,255,0.5)] backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1096px] items-center justify-between px-4 sm:px-4 md:px-4 lg:px-[68px]">
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
                href="/author/documents/new"
                className="inline-flex h-8 items-center justify-center rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-white px-3 text-[14px] leading-5 font-medium text-[#2a2419]"
              >
                Write
              </Link>
              <Link
                href="/author"
                className="inline-flex h-8 items-center justify-center rounded-[4px] border border-[rgba(42,36,25,0.12)] bg-white px-3 text-[14px] leading-5 font-medium text-[#2a2419]"
              >
                Workspace
              </Link>
            </>
          ) : (
            <Link
              href="/author/sign-in"
              className="inline-flex h-8 items-center justify-center rounded-[4px] bg-[#2a2419] px-3 text-[14px] leading-5 font-medium text-[#faf8f5]"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
