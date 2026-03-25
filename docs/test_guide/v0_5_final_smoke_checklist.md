# v0.5 Final Smoke Checklist

## Goal

Release 전에 `v0.5`의 discovery, topic hub, auth session, author workspace 개선이 실제 환경에서 정상 동작하는지 빠르게 확인한다.

이 체크리스트는 다음 범위를 검증한다.
- auth session
- library filter / sort / search
- topic hub
- my library discovery
- author workspace / editor support
- public/private visibility

## Preconditions

- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)의 최신 migration 상태가 반영돼 있다.
- `.env.local`이 채워져 있다.
- `pnpm dev` 또는 배포 환경이 떠 있다.
- 로그인 가능한 테스트 계정이 있다.
- 서로 다른 tag를 가진 public record가 최소 3개 이상 있다.
- bookmark한 record가 최소 1개 있다.

## 1. Auth Session

- 비로그인 상태에서 `/`, `/library/[slug]`, `/author/sign-in`을 이동한다.
- 로그인 후 `/`, `/me/library`, `/author`를 이동한다.
- 새로고침과 페이지 전환을 반복한다.

Expected:
- refresh token 오류 없이 세션이 유지된다
- 로그인/로그아웃 후 header 상태가 맞게 보인다
- 공개 페이지 이동이 auth 체크 때문에 과하게 막히지 않는다

## 2. Library Filter / Sort / Search

- `/`의 library browser에서 검색어를 입력한다.
- tag filter를 2개 이상 눌러본다.
- 정렬 옵션을 바꿔본다.

Expected:
- 제목, writer, tag 기준 검색이 동작한다
- 태그 필터가 적용된다
- 정렬 옵션이 정상 반영된다
- 필터를 눌러도 화면이 의도치 않게 최상단으로 튀지 않는다

## 3. Topic Hub

- record의 tag pill을 눌러 `/topics/[topic]`으로 이동한다.
- topic hub에서 다른 record와 related topic link를 눌러본다.

Expected:
- topic hub 페이지가 정상 렌더링된다
- 같은 topic 아래 연결된 record들이 보인다
- related topics 탐색이 가능하다

## 4. My Library Discovery

- `/me/library`에 접속한다.
- 검색, tag filter, sort를 사용한다.
- bookmark한 record 상세로 이동한다.

Expected:
- bookmark 중심 목록이 정상 렌더링된다
- 검색 / 필터 / 정렬이 동작한다
- 카드 클릭 시 public detail로 이동한다

## 5. Author Workspace

- `/author`에 접속한다.
- save/delete 이후 banner를 확인한다.
- 기존 record 카드의 preview / edit / delete를 확인한다.

Expected:
- workspace banner가 query param 기준으로 보인다
- 카드 메타데이터와 action이 정상 보인다
- curation shelf UI가 workspace에 남아 있지 않다

## 6. Editor Support

- `/author/documents/new` 또는 `/author/documents/[documentId]`로 이동한다.
- starter outline, reflection prompt, markdown guide를 확인한다.
- word count / line count를 확인한다.

Expected:
- writing support UI가 보인다
- markdown toolbar와 preview가 함께 동작한다
- 작성 화면이 폼처럼 과하게 무겁지 않다

## 7. Public Surfaces

- `/`와 `/topics/[topic]`을 다시 확인한다.

Expected:
- curation shelf surface가 public page에 남아 있지 않다
- discovery UI와 topic hub만 현재 범위대로 보인다

## 8. Private Visibility

- private record를 하나 준비한다.
- 비로그인 상태와 로그인 상태에서 `/`, `/topics/[topic]`, `/me/library`, `/library/[slug]`를 확인한다.

Expected:
- private record가 public list, topic hub, recommendation에 노출되지 않는다
- private record 직접 접근은 막힌다

## Regression Focus

- `/`
- `/topics/[topic]`
- `/me/library`
- `/author`
- `/author/documents/new`
- `/author/documents/[documentId]`
- 검색 / 필터 / 정렬 / session refresh / writing support가 함께 깨지지 않는지 확인한다.

## Pass Criteria

아래가 모두 만족되면 `v0.5` smoke test pass로 본다.

- auth session이 안정적이다
- library / my library discovery가 동작한다
- topic hub가 동작한다
- author workspace / editor support가 동작한다
- curation shelf 제거 상태가 유지된다
- private visibility 회귀가 없다
