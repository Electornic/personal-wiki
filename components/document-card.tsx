import Link from "next/link";

import { TopicPill } from "@/components/topic-pill";
import type { WikiDocument } from "@/lib/wiki/types";

type DocumentCardProps = {
  document: WikiDocument;
};

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <article className="group flex h-full flex-col gap-4 rounded-[1.75rem] border border-stone-200 bg-white px-6 py-6 shadow-[0_24px_64px_rgba(51,39,18,0.06)] transition hover:-translate-y-1 hover:border-stone-400">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-stone-500">
        <span>{document.sourceType}</span>
        <span>{document.visibility}</span>
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl leading-tight text-stone-900">{document.title}</h3>
        <p className="text-sm leading-7 text-stone-600">{document.intro}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {document.topics.map((topic) => (
          <TopicPill key={topic} label={topic} />
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between text-sm text-stone-500">
        <span>{document.authorName}</span>
        <Link
          href={`/library/${document.slug}`}
          className="font-medium text-stone-900 transition group-hover:translate-x-1"
        >
          read
        </Link>
      </div>
    </article>
  );
}
