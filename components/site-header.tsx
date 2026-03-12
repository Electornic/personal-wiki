import Link from "next/link";

type SiteHeaderProps = {
  isAuthenticated: boolean;
};

export function SiteHeader({ isAuthenticated }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl tracking-tight transition-opacity hover:opacity-70"
        >
          Personal Wiki
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/author/documents/new" className="button-secondary">
                Write
              </Link>
              <Link href="/author" className="button-secondary">
                Workspace
              </Link>
            </>
          ) : (
            <Link href="/author/sign-in" className="button-primary">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
