export default function MyLibraryLoading() {
  return (
    <main className="site-shell pb-20 pt-12">
      <section className="animate-pulse">
        <div className="h-10 w-40 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
        <div className="mt-3 h-6 w-72 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
      </section>

      <section className="mt-10 w-full animate-pulse">
        <div className="h-9 w-full max-w-[448px] rounded-[10px] bg-[rgba(42,36,25,0.08)]" />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-6 py-6"
            >
              <div className="h-8 w-3/5 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
              <div className="mt-4 h-5 w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
              <div className="mt-3 h-5 w-5/6 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
              <div className="mt-6 flex gap-2">
                <div className="h-6 w-16 rounded-[999px] bg-[rgba(42,36,25,0.08)]" />
                <div className="h-6 w-20 rounded-[999px] bg-[rgba(42,36,25,0.08)]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
