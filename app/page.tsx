import Link from "next/link";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { listPublicDiscoveryPage } from "@/entities/record/api/documents";
import { DocumentCard } from "@/entities/record/ui/document-card";
import { parseDiscoveryState } from "@/lib/wiki/discovery";
import { getAuthStatus } from "@/lib/wiki/auth";

export default function LandingPage() {
  return (
    <main className="surface-light site-shell mx-auto my-4 max-w-[1096px] rounded-[12px] border border-[var(--content-border)] bg-[var(--content-bg)] pb-20 pt-16 backdrop-blur-sm md:pt-24">
      <section className="mx-auto max-w-[640px] text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-warm)]">
          <svg aria-hidden="true" className="h-8 w-8 text-[var(--accent)]" fill="none" viewBox="0 0 32 32">
            <path
              d="M8 4h16a2 2 0 0 1 2 2v20l-10-6-10 6V6a2 2 0 0 1 2-2Z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
        <h1 className="text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--foreground)] md:text-[56px]">
          Your Personal Library
        </h1>
        <p className="mx-auto mt-5 max-w-[480px] text-[18px] leading-[28px] text-[var(--muted)]">
          Read, reflect, and record. A quiet space to collect your thoughts on books and articles.
        </p>
        <Suspense fallback={<HeroButtonsFallback />}>
          <HeroButtons />
        </Suspense>
      </section>

      <section className="mt-20 md:mt-28">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[var(--foreground)]">
            Recent Publications
          </h2>
          <Link
            href="/library"
            className="text-[14px] font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            View all &rarr;
          </Link>
        </div>

        <Suspense fallback={<RecentDocsFallback />}>
          <RecentDocs />
        </Suspense>
      </section>
    </main>
  );
}

async function RecentDocs() {
  const paginated = await getCachedRecentDocs();

  if (paginated.documents.length === 0) {
    return (
      <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-6 py-12 text-center">
        <p className="text-[15px] text-[var(--muted)]">No public documents yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {paginated.documents.slice(0, 3).map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}

async function getCachedRecentDocs() {
  "use cache";

  cacheLife("minutes");
  cacheTag("public-discovery");

  return listPublicDiscoveryPage(
    parseDiscoveryState({}),
    1,
    3,
  );
}

async function HeroButtons() {
  const { isAuthenticated } = await getAuthStatus();

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <Link
        href="/library"
        className="inline-flex h-11 items-center justify-center rounded-[6px] bg-[var(--accent)] px-6 text-[15px] font-medium !text-[var(--accent-text)] transition hover:bg-[var(--accent-hover)]"
      >
        Browse Library
      </Link>
      {isAuthenticated ? (
        <Link
          href="/author"
          className="inline-flex h-11 items-center justify-center rounded-[6px] border border-[var(--border)] px-6 text-[15px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
        >
          Workspace
        </Link>
      ) : (
        <Link
          href="/author/sign-in"
          className="inline-flex h-11 items-center justify-center rounded-[6px] border border-[var(--border)] px-6 text-[15px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}

function HeroButtonsFallback() {
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <div className="h-11 w-36 animate-pulse rounded-[6px] bg-[var(--surface-warm)]" />
      <div className="h-11 w-24 animate-pulse rounded-[6px] bg-[var(--surface-warm)]" />
    </div>
  );
}

function RecentDocsFallback() {
  return (
    <div className="grid gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-6 py-6"
        >
          <div className="h-7 w-2/5 rounded bg-[var(--surface-warm)]" />
          <div className="mt-4 h-4 w-full rounded bg-[var(--surface-warm)]" />
          <div className="mt-3 h-4 w-3/4 rounded bg-[var(--surface-warm)]" />
        </div>
      ))}
    </div>
  );
}
