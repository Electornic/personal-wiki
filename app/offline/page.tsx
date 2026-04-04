import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="surface-light site-shell mx-auto my-4 max-w-[1096px] rounded-[12px] border border-[var(--content-border)] bg-[var(--content-bg)] pb-20 pt-16 backdrop-blur-sm md:pt-20">
      <section className="mx-auto max-w-[720px] rounded-[10px] border border-[rgba(42,36,25,0.1)] bg-white px-6 py-10 text-center md:px-10 md:py-14">
        <p className="section-kicker">Offline</p>
        <h1 className="mt-3 text-[36px] leading-[42px] font-semibold tracking-[-0.72px] text-[var(--foreground)] md:text-[44px] md:leading-[48px]">
          You are offline for now
        </h1>
        <p className="mx-auto mt-4 max-w-[540px] text-[18px] leading-[29px] text-[var(--muted)]">
          The reading app shell is still available, but this page needs a network
          connection or a previously cached public route.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="button-primary">
            Return to library
          </Link>
          <Link href="/topics/attention" className="button-secondary">
            Open a cached topic if available
          </Link>
        </div>
      </section>
    </main>
  );
}
