# v0.6.13 Public Discovery Query Speed

## Goal

- public home discovery의 첫 응답과 discovery search/tag filter 경로가 이번 버전의 lighter query 구조로 정상 동작하는지 확인한다.

## Preconditions

- `pnpm dev`가 실행 중이다.
- 최신 SQL migration 19개가 모두 적용되어 있다.
- public record가 여러 개 있고 tag, `book`/`article`, 서로 다른 published date가 섞여 있다.
- bookmark된 public record가 최소 1개 있다.
- `.env.local`에 `SUPABASE_DEBUG_LOG=1`을 설정하면 query 순서를 함께 확인할 수 있다.

## 1. Home First Load

- `/`에 진입한다.
- dev 서버 로그에서 initial home query 순서를 본다.
- filter panel을 열기 전과 연 뒤를 각각 확인한다.

Expected:
- 목록 카드와 pagination이 먼저 렌더링된다.
- 태그 controls는 별도 fallback 이후 정상 표시된다.
- filter panel을 열기 전에는 태그 조회가 initial list query와 같은 critical path에 묶이지 않는다.

## 2. Public Discovery Search

- `/`에서 검색어를 입력한다.
- 결과가 있는 검색어와 없는 검색어를 각각 시도한다.
- 가능하면 dev 서버 로그에서 `/rpc/search_public_records` 호출 여부를 본다.

Expected:
- 검색 결과가 정상 렌더링된다.
- 기본 public search는 전체 public id 선조회 없이 RPC 우선 경로로 동작한다.
- RPC가 가능한 환경에서는 fallback 없이 결과를 받을 수 있다.

## 3. Public Discovery Filters

- `/`에서 source, sort, tag filter를 조합한다.
- page query를 큰 숫자로 직접 넣어 `/ ?page=999#library` 형태도 확인한다.

Expected:
- source/sort/tag 조합이 깨지지 않는다.
- out-of-range page는 마지막 유효 페이지로 보정된다.
- 태그 필터가 적용돼도 목록과 pagination이 정상 동작한다.

## 4. My Library Tag Filter

- 로그인 후 `/me/library`로 이동한다.
- tag filter를 적용하고 해제한다.
- search와 tag를 함께 조합한다.

Expected:
- bookmark 목록에서 tag filter가 정상 동작한다.
- 태그 필터가 태그 이름 전체 fetch + in-memory 매칭 없이 candidate id를 줄인다.
- 기존 bookmark browsing UX는 유지된다.

## Regression Focus

- home에서 record count와 pagination이 깨지지 않는지 확인한다.
- `most-reacted` sort가 계속 동작하는지 확인한다.
- search RPC 실패 시 fallback 결과가 비정상적으로 비지 않는지 확인한다.
