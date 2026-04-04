"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { WORKSPACE_NAV_ITEMS } from "@/app/author/_components/nav-items";

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function MobileNavToggle() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[rgba(44,30,14,0.85)] text-[var(--sidebar-text)] shadow-lg backdrop-blur-[12px] lg:hidden"
        onClick={() => setOpen(!open)}
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed inset-y-0 left-0 z-40 w-[280px] overflow-y-auto bg-[rgba(44,30,14,0.95)] px-4 py-6 backdrop-blur-[16px] lg:hidden">
            <div className="mb-6">
              <p className="text-[11px] font-medium tracking-wider text-[var(--sidebar-text-muted)] uppercase">
                Workspace
              </p>
            </div>

            <div className="flex flex-col gap-1">
              {WORKSPACE_NAV_ITEMS.map((item) => (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  pathname={pathname}
                  exact={item.exact}
                  onClick={close}
                />
              ))}
            </div>

            <div className="mt-8 border-t border-[var(--sidebar-border)] pt-4">
              <MobileNavLink href="/" label="Home" pathname={pathname} exact onClick={close} />
              <MobileNavLink href="/library" label="Public Library" pathname={pathname} onClick={close} />
            </div>
          </nav>
        </>
      )}
    </>
  );
}

function MobileNavLink({
  href,
  label,
  pathname,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  pathname: string;
  exact?: boolean;
  onClick?: () => void;
}) {
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      className={`rounded-md px-3 py-2.5 text-[15px] font-medium transition ${
        active
          ? "bg-[var(--sidebar-active)] !text-[var(--sidebar-text)]"
          : "!text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:!text-[var(--sidebar-text)]"
      }`}
    >
      {label}
    </Link>
  );
}
