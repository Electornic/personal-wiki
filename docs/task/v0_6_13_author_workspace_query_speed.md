# Personal Wiki v0.6.13 Author Workspace Query Speed

## Branch

- Working branch: `V0_6_13_Public_Discovery_Query_Speed`

## Goal

- `/author` workspace의 초기 진입 비용을 줄여 authenticated author 목록 화면이 불필요한 payload와 round trip 없이 열리도록 정리한다.

## Scope

- author workspace 목록 query를 detail projection에서 list projection으로 바꾼다.
- author workspace 목록에서 count와 rows를 가능한 한 적은 request로 처리한다.
- `/author` page에서 이미 확인한 `userId`를 목록 query에 재사용해 auth 중복 확인을 줄인다.
- `/author`, `/author/sign-in` 진입에서 profiles lookup 없이 auth metadata만으로 access 상태를 계산한다.
- 이번 변경을 검증하는 task 문서와 test guide를 추가한다.

## Non-Goals

- author editor form UI 변경
- author auth 정책 변경
- public discovery query 변경
- 새 SQL migration 추가

## Current Problems

- `/author`는 목록 카드에 필요하지 않은 `contents` 전체를 매번 읽는다.
- `/author` 진입 시 `getAuthorAccess()`와 `listAuthorDocumentsPage()`가 각각 auth user를 확인해 round trip이 중복된다.
- `/author`, `/author/sign-in` 진입 때 access helper가 profiles lookup까지 수행한다.
- author 목록은 count query, rows query, tags fetch query가 순차로 붙어 기본 진입 비용이 커진다.

## Proposed Changes

- author 목록은 `visibility`와 nested tags를 포함한 list projection으로 읽는다.
- author 목록 query는 rows response에 lighter count를 함께 받아 count/rows 분리를 줄인다.
- `listAuthorDocumentsPage()`는 `userId`를 인자로 받아 내부 `auth.getUser()`를 다시 호출하지 않는다.
- `getAuthorAccess()`는 profiles table을 읽지 않고 session user metadata와 email만 사용한다.

## Acceptance Criteria

- `/author` 목록은 `contents` 전체를 읽지 않는다.
- `/author` 진입 시 page layer에서 확인한 `userId`를 author 목록 query가 재사용한다.
- author 목록은 count + rows + tag 보강이 이전보다 적은 round trip으로 동작한다.
- `/author`, `/author/sign-in` 진입은 profiles table 조회 없이 access 상태를 계산한다.
- lint, typecheck, test, build가 통과한다.

## Risks

- author 목록 pagination fallback이 유지되므로 out-of-range page에서는 rows query가 한 번 더 붙을 수 있다.
- `author_name`이 비어 있는 데이터가 남아 있으면 profile fallback query는 계속 붙을 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- `/author` first load
- `/author?page=999`
- sign-in 이후 workspace 진입

## Related Docs

- [docs/test_guide/v0_6_13_author_workspace_query_speed.md](../test_guide/v0_6_13_author_workspace_query_speed.md)
- [docs/task/v0_6_13_public_discovery_query_speed.md](./v0_6_13_public_discovery_query_speed.md)
