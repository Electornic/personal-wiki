"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 16 16"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function AuthSubmitButton({
  idleLabel,
  pendingLabel,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-[#2a2419] text-[14px] leading-5 font-medium text-[var(--accent-text)] transition-all duration-200 hover:-translate-y-px hover:bg-[#3a3328] hover:shadow-[0_10px_24px_rgba(42,36,25,0.12)] disabled:translate-y-0 disabled:bg-[#8f8778] disabled:shadow-none"
      type="submit"
      disabled={pending}
    >
      {pending ? <Spinner /> : null}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
