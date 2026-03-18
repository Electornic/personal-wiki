# Personal Wiki v0.5.2 Library Filter And Navigation Speed

## Branch

- Working branch: `V0_5_2_Library_Filter_And_Navigation_Speed`

## Goal

- 라이브러리 목록에서 필터 변경 시 화면 위치와 반응 속도를 개선하고, 라이브러리 문서 간 페이지 이동이 느린 원인을 파악해 체감 속도를 높인다.

## Scope

- 필터 클릭 시 불필요한 스크롤 이동 원인을 제거하거나 제어한다.
- 필터 변경 시 UI state 이외의 불필요한 작업이 함께 실행되는지 점검한다.
- `/library/[slug]` 계열 페이지 이동 시 느린 구간을 추적하고 최소 수정으로 개선한다.
- 이번 변경에 맞는 작업 문서를 남긴다.

## Non-Goals

- 추천 알고리즘 전면 변경
- 라이브러리 페이지 정보 구조 개편
- 새 인증 흐름 추가
- 대규모 리팩터링

## Current Problems

- 라이브러리 필터를 누르면 화면이 최상단으로 이동해 읽던 문맥이 끊긴다.
- 필터 변경이 단순한 UI state 변경처럼 보여도 실제로는 다른 작업이 함께 실행되는 것으로 보인다.
- 라이브러리 문서들 사이를 이동할 때 여전히 페이지 전환 속도가 느리다.
- 이전 속도 개선 이후에도 남은 병목 지점이 명확히 정리되지 않았다.

## Proposed Changes

- 필터 변경 시 라우팅, 스크롤, 데이터 재계산 흐름을 나눠서 실제 비용이 큰 구간을 확인한다.
- 필요 시 필터 상태 반영 방식을 조정해 스크롤 위치를 보존한다.
- 라이브러리 상세 전환 시 서버 fetch, 추천 계산, comments/reactions 등 부가 작업의 비용을 다시 점검한다.
- 확인된 병목만 최소 변경으로 줄인다.

## Acceptance Criteria

- 라이브러리 목록에서 필터를 바꿔도 의도치 않게 화면 최상단으로 튀지 않는다.
- 필터 변경이 불필요한 전체 페이지 이동이나 무거운 재요청 없이 반영된다.
- 라이브러리 문서 간 이동 시 이전보다 체감 지연이 줄어든다.
- 느린 원인이 코드 기준으로 설명 가능하게 정리된다.

## Risks

- URL 기반 필터 상태를 바꾸면 브라우저 뒤로 가기/앞으로 가기 동작에 영향이 생길 수 있다.
- 라이브러리 상세 페이지 최적화가 공개/비공개 권한 처리와 충돌할 수 있다.
- 서버 컴포넌트 캐싱 판단을 잘못하면 최신성이나 visibility 제어에 문제가 생길 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- 라이브러리 목록에서 필터 반복 클릭 시 스크롤 위치와 응답 속도 확인
- 서로 다른 `/library/[slug]` 문서 사이 이동 체감 속도 확인

## Related Docs

- [v0_5_1_auth_session_and_navigation_speed.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_5_1_auth_session_and_navigation_speed.md)
- [v0_4_design_speed_and_reading_flow.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_4_design_speed_and_reading_flow.md)
- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [.omx/specs/deep-interview-personal-wiki-foundation.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/specs/deep-interview-personal-wiki-foundation.md)
- [.omx/plans/personal-wiki-mvp-ralplan.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/plans/personal-wiki-mvp-ralplan.md)
