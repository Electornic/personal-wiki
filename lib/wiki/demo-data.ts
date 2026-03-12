import type { WikiDocument } from "@/lib/wiki/types";

export const demoDocuments: WikiDocument[] = [
  {
    id: "demo-1",
    slug: "the-creative-act",
    title: "The Creative Act",
    contents:
      "창작의 결과물이 아니라, 창작하는 사람의 감각이 어떻게 길러지는지를 메모한 기록.\n\n## 감각의 관리\n좋은 작업은 더 많은 생산이 아니라 더 좋은 감각 상태를 만드는 데서 출발한다.\n\n## 연결된 생각\n독서 메모도 결국 아이디어 저장소가 아니라 다음 생각으로 이동하는 발판이어야 한다.",
    sourceType: "book",
    bookTitle: "The Creative Act: A Way of Being",
    visibility: "public",
    writerName: "rick_rubin",
    publishedAt: "2023-01-17",
    tags: ["creativity", "practice", "attention"],
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-08T11:00:00.000Z",
  },
  {
    id: "demo-2",
    slug: "how-to-take-smart-notes",
    title: "How to Take Smart Notes",
    contents:
      "메모를 쌓는 행위보다, 서로 연결 가능한 단위로 사고를 남기는 방식에 대한 기록.\n\n## 메모의 단위\n긴 요약보다 작은 생각 조각이 나중에 더 많이 재사용된다.\n\n## 연결된 생각\n마크다운 기반 기록은 읽기와 수정의 균형을 잡기에 충분히 가볍다.",
    sourceType: "book",
    bookTitle: "How to Take Smart Notes",
    visibility: "public",
    writerName: "sonnke_ahrens",
    publishedAt: "2022-03-08",
    tags: ["notes", "systems", "practice"],
    createdAt: "2026-02-25T09:00:00.000Z",
    updatedAt: "2026-03-06T15:00:00.000Z",
  },
  {
    id: "demo-3",
    slug: "seeing-like-a-designer",
    title: "Seeing Like a Designer",
    contents:
      "좋은 인터페이스는 설명보다 맥락과 시선의 흐름으로 사람을 이동시킨다는 글.\n\n## 시선의 흐름\n읽는 경험에서 핵심은 정보량보다 다음 지점으로 향하게 만드는 배치다.\n\n## 위키 적용\n추천 모듈은 사이드 기능이 아니라 독서의 연장선이어야 한다.",
    sourceType: "article",
    visibility: "public",
    writerName: "margaret_sullivan",
    publishedAt: "2025-12-02",
    tags: ["design", "attention", "reading"],
    createdAt: "2026-03-03T09:00:00.000Z",
    updatedAt: "2026-03-10T01:00:00.000Z",
  },
  {
    id: "demo-4",
    slug: "private-reading-log",
    title: "Private Reading Log",
    contents:
      "비공개 메모라 public surface에 나타나지 않아야 한다.\n\n## 비공개\n추천/목록 어디에서도 이 문서의 존재가 보이면 안 된다.",
    sourceType: "article",
    visibility: "private",
    writerName: "internal_note",
    publishedAt: "2026-03-09",
    tags: ["practice", "design"],
    createdAt: "2026-03-09T09:00:00.000Z",
    updatedAt: "2026-03-10T03:00:00.000Z",
  },
];
