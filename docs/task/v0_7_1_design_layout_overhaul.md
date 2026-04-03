# Personal Wiki v0.7.1 Design & Layout Overhaul

## Branch

- Working branch: `V0_7_1_Design_Layout_Overhaul`

## Goal

- 호두나무 계열 컬러 톤으로 전환하여 "개인 도서관" 아이덴티티를 강화한다.
- Author 영역에 사이드바 네비게이션을 도입하고, 랜딩 페이지를 분리한다.
- 디자인 리뷰 피드백을 전체 반영한다.

## Scope

### 1. 컬러 톤 — 호두나무 계열
- 기존 갈색 톤을 호두나무/월넛 서재 느낌으로 심화
- CSS 변수 또는 Tailwind 설정으로 컬러 토큰 관리
- 모든 페이지에 일괄 적용

### 2. 랜딩 페이지 (`/`)
- 제품 소개 + 최근 공개 문서 맛보기 + [전체 문서 보기] CTA
- 기존 홈의 문서 목록은 `/library`로 분리

### 3. 공개 문서 목록 (`/library`)
- 기존 홈 페이지의 Browse Library 섹션을 독립 페이지로 이동
- 검색, 필터, 페이지네이션 유지

### 4. Author 사이드바
- 데스크톱: 왼쪽 고정 사이드바 (200-280px)
- 각 탭(문서, Chat, 새 글, My Lib)은 사이드바 내 섹션으로 전환
  - 문서: 돌아가기 / 검색 / 문서 리스트 / 페이지네이션
  - Chat: 돌아가기 / 새 채팅 버튼 / (히스토리 후속)
  - 새 글: 돌아가기 / 새 글 작성 버튼 / 최근 글 5-10개
  - My Lib: 돌아가기 / 검색 / 북마크 리스트 / 페이지네이션
- 모바일: 햄버거 메뉴 → 오버레이로 사이드바 내용 표시
- 헤더는 심플하게: 로고 + 홈 링크 정도만

### 5. 디자인 리뷰 피드백 반영
- 홈: Hero 축소 (랜딩으로 이동하면서 자연 해결)
- 에디터: 버튼 크기 확대, Cancel 확인 팝업, Publish 하단 이동, Writing support 개선
- Workspace: Private 배지 → 자물쇠 아이콘, 카드 전체 클릭, 삭제 확인 팝업
- Bookmark/Like: filled/outline 아이콘으로 활성/비활성 구분
- 문서 카드: unknown 작성자 처리, book/article 아이콘 구분 개선, 빈 카드 처리

### 6. 레이아웃 정리
- 헤더 높이 64px 통일
- site-shell 패턴 일관 적용
- sign-in 페이지 site-shell 패턴으로 통일
- 에디터 top padding 정리

## Non-Goals

- 채팅 히스토리 DB 저장 (후속)
- Public reader 사이드바 (후속)
- 임베딩/검색 고도화

## Proposed Changes

### A. 컬러 시스템
- `globals.css`에 CSS 변수로 컬러 토큰 정의
- 호두나무 팔레트: 깊은 브라운 foreground, 따뜻한 아이보리 background, 나무결 카드
- 기존 하드코딩된 색상값을 CSS 변수로 교체

### B. 레이아웃 구조 변경
- `app/layout.tsx`: public용 / author용 레이아웃 분리
- `app/author/layout.tsx`: 사이드바 포함 레이아웃
- 사이드바 컴포넌트: `components/author-sidebar.tsx`
- 모바일 햄버거: `components/mobile-nav.tsx`

### C. 라우트 변경
- `/` → 랜딩 페이지 (새로 만듦)
- `/library` → 공개 문서 목록 (기존 홈의 문서 목록 이동)
- `/library/[slug]` → 유지
- `/topics/[topic]` → 유지
- `/me/library` → 사이드바 내 My Lib으로 통합 검토
- `/author/*` → 사이드바 레이아웃 적용

### D. 리뷰 피드백 컴포넌트 수정
- 에디터 폼: 버튼 크기, 레이아웃 순서 변경
- 확인 팝업 컴포넌트 (Cancel, Delete용)
- Bookmark/Like 아이콘 상태 구분
- 문서 카드 개선

## Acceptance Criteria

- [ ] 호두나무 컬러 톤이 전체 페이지에 일관 적용
- [ ] `/` 랜딩 페이지에서 제품 소개 + 공개 문서 맛보기 표시
- [ ] `/library`에서 기존 문서 목록 + 검색 + 필터 동작
- [ ] Author 사이드바: 문서/Chat/새 글/My Lib 섹션 전환
- [ ] 모바일: 햄버거 → 오버레이 네비게이션
- [ ] 헤더 심플화 (로고 + 홈)
- [ ] Cancel/Delete 시 확인 팝업
- [ ] Publish 버튼 하단 배치
- [ ] Bookmark/Like 활성 상태 구분
- [ ] Private 배지 → 자물쇠 아이콘
- [ ] 카드 전체 클릭 가능
- [ ] unknown 작성자 표시 개선
- [ ] 레이아웃 불일치 정리 (헤더 높이, padding, site-shell)
- [ ] `pnpm lint` / `tsc --noEmit` / `pnpm test` / `pnpm build` 통과

## Risks

- **범위가 크다**: 컬러 + 레이아웃 + 라우트 변경 + 피드백 반영을 한 버전에서 진행. 중간 검증 포인트를 자주 잡아야 한다.
- **라우트 변경**: `/` → 랜딩, `/library` 신규. 기존 링크/SEO에 영향. 리다이렉트 필요 여부 검토.
- **사이드바 레이아웃**: author 전용 layout.tsx 분리 시 기존 root layout과의 충돌 주의.
- **모바일 사이드바**: 오버레이 동작, 스크롤 잠금, 접근성 처리 필요.

## Verification

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

- 모든 페이지 수동 확인 (데스크톱 + 모바일 뷰포트)
- 사이드바 섹션 전환 동작 확인
- 모바일 햄버거 메뉴 동작 확인
- 랜딩 → 라이브러리 → 문서 읽기 흐름 확인
- Author 사이드바 → 에디터 → 챗 전환 흐름 확인

## Related Docs

- `docs/idea/2026_04_04_01_Idea.md` — 디자인 리뷰 피드백
- `docs/task/v0_7_0_chat_driven_writing.md` — 챗 기능 (사이드바에 통합)
- `docs/task/TEMPLATE.md`
