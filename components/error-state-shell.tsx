import Link from "next/link";
import type { ReactNode } from "react";

type ErrorStateAction =
  | {
      type: "link";
      href: string;
      label: string;
      tone?: "primary" | "secondary";
    }
  | {
      type: "button";
      onClick: () => void;
      label: string;
      tone?: "primary" | "secondary";
    };

type ErrorStateShellProps = {
  title: string;
  description: string;
  actions: ErrorStateAction[];
  fullScreen?: boolean;
  footer?: ReactNode;
};

function ShellAction({ action }: { action: ErrorStateAction }) {
  const tone = action.tone ?? "secondary";
  const className =
    tone === "primary"
      ? "inline-flex h-[44px] items-center justify-center rounded-[4px] bg-[var(--foreground)] px-5 text-[14px] leading-5 font-medium !text-[var(--accent-text)] visited:!text-[var(--accent-text)]"
      : "inline-flex h-[44px] items-center justify-center rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-white px-5 text-[14px] leading-5 font-medium text-[var(--foreground)]";

  if (action.type === "link") {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

export function ErrorStateShell({
  title,
  description,
  actions,
  fullScreen = false,
  footer,
}: ErrorStateShellProps) {
  return (
    <main
      className={[
        fullScreen ? "min-h-screen" : "min-h-[calc(100vh-4rem)]",
        "site-shell flex items-center py-16",
      ].join(" ")}
    >
      <div className="relative w-full overflow-hidden rounded-[14px] border border-[rgba(42,36,25,0.1)] bg-[linear-gradient(180deg,#ffffff_0%,var(--card)_100%)] px-8 py-10 text-center shadow-[0_24px_70px_rgba(42,36,25,0.08)] md:px-12 md:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-8 h-32 w-32 rounded-full bg-[rgba(232,227,219,0.65)] blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-8 bottom-0 h-28 w-28 rounded-full bg-[rgba(214,194,163,0.18)] blur-2xl"
        />

        <div className="relative">
          <h1 className="mx-auto max-w-[620px] text-[34px] leading-[40px] font-semibold tracking-[-0.03em] text-[var(--foreground)] md:text-[42px] md:leading-[48px]">
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-7 text-[var(--muted)] md:text-[18px] md:leading-8">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {actions.map((action) => (
              <ShellAction
                key={`${action.type}-${action.label}`}
                action={action}
              />
            ))}
          </div>

          {footer ? (
            <div className="mx-auto mt-8 max-w-[540px] text-[13px] leading-6 text-[#8a826f]">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
