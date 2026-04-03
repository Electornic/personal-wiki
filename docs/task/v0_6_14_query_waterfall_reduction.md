# Personal Wiki v0.6.14 Query Waterfall Reduction

## Branch

- Working branch: `V0_6_14_Query_Waterfall_Reduction`

## Goal

- 모든 library 관련 페이지의 데이터 fetch waterfall을 줄여 체감 로딩 속도를 개선한다.

## Scope

- discovery 필터 체인(tag + query)을 sequential에서 parallel로 변경한다.
- 검색 fallback 경로의 개별 쿼리(field ILIKE, tag name, author_name)를 병렬화한다.
- `listRelatedDocumentsForDocument`에서 source document의 tag ID 조회를 제거하고 이미 알고 있는 tag slug로 직접 candidate를 조회한다.

## Non-Goals

- Supabase RPC 신규 생성 또는 DB 스키마 변경
- 캐시 전략 변경 (`cacheLife` 조정 등)
- UI/UX 변경

## Current Problems

- discovery 필터(tag + query)가 sequential await 체인으로 동작해 필터 조합 시 round-trip이 누적된다.
- 검색 fallback 경로에서 field ILIKE 3개 → tag name 조회 → record_tags 조회 → author_name 조회가 순차 실행된다.
- `listRelatedDocumentsForDocument`가 source document의 tag ID를 record_tags에서 다시 조회한 뒤 candidate를 찾아 3단 waterfall이 발생한다.

## Proposed Changes

- `resolveFilteredRecordIds` 공용 헬퍼를 추가해 tag filter와 query filter를 `Promise.all`로 병렬 실행 후 교집합을 구한다.
- `resolvePublicDiscoveryRecordIds`, `listDiscoveryListItemsPageForRecordIds`, `listDiscoveryDocumentsPageForRecordIds`에서 이 헬퍼를 사용한다.
- `listRecordIdsMatchingDiscoveryQuery` fallback 경로에서 field ILIKE 3개 + tag name 조회 + author_name 조회를 하나의 `Promise.all`로 묶는다.
- `listRelatedDocumentsForDocument`에서 `fetchTagRowsForRecordId` 호출을 제거하고 `document.tags` → `createSlug` → `tags!inner` join으로 candidate를 직접 조회한다.

## Acceptance Criteria

- 필터 조합(tag + query) 시 tag filter와 query filter가 병렬로 실행된다.
- 검색 fallback 경로에서 독립적인 쿼리들이 하나의 `Promise.all`로 묶인다.
- related documents 조회가 2단(candidate tags + candidate records)으로 줄어든다.
- `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build`가 통과한다.

## Risks

- `tags!inner` join에서 `.in("tags.slug", tagSlugs)` 필터가 PostgREST에서 기대대로 동작하는지 확인 필요.
- 병렬화로 인해 DB 동시 연결 수가 일시적으로 늘어날 수 있으나, 개인 위키 규모에서는 문제 없음.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`

## Related Docs

- [v0_6_13_public_discovery_query_speed.md](./v0_6_13_public_discovery_query_speed.md)
- [v0_6_13_my_library_query_speed.md](./v0_6_13_my_library_query_speed.md)
