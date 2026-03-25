# v0.6 Final Smoke Checklist

## Goal

Release 전에 `v0.6`의 recommendation/reaction 정리, public reading PWA, reading/auth polish가 실제 환경에서 정상 동작하는지 빠르게 확인한다.

이 체크리스트는 다음 범위를 검증한다.
- recommendation and reactions
- my library bookmark-only flow
- public reading PWA
- sign-in / header polish
- `/author/sign-in` auth guard

## Preconditions

- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)의 최신 migration 상태가 반영돼 있다.
- `.env.local`이 채워져 있다.
- `pnpm dev` 또는 배포 환경이 떠 있다.
- 로그인 가능한 테스트 계정이 있다.
- public record 2개 이상과 private record 1개 이상이 있다.
- bookmark / like를 확인할 수 있는 public record가 있다.
- PWA 확인은 production build 또는 배포 환경에서 진행한다.

## 1. Recommendation And Reaction

- public record detail을 연다.
- bookmark / like를 각각 눌러본다.
- related reading이 있는 record와 없는 record를 각각 확인한다.

Expected:
- public record detail에서 like count가 보인다
- recommendation reason이 shared topic 기준으로 읽힌다
- related reading empty state가 topic hub 또는 전체 library 이동을 제시한다
- recommendation과 목록 정렬이 최근 문서 우선 인상과 맞는다

## 2. Private Reaction Guard

- private record detail을 연다.
- 같은 record가 public surface에 섞이는지 확인한다.

Expected:
- private record detail에는 bookmark / like UI가 보이지 않는다
- private record에는 새 reaction row를 만들 수 없다
- public list / recommendation에 private record가 누출되지 않는다

## 3. My Library

- `/me/library`에 접속한다.
- bookmark한 public record를 확인한다.

Expected:
- `My Library`는 bookmark 전용 저장 목록으로 동작한다
- 목록 정렬은 최신순 기준으로 읽힌다
- likes 전용 탭이나 혼합 의미가 남아 있지 않다

## 4. PWA

- production build 또는 배포 환경에서 `/`와 `/library/[slug]`를 연다.
- 브라우저에서 manifest와 install 가능 상태를 확인한다.
- 네트워크를 끄고 이미 방문한 public route를 다시 연다.
- cache가 없는 route는 `/offline`로 유도되는지 본다.

Expected:
- manifest가 노출된다
- PWA 설치 가능 상태가 된다
- public route는 offline fallback 또는 cache로 다시 열린다
- `/author`, `/auth`, `/me`는 PWA 캐시 대상이 아니다

## 5. Sign-In Polish

- `/author/sign-in`에 접속한다.
- `Sign In` / `Sign Up` 탭을 전환한다.
- input focus와 submit pending state를 확인한다.

Expected:
- tab active state가 분명하다
- input focus 상태가 읽기 쉽다
- submit 중 버튼이 pending state로 바뀐다

## 6. Header Auth State

- 비로그인 상태에서 header를 확인한다.
- 로그인 후 다시 header를 확인한다.
- 로그아웃 후 header를 다시 확인한다.

Expected:
- 비로그인 상태에서는 `Sign In`만 보인다
- 로그인 후에는 authenticated nav가 바로 보인다
- 로그아웃 후에는 다시 `Sign In` 상태로 돌아온다

## 7. Authenticated Sign-In Guard

- 로그인한 상태에서 `/author/sign-in`으로 직접 접근한다.

Expected:
- `/author`로 즉시 리다이렉트된다
- 로그인 상태에서 sign-in page가 그대로 열리지 않는다

## 8. Workspace Mobile Actions

- 모바일 폭에서 `/author`를 연다.
- record 카드의 `Preview / Edit / Delete` 버튼을 본다.

Expected:
- 세 버튼의 크기와 리듬이 맞는다
- 아이콘이 이질감 없이 정렬된다

## 9. Continue Reading Compact Layout

- 모바일 폭에서 `/library/[slug]`의 `Continue Reading`을 확인한다.

Expected:
- 카드가 이전보다 더 compact하게 보인다
- 제목 / 메타 / 추천 이유는 읽히고, 정보량은 과하게 두껍지 않다
- mobile에서는 excerpt 없이도 흐름이 이해된다

## Regression Focus

- `/`
- `/library/[slug]`
- `/offline`
- `/me/library`
- `/author`
- `/author/sign-in`
- recommendation, reactions, PWA, auth/header 상태가 함께 깨지지 않는지 확인한다.

## Pass Criteria

아래가 모두 만족되면 `v0.6` smoke test pass로 본다.

- recommendation / reaction 의미가 의도대로 동작한다
- my library가 bookmark 전용으로 동작한다
- public reading PWA가 설치/오프라인 범위 안에서 동작한다
- sign-in / header auth polish가 정상 동작한다
- `/author/sign-in` guard가 동작한다
- mobile reading / workspace polish가 유지된다
