import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { ConversationSection } from "@/app/library/[slug]/_components/conversation-section";
import { RecordReactionsSection } from "@/app/library/[slug]/_components/record-reactions-section";
import {
  getPublicDocumentBySlug,
  getReadableDocumentBySlug,
  listRelatedDocumentsForDocument,
} from "@/entities/record/api/documents";
import { formatDisplayDate, formatLongDisplayDate } from "@/entities/record/model/content";
import { MarkdownContent } from "@/entities/record/ui/markdown-content";
import { TopicPill } from "@/entities/tag/ui/topic-pill";
import { buildLibraryHref, buildRecordCacheTag, buildTopicHref } from "@/lib/wiki/routes";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M10 3.333 5.333 8 10 12.667"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M6 8h6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

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
      className="h-5 w-5 text-[var(--muted)]"
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

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path d="M3.333 8h9.334" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9.333 5.333 12 8l-2.667 2.667" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function buildRelatedReasonText(
  sharedTags: string[],
  sourceType: "book" | "article",
) {
  if (sharedTags.length >= 2) {
    return `Shared topics: ${sharedTags.slice(0, 2).join(", ")}`;
  }

  if (sharedTags[0]) {
    return `Shared topic: ${sharedTags[0]}`;
  }

  return sourceType === "book"
    ? "A nearby book from the same reading shelf"
    : "A nearby article from the same reading shelf";
}

