# Personal Wiki v0.6.6 Auth Metadata And Reaction Count

## Branch

- Working branch: `V0_6_6_Auth_Metadata_And_Reaction_Count`

## Goal

- auth/session 경로에서 ByteString 오류를 막고, `most-reacted` 정렬을 DB 집계 기반으로 옮긴다.

## Scope

- Supabase auth/session cookie 경로의 non-ASCII 리스크를 줄인다.
- signup/signin/callback에서 profile 이름 저장 흐름을 `profiles` 기준으로 정리한다.
- `records.reaction_count`를 추가하고 `record_likes`와 동기화한다.
- discovery의 `most-reacted` 정렬에서 별도 like total 집계를 줄인다.

## Non-Goals

- 검색 시스템 전체 재설계
- 추천 로직 변경
- UI 전면 개편

## Current Problems

- 일부 한글 metadata/session 경로에서 ByteString 오류가 날 수 있다.
- `most-reacted` 정렬은 앱 레벨에서 like totals를 별도 계산해 비용이 커질 수 있다.

## Proposed Changes

- auth metadata에 profile 이름을 의존하지 않도록 정리하고, redirect/middleware cookie 경로를 ASCII-safe 하게 맞춘다.
- `records.reaction_count` migration과 trigger를 추가한다.
- discovery 정렬은 `reaction_count`를 우선 사용한다.

## Acceptance Criteria

- signup/signin/callback 이후 `/author/documents/new` 진입에서 ByteString 오류가 재현되지 않는다.
- `most-reacted` 정렬이 기존 결과와 동일한 의미를 유지하면서 별도 like total 계산 의존이 줄어든다.
- migration 적용 후 setup 문서와 README가 현재 순서를 반영한다.

## Risks

- profile 이름 보존 규칙을 잘못 잡으면 기존 사용자명이 fallback 값으로 덮일 수 있다.
- trigger/column 동기화가 잘못되면 reaction_count가 실제 like 수와 어긋날 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- signup / signin / callback / `/author/documents/new`
- `/`와 `/me/library`의 `most-reacted` 정렬

## Related Docs

- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)
- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
