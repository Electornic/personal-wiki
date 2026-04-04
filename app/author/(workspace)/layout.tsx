import { Suspense } from "react";

import { AuthorSidebar } from "@/app/author/_components/author-sidebar";
import { MobileNavToggle } from "@/app/author/_components/mobile-nav";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-[1096px] gap-0 px-0 py-0 lg:py-4">
      <Suspense fallback={<SidebarSkeleton />}>
        <AuthorSidebar />
      </Suspense>
      <div className="surface-light flex flex-1 flex-col overflow-hidden rounded-none bg-[var(--content-bg)] backdrop-blur-sm lg:rounded-r-[12px] lg:border lg:border-[var(--content-border)]">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[calc(1096px-var(--sidebar-width))]">
            {children}
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <MobileNavToggle />
      </Suspense>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-64px-2rem)] w-[var(--sidebar-width)] shrink-0 rounded-l-[12px] border border-r-0 border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] lg:flex" />
  );
}
