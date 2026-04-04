import { Suspense } from "react";

import { AuthorSidebar } from "@/app/author/_components/author-sidebar";
import { MobileNavToggle } from "@/app/author/_components/mobile-nav";

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-[1096px]">
      <Suspense fallback={<SidebarSkeleton />}>
        <AuthorSidebar />
      </Suspense>
      <div className="flex flex-1 flex-col overflow-hidden">
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
    <aside className="sticky top-16 hidden h-[calc(100dvh-64px)] w-[var(--sidebar-width)] shrink-0 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] lg:flex" />
  );
}
