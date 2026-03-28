import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-shell flex min-h-[calc(100vh-4rem)] items-center py-16">
      <div className="w-full rounded-[10px] border border-[rgba(42,36,25,0.1)] bg-white px-8 py-10 text-center shadow-[0_18px_50px_rgba(42,36,25,0.08)]">
        <p className="text-[12px] leading-4 tracking-[0.24em] text-[#8a826f] uppercase">
          404
        </p>
        <h1 className="mt-4 text-[32px] leading-[38px] font-semibold text-[#2a2419]">
          This page could not be found
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-7 text-[#6b6354]">
          The link may be outdated, the topic may not exist yet, or the document is no
          longer available.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-[42px] items-center justify-center rounded-[4px] bg-[#2a2419] px-5 text-[14px] leading-5 font-medium text-[#faf8f5]"
          >
            Back to library
          </Link>
          <Link
            href="/author"
            className="inline-flex h-[42px] items-center justify-center rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-white px-5 text-[14px] leading-5 font-medium text-[#2a2419]"
          >
            Open workspace
          </Link>
        </div>
      </div>
    </main>
  );
}
