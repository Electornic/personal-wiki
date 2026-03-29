# v0.6.8 Public Reading Query Performance

## Goal

- public reading home/topic/detail 흐름에서 경량 query, 검색, cache invalidation이 정상 동작하는지 확인한다.

## Preconditions

- `pnpm dev`가 실행 중이다.
- 최신 SQL migration 18개가 모두 적용되어 있다.
- public record가 여러 개 있고, 서로 다른 tag와 `book`/`article` 타입이 섞여 있다.
- like 가능한 public record가 최소 1개 있다.

## 1. Home Discovery

- `/`에 진입한다.
- source, tag, sort 필터를 각각 적용한다.
- query 검색을 수행한다.

Expected:
- 목록 카드가 정상 렌더링되고 excerpt가 보인다.
- 필터와 검색 결과가 조합되어도 응답이 깨지지 않는다.
- `most-reacted` 정렬이 동작한다.

## 2. Topic Page

- home의 topic pill 또는 `/topics/[topic]`로 진입한다.
- record card와 related topic 링크를 확인한다.

Expected:
- topic page가 정상 렌더링된다.
- 각 record card가 excerpt 기반으로 표시된다.
- 없는 topic은 not-found로 간다.

## 3. Public Detail And Related

- `/library/[slug]`로 진입한다.
- 본문, related documents, reactions/comments fallback을 확인한다.

Expected:
- 본문이 정상 렌더링된다.
- related documents가 excerpt 기반 카드로 표시된다.
- private record는 public detail에서 노출되지 않는다.

## 4. Mutation Invalidation

- author로 로그인한다.
- public record를 저장하거나 수정한다.
- 다른 public record에 like를 추가/제거한다.
- 필요하면 public record를 삭제한다.

Expected:
- 저장/수정 후 `/`와 `/library/[slug]`가 최신 내용으로 갱신된다.
- like 변경 후 `most-reacted` 정렬 결과와 detail reaction count가 갱신된다.
- 삭제한 record는 home/topic/detail에서 더 이상 보이지 않는다.

## Regression Focus

- `author_name`이 `unknown`으로 깨지지 않는지 확인한다.
- search RPC 실패 시에도 검색이 fallback으로 동작하는지 확인한다.
- public route는 정상 동작하고, author/me route는 기존처럼 동적 동작을 유지하는지 확인한다.
