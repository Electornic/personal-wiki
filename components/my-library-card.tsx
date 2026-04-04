import Link from "next/link";

import { formatDisplayDate } from "@/entities/record/model/content";
import type { WikiDocumentPreview } from "@/entities/record/model/types";
import { ArticleIcon, BookIcon } from "@/entities/record/ui/source-type-icon";
import { TopicPill } from "@/entities/tag/ui/topic-pill";

type MyLibraryCardProps = {
  document: WikiDocumentPreview;
};

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
