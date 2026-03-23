# Personal Wiki v0.6.2 Public Reading PWA

## Branch

- Working branch: `V0_6_2_Public_Reading_PWA`

## Goal

- public reading 흐름을 설치 가능하고, 다시 열기 쉽고, 최소한의 오프라인 fallback을 가진 PWA 형태로 만든다.

## Scope

- web app manifest를 추가한다.
- PWA 설치에 필요한 앱 아이콘을 추가한다.
- service worker를 등록한다.
- public reading 중심의 최소 캐시 전략을 넣는다.
- 오프라인 fallback 페이지를 추가한다.
- PWA 범위에 맞게 README와 관련 문서를 갱신한다.
- 현재 브랜치 버전을 `0.6.2`로 올린다.

## Non-Goals

- push notification
- background sync
- author workspace 오프라인 편집
- private/auth route 공격적 캐시
- 앱스토어 배포 대응

## Current Problems

- 현재 앱은 설치 가능한 web app처럼 동작하지 않는다.
- 오프라인이나 불안정한 네트워크에서 public reading fallback이 없다.
- favicon은 있지만 PWA용 아이콘 세트와 manifest가 없다.
- public reading과 authoring을 구분한 캐시 전략이 아직 없다.

## Proposed Changes

- `manifest.webmanifest`에서 앱 이름, 시작 URL, 테마색, 아이콘을 정의한다.
- public route 중심 service worker를 등록한다.
- `/`, `/library/[slug]`, `/topics/[topic]`, `/offline` 중심으로 document cache를 적용한다.
- `/author`, `/auth`, `/me` 경로는 캐시 대상에서 제외한다.
- 코드 생성 아이콘 라우트를 추가해 별도 바이너리 자산 없이도 설치 가능한 아이콘 세트를 만든다.
- 오프라인 시에는 `/offline` fallback을 노출한다.

## Acceptance Criteria

- 브라우저에서 manifest가 노출된다.
- public reading 앱이 설치 가능한 상태가 된다.
- PWA용 아이콘 경로가 존재한다.
- 이미 방문한 public route는 네트워크 실패 시 캐시로 다시 열 수 있다.
- 캐시가 없을 때는 `/offline` fallback이 보인다.
- private/auth 경로는 PWA 캐시 대상에서 제외된다.

## Risks

- service worker 캐시 판단을 잘못하면 오래된 화면이 남을 수 있다.
- auth/private 경로가 잘못 캐시되면 제품 규칙과 충돌할 수 있다.
- 개발 환경에서 service worker가 남으면 디버깅이 번거로울 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- manual:
  - manifest 확인
  - 아이콘 경로 확인
  - public route 설치 가능 여부 확인
  - 네트워크 차단 시 cached route / offline fallback 확인

## Related Docs

- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)
- [.omx/specs/deep-interview-personal-wiki-foundation.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/specs/deep-interview-personal-wiki-foundation.md)
- [.omx/plans/personal-wiki-mvp-ralplan.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/plans/personal-wiki-mvp-ralplan.md)
