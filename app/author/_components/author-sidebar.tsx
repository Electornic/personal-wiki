"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function DocumentIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 16 16">
      <path
        d="M5.333 2.667h4l2.667 2.666v8A1.333 1.333 0 0 1 10.667 14H5.333A1.333 1.333 0 0 1 4 12.667V4A1.333 1.333 0 0 1 5.333 2.667Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M6 7.333h4M6 10h4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 16 16">
      <path
        d="M2.667 3.333A1.333 1.333 0 0 1 4 2h8a1.333 1.333 0 0 1 1.333 1.333v6.667A1.333 1.333 0 0 1 12 11.333H5.333L2.667 14V3.333Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WriteIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 16 16">
      <path
        d="M10.667 2.667 13.333 5.333 6 12.667 3.333 13.333 4 10.667l6.667-8Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="m9.333 4 2.667 2.667" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 16 16">
      <path
        d="M4.667 2.667h6.666A1.333 1.333 0 0 1 12.667 4v9.333L8 10.667l-4.667 2.666V4a1.333 1.333 0 0 1 1.334-1.333Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M13.3 9.8a1.1 1.1 0 0 0 .2 1.2l.04.04a1.333 1.333 0 1 1-1.886 1.886l-.04-.04a1.1 1.1 0 0 0-1.2-.22 1.1 1.1 0 0 0-.667 1.007v.113a1.333 1.333 0 1 1-2.667 0v-.06A1.1 1.1 0 0 0 6.367 12.7a1.1 1.1 0 0 0-1.2.22l-.04.04a1.333 1.333 0 1 1-1.886-1.886l.04-.04a1.1 1.1 0 0 0 .22-1.2 1.1 1.1 0 0 0-1.007-.667H2.38a1.333 1.333 0 1 1 0-2.667h.06A1.1 1.1 0 0 0 3.5 5.833a1.1 1.1 0 0 0-.22-1.2l-.04-.04A1.333 1.333 0 1 1 5.127 2.72l.04.04a1.1 1.1 0 0 0 1.2.22h.053a1.1 1.1 0 0 0 .667-1.007v-.113a1.333 1.333 0 0 1 2.667 0v.06a1.1 1.1 0 0 0 .667 1.007 1.1 1.1 0 0 0 1.2-.22l.04-.04a1.333 1.333 0 1 1 1.886 1.886l-.04.04a1.1 1.1 0 0 0-.22 1.2v.053a1.1 1.1 0 0 0 1.007.667h.113a1.333 1.333 0 0 1 0 2.667h-.06a1.1 1.1 0 0 0-1.007.667Z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/author", label: "Documents", icon: DocumentIcon, exact: true },
  { href: "/author/chat", label: "Chat", icon: ChatIcon },
  { href: "/author/documents/new", label: "New Record", icon: WriteIcon },
  { href: "/me/library", label: "My Library", icon: LibraryIcon },
];

export function AuthorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-64px-2rem)] w-[var(--sidebar-width)] shrink-0 flex-col overflow-y-auto rounded-l-[12px] border border-r-0 border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] lg:flex">
      <nav className="flex flex-1 flex-col px-3 py-4">
        <div className="mb-6 px-2">
          <p className="text-[11px] font-medium tracking-wider text-[var(--sidebar-text-muted)] uppercase">
            Workspace
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition ${
                  active
                    ? "bg-[var(--sidebar-active)] !text-[var(--sidebar-text)]"
                    : "!text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:!text-[var(--sidebar-text)]"
                }`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto border-t border-[var(--sidebar-border)] pt-3">
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-[var(--sidebar-text-muted)] transition hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
            type="button"
          >
            <SettingsIcon />
            Settings
          </button>
        </div>
      </nav>
    </aside>
  );
}
