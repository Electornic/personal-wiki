# Personal Wiki v0.6.12 Image And Writer Fix

## Branch

- Working branch: `V0_6_12_Image_And_Writer_Fix`

## Goal

- public reading 이미지 렌더를 `next/image` 기반으로 바꾸고, 홈 라이브러리 카드에서 writer name이 `unknown`으로 보이는 케이스를 줄인다.

## Scope

- markdown image 렌더에서 앱 내부 이미지 경로를 `next/image`로 렌더한다.
- public list/detail 데이터 매핑에서 저장된 `author_name`이 비어 있을 때 profile 기반 fallback을 시도한다.
- 기존 `records.author_name` 누락 row를 보정하는 SQL migration을 추가한다.
- `package.json.version`을 `0.6.12`로 올린다.

## Non-Goals

- 외부 이미지 전체를 강제로 optimizer 경로로 바꾸는 작업
- 이미지 crop, placeholder, blur 처리
- author profile UX 개편

## Current Problems

- public reading 페이지 markdown 이미지는 일반 `<img>`로 렌더되어 Next 이미지 최적화를 타지 않는다.
- 일부 기존 record는 `author_name`이 비어 있어 홈 목록에서 writer name이 `unknown`으로 보일 수 있다.

## Proposed Changes

- 상대 경로 기반 이미지(`/api/record-images?...`)는 `next/image`로 렌더한다.
- blob/external URL은 기존 preview 호환성을 위해 plain `<img>`로 유지한다.
- public list/detail 매핑 시 `author_name`이 없고 `writer_user_id`가 있으면 profile의 `user_name` 또는 email prefix로 fallback 한다.
- Supabase migration으로 기존 빈 `author_name` row를 재보정해 목록 표시와 writer 검색 인덱스를 같이 맞춘다.

## Acceptance Criteria

- `/library/[slug]`에서 내부 markdown 이미지가 `next/image` 경로로 렌더된다.
- author preview의 blob 이미지 렌더는 유지된다.
- 홈 라이브러리 목록에서 기존 `author_name` 누락 record도 가능한 경우 profile 이름으로 writer name이 보인다.
- 최신 migration 적용 후 기존 누락 row도 DB 레벨에서 `author_name`이 채워진다.
- lint, typecheck, test, build가 통과한다.

## Risks

- 프로필 조회 권한/환경에 따라 fallback이 실패하면 기존처럼 `unknown`이 남을 수 있다.
- `next/image` width/height 고정값은 실제 원본 비율과 다를 수 있어 시각 확인이 필요하다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- public reading markdown image render
- author preview image render
- home writer name fallback

## Related Docs

- [docs/test_guide/v0_6_12_image_and_writer_fix.md](../test_guide/v0_6_12_image_and_writer_fix.md)
- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)
