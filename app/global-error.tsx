"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#faf8f5] text-[#2a2419]">
        <main className="mx-auto flex min-h-screen max-w-[720px] items-center px-6 py-16">
          <div className="w-full rounded-[10px] border border-[rgba(42,36,25,0.1)] bg-white px-8 py-10 text-center shadow-[0_18px_50px_rgba(42,36,25,0.08)]">
            <p className="text-[12px] leading-4 tracking-[0.24em] text-[#8a826f] uppercase">
              Global Error
            </p>
            <h1 className="mt-4 text-[32px] leading-[38px] font-semibold">
              The app hit an unexpected problem
            </h1>
            <p className="mt-4 text-[16px] leading-7 text-[#6b6354]">
              Reload the page or try again. If the issue persists, return to the home
              page and restart the flow.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex h-[42px] items-center justify-center rounded-[4px] bg-[#2a2419] px-5 text-[14px] leading-5 font-medium text-[#faf8f5]"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
