# Personal Wiki v0.6.15 Skeleton UI Refinement

## Branch

- Working branch: `V0_6_15_Skeleton_UI_Refinement`

## Goal

- 모든 페이지의 스켈레톤 UI를 점진적 로딩(progressive loading) 방식으로 개선한다.
- 현재 loading.tsx가 전체 페이지를 한 덩어리로 보여주다 한번에 사라지는 어색한 전환을 없앤다.

## Scope

- public reader 경로: `/`, `/library/[slug]`, `/topics/[topic]`, `/me/library`
- author 경로: `/author`, `/author/sign-in`, `/author/documents`

## Non-Goals

- 스켈레톤 디자인 시스템(공용 컴포넌트 라이브러리) 구축
- 스켈레톤 애니메이션 변경 (animate-pulse 유지)
- 데이터 fetching 로직 변경

## Current Problems

### 1. `/library/[slug]` — 원샷 전환

- `loading.tsx`가 전체 페이지(back button + header + content + related) 스켈레톤을 한 덩어리로 렌더
- `page.tsx`가 async로 document를 await → loading.tsx가 한꺼번에 사라지고 전체 콘텐츠가 팍 나타남
- 이후 Suspense fallback(reactions, related, comments)이 뒤늦게 나타나면서 두 번의 레이아웃 점프 발생
- **체감:** 스켈레톤 → (빈 틈) → 전체 콘텐츠 + 섹션 스켈레톤 → 섹션 완성. 어색한 3단계 전환.

### 2. `/` (홈) — loading.tsx와 Suspense fallback 간 불일치

- `loading.tsx`는 hero + 3카드를 보여주지만, 실제 page.tsx에서 hero 텍스트는 static이고 library section만 Suspense
- loading.tsx가 사라지면 hero가 즉시 렌더 + library 영역에 `HomeLibraryFallback`이 다시 나타남
- **체감:** 스켈레톤 hero → 실제 hero + 다른 스켈레톤. hero 영역이 깜빡이는 느낌.

### 3. `/topics/[topic]` — Suspense 없이 전체 blocking

- page.tsx가 async로 전체 데이터를 await, Suspense boundary 없음
- loading.tsx가 한번에 사라지고 전체 콘텐츠가 팍 나타남
- 레코드 목록이 많아질수록 전환이 더 어색해질 수 있음

### 4. `/me/library` — 동일 패턴

- page.tsx가 auth + discovery 데이터를 모두 await하고 한번에 렌더
- DiscoveryControls만 Suspense로 감싸져 있고 나머지는 blocking
- loading.tsx → 전체 콘텐츠 원샷 전환

### 5. `/author` — 전체 blocking + static 텍스트까지 스켈레톤

- page.tsx가 auth + document list를 모두 await한 뒤 한번에 렌더
- loading.tsx가 "Workspace" 제목, 버튼, 문서 카드를 전부 스켈레톤으로 보여줌
- 인증 실패/미설정 시 다른 UI를 보여주는 분기가 있어서 Suspense 분리 시 주의 필요
- **체감:** 전체 스켈레톤 → 한번에 팍 전환

### 6. `/author/sign-in` — static UI까지 불필요하게 스켈레톤

- page.tsx가 auth check만 await (인증됐으면 redirect)
- loading.tsx가 back link + 전체 폼 카드를 스켈레톤으로 보여줌
- 실제 콘텐츠는 거의 static (폼 + 탭 UI) — auth check만 끝나면 즉시 보여줄 수 있음
- **체감:** 폼 스켈레톤이 나왔다가 거의 동일한 모양의 실제 폼으로 교체. 불필요한 깜빡임.

### 7. `/author/documents` — 에디터 폼 전체 blocking

- page.tsx가 document 데이터를 await한 뒤 폼 렌더
- loading.tsx가 sticky header + 폼 전체를 스켈레톤으로 보여줌
- **체감:** 에디터 스켈레톤 → 실제 에디터 원샷 전환

