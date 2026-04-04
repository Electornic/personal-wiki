import Image from "next/image";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  buildRecordImageProxyUrl,
  isRecordImageToken,
} from "@/lib/wiki/record-images";

type MarkdownContentProps = {
  contents: string;
  className?: string;
  imageUrlOverrides?: Record<string, string>;
};

function isOptimizableMarkdownImage(src: string) {
  if (!src.startsWith("/")) {
    return false;
  }

  if (src.startsWith("//")) {
    return false;
  }

  return true;
}

function resolveMarkdownImageSrc(
  src: string | Blob | undefined,
  imageUrlOverrides?: Record<string, string>,
) {
  if (typeof src !== "string") {
    return null;
  }

  if (imageUrlOverrides?.[src]) {
    return imageUrlOverrides[src];
  }

  if (isRecordImageToken(src)) {
    return buildRecordImageProxyUrl(src);
  }

  return src;
}

export function MarkdownContent({
  contents,
  className,
  imageUrlOverrides,
}: MarkdownContentProps) {
  return (
    <div
      className={[
        "max-w-none text-[var(--foreground)]",
        className ?? "",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => {
          if (url.startsWith("storage://") || url.startsWith("local-image://")) {
            return url;
          }

          return defaultUrlTransform(url);
        }}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-0 mb-4 text-[30px] leading-9 font-semibold tracking-[-0.3px] text-[var(--foreground)]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 mb-3 text-[24px] leading-8 font-semibold text-[var(--foreground)]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 mb-3 text-[20px] leading-7 font-semibold text-[var(--foreground)]">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-6 text-[18px] leading-[29.25px] text-[var(--foreground)]">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-8 border-l-4 border-[rgba(42,36,25,0.1)] pl-7 text-[18px] leading-[29.25px] italic text-[rgba(42,36,25,0.8)]">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-6 list-disc pl-6 text-[18px] leading-[29.25px] text-[var(--foreground)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-6 list-decimal pl-6 text-[18px] leading-[29.25px] text-[var(--foreground)]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-2 pl-1 marker:text-[var(--foreground)]">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-[#5b4330] underline decoration-[rgba(91,67,48,0.55)] underline-offset-4 hover:text-[var(--foreground)]"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            const resolvedSrc = resolveMarkdownImageSrc(src, imageUrlOverrides);

            if (!resolvedSrc) {
              return null;
            }

            const imageClassName =
              "my-8 w-full rounded-[10px] border border-[rgba(42,36,25,0.08)] bg-[rgba(232,227,219,0.24)] shadow-[0_12px_36px_rgba(42,36,25,0.08)]";

            if (isOptimizableMarkdownImage(resolvedSrc)) {
              return (
                <Image
                  src={resolvedSrc}
                  alt={alt ?? ""}
                  width={1600}
                  height={900}
                  sizes="(min-width: 1024px) 768px, 100vw"
                  className={imageClassName}
                  style={{ height: "auto" }}
                />
              );
            }

            return (
              // Blob preview URLs and external markdown images stay on plain img to avoid breaking preview flows.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedSrc}
                alt={alt ?? ""}
                className={imageClassName}
                loading="lazy"
              />
            );
          },
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--foreground)]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[rgba(42,36,25,0.85)]">{children}</em>
          ),
          code: ({ children }) => (
            <code className="rounded bg-[rgba(232,227,219,0.6)] px-1.5 py-0.5 text-[0.95em] text-[var(--foreground)]">
              {children}
            </code>
          ),
        }}
      >
        {contents}
      </ReactMarkdown>
    </div>
  );
}
