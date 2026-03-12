import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentForm } from "@/components/comment-form";
import { CommentThread } from "@/components/comment-thread";
import { MarkdownContent } from "@/components/markdown-content";
import { TopicPill } from "@/components/topic-pill";
import { getAuthorAccess } from "@/lib/wiki/auth";
import { listCommentsForRecord } from "@/lib/wiki/comments";
import { getPublicDocumentBySlug, listRelatedDocuments } from "@/lib/wiki/documents";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LibraryDocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const document = await getPublicDocumentBySlug(slug);

  if (!document) {
    notFound();
  }

  const relatedDocuments = await listRelatedDocuments(slug, 3);
  const comments = await listCommentsForRecord(document.id);
  const access = await getAuthorAccess();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-10 md:px-10">
      <div className="flex items-center justify-between text-sm text-stone-500">
        <Link href="/" className="transition hover:text-stone-900">
          home
        </Link>
        <span>{document.sourceType}</span>
      </div>

      <section className="grid gap-8 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)] md:grid-cols-[1.5fr_0.7fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="section-kicker">Record</p>
            <h1 className="text-4xl leading-tight text-stone-900 md:text-6xl">
              {document.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {document.tags.map((tag) => (
              <TopicPill key={tag} label={tag} />
            ))}
          </div>
          <MarkdownContent contents={document.contents} />
        </div>

        <aside className="space-y-6 rounded-[1.5rem] bg-stone-100/80 p-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
              Source
            </p>
            <p className="text-lg text-stone-900">
              {document.sourceType === "book"
                ? document.bookTitle ?? document.title
                : document.title}
            </p>
            <p className="text-sm text-stone-600">{document.writerName}</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
              Related documents
            </p>
            {relatedDocuments.length > 0 ? (
              <div className="space-y-3">
                {relatedDocuments.map((relatedDocument) => (
                  <Link
                    key={relatedDocument.id}
                    href={`/library/${relatedDocument.slug}`}
                    className="block rounded-3xl border border-stone-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-stone-400"
                  >
                    <p className="text-base text-stone-900">{relatedDocument.title}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {relatedDocument.sharedTags.join(" · ")}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 px-4 py-5 text-sm leading-6 text-stone-600">
                아직 충분히 겹치는 태그가 없습니다. 추천은 빈 상태를 그대로 보여줍니다.
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="space-y-6 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_28px_80px_rgba(51,39,18,0.08)]">
        <div className="space-y-2">
          <p className="section-kicker">Comments</p>
          <h2 className="text-3xl text-stone-900">Reader conversation</h2>
          <p className="text-sm leading-7 text-stone-600">
            Public comments are readable without login. Posting requires an account.
          </p>
        </div>

        {comments.length ? (
          <CommentThread
            comments={comments}
            recordId={document.id}
            recordSlug={document.slug}
            canComment={access.isAuthenticated}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-stone-300 px-4 py-5 text-sm leading-6 text-stone-600">
            No comments yet.
          </div>
        )}

        {access.isAuthenticated ? (
          <CommentForm recordId={document.id} recordSlug={document.slug} />
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-stone-50 px-5 py-5 text-sm leading-7 text-stone-700">
            Log in to leave a comment.
          </div>
        )}
      </section>
    </main>
  );
}
