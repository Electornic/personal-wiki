export default function RootLoading() {
  return (
    <main className="site-shell pb-20 pt-12 md:pt-16">
      <section className="animate-pulse">
        <div className="mx-auto h-12 w-full max-w-[560px] rounded-[6px] bg-[rgba(42,36,25,0.08)] md:h-16" />
        <div className="mx-auto mt-6 h-6 w-full max-w-[720px] rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
      </section>

      <section className="mt-16 grid gap-6 animate-pulse md:mt-[112px]">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="min-h-[224px] rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-6 py-6"
          >
            <div className="h-8 w-2/3 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-5 h-5 w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-3 h-5 w-5/6 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-6 flex gap-2">
              <div className="h-6 w-20 rounded-[999px] bg-[rgba(42,36,25,0.08)]" />
              <div className="h-6 w-16 rounded-[999px] bg-[rgba(42,36,25,0.08)]" />
              <div className="h-6 w-24 rounded-[999px] bg-[rgba(42,36,25,0.08)]" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
