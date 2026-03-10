import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Wiki",
  description:
    "A personal library for book and article records, connected thoughts, and tag-based discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
