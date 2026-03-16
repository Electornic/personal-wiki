# v0.2 Final Smoke Checklist

## Goal

Release 전에 `v0.2`의 핵심 사용자 흐름이 실제 환경에서 정상 동작하는지 빠르게 확인한다.

이 체크리스트는 다음 범위를 검증한다.
- user signup/login
- workspace
- record create/edit/read
- public/private visibility
- comments and replies

## Preconditions

- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)의 SQL 5개를 모두 순서대로 실행했다.
- `.env.local`이 채워져 있다.
- `pnpm dev` 또는 배포 환경이 떠 있다.
- Email confirmation을 개발 중이라면 적절히 껐거나, 메일 인증 가능한 상태다.

## 1. Auth

- `/author/sign-in`에 접속한다.
- `Sign Up` 탭에서 아래로 회원가입한다.
  - user name
  - email
  - password
- 에러 없이 가입되거나, 로그인 가능한 상태가 된다.
- `Sign In` 탭에서 방금 계정으로 로그인한다.
- 로그인 후 `/author`로 이동한다.

Expected:
- 로그인 성공
- 세션 유지
- workspace 진입 가능
- 상단/본문에 현재 로그인한 사용자 이름이 보인다

## 2. Workspace

- `/author`에서 `Workspace` 화면이 보인다.
- `New Record` 버튼이 보인다.
- `Sign Out` 버튼이 보인다.
- 기존 레코드가 있으면 카드 리스트가 정상 렌더링된다.

Expected:
- 각 카드에서 아래 정보가 보인다
  - title
  - public/private badge
  - source type
  - date
  - tags
- 각 카드 액션이 보인다
  - preview
  - edit
  - delete

## 3. Create Record

- `New Record` 클릭
- 아래 필드 입력
  - title
  - source type
  - book title if source type is `book`
  - tags
  - contents
  - visibility
- `Publish` 클릭

Expected:
- 저장 성공
- workspace로 돌아온다
- 새 레코드가 리스트에 보인다
- visibility badge가 맞다
- source type이 맞다

## 4. Edit Record

- 생성한 레코드의 `Edit` 클릭
- 아래 중 최소 하나 수정
  - title
  - tags
  - contents
  - visibility
- 다시 저장

Expected:
- 수정 성공
- workspace에서 변경 내용이 보인다
- preview/public page에서도 변경 내용이 반영된다

## 5. Public Reading

- `Preview` 클릭 또는 `/library/[slug]` 직접 접속
- public record의 본문과 메타데이터를 확인

Expected:
- title 렌더링
- writer name 렌더링
- published date 렌더링
- tags 렌더링
- markdown 본문 렌더링
- related reading 렌더링 또는 empty state

## 6. Private Visibility

- 한 레코드를 `private`로 저장
- 비로그인 상태 또는 다른 사용자 기준으로 해당 slug 접근

Expected:
- private record는 공개 접근 불가
- 홈/추천/관련 목록에 private record가 노출되지 않는다

## 7. Comments

- public record 상세 하단으로 이동
- 비로그인 상태에서 comments 영역 확인

Expected:
- comments는 읽을 수 있다
- comment 작성은 로그인 필요 상태로 보인다

- 로그인 상태에서 top-level comment 작성
- 작성된 comment 아래 reply 작성

Expected:
- top-level comment 생성
- reply 생성
- 작성자 user name 표시
- depth 5를 넘는 reply는 막힌다

## 8. Sign Out

- workspace 또는 header에서 `Sign Out`

Expected:
- 세션 종료
- `/author` 접근 시 sign-in required 상태
- public reading은 계속 가능

## Regression Focus

- `/` home 정상 렌더링
- `/library/[slug]` 정상 렌더링
- `/author/sign-in` 정상 렌더링
- `/author` 정상 렌더링
- `/author/documents/new` 정상 렌더링
- `/author/documents/[documentId]` 정상 렌더링
- signup/login, create/edit/delete, comment/reply, sign out 플로우가 함께 깨지지 않는다

## Pass Criteria

아래가 모두 만족되면 `v0.2` smoke test pass로 본다.

- signup/login 동작
- workspace 동작
- create/edit/delete 동작
- public/private visibility 동작
- public record 읽기 동작
- comment/reply 동작
- sign out 동작
