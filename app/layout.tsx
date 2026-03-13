import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAuthorAccess } from "@/lib/wiki/auth";

export const metadata: Metadata = {
  title: "Personal Wiki",
  description:
    "A personal library for book and article records, connected thoughts, and tag-based discovery.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await getAuthorAccess();

  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <SiteHeader isAuthenticated={access.isAuthenticated} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
