# v0.3 Final Smoke Checklist

## Goal

Release 전에 `v0.3`의 핵심 reading, writing, reaction, personal library 흐름이 실제 환경에서 정상 동작하는지 빠르게 확인한다.

이 체크리스트는 다음 범위를 검증한다.
- auth
- workspace
- improved markdown editor
- public record detail
- comments and replies
- bookmark / like
- my library

## Preconditions

- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)의 SQL 7개를 모두 순서대로 실행했다.
- `.env.local`이 채워져 있다.
- `pnpm dev` 또는 배포 환경이 떠 있다.
- 로그인 가능한 테스트 계정이 있다.
- 최소 1개 이상의 public record가 존재한다.

## 1. Auth

- `/author/sign-in`에 접속한다.
- 기존 계정으로 로그인한다.
- 로그인 후 `/author` 접근을 확인한다.

Expected:
- 로그인 성공
- 세션 유지
- workspace 진입 가능
- 현재 로그인한 사용자 이름이 보인다

## 2. Workspace

- `/author`에서 workspace 화면 확인
- `New Record` 버튼, `Sign Out` 버튼 확인
- 기존 레코드 카드 리스트 확인

Expected:
- title
- visibility badge
- source type
- date
- tags
- preview / edit / delete 액션
가 정상 렌더링된다.

## 3. Create Record

- `New Record` 클릭
- 아래 필드 입력
  - title
  - source type
  - book title if `book`
  - tags
  - contents
  - visibility
- `Publish` 클릭

Expected:
- 저장 성공
- workspace로 돌아온다
- 새 레코드가 리스트에 보인다

## 4. Editor UX

- 생성하거나 기존 record의 `Edit` 클릭
- improved markdown toolbar 사용
  - H1
  - H2
  - H3
  - bold
  - italic
  - quote
  - bullet list
  - ordered list
  - link
- `Preview` 탭으로 전환

Expected:
- heading이 heading처럼 보인다
- quote가 blockquote 스타일로 보인다
- list가 list처럼 보인다
- link가 일반 본문과 다른 스타일로 보인다
- bold / italic이 정상 반영된다
- write / preview 전환이 깨지지 않는다

## 5. Public Record Detail

- `Preview` 클릭 또는 `/library/[slug]` 직접 접속
- 본문과 메타데이터 확인

Expected:
- title
- writer
- published date
- tags
- markdown-rendered contents
- related reading
- comments section
이 모두 정상 렌더링된다.

## 6. Comment UX

- 비로그인 상태에서 public record detail 확인

Expected:
- comments는 읽을 수 있다
- comment 작성은 sign-in 유도 상태다

- 로그인 상태에서 같은 page 확인

Expected:
- top-level comment input은 기본 collapsed shell처럼 보인다
- 클릭 시 확장된다
- comment 작성 가능

- 기존 comment 아래 `Reply` 클릭

Expected:
- reply input이 기본 hidden 상태였다가 열림
- reply composer가 top-level보다 더 가볍게 보임
- `Cancel`로 닫힘
- reply 작성 가능

## 7. Bookmark

- public record detail에서 `Bookmark` 클릭
- 다시 클릭해서 해제도 확인

Expected:
- toggle 동작
- 상태 라벨/아이콘 반영
- 새로고침 후 상태 유지

## 8. Like

- public record detail에서 `Like` 클릭
- 다시 클릭해서 해제도 확인

Expected:
- toggle 동작
- 상태 라벨/아이콘 반영
- 새로고침 후 상태 유지

## 9. My Library

- `/me/library` 접속
- `Bookmarks` 탭 확인
- `Likes` 탭 확인

Expected:
- 각 탭이 정상 전환된다
- bookmark한 record는 `Bookmarks`에 보인다
- like한 record는 `Likes`에 보인다
- 해제하면 해당 탭에서 사라진다
- 카드 클릭 시 public record detail로 이동한다

## 10. Private Visibility

- 하나의 record를 private로 저장
- 비로그인 상태 또는 다른 계정 기준 접근 확인

Expected:
- private record는 공개 상세에서 접근되지 않는다
- 홈 / related / my library public surface에 누출되지 않는다

## 11. Sign Out

- workspace 또는 header에서 `Sign Out`

Expected:
- 세션 종료
- `/author`는 sign-in required 상태
- public reading은 계속 가능

## Regression Focus

- `/`
- `/author`
- `/author/sign-in`
- `/author/documents/new`
- `/author/documents/[documentId]`
- `/library/[slug]`
- `/me/library`
가 모두 정상 렌더링된다.
- improved markdown preview, comment/reply interaction, bookmark / like persistence가 함께 깨지지 않는다.
- private visibility 회귀가 없어야 한다.

## Pass Criteria

아래가 모두 만족되면 `v0.3` smoke test pass로 본다.

- auth 동작
- workspace 동작
- create/edit 동작
- improved markdown preview 동작
- comment/reply interaction 동작
- bookmark / like persistence 동작
- my library 반영 동작
- private visibility 회귀 없음
