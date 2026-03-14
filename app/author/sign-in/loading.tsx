export default function AuthorSignInLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8f5] px-4 py-8 md:px-0 md:py-16">
      <div className="mx-auto flex min-h-full w-full max-w-[1096px] items-center justify-center px-0 md:px-[324px]">
        <div className="w-full max-w-[448px] animate-pulse">
          <div className="h-8 w-32 rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
          <div className="mt-8 rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-[32px] py-[32px]">
            <div className="mx-auto h-9 w-32 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mx-auto mt-3 h-5 w-56 rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-8 h-9 w-full rounded-[10px] bg-[rgba(42,36,25,0.08)]" />
            <div className="mt-8 space-y-4">
              <div className="h-[54px] w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
              <div className="h-[54px] w-full rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
              <div className="h-9 w-full rounded-[4px] bg-[rgba(42,36,25,0.08)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
