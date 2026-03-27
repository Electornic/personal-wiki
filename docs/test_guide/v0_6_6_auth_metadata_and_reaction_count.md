# v0.6.6 Auth Metadata And Reaction Count

## Goal

- auth metadata/session 경로의 ByteString 오류 방지와 reaction count 기반 정렬을 함께 검증한다.

## Preconditions

- `.env.local`의 Supabase env가 채워져 있다.
- v0.6.6 migration까지 적용된 DB를 사용한다.
- 한글 user name으로 signup 가능한 테스트 계정이 있다.
- public record 여러 개와 like 데이터가 준비돼 있다.

## 1. Signup / Signin / Callback Stability

- `/author/sign-in`에서 한글 user name으로 signup을 시도한다.
- callback 또는 로그인 이후 `/author`, `/author/documents/new`로 이동한다.
- 새로고침과 재로그인을 반복한다.

Expected:
- ByteString 오류가 재현되지 않는다.
- 기존 profile user name이 fallback email 값으로 덮이지 않는다.

## 2. Most Reacted Sorting

- `/`에서 sort를 `Most liked`로 바꾼다.
- `/me/library`에서도 같은 정렬을 확인한다.
- like 수가 높은 문서가 먼저 오는지 본다.

Expected:
- `most-reacted` 정렬이 일관되게 동작한다.
- 페이지 이동 후에도 정렬 순서가 안정적이다.

## Regression Focus

- signup / login / callback 이후 workspace 접근이 깨지지 않는지 확인한다.
- comments, bookmark, like 기본 동작이 유지되는지 확인한다.
