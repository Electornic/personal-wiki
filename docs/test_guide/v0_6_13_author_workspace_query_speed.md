# v0.6.13 Author Workspace Query Speed

## Goal

- `/author` workspace가 lighter author list query로 정상 렌더링되고, sign-in 이후 초기 진입이 기존보다 불필요한 query 없이 동작하는지 확인한다.

## Preconditions

- `pnpm dev`가 실행 중이다.
- `.env.local`에 authoring Supabase env가 채워져 있다.
- 로그인 가능한 author account가 있다.
- author record가 여러 개 있고 public/private, tag, source type이 섞여 있다.
- 필요하면 `.env.local`에 `SUPABASE_DEBUG_LOG=1`을 설정해 query 순서를 확인한다.

## 1. Workspace First Load

- 로그인 상태에서 `/author`로 이동한다.
- 첫 진입 렌더와 목록 카드 정보를 확인한다.
- 가능하면 dev 서버 로그에서 query 순서를 본다.

Expected:
- workspace header와 목록 카드가 정상 렌더링된다.
- 목록 카드에 필요한 title, visibility, source, tags, published date가 유지된다.
- 불필요한 `contents` full payload 없이 author list projection으로 동작한다.
- access 확인 시 profiles lookup이 추가로 붙지 않는다.

## 2. Pagination

- `/author?page=2`로 이동한다.
- `/author?page=999`도 직접 입력해 확인한다.

Expected:
- 정상 페이지는 해당 목록을 보여준다.
- out-of-range page는 마지막 유효 페이지로 보정된다.
- count, total pages, page range 표시가 깨지지 않는다.

## 3. Auth Entry

- 로그아웃 후 `/author`로 진입한다.
- 다시 로그인 후 `/author`로 돌아온다.

Expected:
- 비로그인 상태에서는 sign-in 유도 화면이 보인다.
- 로그인 후 workspace가 정상 복귀한다.
- page layer에서 확인한 user identity를 목록 query가 재사용한다.
- `/author/sign-in` 진입도 profiles table 조회 없이 access 상태를 계산한다.

## Regression Focus

- preview, edit, delete 버튼이 기존처럼 동작하는지 확인한다.
- `author_name`이 비어 있는 record가 있어도 writer 표시가 깨지지 않는지 확인한다.
- `SUPABASE_DEBUG_LOG=1` 기준으로 `/author` 진입 시 auth 재확인이 불필요하게 반복되지 않는지 본다.
