import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaProvider } from "@/components/pwa-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Personal Wiki",
  description:
    "A personal library for book and article records, connected thoughts, and tag-based discovery.",
  applicationName: "Personal Wiki",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Personal Wiki",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <PwaProvider />
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
