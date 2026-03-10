import Link from "next/link";
import { notFound } from "next/navigation";

import { NoteCardList } from "@/components/note-card-list";
import { TopicPill } from "@/components/topic-pill";
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
            <p className="max-w-2xl text-lg leading-8 text-stone-700">
              {document.intro}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {document.topics.map((topic) => (
              <TopicPill key={topic} label={topic} />
            ))}
          </div>
          <NoteCardList noteCards={document.noteCards} />
        </div>

        <aside className="space-y-6 rounded-[1.5rem] bg-stone-100/80 p-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
              Source
            </p>
            <p className="text-lg text-stone-900">{document.sourceTitle}</p>
            <p className="text-sm text-stone-600">{document.authorName}</p>
            {document.sourceUrl ? (
              <a
                href={document.sourceUrl}
                className="inline-block text-sm text-stone-700 underline-offset-4 transition hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                원문 링크
              </a>
            ) : null}
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
                      {relatedDocument.sharedTopics.join(" · ")}
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
    </main>
  );
}