### 8. 공통 — loading.tsx ↔ Suspense fallback 사이 시각적 단절

- loading.tsx (route-level)와 page 내부 Suspense fallback이 별도로 존재
- loading.tsx가 사라진 뒤 Suspense fallback이 다른 모양으로 나타나면서 "스켈레톤이 두 번 바뀌는" 느낌

## Proposed Changes

### A. `/library/[slug]` — 점진적 Suspense 분리

**핵심:** page.tsx에서 document fetch를 별도 async 컴포넌트로 분리, Suspense 계층화

```
page.tsx (sync)
├── Back button (즉시 렌더)
└── <Suspense fallback={<DocumentHeaderSkeleton />}>
    └── DocumentContent (async, document fetch)
        ├── Header (title, meta, tags)
        ├── Markdown content
        ├── <Suspense fallback={<ReactionsSkeleton />}>
        │   └── RecordReactionsSection
        ├── <Suspense fallback={<RelatedSkeleton />}>
        │   └── RelatedDocumentsSection
        └── <Suspense fallback={<ConversationSkeleton />}>
            └── ConversationSection
```

- `loading.tsx` 삭제 또는 최소화 (back button만)
- document fetch가 끝나면 header + content가 먼저 나타나고, 하단 섹션들은 개별 스트리밍
- **결과:** back button 즉시 → header+content 스트리밍 → 하단 섹션 개별 스트리밍. 자연스러운 top-down 전개.

### B. `/` (홈) — loading.tsx를 hero와 일치시키기

**핵심:** loading.tsx에서 hero 영역을 제거하고, library 스켈레톤만 남김

- hero 텍스트는 page.tsx에서 static으로 즉시 렌더되므로 loading.tsx에 hero 스켈레톤 불필요
- page.tsx 구조:
  - hero section (sync, 즉시 렌더)
  - `<Suspense fallback={<HomeLibraryFallback />}>` (이미 존재)
- loading.tsx를 `HomeLibraryFallback`과 동일한 모양으로 맞추거나, loading.tsx를 삭제하고 page 내부 Suspense에 위임
- **결과:** hero 즉시 노출 → library 영역만 스켈레톤 → 데이터 스트리밍. 깜빡임 제거.

### C. `/topics/[topic]` — Suspense boundary 추가

**핵심:** records 목록을 별도 async 컴포넌트로 분리

```
page.tsx (sync)
├── Back button (즉시 렌더)
└── <Suspense fallback={<TopicPageSkeleton />}>
    └── TopicContent (async, data fetch)
        ├── Topic header (title, description, count)
        ├── Records list
        └── Related topics
```

- loading.tsx를 삭제하고 page 내부 Suspense에 위임
- back button이 즉시 보이고, 나머지가 스트리밍
- **결과:** back button 즉시 → topic 콘텐츠 스트리밍. 단순하고 자연스러움.

### D. `/me/library` — 동일 패턴 적용

**핵심:** page header를 sync로 즉시 렌더, 북마크 목록을 Suspense로 분리

```
page.tsx (sync)
├── Page header: "My Library" + subtitle (즉시 렌더)
└── <Suspense fallback={<MyLibraryContentSkeleton />}>
    └── MyLibraryContent (async, auth + data fetch)
        ├── Bookmark badge
        ├── MyLibraryBrowser + DiscoveryControls
        └── PaginationNav
```

- loading.tsx를 삭제하고 page 내부 Suspense에 위임
- **결과:** 페이지 제목 즉시 → 목록 스트리밍.

### E. `/author` — Workspace 제목 즉시 렌더 + 문서 목록 Suspense

**핵심:** auth 분기 후 static 영역 즉시 렌더, 문서 목록만 스트리밍

- 단, auth check + hasAuthoringEnv 분기가 있어 page.tsx 자체는 async 유지 필요
- auth 통과 후 "Workspace" 제목 + 버튼 영역을 sync로 먼저 보여주고, 문서 목록을 Suspense로 분리

