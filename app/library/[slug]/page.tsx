import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentForm } from "@/components/comment-form";
import { CommentThread } from "@/components/comment-thread";
import { MarkdownContent } from "@/components/markdown-content";
import { RecordReactions } from "@/components/record-reactions";
import { TopicPill } from "@/components/topic-pill";
import { getAuthorAccess } from "@/lib/wiki/auth";
import { listCommentsForRecord } from "@/lib/wiki/comments";
import { formatDisplayDate, formatLongDisplayDate } from "@/lib/wiki/content";
import { getPublicDocumentBySlug, listRelatedDocuments } from "@/lib/wiki/documents";
import { getReactionStateForRecord } from "@/lib/wiki/reactions";

type PageProps = {
  params: Promise<{ slug: string }>;
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
      className="h-5 w-5 text-[#6b6354]"
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
      className="h-5 w-5 text-[#6b6354]"
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

function CommentIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-[#6b6354]"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M5 6.667A1.667 1.667 0 0 1 6.667 5h6.666A1.667 1.667 0 0 1 15 6.667v4.166a1.667 1.667 0 0 1-1.667 1.667H9.167L6.25 15V12.5H6.667A1.667 1.667 0 0 1 5 10.833V6.667Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export default async function LibraryDocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const [document, access] = await Promise.all([
    getPublicDocumentBySlug(slug),
    getAuthorAccess(),
  ]);

  if (!document) {
    notFound();
  }

  const [relatedDocuments, comments, reactionState] = await Promise.all([
    listRelatedDocuments(slug, 3),
    listCommentsForRecord(document.id),
    getReactionStateForRecord(document.id),
  ]);

  return (
    <main className="site-shell pb-20 pt-8">
      <div className="site-shell-content">
        <Link
          href="/"
          className="inline-flex h-8 items-center gap-2 rounded-[4px] px-[10px] text-[14px] leading-5 font-medium text-[#2a2419] transition hover:bg-[rgba(232,227,219,0.45)]"
        >
          <BackIcon />
          Library
        </Link>

        <article className="mt-8 w-full">
          <header>
            <div className="flex items-center">
              {document.sourceType === "book" ? <BookIcon /> : <ArticleIcon />}
            </div>
            <h1 className="mt-4 text-[36px] leading-[45px] font-semibold tracking-[-0.02em] text-[#2a2419] md:text-[48px] md:leading-[60px] md:tracking-[-0.96px]">
              {document.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px] leading-6">
              <span className="font-medium text-[#2a2419]">{document.writerName}</span>
              <span className="text-[#6b6354]">·</span>
              <span className="text-[#6b6354]">
                {formatLongDisplayDate(document.publishedAt)}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {document.tags.map((tag) => (
                <TopicPill key={tag} label={tag} />
              ))}
            </div>
          </header>

          <section className="mt-12">
            <MarkdownContent
              contents={document.contents}
              className={[
                "prose-p:mb-[28px] prose-p:text-[18px] prose-p:leading-[29.25px] prose-p:text-[#2a2419]",
                "prose-headings:mt-11 prose-headings:mb-3 prose-headings:text-[#2a2419]",
                "prose-h1:text-[30px] prose-h1:leading-9 prose-h1:tracking-[-0.3px]",
                "prose-h2:text-[24px] prose-h2:leading-8",
                "prose-blockquote:my-8 prose-blockquote:border-l-4 prose-blockquote:border-[rgba(42,36,25,0.1)] prose-blockquote:pl-7 prose-blockquote:text-[18px] prose-blockquote:leading-[29.25px] prose-blockquote:italic prose-blockquote:text-[rgba(42,36,25,0.8)]",
                "prose-ol:my-6 prose-ol:pl-6 prose-li:mb-2 prose-li:text-[18px] prose-li:leading-[29.25px] prose-li:text-[#2a2419]",
                "prose-strong:text-[#2a2419]",
              ].join(" ")}
            />
          </section>

          <section className="mt-12 border-b border-t border-[rgba(42,36,25,0.1)] py-6">
            <RecordReactions
              recordId={document.id}
              recordSlug={document.slug}
              state={reactionState}
              canReact={access.isAuthenticated}
            />
          </section>

          <section className="mt-16 border-t border-[rgba(42,36,25,0.1)] pt-12">
            <h2 className="text-[24px] leading-8 font-semibold text-[#2a2419]">
              Related Reading
            </h2>
            {relatedDocuments.length > 0 ? (
              <div className="mt-6 space-y-4">
                {relatedDocuments.map((relatedDocument) => (
                  <Link
                    key={relatedDocument.id}
                    href={`/library/${relatedDocument.slug}`}
                    className="block rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.3)] px-[21px] py-[21px] transition hover:bg-[rgba(232,227,219,0.45)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 shrink-0">
                        {relatedDocument.sourceType === "book" ? (
                          <BookIcon />
                        ) : (
                          <ArticleIcon />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[18px] leading-7 font-semibold text-[#2a2419]">
                          {relatedDocument.title}
                        </p>
                        <p className="mt-1 text-[14px] leading-5 text-[#6b6354]">
                          {relatedDocument.writerName} ·{" "}
                          {formatDisplayDate(relatedDocument.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[6px] border border-dashed border-[rgba(42,36,25,0.18)] px-4 py-5 text-[14px] leading-6 text-[#6b6354]">
                아직 충분히 겹치는 태그가 없습니다. 추천은 빈 상태를 그대로 보여줍니다.
              </div>
            )}
          </section>

          <section className="mt-16 border-t border-[rgba(42,36,25,0.1)] pt-12">
            <div className="flex items-center gap-2">
              <CommentIcon />
              <h2 className="text-[24px] leading-8 font-semibold text-[#2a2419]">
                Comments
                <span className="ml-0.5 text-[18px] leading-7 text-[#6b6354]">
                  ({comments.length})
                </span>
              </h2>
            </div>

            {access.isAuthenticated ? (
              <div className="mt-8">
                <CommentForm recordId={document.id} recordSlug={document.slug} />
              </div>
            ) : (
              <div className="mt-8 rounded-[6px] border border-[rgba(42,36,25,0.1)] bg-[rgba(232,227,219,0.3)] px-6 py-6 text-center">
                <p className="text-[18px] leading-[32.4px] text-[#6b6354]">
                  Sign in to join the conversation
                </p>
                <Link
                  href="/author/sign-in"
                  className="mt-4 inline-flex h-8 items-center justify-center rounded-[4px] border border-[rgba(42,36,25,0.1)] bg-[#faf8f5] px-3 text-[14px] leading-5 font-medium text-[#2a2419]"
                >
                  Sign In
                </Link>
              </div>
            )}

            <div className="mt-10">
              {comments.length ? (
                <CommentThread
                  comments={comments}
                  recordId={document.id}
                  recordSlug={document.slug}
                  canComment={access.isAuthenticated}
                />
              ) : (
                <div className="text-[14px] leading-6 text-[#6b6354]">No comments yet.</div>
              )}
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
