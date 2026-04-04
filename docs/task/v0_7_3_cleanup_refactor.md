# Personal Wiki v0.7.3 Cleanup & Refactor

## Branch

- Working branch: `V0_7_3_Cleanup_Refactor`

## Goal

- 고아 코드 제거, 태그 쿼리 성능 최적화, 에디터 폼 분리로 코드베이스 건강성 개선.
- 네비게이션 prefetch 제거로 초기 로드 네트워크 요청 감소.

## Scope

### 1. 고아 코드 제거
- `listAvailableTagsForPublicDocuments` — 소비처 없음, 삭제
- `getPublicDiscoveryView` — 소비처 없음, 삭제

### 2. 태그 인기순 쿼리 SQL RPC 최적화
- `get_public_tags_by_popularity()` DB 함수 생성
- `listPublicTagsByPopularity`를 전체 테이블 스캔 → RPC 호출로 변경
- 데모 모드 fallback 유지

### 3. AuthorDocumentForm 분리
- `author-document-form.tsx` (745줄) → 3파일:
  - `author-document-form.tsx` (~187줄) — form shell, visibility, staged images
  - `author-document-editor.tsx` (~491줄) — toolbar, textarea, preview, image staging
  - `author-document-metadata.tsx` (~110줄) — title, sourceType, bookTitle, tags

### 4. Link prefetch 비활성화
- 헤더, 사이드바, 모바일 네비의 Link에 `prefetch={false}` 추가
- 메인 페이지 초기 로드 시 ~10개 RSC prefetch 요청 제거

## Non-Goals

- Supabase auth 속도 최적화 (인프라 수준)
- cacheLife 튜닝 (현재 충분)

## Acceptance Criteria

- [x] `listAvailableTagsForPublicDocuments`, `getPublicDiscoveryView` 삭제
- [x] `get_public_tags_by_popularity` SQL RPC 함수 마이그레이션
- [x] `listPublicTagsByPopularity` RPC 호출로 변경
- [x] AuthorDocumentForm 3파일 분리, 각 컴포넌트 자체 state 소유
- [x] 네비게이션 Link prefetch={false}
- [x] `pnpm lint` / `tsc --noEmit` / `pnpm test` / `pnpm build` 통과

## Risks

- **SQL RPC 미실행 시** 태그 목록 빈 배열 반환. 배포 전 반드시 SQL 실행 필요.

## Verification

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

- Supabase Dashboard에서 `get_public_tags_by_popularity` RPC 실행 확인
- /library 페이지에서 태그 pill 정상 표시 확인
- /author/documents/new 에디터 폼 정상 동작 확인
- 네트워크 탭에서 prefetch 요청 감소 확인

## Related Docs

- `docs/task/v0_7_2_mobile_layout_polish.md` — 선행 작업
- `supabase/migrations/20260404T120000Z_v0_7_3_public_tag_popularity_rpc.sql` — DB 마이그레이션
