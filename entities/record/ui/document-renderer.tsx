import type { ReactNode } from "react";

import { formatLongDisplayDate } from "@/entities/record/model/content";
import type { WikiDocument } from "@/entities/record/model/types";
import { MarkdownContent } from "@/entities/record/ui/markdown-content";
import { TopicPill } from "@/entities/tag/ui/topic-pill";

type DocumentRendererProps = {
  document: WikiDocument;
  headerExtra?: ReactNode;
  tagsInteractive?: boolean;
};

const PROSE_CLASS = [
  "prose-p:mb-[28px] prose-p:text-[18px] prose-p:leading-[29.25px] prose-p:text-[var(--foreground)]",
  "prose-headings:mt-11 prose-headings:mb-3 prose-headings:text-[var(--foreground)]",
  "prose-h1:text-[30px] prose-h1:leading-9 prose-h1:tracking-[-0.3px]",
  "prose-h2:text-[24px] prose-h2:leading-8",
  "prose-blockquote:my-8 prose-blockquote:border-l-4 prose-blockquote:border-[var(--border)] prose-blockquote:pl-7 prose-blockquote:text-[18px] prose-blockquote:leading-[29.25px] prose-blockquote:italic prose-blockquote:text-[rgba(42,36,25,0.8)]",
  "prose-ol:my-6 prose-ol:pl-6 prose-li:mb-2 prose-li:text-[18px] prose-li:leading-[29.25px] prose-li:text-[var(--foreground)]",
  "prose-strong:text-[var(--foreground)]",
].join(" ");

function BookIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-[#8B6914]" fill="none" viewBox="0 0 20 20">
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

function ArticleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-[var(--muted)]" fill="none" viewBox="0 0 20 20">
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

export function DocumentRenderer({
  document: doc,
  headerExtra,
  tagsInteractive = true,
}: DocumentRendererProps) {
  return (
    <article className="mt-8 w-full">
      <header>
        <div className="flex items-center gap-2">
          {doc.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
          {headerExtra}
        </div>
        <h1 className="mt-4 text-[32px] leading-[40px] font-semibold tracking-[-0.02em] text-[var(--foreground)] md:text-[40px] md:leading-[50px]">
          {doc.title}
        </h1>
        {doc.sourceType === "book" && doc.bookTitle ? (
          <p className="mt-2 text-[16px] leading-6 italic text-[var(--muted)]">
            from {doc.bookTitle}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] leading-5">
          <span className="font-medium text-[var(--foreground)]">{doc.writerName}</span>
          <span className="text-[var(--muted)]">·</span>
          <span className="text-[var(--muted)]">
            {formatLongDisplayDate(doc.publishedAt)}
          </span>
        </div>
        {doc.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {doc.tags.map((tag) => (
              <TopicPill key={tag} label={tag} interactive={tagsInteractive} />
            ))}
          </div>
        ) : null}
      </header>

      <section className="mt-10">
        <MarkdownContent contents={doc.contents} className={PROSE_CLASS} />
      </section>
    </article>
  );
}
