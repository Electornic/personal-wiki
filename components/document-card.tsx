import Link from "next/link";

import { TopicPill } from "@/components/topic-pill";
import { formatDisplayDate, getExcerpt } from "@/lib/wiki/content";
import type { WikiDocument } from "@/lib/wiki/types";

type DocumentCardProps = {
  document: WikiDocument;
};

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Link href={`/library/${document.slug}`} className="block group">
      <article className="surface-card p-6 hover:shadow-md transition-shadow">
        <div className="mb-3 flex items-start gap-3">
          <div className="mt-1 text-stone-500">
            <span className="text-sm uppercase">{document.sourceType}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-2xl leading-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              {document.title}
            </h3>
            {document.sourceType === "book" && document.bookTitle ? (
              <p className="mb-2 text-sm italic text-stone-500">
                from {document.bookTitle}
              </p>
            ) : null}
          </div>
        </div>

        <p className="mb-4 text-base leading-7 text-stone-700">
          {getExcerpt(document.contents)}
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {document.tags.slice(0, 4).map((tag) => (
            <TopicPill key={tag} label={tag} />
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-stone-500">
          <span className="font-medium">{document.writerName}</span>
          <span>{formatDisplayDate(document.publishedAt)}</span>
        </div>
      </article>
    </Link>
  );
}
