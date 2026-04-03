import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { PwaProvider } from "@/components/pwa-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Personal Wiki",
  description:
    "A personal library for book and article records, connected thoughts, and tag-based discovery.",
  applicationName: "Personal Wiki",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon/favicon.ico"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Personal Wiki",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ed",
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
          <Suspense fallback={null}>
            <SiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <AnalyticsProvider />
      </body>
    </html>
  );
}
