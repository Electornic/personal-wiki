import { AuthorSidebar } from "@/app/author/_components/author-sidebar";
import { MobileNavToggle } from "@/app/author/_components/mobile-nav";

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-64px)]">
      <AuthorSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
      <MobileNavToggle />
    </div>
  );
}
