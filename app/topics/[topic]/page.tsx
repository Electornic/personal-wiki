import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { formatTopicTitle, normalizeTopic } from "@/app/topics/[topic]/_lib/topic";
import { listPublicDocumentsByTag } from "@/entities/record/api/documents";
import { formatDisplayDate } from "@/entities/record/model/content";
import { TopicPill } from "@/entities/tag/ui/topic-pill";
import { buildTopicHref, decodeRouteSegment } from "@/lib/wiki/routes";

type PageProps = {
  params: Promise<{ topic: string }>;
};

function BackIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path d="M10 3.333 5.333 8 10 12.667" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 8h6" stroke="currentColor" strokeWidth="1.2" />
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

export default function TopicHubPage({ params }: PageProps) {
  return (
    <main className="surface-light site-shell mx-auto my-0 max-w-[1096px] rounded-none bg-[var(--content-bg)] pb-20 pt-12 backdrop-blur-sm md:my-4 md:rounded-[12px] md:border md:border-[var(--content-border)] md:pt-16">
      <div className="w-full">
        <Link
          href="/#library"
          className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 text-[var(--muted)] transition hover:bg-[rgba(232,227,219,0.45)]"
        >
          <BackIcon />
          Back to library
        </Link>

        <Suspense fallback={<TopicContentSkeleton />}>
          <TopicContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function TopicContent({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const decodedTopic = decodeRouteSegment(topic);
  const normalizedTopic = normalizeTopic(decodedTopic);
  const records = await getCachedTopicDocuments(normalizedTopic);

  if (records.length === 0) {
    notFound();
  }

  const relatedTopics = [...new Set(
    records
      .flatMap((record) => record.tags)
      .filter((tag) => normalizeTopic(tag) !== normalizedTopic),
  )].slice(0, 6);

  return (
    <>
      <section className="border-b border-[var(--border)] pb-8 pt-8 md:pb-10">
        <h1 className="text-[36px] leading-[40px] font-semibold tracking-[-0.72px] text-[var(--foreground)] md:text-[48px] md:leading-[48px] md:tracking-[-0.96px]">
          {formatTopicTitle(decodedTopic)}
        </h1>
        <p className="mt-4 max-w-[672px] text-[18px] leading-[29.25px] text-[var(--muted)]">
          Exploring {normalizedTopic} across multiple perspectives and
          contexts.
        </p>
        <p className="mt-6 text-[14px] leading-5 text-[var(--muted)]">
          {records.length} {records.length === 1 ? "record" : "records"}
        </p>
      </section>

      <section className="pt-12">
        <h2 className="text-[24px] leading-8 font-semibold tracking-[-0.24px] text-[var(--foreground)]">
          Records
        </h2>

        <div className="mt-6 grid gap-6">
          {records.map((record) => (
            <Link
              key={record.id}
              href={`/library/${record.slug}`}
              prefetch={false}
              className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-[21px] py-[21px] transition hover:bg-[rgba(255,255,255,0.72)]"
            >
              <div className="flex gap-4">
                <div className="mt-1 shrink-0">
                  {record.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[20px] leading-[25px] font-semibold text-[var(--foreground)]">
                    {record.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[22.75px] text-[rgba(107,99,84,0.9)] md:max-w-[761px]">
                    {record.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-4 text-[var(--muted)]">
                    <span className="font-medium">{record.writerName}</span>
                    <span>·</span>
                    <span>{formatDisplayDate(record.publishedAt)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {record.tags
                      .filter((tag) => normalizeTopic(tag) !== normalizedTopic)
                      .slice(0, 3)
                      .map((tag) => (
                        <TopicPill key={tag} label={tag} interactive={false} />
                      ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {relatedTopics.length ? (
        <section className="mt-12 border-t border-[var(--border)] pt-8 md:pt-[33px]">
          <h2 className="text-[20px] leading-7 font-semibold tracking-[-0.2px] text-[var(--muted)]">
            Explore related topics
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {relatedTopics.map((tag) => (
              <Link
                key={tag}
                href={buildTopicHref(tag)}
                prefetch={false}
                className="inline-flex h-[38px] items-center rounded-full border border-[var(--border)] bg-[rgba(232,227,219,0.4)] px-4 text-[14px] leading-5 text-[var(--foreground)] transition hover:bg-[rgba(232,227,219,0.6)]"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

async function getCachedTopicDocuments(topic: string) {
  "use cache";

  cacheLife("hours");
  cacheTag("public-discovery");
  cacheTag(`topic:${topic}`);

  return listPublicDocumentsByTag(topic);
}

function TopicContentSkeleton() {
  return (
    <>
      <section className="animate-pulse border-b border-[var(--surface-warm)] pb-8 pt-8 md:pb-10">
        <div className="h-12 w-64 rounded-[6px] bg-[var(--surface-warm)]" />
        <div className="mt-4 h-8 w-full max-w-[560px] rounded-[6px] bg-[var(--surface-warm)]" />
        <div className="mt-6 h-5 w-20 rounded-[6px] bg-[var(--surface-warm)]" />
      </section>

      <section className="animate-pulse pt-12">
        <div className="h-8 w-28 rounded-[6px] bg-[var(--surface-warm)]" />
        <div className="mt-6 rounded-[6px] border border-[var(--surface-warm)] bg-[var(--card)] px-6 py-6">
          <div className="h-7 w-2/3 rounded-[6px] bg-[var(--surface-warm)]" />
          <div className="mt-4 h-5 w-full rounded-[6px] bg-[var(--surface-warm)]" />
          <div className="mt-3 h-5 w-4/5 rounded-[6px] bg-[var(--surface-warm)]" />
        </div>
      </section>
    </>
  );
}
