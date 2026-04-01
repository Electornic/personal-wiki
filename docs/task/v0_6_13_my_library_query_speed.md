# Personal Wiki v0.6.13 My Library Query Speed

## Branch

- Working branch: `V0_6_13_Public_Discovery_Query_Speed`

## Goal

- `/me/library`가 같은 bookmark id 집합을 한 요청 안에서 반복 조회하지 않도록 정리하고, 기본 목록을 full detail fetch 없이 lighter list query로 렌더링한다.

## Scope

- my library bookmark id 집합을 request-scoped cache로 재사용한다.
- 기본 `/me/library` 목록을 full detail 기반 preview 변환 대신 list item query로 바꾼다.
- discovery state가 있어도 my library 목록은 list item query 경로를 사용한다.
- page layer에서 목록을 먼저 렌더링하고, tag controls는 nested suspense로 분리한다.
- 이번 변경을 검증하는 task 문서와 test guide를 추가한다.

## Non-Goals

- bookmark 제품 의미 변경
- my library UI 디자인 변경
- public discovery query 변경
- 새 SQL migration 추가

## Current Problems

- `/me/library`는 한 요청 안에서 `listBookmarkRecordIds()`를 여러 번 다시 호출한다.
- 기본 상태에서도 bookmark된 문서 전체 full detail을 모두 읽고 나서 메모리에서 페이지를 자른다.
- tag 목록도 별도 bookmark id 재조회 뒤에 다시 계산한다.

## Proposed Changes

- `getMyLibraryRecordIds()`를 `react cache`로 묶어 bookmark id 집합을 request 안에서 공유한다.
- `/me/library` page에서 이미 확인한 `userId`를 bookmark 조회에 재사용한다.
- `listMyLibraryDiscoveryPage()`는 default/non-default 모두 list item query path를 사용한다.
- `/me/library` page는 목록을 먼저 렌더링하고, tag controls는 별도 async section으로 분리한다.

## Acceptance Criteria

- `/me/library` 기본 진입은 bookmark ids를 한 번만 읽는다.
- `/me/library` 기본 목록은 full detail `contents` 전체 fetch 없이 렌더링된다.
- search/filter/sort 상태에서도 my library 목록은 preview/list item query path를 유지한다.
- tag controls는 목록 first paint의 critical path에서 분리된다.
- lint, typecheck, test, build가 통과한다.

## Risks

- tag 목록은 여전히 bookmark 전체 집합 기준으로 계산되므로 북마크가 매우 많으면 추가 최적화가 필요할 수 있다.
- 기본 경로가 list item 중심으로 바뀌면서, 향후 full document field에 의존하는 UI가 들어오면 query를 다시 점검해야 한다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- `/me/library` first load
- `/me/library` search
- `/me/library` tag filter
- `/me/library?page=999`

## Related Docs

- [docs/test_guide/v0_6_13_my_library_query_speed.md](../test_guide/v0_6_13_my_library_query_speed.md)
- [docs/task/v0_6_13_author_workspace_query_speed.md](./v0_6_13_author_workspace_query_speed.md)
