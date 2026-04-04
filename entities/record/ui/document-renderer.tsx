import type { ReactNode } from "react";

import { formatLongDisplayDate } from "@/entities/record/model/content";
import type { WikiDocument } from "@/entities/record/model/types";
import { MarkdownContent } from "@/entities/record/ui/markdown-content";
import { ArticleIcon, BookIcon } from "@/entities/record/ui/source-type-icon";
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
        <h1 className="mt-4 text-[32px] leading-[40px] font-semibold tracking-[-0.02em] text-[var(--foreground)] md:text-[48px] md:leading-[60px] md:tracking-[-0.96px]">
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
