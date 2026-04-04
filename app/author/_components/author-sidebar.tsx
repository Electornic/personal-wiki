"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type SidebarSection = "menu" | "documents" | "chat" | "write" | "library";

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

function BackIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 opacity-50" fill="none" viewBox="0 0 16 16">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function AuthorSidebar() {
  const pathname = usePathname();
  const [section, setSection] = useState<SidebarSection>("menu");

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-64px)] w-[var(--sidebar-width)] shrink-0 flex-col overflow-y-auto border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] lg:flex">
      {section === "menu" ? (
        <MainMenu
          onNavigate={setSection}
          isActive={isActive}
        />
      ) : (
        <SectionPanel
          section={section}
          onBack={() => setSection("menu")}
          pathname={pathname}
        />
      )}
    </aside>
  );
}

function MainMenu({
  onNavigate,
  isActive,
}: {
  onNavigate: (section: SidebarSection) => void;
  isActive: (path: string) => boolean;
}) {
  return (
    <nav className="flex flex-1 flex-col px-3 py-4">
      <div className="mb-6 px-2">
        <p className="text-[11px] font-medium tracking-wider text-[var(--sidebar-text-muted)] uppercase">
          Workspace
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <SidebarButton
          icon={<DocumentIcon />}
          label="Documents"
          active={isActive("/author") && !isActive("/author/chat") && !isActive("/author/documents") && !isActive("/author/sign-in")}
          chevron
          onClick={() => onNavigate("documents")}
        />
        <SidebarButton
          icon={<ChatIcon />}
          label="Chat"
          active={isActive("/author/chat")}
          chevron
          onClick={() => onNavigate("chat")}
        />
        <SidebarButton
          icon={<WriteIcon />}
          label="New Record"
          active={isActive("/author/documents")}
          chevron
          onClick={() => onNavigate("write")}
        />
        <SidebarButton
          icon={<LibraryIcon />}
          label="My Library"
          chevron
          onClick={() => onNavigate("library")}
        />
      </div>

      <div className="mt-auto border-t border-[var(--sidebar-border)] pt-3">
        <SidebarButton
          icon={<SettingsIcon />}
          label="Settings"
          onClick={() => {}}
        />
      </div>
    </nav>
  );
}

function SectionPanel({
  section,
  onBack,
  pathname,
}: {
  section: SidebarSection;
  onBack: () => void;
  pathname: string;
}) {
  const titles: Record<SidebarSection, string> = {
    menu: "",
    documents: "Documents",
    chat: "Chat",
    write: "New Record",
    library: "My Library",
  };

  return (
    <nav className="flex flex-1 flex-col px-3 py-4">
      <button
        className="mb-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-[var(--sidebar-text-muted)] transition hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
        onClick={onBack}
        type="button"
      >
        <BackIcon />
        Back
      </button>

      <div className="mb-4 px-2">
        <p className="text-[14px] font-medium text-[var(--sidebar-text)]">{titles[section]}</p>
      </div>

      {section === "documents" && <DocumentsSection pathname={pathname} />}
      {section === "chat" && <ChatSection pathname={pathname} />}
      {section === "write" && <WriteSection pathname={pathname} />}
      {section === "library" && <LibrarySection />}
    </nav>
  );
}

function DocumentsSection({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/author"
        className={`rounded-md px-3 py-2 text-[13px] transition ${
          pathname === "/author"
            ? "bg-[var(--sidebar-active)] !text-[var(--sidebar-text)]"
            : "!text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:!text-[var(--sidebar-text)]"
        }`}
      >
        All Documents
      </Link>
      <p className="mt-2 px-3 text-[11px] text-[var(--sidebar-text-muted)]">
        Document list will appear here
      </p>
    </div>
  );
}

function ChatSection({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/author/chat"
        className={`rounded-md px-3 py-2 text-[13px] transition ${
          pathname === "/author/chat"
            ? "bg-[var(--sidebar-active)] !text-[var(--sidebar-text)]"
            : "!text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:!text-[var(--sidebar-text)]"
        }`}
      >
        Start New Chat
      </Link>
      <p className="mt-2 px-3 text-[11px] text-[var(--sidebar-text-muted)]">
        Chat history coming soon
      </p>
    </div>
  );
}

function WriteSection({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/author/documents/new"
        className={`rounded-md px-3 py-2 text-[13px] transition ${
          pathname === "/author/documents/new"
            ? "bg-[var(--sidebar-active)] !text-[var(--sidebar-text)]"
            : "!text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:!text-[var(--sidebar-text)]"
        }`}
      >
        Write New Record
      </Link>
      <p className="mt-2 px-3 text-[11px] text-[var(--sidebar-text-muted)]">
        Recent records will appear here
      </p>
    </div>
  );
}

function LibrarySection() {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/me/library"
        className="rounded-md px-3 py-2 text-[13px] !text-[var(--sidebar-text-muted)] transition hover:bg-[var(--sidebar-hover)] hover:!text-[var(--sidebar-text)]"
      >
        View My Library
      </Link>
      <p className="mt-2 px-3 text-[11px] text-[var(--sidebar-text-muted)]">
        Bookmarked records will appear here
      </p>
    </div>
  );
}

function SidebarButton({
  icon,
  label,
  active,
  chevron,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  chevron?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition ${
        active
          ? "bg-[var(--sidebar-active)] text-[var(--sidebar-text)]"
          : "text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {chevron && <ChevronIcon />}
    </button>
  );
}
