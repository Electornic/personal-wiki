# Personal Wiki v0.7.2 Mobile Layout & Polish

## Branch

- Working branch: `V0_7_2_Mobile_Layout_Polish`

## Goal

- 모바일 레이아웃을 풀 블리드로 전환하여 좁은 화면에서 콘텐츠 공간을 최대화한다.
- v0.7.1 디자인 리뷰에서 남은 polish 항목을 마무리한다.

## Scope

### 1. 모바일 풀 블리드 크림 박스
- 모바일(<768px)에서 margin, border-radius, border 제거
- 데스크탑(md+)에서 기존 스타일 유지
- 대상: 모든 surface-light 페이지 + author layout

### 2. 헤더 스크롤 시 텍스트 가시성
- 모바일에서 반투명 헤더(85%) 아래로 크림 콘텐츠가 비치는 문제
- 모바일 opacity 95%로 상향, 데스크탑 85% 유지

### 3. 에디터 툴바 버튼 크기 확대
- 모바일 터치 타겟 기준(44px) 미달이던 h-8(32px) → h-10(40px)
- 텍스트 크기도 12px → 13px, 데스크탑에서는 기존 크기 유지

### 4. Book/Article 아이콘 색상 구분
- Book 아이콘에 golden brown(#8B6914) 색상 적용
- Article 아이콘은 기존 muted 색상 유지

### 5. Unknown 작성자 표시 정리
- fallback 텍스트 "unknown" → "Anonymous"

## Non-Goals

- /me/library 사이드바 통합 (후속 0.7.x+)
- route group 리팩터 (후속 0.7.x+)
- AuthorDocumentForm 분리 (후속 0.7.x+)
- BookIcon/ArticleIcon 공통 컴포넌트 추출 (현재 각 파일에 로컬 정의 유지)

## Proposed Changes

### A. 풀 블리드 레이아웃
- `app/author/layout.tsx`: 외부 wrapper `px-0 py-0 lg:py-4`, 크림 박스 `rounded-none lg:rounded-r-[12px] lg:border`
- 6개 public 페이지: `my-0 rounded-none md:my-4 md:rounded-[12px] md:border md:border-[var(--content-border)]`

### B. 헤더 opacity
- `site-header-client.tsx`: `bg-[rgba(44,30,14,0.95)] md:bg-[rgba(44,30,14,0.85)]`

### C. 에디터 버튼
- `author-document-form.tsx`: 툴바 버튼 `h-10 text-[13px] leading-5 md:h-8 md:text-[12px] md:leading-4`

### D. 아이콘 색상
- 4개 파일의 BookIcon: `text-[var(--muted)]` → `text-[#8B6914]`

### E. 작성자 fallback
- `entities/record/api/documents.ts`: `"unknown"` → `"Anonymous"`

## Acceptance Criteria

- [x] 모바일에서 크림 박스가 풀 블리드로 표시
- [x] 데스크탑에서 기존 rounded + border 스타일 유지
- [x] 모바일 헤더에서 스크롤 시 텍스트 비침 개선
- [x] 에디터 툴바 버튼이 모바일에서 터치하기 쉬운 크기
- [x] Book과 Article 아이콘이 색상으로 구분
- [x] 작성자 없을 때 "Anonymous" 표시
- [x] `pnpm lint` / `tsc --noEmit` / `pnpm build` 통과

## Risks

- **smart quote 오염**: 에디터 파일 수정 시 유니코드 따옴표 혼입 주의 (실제 발생 후 수정함)
- **풀 블리드 경계**: 모바일에서 크림 박스와 다크 배경 사이 전환이 갑작스러울 수 있음 — 필요 시 후속에서 그라디언트 추가 검토

## Verification

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

- 모바일 뷰포트(375px)에서 크림 박스 풀 블리드 확인
- 데스크탑(1280px)에서 기존 rounded 스타일 유지 확인
- 에디터 페이지에서 툴바 버튼 터치 영역 확인
- Book/Article 카드에서 아이콘 색상 구분 확인

## Related Docs

- `docs/task/v0_7_1_design_layout_overhaul.md` — 디자인 오버홀 (이번 작업의 선행)
- `docs/idea/2026_04_04_01_Idea.md` — 디자인 리뷰 피드백 원본
