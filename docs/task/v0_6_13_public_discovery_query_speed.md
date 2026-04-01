# Personal Wiki v0.6.13 Public Discovery Query Speed

## Branch

- Working branch: `V0_6_13_Public_Discovery_Query_Speed`

## Goal

- public home discovery의 첫 진입 비용을 줄이고, discovery 검색/태그 필터가 불필요한 후보 id 조회와 in-memory 후처리에 덜 의존하도록 정리한다.

## Scope

- home 기본 경로에서 records 목록과 태그 목록의 critical path를 분리한다.
- public discovery 목록의 total count 계산 비용을 줄인다.
- public discovery 검색에서 전체 public id 선조회 없이 RPC 결과를 바로 사용한다.
- record id 기반 discovery에서도 태그 필터를 `record_tags` query로 줄인다.
- 이번 변경에 맞는 task 문서와 test guide를 추가한다.

## Non-Goals

- discovery UI 스타일 변경
- author workspace query 구조 변경
- recommendation ranking 기준 변경
- 새 SQL migration 추가

## Current Problems

- home `/`는 목록과 전체 태그 목록을 함께 기다려 첫 캐시 미스 시 응답이 묵직하다.
- public discovery 목록은 `count: "exact"`를 사용해 첫 페이지 조회에서도 count 비용이 붙는다.
- query search는 기본 상태에서도 전체 public id를 먼저 읽은 뒤 RPC 결과와 교차시킨다.
- record id 기반 discovery 태그 필터는 태그 행 전체를 읽어 in-memory로 다시 매칭한다.

## Proposed Changes

- home page에서 태그 controls를 별도 cached server component로 분리하고 nested suspense로 늦게 붙인다.
- public discovery list count는 exact 대신 estimated count를 사용한다.
- `listRecordIdsMatchingDiscoveryQuery`는 unrestricted search일 때 전체 id 집합을 미리 읽지 않고 RPC 결과를 바로 쓴다.
- `filterRecordIdsBySelectedTags`는 `record_tags` 기반 query로 후보 id를 바로 줄인다.

## Acceptance Criteria

- home `/`의 records 목록은 태그 목록 없이도 먼저 렌더링될 수 있다.
- home public discovery는 exact count 대신 lighter count strategy를 사용한다.
- query search는 기본 public path에서 `listPublicRecordIds()` 없이 동작한다.
- my library 같은 record id 기반 discovery의 태그 필터는 태그 이름 전체 fetch 없이 동작한다.
- lint, typecheck, test, build가 통과한다.

## Risks

- estimated count는 exact count와 약간 다를 수 있어 페이지 수가 보수적으로 보일 수 있다.
- controls를 분리하면서 첫 로딩에 filter panel fallback이 잠깐 보일 수 있다.
- search RPC fallback 경로는 그대로 남아 있으므로 RPC 미적용 환경에서는 여전히 query 수가 늘 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- home `/` 첫 진입
- home filter panel open
- public query search
- my library tag filter

## Related Docs

- [docs/test_guide/v0_6_13_public_discovery_query_speed.md](../test_guide/v0_6_13_public_discovery_query_speed.md)
- [docs/task/v0_6_8_public_reading_query_performance.md](./v0_6_8_public_reading_query_performance.md)
