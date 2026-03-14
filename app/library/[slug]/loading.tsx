export default function LibraryDocumentLoading() {
  return (
    <main className="site-shell pb-20 pt-8">
      <div className="site-shell-content animate-pulse">
        <div className="h-8 w-24 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />

        <article className="mt-8 w-full">
          <div className="h-5 w-5 rounded-full bg-[rgba(42,36,25,0.08)]" />
          <div className="mt-4 h-12 w-full rounded-[6px] bg-[rgba(42,36,25,0.08)] md:h-16" />
          <div className="mt-4 h-6 w-64 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          <div className="mt-5 flex gap-2">
            <div className="h-6 w-20 rounded-[999px] bg-[rgba(42,36,25,0.08)]" />
            <div className="h-6 w-16 rounded-[999px] bg-[rgba(42,36,25,0.08)]" />
            <div className="h-6 w-24 rounded-[999px] bg-[rgba(42,36,25,0.08)]" />
          </div>

          <section className="mt-12 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-6 rounded-[6px] bg-[rgba(42,36,25,0.08)]"
                style={{ width: index === 5 ? "68%" : "100%" }}
              />
            ))}
          </section>

          <section className="mt-16 border-t border-[rgba(42,36,25,0.08)] pt-12">
            <div className="h-8 w-48 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-[21px] py-[21px]"
                >
                  <div className="h-6 w-3/5 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
                  <div className="mt-3 h-5 w-1/3 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
