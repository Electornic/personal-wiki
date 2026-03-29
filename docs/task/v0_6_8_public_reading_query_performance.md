# Personal Wiki v0.6.8 Public Reading Query Performance

## Branch

- Working branch: `V0_6_8_Performance_Improvements`

## Goal

- public reading home/detail/topic 흐름의 DB round trip과 payload를 줄여 초기 응답 속도를 개선한다.

## Scope

- public discovery 목록을 lightweight projection 기반으로 정리한다.
- `documents.ts`의 public query path에서 server client 의존을 제거한다.
- topic/related/home 목록에서 본문 전체 payload 대신 excerpt를 사용한다.
- public 검색용 excerpt/search vector migration과 RPC를 추가한다.
- public route cache와 invalidation 경로를 보강한다.

## Non-Goals

- author editor UI 변경
- recommendation ranking 기준 변경
- comment/reaction 제품 기능 추가

## Current Problems

- discovery가 `public id 전체 조회 -> 후속 필터 -> 다시 문서 fetch` 구조라 쿼리 수가 쉽게 늘어난다.
- public list/topic/related 카드에서도 `contents`를 기반으로 excerpt를 만들어 payload가 무겁다.
- public detail/topic helper 일부가 `cookies()` 기반 server client 경로를 건드려 dynamic rendering 범위를 키운다.
- 검색이 `ilike` 다중 호출에 의존해 데이터가 늘수록 비용이 커질 수 있다.

## Proposed Changes

- public list/detail mapper를 분리하고 list 전용 타입을 도입한다.
- `records.excerpt`와 `records.search_vector`를 migration으로 추가하고 public search RPC를 만든다.
- home/topic/detail route에서 public data path를 `use cache` 기반 wrapper로 감싼다.
- save/delete/like 이후 public discovery/detail cache invalidation을 tag 기준으로 보강한다.
- topic route와 related document query를 list projection 기반으로 바꾼다.

## Acceptance Criteria

- `/` home discovery가 public client 기준의 경량 select를 사용한다.
- `/library/[slug]` 본문은 public detail query로 읽고, reaction/comment는 분리된 동적 섹션으로 남는다.
- `/topics/[topic]`가 전체 public document full payload를 읽지 않는다.
- public 검색은 `search_public_records` RPC를 우선 사용하고 실패 시 기존 검색으로 fallback한다.
- 저장/삭제/like 이후 public home/detail/topic cache가 갱신된다.

## Risks

- 새 excerpt/search vector migration이 적용되기 전에는 public list query가 실패할 수 있다.
- `use cache`와 cache invalidation 조합이 잘못되면 stale data가 남을 수 있다.
- `author_name` denormalized 경로를 쓰므로 저장 시 author name 동기화가 빠지면 표시 이름이 틀어질 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- public home filter/search/sort
- public topic page
- public detail + related documents
- like/save/delete 이후 public cache refresh

## Related Docs

- [docs/test_guide/v0_6_8_public_reading_query_performance.md](../test_guide/v0_6_8_public_reading_query_performance.md)
- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)
