"use client";

import { useRouter } from "next/navigation";

function BackIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path d="M10 3.333 5.333 8 10 12.667" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/library");
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
    >
      <BackIcon />
      Back
    </button>
  );
}
