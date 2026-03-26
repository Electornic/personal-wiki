# v0.6.5 Comment, Markdown, Performance Fixes

## Goal

- 댓글 depth 제한, markdown 이미지 지원, 작성 워크스페이스 페이지네이션, `/author/documents/new` auth 오류 완화를 함께 검증한다.

## Preconditions

- `.env`에 Supabase env가 채워져 있다.
- 최소 9개 이상의 작성 문서가 있는 author 계정이 있다.
- public 문서 1개 이상과 댓글 작성 가능한 로그인 계정이 있다.
- `pnpm dev`로 앱이 실행 중이다.

## 1. Author Workspace Pagination

- `/author`에 로그인 상태로 진입한다.
- 목록 상단에 현재 보여주는 범위와 전체 개수가 보이는지 확인한다.
- `Next`를 눌러 다음 페이지로 이동한다.
- `Previous`를 눌러 첫 페이지로 돌아온다.

Expected:
- 현재 페이지에 필요한 문서만 렌더링된다.
- 페이지 번호와 범위 표시가 현재 상태와 일치한다.
- 이동 후에도 edit / preview / delete 액션이 정상적으로 보인다.

## 2. Home And My Library Pagination

- `/`에 진입해 기본 목록에서 8개만 먼저 보이는지 확인한다.
- `Next`를 눌러 다음 묶음으로 이동한다.
- `/me/library`에서도 같은 방식으로 이전/다음 이동이 가능한지 확인한다.

Expected:
- 기본 상태에서는 한 페이지당 8개만 노출된다.
- 다음 페이지 이동 시 다음 묶음만 렌더링된다.
- 검색/태그 필터를 적용하면 페이지 파라미터가 초기화되고 기존 필터 동작이 유지된다.
- 검색/태그/정렬 상태에서도 결과 페이지가 8개 단위로 유지된다.

## 3. New Document Page Auth Stability

- 로그인된 상태에서 `/author/documents/new`로 이동한다.
- 페이지 새로고침을 한 번 수행한다.
- visibility toggle, markdown toolbar, preview 탭이 정상 동작하는지 본다.

Expected:
- ByteString 오류 없이 페이지가 렌더링된다.
- 로그인 세션이 유지된다.
- 작성 폼 주요 인터랙션이 정상 동작한다.

## 4. Markdown Image Support

- `/author/documents/new`에서 본문에 `![Reading desk](https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80)`를 넣는다.
- preview 탭에서 이미지가 보이는지 확인한다.
- 문서를 public으로 저장한 뒤 public detail 페이지에서도 같은 이미지가 보이는지 확인한다.

Expected:
- preview와 public reading에서 모두 이미지가 깨지지 않고 표시된다.
- 이미지가 본문 폭 안에서 자연스럽게 렌더링된다.

## 5. Comment Depth Limit And Design

- public 문서 상세 페이지에서 root comment를 작성한다.
- reply를 2번 이어서 작성해 3레벨 구조를 만든다.
- 마지막 reply 카드에서 reply 버튼이 더 이상 보이지 않는지 확인한다.

Expected:
- 댓글은 최대 3레벨까지만 작성 가능하다.
- conversation count는 전체 댓글 수를 반영한다.
- 댓글 카드와 들여쓰기가 이전보다 읽기 쉽게 정리되어 보인다.

## Regression Focus

- `/author/sign-in` 이후 `/author`와 `/author/documents/new` 세션 흐름이 유지되는지 다시 확인한다.
- `/`와 `/me/library` 기본 상태에서 한 번에 8개씩만 가져오는지 다시 확인한다.
- public/private 권한이 댓글, 저장, preview 링크에서 누출 없이 유지되는지 확인한다.
- markdown 이미지 추가 후 기존 heading, list, link 렌더링이 깨지지 않는지 확인한다.
