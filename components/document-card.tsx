import Link from "next/link";

import { TopicPill } from "@/components/topic-pill";
import { formatDisplayDate, getExcerpt } from "@/lib/wiki/content";
import type { WikiDocument } from "@/lib/wiki/types";

type DocumentCardProps = {
  document: WikiDocument;
};

function ArticleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-[#6b6354]"
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
      className="h-5 w-5 text-[#6b6354]"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M5.833 3.333h6.25A2.083 2.083 0 0 1 14.167 5.417v10.416a1.667 1.667 0 0 0-1.667-1.666h-6.25A1.667 1.667 0 0 0 4.583 15.833V4.583a1.25 1.25 0 0 1 1.25-1.25Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M14.167 5v10.833" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function DocumentCard({ document }: DocumentCardProps) {
  const excerpt = getExcerpt(document.contents);

  return (
    <Link href={`/library/${document.slug}`} className="block group">
      <article className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-6 py-6 transition group-hover:bg-[rgba(255,255,255,0.72)]">
        <div className="flex min-h-full flex-col">
          <div className="flex items-start gap-3">
            <div className="mt-1 shrink-0">
              {document.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[24px] leading-8 font-semibold tracking-[-0.01em] text-[#2a2419] transition-colors group-hover:text-[#3a3328]">
                {document.title}
              </h3>
              {document.sourceType === "book" && document.bookTitle ? (
                <p className="mt-1 text-[14px] leading-5 italic text-[#6b6354]">
                  from {document.bookTitle}
                </p>
              ) : null}
            </div>
          </div>

          <p className="mt-4 text-[16px] leading-[26px] text-[rgba(42,36,25,0.8)]">
            {excerpt}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {document.tags.slice(0, 4).map((tag) => (
              <TopicPill key={tag} label={tag} />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-[14px] leading-5 text-[#6b6354]">
            <span className="font-medium">{document.writerName}</span>
            <span>{formatDisplayDate(document.publishedAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
