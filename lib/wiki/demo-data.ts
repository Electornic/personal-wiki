import type { WikiDocument } from "@/lib/wiki/types";

export const demoDocuments: WikiDocument[] = [
  {
    id: "demo-1",
    slug: "the-creative-act",
    title: "The Creative Act",
    sourceType: "book",
    visibility: "public",
    authorName: "Rick Rubin",
    sourceTitle: "The Creative Act: A Way of Being",
    sourceUrl: null,
    isbn: "9780593652886",
    publishedAt: "2023-01-17",
    intro:
      "창작의 결과물이 아니라, 창작하는 사람의 감각이 어떻게 길러지는지를 메모한 기록.",
    topics: ["creativity", "practice", "attention"],
    noteCards: [
      {
        position: 0,
        heading: "감각의 관리",
        content: "좋은 작업은 더 많은 생산이 아니라 더 좋은 감각 상태를 만드는 데서 출발한다.",
      },
      {
        position: 1,
        heading: "연결된 생각",
        content: "독서 메모도 결국 아이디어 저장소가 아니라 다음 생각으로 이동하는 발판이어야 한다.",
      },
    ],
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-08T11:00:00.000Z",
  },
  {
    id: "demo-2",
    slug: "how-to-take-smart-notes",
    title: "How to Take Smart Notes",
    sourceType: "book",
    visibility: "public",
    authorName: "Sonnke Ahrens",
    sourceTitle: "How to Take Smart Notes",
    sourceUrl: null,
    isbn: "9783982438801",
    publishedAt: "2022-03-08",
    intro:
      "메모를 쌓는 행위보다, 서로 연결 가능한 단위로 사고를 남기는 방식에 대한 기록.",
    topics: ["notes", "systems", "practice"],
    noteCards: [
      {
        position: 0,
        heading: "메모의 단위",
        content: "긴 요약보다 작은 생각 조각이 나중에 더 많이 재사용된다.",
      },
      {
        position: 1,
        heading: "연결된 생각",
        content: "카드/불릿 메모 구조는 위키의 추천 경험과도 자연스럽게 맞물린다.",
      },
    ],
    createdAt: "2026-02-25T09:00:00.000Z",
    updatedAt: "2026-03-06T15:00:00.000Z",
  },
  {
    id: "demo-3",
    slug: "seeing-like-a-designer",
    title: "Seeing Like a Designer",
    sourceType: "article",
    visibility: "public",
    authorName: "Margaret Sullivan",
    sourceTitle: "Seeing Like a Designer",
    sourceUrl: "https://example.com/seeing-like-a-designer",
    isbn: null,
    publishedAt: "2025-12-02",
    intro:
      "좋은 인터페이스는 설명보다 맥락과 시선의 흐름으로 사람을 이동시킨다는 글.",
    topics: ["design", "attention", "reading"],
    noteCards: [
      {
        position: 0,
        heading: "시선의 흐름",
        content: "읽는 경험에서 핵심은 정보량보다 다음 지점으로 향하게 만드는 배치다.",
      },
      {
        position: 1,
        heading: "위키 적용",
        content: "추천 모듈은 사이드 기능이 아니라 독서의 연장선이어야 한다.",
      },
    ],
    createdAt: "2026-03-03T09:00:00.000Z",
    updatedAt: "2026-03-10T01:00:00.000Z",
  },
  {
    id: "demo-4",
    slug: "private-reading-log",
    title: "Private Reading Log",
    sourceType: "article",
    visibility: "private",
    authorName: "Internal Note",
    sourceTitle: "Unpublished",
    sourceUrl: null,
    isbn: null,
    publishedAt: "2026-03-09",
    intro: "비공개 메모라 public surface에 나타나지 않아야 한다.",
    topics: ["practice", "design"],
    noteCards: [
      {
        position: 0,
        heading: "비공개",
        content: "추천/목록 어디에서도 이 문서의 존재가 보이면 안 된다.",
      },
    ],
    createdAt: "2026-03-09T09:00:00.000Z",
    updatedAt: "2026-03-10T03:00:00.000Z",
  },
];
