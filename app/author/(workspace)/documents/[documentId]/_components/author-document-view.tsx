import Link from "next/link";

import { formatLongDisplayDate } from "@/entities/record/model/content";
import type { WikiDocument } from "@/entities/record/model/types";
import { MarkdownContent } from "@/entities/record/ui/markdown-content";
import { TopicPill } from "@/entities/tag/ui/topic-pill";

function EditIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M10.667 2.667 13.333 5.333 6 12.667 3.333 13.333 4 10.667l6.667-8Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="m9.333 4 2.667 2.667" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path d="M10 3.333 5.333 8 10 12.667" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 8h6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

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

function PrivateIcon() {
  return (
    <svg aria-hidden="true" className="h-3 w-3" fill="none" viewBox="0 0 12 12">
      <path d="M3.5 5V3.75a2.5 2.5 0 1 1 5 0V5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="2.5" y="5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function AuthorDocumentView({ doc }: { doc: WikiDocument }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          href="/author"
          className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-hover)]"
        >
          <BackIcon />
          Back
        </Link>
        <Link
          href={`/author/documents/${doc.id}?mode=edit`}
          className="inline-flex h-[38px] items-center gap-2 rounded-[4px] border border-[var(--border)] bg-[var(--card)] px-4 text-[14px] leading-5 font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-warm)]"
        >
          <EditIcon />
          Edit
        </Link>
      </div>

      <article className="mt-8">
        <header>
          <div className="flex items-center gap-2">
            {doc.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
            {doc.visibility === "private" ? (
              <span className="inline-flex items-center gap-1 text-[13px] text-[var(--muted)]">
                <PrivateIcon />
                Private
              </span>
            ) : null}
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
                <TopicPill key={tag} label={tag} interactive={false} />
              ))}
            </div>
          ) : null}
        </header>

        <section className="mt-10">
          <MarkdownContent
            contents={doc.contents}
            className={[
              "prose-p:mb-[28px] prose-p:text-[18px] prose-p:leading-[29.25px] prose-p:text-[var(--foreground)]",
              "prose-headings:mt-11 prose-headings:mb-3 prose-headings:text-[var(--foreground)]",
              "prose-h1:text-[30px] prose-h1:leading-9 prose-h1:tracking-[-0.3px]",
              "prose-h2:text-[24px] prose-h2:leading-8",
              "prose-blockquote:my-8 prose-blockquote:border-l-4 prose-blockquote:border-[var(--border)] prose-blockquote:pl-7 prose-blockquote:text-[18px] prose-blockquote:leading-[29.25px] prose-blockquote:italic prose-blockquote:text-[rgba(42,36,25,0.8)]",
              "prose-ol:my-6 prose-ol:pl-6 prose-li:mb-2 prose-li:text-[18px] prose-li:leading-[29.25px] prose-li:text-[var(--foreground)]",
              "prose-strong:text-[var(--foreground)]",
            ].join(" ")}
          />
        </section>
      </article>
    </div>
  );
}
