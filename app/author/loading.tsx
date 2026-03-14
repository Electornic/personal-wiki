export default function AuthorWorkspaceLoading() {
  return (
    <main className="site-shell pb-20 pt-20">
      <section className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="h-12 w-48 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-3 h-5 w-64 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="h-12 w-36 rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
            <div className="h-12 w-32 rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
          </div>
        </div>
        <div className="h-px w-full bg-[rgba(42,36,25,0.08)]" />
      </section>

      <section className="mt-16 grid gap-6 animate-pulse">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-[24px] py-[24px]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="h-8 w-3/5 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
                <div className="mt-4 h-5 w-2/5 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="h-5 w-16 rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
                  <div className="h-5 w-20 rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
                  <div className="h-5 w-14 rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-[38px] w-[92px] rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
                <div className="h-[38px] w-[78px] rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
                <div className="h-[34px] w-[34px] rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
