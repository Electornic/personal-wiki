import Link from "next/link";

import { formatDisplayDate } from "@/entities/record/model/content";
import type { WikiDocumentPreview } from "@/entities/record/model/types";
import { TopicPill } from "@/entities/tag/ui/topic-pill";

type MyLibraryCardProps = {
  document: WikiDocumentPreview;
};

function ArticleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-[var(--muted)]"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M6.667 2.5h5l3.333 3.333v10A1.667 1.667 0 0 1 13.333 17.5H6.667A1.667 1.667 0 0 1 5 15.833V4.167A1.667 1.667 0 0 1 6.667 2.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M11.667 2.5v3.333H15" stroke="currentColor" strokeWidth="1.25" />
      <path d="M7.5 9.167h5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M7.5 12.5h5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-[#8B6914]"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M10 5C8.333 3.667 6.25 3.333 4.167 3.333v11.334C6.25 14.667 8.333 15 10 16.333c1.667-1.333 3.75-1.666 5.833-1.666V3.333C13.75 3.333 11.667 3.667 10 5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M10 5v11.333" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function MyLibraryCard({ document }: MyLibraryCardProps) {
  return (
    <Link href={`/library/${document.slug}`} prefetch={false} className="block group">
      <article className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-4 py-4 transition group-hover:bg-[rgba(255,255,255,0.72)] md:px-6 md:py-6">
        <div className="flex min-h-full flex-col">
          <div className="flex items-start gap-3">
            <div className="mt-1 shrink-0">
              {document.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="max-w-[284px] text-[24px] leading-8 font-semibold tracking-[-0.01em] text-[var(--foreground)] md:max-w-none">
                {document.title}
              </h2>
              {document.sourceType === "book" && document.bookTitle ? (
                <p className="mt-1 text-[14px] leading-5 italic text-[var(--muted)]">
                  from {document.bookTitle}
                </p>
              ) : null}
            </div>
          </div>

          <p className="mt-4 line-clamp-3 text-[16px] leading-[26px] text-[rgba(42,36,25,0.8)] md:line-clamp-none">
            {document.excerpt}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {document.tags.slice(0, 4).map((tag) => (
              <TopicPill key={tag} label={tag} interactive={false} />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-[14px] leading-5 text-[var(--muted)]">
            <span className="font-medium">{document.writerName}</span>
            <span>{formatDisplayDate(document.publishedAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
