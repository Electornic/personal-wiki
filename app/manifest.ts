import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Personal Wiki",
    short_name: "Wiki",
    description:
      "A personal library for book and article records, connected thoughts, and tag-based discovery.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#faf8f5",
    categories: ["books", "education", "productivity"],
    lang: "ko",
    icons: [
      {
        src: "/pwa/icon-192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512-maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