```
page.tsx (async — auth check 필요)
├── Auth guard (redirect/error states)
├── Header: "Workspace" + buttons (즉시 렌더)
└── <Suspense fallback={<DocumentListSkeleton />}>
    └── AuthorDocumentList (async, document list fetch)
```

- loading.tsx 삭제, page 내부 Suspense에 위임
- **결과:** auth check 후 header 즉시 → 문서 목록 스트리밍

### F. `/author/sign-in` — loading.tsx 삭제

**핵심:** 거의 전부 static UI, auth check만 await

- auth check는 빠르고 (인증됐으면 redirect, 아니면 폼 표시), 폼 자체는 static
- loading.tsx의 폼 스켈레톤이 실제 폼과 거의 동일 → 불필요한 깜빡임만 유발
- loading.tsx를 삭제하면 auth check 동안 이전 페이지가 유지되다가 폼이 바로 나타남
- **결과:** 불필요한 스켈레톤 깜빡임 제거

### G. `/author/documents` — sticky header 즉시 렌더

**핵심:** 에디터 헤더를 sync로 먼저 보여주고 폼 데이터만 Suspense

```
page.tsx (async — auth + document fetch)
├── Sticky header: back button + save button (즉시 렌더)
└── <Suspense fallback={<EditorFormSkeleton />}>
    └── DocumentEditorForm (async, document data fetch)
```

- loading.tsx 삭제, page 내부 Suspense에 위임
- **결과:** header 즉시 → 에디터 폼 스트리밍

### H. 공통 — Suspense fallback 스켈레톤 정돈

- 각 Suspense fallback이 실제 콘텐츠와 동일한 레이아웃/사이즈를 갖도록 정리
- 기존 loading.tsx에서 사용하던 스켈레톤 조각들을 Suspense fallback으로 이동
- loading.tsx 삭제 시 레이아웃 시프트(CLS) 없도록 fallback 높이 맞춤

## Acceptance Criteria

- [ ] `/library/[slug]`: back button 즉시 렌더, document content 스트리밍, 하단 3섹션 개별 스트리밍
- [ ] `/`: hero 텍스트 즉시 렌더, library 카드만 스켈레톤 → 스트리밍
- [ ] `/topics/[topic]`: back button 즉시 렌더, topic content 스트리밍
- [ ] `/me/library`: 페이지 제목 즉시 렌더, 북마크 목록 스트리밍
- [ ] `/author`: auth 후 header 즉시 렌더, 문서 목록 스트리밍
- [ ] `/author/sign-in`: 불필요한 스켈레톤 깜빡임 없이 폼 직접 렌더
- [ ] `/author/documents`: sticky header 즉시 렌더, 에디터 폼 스트리밍
- [ ] 모든 페이지에서 "스켈레톤이 두 번 바뀌는" 현상 없음
- [ ] 레이아웃 시프트(CLS) 증가 없음 — fallback과 실제 콘텐츠 사이즈 일치
- [ ] `pnpm lint` / `tsc --noEmit` / `pnpm test` / `pnpm build` 통과

## Risks

- **Suspense 계층 증가에 따른 복잡도:** page.tsx가 Suspense 중첩으로 읽기 어려워질 수 있음 → async 컴포넌트를 `_components/`로 분리해서 관리
- **CLS 악화:** fallback 높이가 실제 콘텐츠와 다르면 레이아웃 시프트 → fallback을 실제 콘텐츠 구조와 최대한 일치시킴
- **loading.tsx 삭제 시 초기 빈 화면:** Suspense fallback이 없으면 아무것도 안 보임 → fallback을 반드시 제공
- **preview mode 분기:** `/library/[slug]`에서 preview mode일 때 다른 fetch 경로 → async 컴포넌트 내부에서 동일하게 분기 처리

## Verification

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

- 각 페이지 네트워크 throttling(Slow 3G)으로 점진적 로딩 확인
- Chrome DevTools Performance 탭에서 CLS 측정
- preview mode(`?preview=1`) 동작 확인

## Related Docs

- `docs/task/TEMPLATE.md`
