# v0.6.13 My Library Query Speed

## Goal

- `/me/library`가 bookmark id 재조회 없이 lighter query path로 렌더링되고, search/filter/sort 조합에서도 기존 UX를 유지하는지 확인한다.

## Preconditions

- `pnpm dev`가 실행 중이다.
- author 계정으로 로그인되어 있다.
- bookmark된 public record가 여러 개 있고 source type과 tags가 섞여 있다.
- 필요하면 `.env.local`에 `SUPABASE_DEBUG_LOG=1`을 설정해 query 순서를 확인한다.

## 1. First Load

- `/me/library`로 이동한다.
- 첫 진입 렌더와 목록 카드 정보를 확인한다.
- 가능하면 dev 서버 로그에서 `record_bookmarks` 조회 횟수를 본다.

Expected:
- my library 목록이 정상 렌더링된다.
- 기본 진입에서 bookmark id 집합은 request 안에서 재사용된다.
- page layer에서 이미 확인한 `userId`를 bookmark 조회가 재사용한다.
- full detail `contents` 전체 fetch 없이 preview/list item query로 동작한다.
- tag controls는 목록 뒤에 별도 fallback 이후 표시될 수 있다.

## 2. Discovery Controls

- `/me/library`에서 search를 입력한다.
- source, sort, tag filter를 각각 적용하고 조합한다.

Expected:
- search/filter/sort가 깨지지 않는다.
- 결과 카드가 기존처럼 preview 형태로 보인다.
- no result 상태도 정상적으로 렌더링된다.

## 3. Pagination

- `/me/library?page=2`로 이동한다.
- `/me/library?page=999`도 직접 입력한다.

Expected:
- 유효 페이지는 정상 렌더링된다.
- out-of-range page는 마지막 유효 페이지로 보정된다.
- pagination nav가 깨지지 않는다.

## Regression Focus

- bookmark 제거/추가 후 `/me/library`가 최신 상태로 갱신되는지 확인한다.
- tag 목록이 계속 표시되는지 확인한다.
- `SUPABASE_DEBUG_LOG=1` 기준으로 기본 진입 시 `record_bookmarks` 조회가 불필요하게 반복되지 않는지 본다.
