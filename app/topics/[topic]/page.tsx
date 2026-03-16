import Link from "next/link";
import { notFound } from "next/navigation";

import { CurationShelf } from "@/components/curation-shelf";
import { TopicPill } from "@/components/topic-pill";
import { formatDisplayDate, getExcerpt } from "@/lib/wiki/content";
import { listPublicDocuments } from "@/lib/wiki/documents";
import { listPublicCurationShelves } from "@/lib/wiki/shelves";

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

function normalizeTopic(value: string) {
  return value.trim().toLowerCase();
}

function formatTopicTitle(topic: string) {
  return topic
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function TopicHubPage({ params }: PageProps) {
  const { topic } = await params;
  const decodedTopic = topic;
  const normalizedTopic = normalizeTopic(decodedTopic);

  const [publicDocuments, topicShelves] = await Promise.all([
    listPublicDocuments(),
    listPublicCurationShelves("topic", normalizedTopic),
  ]);
  const records = publicDocuments.filter((document) =>
    document.tags.some((tag) => normalizeTopic(tag) === normalizedTopic),
  );

  if (records.length === 0) {
    notFound();
  }

  const relatedTopics = [...new Set(
    records
      .flatMap((document) => document.tags)
      .filter((tag) => normalizeTopic(tag) !== normalizedTopic),
  )].slice(0, 6);

  return (
    <main className="site-shell pb-20 pt-12 md:pt-16">
      <div className="w-full">
        <Link
          href="/#library"
          className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 text-[#6b6354] transition hover:bg-[rgba(232,227,219,0.45)]"
        >
          <BackIcon />
          Back to library
        </Link>

        <section className="border-b border-[rgba(42,36,25,0.1)] pb-8 pt-8 md:pb-10">
          <h1 className="text-[36px] leading-[40px] font-semibold tracking-[-0.72px] text-[#2a2419] md:text-[48px] md:leading-[48px] md:tracking-[-0.96px]">
            {formatTopicTitle(decodedTopic)}
          </h1>
          <p className="mt-4 max-w-[672px] text-[18px] leading-[29.25px] text-[#6b6354]">
            Exploring {normalizeTopic(decodedTopic)} across multiple perspectives and
            contexts.
          </p>
          <p className="mt-6 text-[14px] leading-5 text-[#6b6354]">
            {records.length} {records.length === 1 ? "record" : "records"}
          </p>
        </section>

        <section className="pt-12">
          <h2 className="text-[24px] leading-8 font-semibold tracking-[-0.24px] text-[#2a2419]">
            Records
          </h2>

          <div className="mt-6 grid gap-6">
            {records.map((record) => (
              <Link
                key={record.id}
                href={`/library/${record.slug}`}
                className="rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-white px-[21px] py-[21px] transition hover:bg-[rgba(255,255,255,0.72)]"
              >
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0">
                    {record.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[20px] leading-[25px] font-semibold text-[#2a2419]">
                      {record.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[22.75px] text-[rgba(107,99,84,0.9)] md:max-w-[761px]">
                      {getExcerpt(record.contents)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-4 text-[#6b6354]">
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

        {topicShelves.length ? (
          <section className="mt-12 border-t border-[rgba(42,36,25,0.1)] pt-8 md:pt-[33px]">
            <div className="grid gap-10">
              {topicShelves.map((shelf) => (
                <CurationShelf
                  key={shelf.id}
                  title={shelf.title}
                  description={shelf.description}
                  documents={shelf.documents}
                />
              ))}
            </div>
          </section>
        ) : null}

        {relatedTopics.length ? (
          <section className="mt-12 border-t border-[rgba(42,36,25,0.1)] pt-8 md:pt-[33px]">
            <h2 className="text-[20px] leading-7 font-semibold tracking-[-0.2px] text-[#6b6354]">
              Explore related topics
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedTopics.map((tag) => (
                <Link
                  key={tag}
                  href={`/topics/${encodeURIComponent(tag)}`}
                  className="inline-flex h-[38px] items-center rounded-full border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.4)] px-4 text-[14px] leading-5 text-[#2a2419] transition hover:bg-[rgba(232,227,219,0.6)]"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
