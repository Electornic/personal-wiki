import Link from "next/link";

import { formatDisplayDate, getExcerpt } from "@/lib/wiki/content";
import type { WikiDocument } from "@/lib/wiki/types";

function ArticleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-[#6b6354]" fill="none" viewBox="0 0 20 20">
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
    <svg aria-hidden="true" className="h-5 w-5 text-[#6b6354]" fill="none" viewBox="0 0 20 20">
      <path
        d="M5.833 3.333h6.25A2.083 2.083 0 0 1 14.167 5.417v10.416a1.667 1.667 0 0 0-1.667-1.666h-6.25A1.667 1.667 0 0 0 4.583 15.833V4.583a1.25 1.25 0 0 1 1.25-1.25Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M14.167 5v10.833" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

type CurationShelfProps = {
  title: string;
  description: string;
  documents: WikiDocument[];
};

export function CurationShelf({ title, description, documents }: CurationShelfProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <section>
      <div>
        <h2 className="text-[24px] leading-8 font-semibold tracking-[-0.24px] text-[#2a2419]">
          {title}
        </h2>
        <p className="mt-2 text-[16px] leading-6 text-[#6b6354]">{description}</p>
      </div>

      <div className="mt-6 grid gap-4">
        {documents.map((document, index) => (
          <Link
            key={document.id}
            href={`/library/${document.slug}`}
            className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-5 py-5 transition hover:bg-[rgba(255,255,255,0.72)]"
          >
            <div className="flex gap-4">
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8e3db] text-[14px] leading-5 font-medium text-[#6b6354]">
                {index + 1}
              </div>
              <div className="mt-1 shrink-0">
                {document.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[18px] leading-[22.5px] font-medium text-[#2a2419]">
                  {document.title}
                </h3>
                {document.sourceType === "book" && document.bookTitle ? (
                  <p className="mt-1 text-[14px] leading-5 italic text-[#6b6354]">
                    from {document.bookTitle}
                  </p>
                ) : null}
                <p className="mt-2 text-[14px] leading-[22.75px] text-[rgba(107,99,84,0.9)]">
                  {getExcerpt(document.contents)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-4 text-[#6b6354]">
                  <span className="font-medium">{document.writerName}</span>
                  <span>·</span>
                  <span>{formatDisplayDate(document.publishedAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
