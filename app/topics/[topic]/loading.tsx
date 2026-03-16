export default function TopicHubLoading() {
  return (
    <main className="site-shell pb-20 pt-12 md:pt-16">
      <div className="mx-auto w-full max-w-[848px] animate-pulse">
        <div className="h-8 w-28 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />

        <section className="border-b border-[rgba(42,36,25,0.08)] pb-8 pt-8 md:pb-10">
          <div className="h-12 w-64 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          <div className="mt-4 h-8 w-full max-w-[560px] rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          <div className="mt-6 h-5 w-20 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
        </section>

        <section className="pt-12">
          <div className="h-8 w-28 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          <div className="mt-6 rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-6 py-6">
            <div className="h-7 w-2/3 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-4 h-5 w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-3 h-5 w-4/5 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
          </div>
        </section>
      </div>
    </main>
  );
}