export default function LibraryDocumentPage({ params, searchParams }: PageProps) {
  return (
    <main className="site-shell pb-20 pt-8">
      <div className="site-shell-content">
        <Link
          href="/"
          className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 font-medium text-[var(--foreground)] transition hover:bg-[rgba(232,227,219,0.45)]"
        >
          <BackIcon />
          Library
        </Link>

        <Suspense fallback={<DocumentContentSkeleton />}>
          <DocumentContent params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function DocumentContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const previewMode = getSearchParam(resolvedSearchParams, "preview") === "1";

  const fetchedDocument = previewMode
    ? await getReadableDocumentBySlug(slug)
    : await getCachedPublicDocument(slug);

  if (!fetchedDocument) {
    notFound();
  }

  return (
    <article className="mt-8 w-full">
      <header>
        <div className="flex items-center">
          {fetchedDocument.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
        </div>
        <h1 className="mt-4 text-[36px] leading-[45px] font-semibold tracking-[-0.02em] text-[var(--foreground)] md:text-[48px] md:leading-[60px] md:tracking-[-0.96px]">
          {fetchedDocument.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px] leading-6">
          <span className="font-medium text-[var(--foreground)]">{fetchedDocument.writerName}</span>
          <span className="text-[var(--muted)]">·</span>
          <span className="text-[var(--muted)]">
            {formatLongDisplayDate(fetchedDocument.publishedAt)}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {fetchedDocument.tags.map((tag) => (
            <TopicPill key={tag} label={tag} />
          ))}
        </div>
      </header>

      <section className="mt-12">
        <MarkdownContent
          contents={fetchedDocument.contents}
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

      {fetchedDocument.visibility === "public" ? (
        <Suspense fallback={<RecordReactionsFallback />}>
          <RecordReactionsSection
            documentId={fetchedDocument.id}
            recordSlug={fetchedDocument.slug}
            visibility={fetchedDocument.visibility}
            initialLikeCount={fetchedDocument.reactionCount ?? 0}
          />
        </Suspense>
      ) : null}

      <Suspense fallback={<RelatedDocumentsFallback />}>
        <RelatedDocumentsSection record={fetchedDocument} />
      </Suspense>

      <Suspense fallback={<ConversationSectionFallback />}>
        <ConversationSection
          documentId={fetchedDocument.id}
          recordSlug={fetchedDocument.slug}
          visibility={fetchedDocument.visibility}
        />
      </Suspense>
    </article>
  );
}

async function RelatedDocumentsSection({
  record,
}: {
  record: NonNullable<Awaited<ReturnType<typeof getReadableDocumentBySlug>>>;
}) {
  const relatedDocuments = record.visibility === "public"
    ? await getCachedRelatedDocuments(record.id, record.slug, record.tags)
    : await listRelatedDocumentsForDocument(record, 2);

  return (
    <section className="mt-12 border-t border-[var(--border)] pt-8 md:mt-16 md:pt-10">
      <h2 className="text-[22px] leading-8 font-semibold text-[var(--foreground)] md:text-[24px]">
        Continue Reading
      </h2>
      {relatedDocuments.length ? (
        <>
          <p className="mt-2 text-[14px] leading-5 text-[var(--muted)] md:text-[16px] md:leading-6">
            Recommendations based on shared topics and recent reading
          </p>

          <div className="mt-6 grid gap-4 md:mt-8 md:gap-5">
            {relatedDocuments.map((relatedDoc, index) => {
              const reasonLabel = index === 0 ? "Best Match" : "Keep Reading";
              const reasonText = buildRelatedReasonText(
                relatedDoc.sharedTags,
                relatedDoc.sourceType,
              );

              return (
                <Link
                  key={relatedDoc.id}
                  href={buildLibraryHref(relatedDoc.slug)}
                  prefetch={false}
                  className="block rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-5 py-5 transition hover:bg-[rgba(255,255,255,0.72)] md:px-6"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] leading-4 text-[var(--muted)] md:text-[12px]">
                    <span className="font-medium tracking-[0.3px] uppercase">
                      {reasonLabel}
                    </span>
                    <span className="text-[rgba(107,99,84,0.5)]">·</span>
                    <span className="text-[12px] leading-4 text-[var(--muted)]">
                      {reasonText}
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-3 md:mt-4 md:gap-4">
                    <div className="mt-0.5 shrink-0 md:mt-1">
                      {relatedDoc.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[18px] leading-6 font-semibold text-[var(--foreground)] md:text-[20px] md:leading-[25px]">
                        {relatedDoc.title}
                      </p>
                      {relatedDoc.sourceType === "book" && relatedDoc.bookTitle ? (
                        <p className="mt-1.5 text-[13px] leading-5 italic text-[var(--muted)] md:mt-2 md:text-[14px]">
                          from {relatedDoc.bookTitle}
                        </p>
                      ) : null}
                      <p className="mt-2 hidden text-[15px] leading-6 text-[rgba(107,99,84,0.9)] md:block">
                        {relatedDoc.excerpt}
                      </p>
                      <p className="mt-2.5 text-[13px] leading-5 text-[var(--muted)] md:mt-3 md:text-[14px]">
                        {relatedDoc.writerName} ·{" "}
                        {formatDisplayDate(relatedDoc.publishedAt)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {relatedDoc.tags.slice(0, 3).map((tag) => (
                          <TopicPill key={tag} label={tag} interactive={false} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-0.5 shrink-0 text-[var(--muted)] md:mt-1">
                      <ArrowRightIcon />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center md:mt-8">
            <Link
              href="/#library"
              className="inline-flex items-center gap-2 text-[14px] leading-5 text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Browse all records
              <ArrowRightIcon />
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-[6px] border border-[var(--border)] bg-[rgba(232,227,219,0.2)] px-6 py-10 text-center md:py-12">
          <p className="text-[16px] leading-6 text-[var(--muted)]">
            No close follow-up reading found yet.
          </p>
          <p className="mt-2 text-[14px] leading-5 text-[var(--muted)]">
            {record.tags[0]
              ? `Explore ${record.tags[0]} to keep moving through related notes.`
              : "Browse the newest records to keep moving through the library."}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {record.tags[0] ? (
              <Link
                href={buildTopicHref(record.tags[0])}
                className="inline-flex items-center gap-2 text-[14px] leading-5 text-[var(--foreground)] transition hover:opacity-70"
              >
                Explore {record.tags[0]}
                <ArrowRightIcon />
              </Link>
            ) : null}
            <Link
              href="/#library"
              className="inline-flex items-center gap-2 text-[14px] leading-5 text-[var(--foreground)] transition hover:opacity-70"
            >
              Browse all records
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

async function getCachedPublicDocument(slug: string) {
  "use cache";

  cacheLife("hours");
  cacheTag("public-discovery");
  cacheTag(buildRecordCacheTag(slug));

  return getPublicDocumentBySlug(slug);
}

async function getCachedRelatedDocuments(
  documentId: string,
  slug: string,
  tags: string[],
) {
  "use cache";

  cacheLife("hours");
  cacheTag("public-discovery");
  cacheTag(buildRecordCacheTag(slug));

  return listRelatedDocumentsForDocument(
    {
      id: documentId,
      tags,
      visibility: "public",
    } as const,
    2,
  );
}

function DocumentContentSkeleton() {
  return (
    <article className="mt-8 w-full animate-pulse">
      <div className="h-5 w-5 rounded-full bg-[var(--surface-warm)]" />
      <div className="mt-4 h-12 w-full rounded-[6px] bg-[var(--surface-warm)] md:h-16" />
      <div className="mt-4 h-6 w-64 rounded-[6px] bg-[var(--surface-warm)]" />
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-20 rounded-[999px] bg-[var(--surface-warm)]" />
        <div className="h-6 w-16 rounded-[999px] bg-[var(--surface-warm)]" />
        <div className="h-6 w-24 rounded-[999px] bg-[var(--surface-warm)]" />
      </div>

      <section className="mt-12 space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-6 rounded-[6px] bg-[var(--surface-warm)]"
            style={{ width: index === 5 ? "68%" : "100%" }}
          />
        ))}
      </section>

      <section className="mt-16 border-t border-[var(--surface-warm)] pt-12">
        <div className="h-8 w-48 rounded-[6px] bg-[var(--surface-warm)]" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[6px] border border-[var(--surface-warm)] bg-[var(--card)] px-[21px] py-[21px]"
            >
              <div className="h-5 w-20 rounded-[6px] bg-[var(--surface-warm)]" />
              <div className="mt-4 h-6 w-3/5 rounded-[6px] bg-[var(--surface-warm)]" />
              <div className="mt-3 h-5 w-full rounded-[6px] bg-[var(--surface-warm)]" />
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

function RecordReactionsFallback() {
  return (
    <section className="mt-12 border-b border-t border-[var(--border)] py-6">
      <div className="h-8 w-48 animate-pulse rounded-[6px] bg-[var(--surface-warm)]" />
    </section>
  );
}

function RelatedDocumentsFallback() {
  return (
    <section className="mt-12 border-t border-[var(--border)] pt-10 md:mt-16 md:pt-12">
      <div className="h-8 w-48 animate-pulse rounded-[6px] bg-[var(--surface-warm)]" />
      <div className="mt-8 grid gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[6px] border border-[var(--surface-warm)] bg-[var(--card)] px-6 py-6"
          >
            <div className="h-5 w-20 rounded-[6px] bg-[var(--surface-warm)]" />
            <div className="mt-4 h-6 w-3/5 rounded-[6px] bg-[var(--surface-warm)]" />
            <div className="mt-3 h-5 w-full rounded-[6px] bg-[var(--surface-warm)]" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ConversationSectionFallback() {
  return (
    <section className="mt-12 border-t border-[var(--border)] pt-10 md:mt-16 md:pt-12">
      <div className="h-8 w-48 animate-pulse rounded-[6px] bg-[var(--surface-warm)]" />
      <div className="mt-8 h-24 animate-pulse rounded-[6px] bg-[var(--surface-warm)]" />
    </section>
  );
}
