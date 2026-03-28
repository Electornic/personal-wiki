# Personal Wiki v0.6.7 Unicode Routes And Error Pages

## Branch

- Working branch: `V0_6_7_Unicode_Routes_And_Error_Pages`

## Goal

- Unicode route handling을 안정화하고, App Router 기준의 에러/404 경험을 명확하게 만든다.

## Scope

- topic/tag 링크 생성과 route param decode 규칙을 공통 helper로 정리한다.
- `/topics/[topic]`와 related topic 링크에서 한글 route가 깨지지 않게 한다.
- `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`를 추가한다.
- Unicode route helper 테스트를 추가한다.

## Non-Goals

- 검색/정렬 성능 최적화
- 추천 로직 개편
- 대규모 UI 리디자인

## Current Problems

- `/topics/칸나` 같은 한글 route에서 비교/링크 처리 규칙이 일관되지 않을 수 있다.
- App Router 기준의 명시적인 에러/404 화면이 없어 예외 상황 경험이 약하다.

## Proposed Changes

- route path segment encode/decode helper를 추가하고 topic/link 경로에서 공통 사용한다.
- 없는 topic/document는 명확한 not-found 경험으로 보낸다.
- route-level error와 global error 페이지를 추가한다.

## Acceptance Criteria

- `/topics/칸나` 같은 한글 topic route가 깨지지 않는다.
- 없는 topic 또는 잘못된 route는 명시적인 404 화면을 본다.
- 예외 상황에서 App Router error UI가 최소한의 recovery action을 제공한다.

## Risks

- encode/decode 규칙을 과도하게 바꾸면 기존 ASCII route가 영향을 받을 수 있다.
- global error 페이지는 최소 구조만 두고, 과도한 로직은 피해야 한다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- `/topics/칸나`
- 없는 topic / 없는 library slug
- 강제 에러 상황에서 error UI 확인

## Related Docs

- [docs/test_guide/v0_6_7_unicode_routes_and_error_pages.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/test_guide/v0_6_7_unicode_routes_and_error_pages.md)
