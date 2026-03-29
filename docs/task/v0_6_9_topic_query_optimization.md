# Personal Wiki v0.6.9 Topic Query Optimization

## Branch

- Working branch: `V0_6_9_Topic_Query_Optimization`

## Goal

- `/topics/[topic]` 진입 시 필요한 Supabase round trip 수를 줄여 topic reading 흐름의 응답 속도를 개선한다.

## Scope

- topic page 전용 public query path를 따로 둔다.
- tag slug lookup + count query를 제거한다.
- topic page가 필요한 lightweight record row와 tag 목록만 가져오게 유지한다.
- home discovery 기본 진입에서 count용 HEAD query를 제거한다.
- public discovery 검색 input이 Enter 제출 없이 디바운스된 route update로 동작하게 고친다.
- topic query 수 측정 기준을 test guide에 남긴다.

## Non-Goals

- home discovery query 재설계
- recommendation ranking 변경
- author/private route 성능 작업

## Current Problems

- 현재 topic page는 `tag lookup -> record id lookup -> count -> records -> tag hydrate`로 이어져 홈보다 쿼리 수가 많다.
- topic page는 pagination이 없는데도 count/head 성격의 조회를 같이 타고 있다.

## Proposed Changes

- `listPublicDocumentsByTag()`를 topic 전용 3-query path로 바꾼다.
- `record_tags`에서 `tags.slug`를 바로 필터해 candidate record id를 얻는다.
- 그 record ids로 lightweight record rows를 읽고, 마지막에 visible tag를 hydrate한다.

## Acceptance Criteria

- `/` 기본 진입 시 기존보다 적은 쿼리 수로 페이지가 렌더링된다.
- `/topics/[topic]` 진입 시 기존보다 적은 쿼리 수로 페이지가 렌더링된다.
- topic page의 record card, related topics, not-found 동작은 기존과 동일하게 유지된다.
- home discovery 검색 input이 타이핑 후 디바운스된 route update로 정상 동작한다.
- lint, typecheck, test, build가 모두 통과한다.

## Risks

- Supabase nested filter 문법이 잘못되면 topic page가 빈 상태로 보일 수 있다.
- topic tag가 없는 문서는 not-found로 떨어지므로 fallback 동작을 유지해야 한다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- `/topics/[topic]` dev query log 확인

## Related Docs

- [docs/test_guide/v0_6_9_topic_query_optimization.md](../test_guide/v0_6_9_topic_query_optimization.md)
- [docs/task/v0_6_8_public_reading_query_performance.md](./v0_6_8_public_reading_query_performance.md)
