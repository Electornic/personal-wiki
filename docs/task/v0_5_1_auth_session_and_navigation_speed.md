# Personal Wiki v0.5.1 Auth Session And Navigation Speed

## Branch

- Working branch: `V0_5_1_Auth_Session_And_Navigation_Speed`

## Goal

- 공개 읽기 흐름의 페이지 전환 체감을 개선하고, Supabase refresh token 오류를 줄인다.

## Scope

- Next.js request 단계에서 Supabase session refresh를 안정적으로 처리한다.
- root layout의 전역 server auth 체크를 제거한다.
- 공개 상세 페이지의 불필요한 auth/data fetch를 줄인다.
- 이번 변경에 맞는 문서를 함께 정리한다.

## Non-Goals

- 추천 알고리즘 변경
- comments / reactions UX 전면 개편
- 새 migration 추가
- 인증 provider 추가

## Current Problems

- root layout이 모든 페이지 전환에서 server-side auth 확인을 수행한다.
- server component에서 refresh token cookie를 항상 안정적으로 갱신하지 못한다.
- `Invalid Refresh Token: Refresh Token Not Found` 오류가 반복적으로 보인다.
- 공개 상세 페이지에서 현재 문서를 다시 조회하는 중복 fetch가 있다.

## Proposed Changes

- Supabase SSR session refresh를 위한 `proxy`를 추가한다.
- header auth 상태를 browser client 기준으로 바꿔 public route의 dynamic 부담을 낮춘다.
- related documents 계산 시 이미 읽은 문서를 재사용하도록 바꾼다.
- reaction state 조회에서 불필요한 profile/auth 중복 확인을 줄인다.

## Acceptance Criteria

- 공개 페이지 전환 시 root layout이 server auth 때문에 매번 dynamic 처리되지 않는다.
- session refresh가 request 단계에서 수행되어 refresh token 관련 오류 빈도가 줄어든다.
- 공개 상세 페이지가 현재 문서를 중복 조회하지 않는다.
- 로그인/로그아웃 이후 header 상태가 브라우저에서 정상 반영된다.

## Risks

- client-side header auth 전환으로 초기 hydration 전 nav가 비어 보일 수 있다.
- proxy matcher가 넓으면 정적 자산 요청까지 불필요하게 탈 수 있다.
- auth 처리 방식 변경이 sign-in/sign-out 직후 상태 반영에 영향을 줄 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- 로그인 상태/비로그인 상태에서 `/`, `/library/[slug]`, `/author`, `/me/library` 전환 확인

## Related Docs

- [v0_4_design_speed_and_reading_flow.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_4_design_speed_and_reading_flow.md)
- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [.omx/specs/deep-interview-personal-wiki-foundation.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/specs/deep-interview-personal-wiki-foundation.md)
- [.omx/plans/personal-wiki-mvp-ralplan.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/plans/personal-wiki-mvp-ralplan.md)
