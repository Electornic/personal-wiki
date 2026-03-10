import Link from "next/link";

import { DocumentCard } from "@/components/document-card";
import { TopicPill } from "@/components/topic-pill";
import { listPublicDocuments } from "@/lib/wiki/documents";

export default async function Home() {
  const documents = await listPublicDocuments();
  const featureDocument = documents[0] ?? null;
  const topicMap = new Map<string, number>();

  documents.forEach((document) => {
    document.topics.forEach((topic) => {
      topicMap.set(topic, (topicMap.get(topic) ?? 0) + 1);
    });
  });

  const topTopics = [...topicMap.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-10 md:px-10 lg:px-12">
      <section className="grid gap-8 rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,#f6f1e8_0%,#fbfaf7_55%,#ece4d3_100%)] p-8 shadow-[0_24px_80px_rgba(76,58,32,0.08)] md:grid-cols-[1.4fr_0.9fr] md:p-12">
        <div className="flex flex-col gap-6">
          <p className="text-sm uppercase tracking-[0.32em] text-stone-500">
            Personal Wiki
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl leading-[1.05] tracking-tight text-stone-900 md:text-7xl">
              Read one thought, then move into the next.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-700">
              책과 아티클 기록을 개인 도서관처럼 쌓고, 읽고 난 뒤 생긴 연결된
              생각을 카드 단위로 남깁니다. 추천은 같은 주제와 태그에서 출발합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="button-primary" href={featureDocument ? `/library/${featureDocument.slug}` : "#library"}>
              featured note 읽기
            </Link>
            <Link className="button-secondary" href="/author">
              author workspace
            </Link>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
            Library pulse
          </p>
          <div className="mt-6 grid gap-5">
            <div>
              <p className="text-4xl text-stone-900">{documents.length}</p>
              <p className="text-sm text-stone-600">public records available</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-stone-700">top topics</p>
              <div className="flex flex-wrap gap-2">
                {topTopics.map(([topic, count]) => (
                  <TopicPill key={topic} label={`${topic} · ${count}`} />
                ))}
              </div>
            </div>
            {featureDocument ? (
              <div className="rounded-3xl bg-stone-900 px-5 py-6 text-stone-50">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-300">
                  featured record
                </p>
                <h2 className="mt-3 text-2xl">{featureDocument.title}</h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  {featureDocument.intro}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section id="library" className="grid gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Newest shelf</p>
            <h2 className="section-title">책과 아티클 기록</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-600">
            공개 문서는 로그인 없이 읽을 수 있습니다. 비공개 문서는 author
            workspace에서만 보이고, 추천/목록 어디에서도 존재가 드러나지 않습니다.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      </section>
    </main>
  );
}
