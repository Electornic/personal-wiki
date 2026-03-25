# Personal Wiki v0.6.3 Reading, Auth, And Header Polish

## Branch

- Working branch: `V0_6_3_Reading_Auth_And_Header_Polish`

## Goal

- reading detail의 `Continue Reading` 밀도를 줄이고, 로그인 화면과 헤더의 인증 상태 체감을 더 자연스럽게 만들며, 모바일 action button의 시각적 일관성을 맞춘다.

## Scope

- `Continue Reading` 추천 카드의 패딩, 텍스트 밀도, 모바일 정보량을 줄인다.
- sign-in / sign-up 화면에 더 분명한 active, focus, submit interaction을 추가한다.
- 로그인/로그아웃 후 헤더 auth 상태가 바로 반영되도록 정리한다.
- author workspace 모바일 action button에서 `Preview / Edit / Delete` 크기를 맞춘다.
- 이번 변경에 맞는 task 문서를 추가하고 버전을 `0.6.3`으로 올린다.

## Non-Goals

- 추천 알고리즘 변경
- auth provider 교체나 세션 구조 재설계
- author workspace 전체 레이아웃 재디자인
- 모바일 전 화면 반응형 재작업

## Current Problems

- reading detail의 추천 카드가 현재 정보량 대비 세로 밀도가 높다.
- 로그인 화면은 정적 폼에 가까워 탭/입력/submit 반응이 약하다.
- 로그인 후 헤더가 즉시 인증 상태를 반영하지 않는 것처럼 보일 수 있다.
- mobile action row에서 delete 버튼만 크기가 달라 아이콘 리듬이 어색하다.

## Proposed Changes

- 추천 카드에서 excerpt를 mobile에서 숨기고, 패딩/타이포/태그 수를 줄여 compact card로 정리한다.
- 로그인 화면의 탭 active state, input focus, submit pending state를 강화한다.
- 헤더는 서버에서 초기 auth 상태를 받아 렌더하고, 클라이언트에서는 Supabase auth change를 이어서 동기화한다.
- mobile action button은 공통 크기 기준으로 맞춰 preview/edit/delete의 optical balance를 정리한다.

## Acceptance Criteria

- `/library/[slug]`의 `Continue Reading` 카드가 기존보다 더 짧고 가볍게 보인다.
- mobile에서 추천 카드가 excerpt 없이도 제목/메타/탐색 이유를 읽을 수 있다.
- `/author/sign-in`에서 탭 active state와 submit pending state를 확인할 수 있다.
- 로그인 후 헤더에서 `Sign In` 대신 authenticated nav가 바로 보인다.
- 로그아웃 후 헤더에서 authenticated nav가 사라지고 `Sign In`이 보인다.
- `/author` mobile action row에서 `Preview / Edit / Delete` 버튼 크기가 맞는다.

## Risks

- 추천 카드 정보를 너무 줄이면 클릭 이유가 약해질 수 있다.
- 헤더 auth 상태를 서버 초기값으로 바꾸는 과정에서 hydration mismatch가 나지 않도록 주의해야 한다.
- 로그인 화면 인터랙션이 과하면 현재 차분한 톤과 어긋날 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- manual:
  - `/library/[slug]`에서 compact `Continue Reading` 확인
  - `/author/sign-in`에서 tab / focus / submit interaction 확인
  - 로그인/로그아웃 직후 header auth state 확인
  - `/author` mobile width에서 action button 크기 확인

## Related Docs

- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [docs/task/v0_6_2_public_reading_pwa.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_6_2_public_reading_pwa.md)
- [docs/task/v0_5_3_author_workspace_cleanup_and_editor_support.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_5_3_author_workspace_cleanup_and_editor_support.md)
