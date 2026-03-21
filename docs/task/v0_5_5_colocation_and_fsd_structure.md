# Personal Wiki v0.5.5 Colocation And FSD Structure

## Branch

- Working branch: `V0_5_5_FSD_Colocation_Structure`

## Goal

- 현재 Next.js App Router 구조를 유지하면서, 과한 폴더 증설 없이 `colocation + 최소 FSD` 방향으로 정리한다.

## Scope

- 공용 인프라 경로를 `shared`로 분리한다.
- 실제로 사용 중인 기록/댓글/반응/태그 경계를 `entities`로 분리한다.
- 라우트 전용 섹션/헬퍼는 `app/**/_components`, `app/**/_lib`로 colocate 한다.
- import 경로를 새 구조에 맞게 정리한다.
- `README.md`의 구조 설명을 현재 상태에 맞게 갱신한다.
- 현재 브랜치 버전을 `0.5.5`로 올린다.

## Non-Goals

- `widgets`, `features`를 미리 전부 생성하는 작업
- 화면 동작이나 제품 플로우 변경
- 대규모 리팩터링이나 UI 재설계
- 기존 v0.5.4 문서의 historical record 수정

## Current Problems

- `components`, `lib/wiki`, `lib/supabase`, `lib/env`에 공용 코드와 라우트 전용 코드가 섞여 있다.
- route 전용 조립 코드와 재사용 도메인 코드의 경계가 불분명하다.
- FSD를 도입하더라도 지금 당장 쓰지 않는 폴더까지 만들면 탐색 비용만 늘어난다.

## Proposed Changes

- `shared/config/env.ts`, `shared/api/supabase/*`로 인프라 경로를 분리한다.
- `entities/record`, `entities/comment`, `entities/reaction`, `entities/tag`만 우선 도입한다.
- `app/library/[slug]`와 `app/topics/[topic]`에 route-local `_components`, `_lib`를 추가한다.
- 공용 UI와 모델 import를 새 경로 기준으로 재배선한다.
- 이번 작업 버전을 `0.5.5`로 고정하고 작업 브랜치 이름도 같은 규칙으로 맞춘다.

## Acceptance Criteria

- 현재 작업 브랜치 이름이 `V0_5_5_FSD_Colocation_Structure`다.
- `package.json.version`이 `0.5.5`다.
- 공용 인프라가 `shared`, 실제 사용 중인 도메인만 `entities` 아래로 이동한다.
- `app/library/[slug]`, `app/topics/[topic]`에 route-local colocated file이 존재한다.
- `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build`가 통과한다.

## Risks

- 경로 이동 후 import 누락이 생기면 build가 바로 깨질 수 있다.
- 레이어를 과하게 나누면 지금 프로젝트 규모에서 오히려 탐색성이 떨어질 수 있다.
- historical version 문서를 현재 버전으로 덮어쓰면 이전 릴리즈 기록이 흐려질 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`

## Related Docs

- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [docs/task/v0_5_4_schema_hardening_and_docs_alignment.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_5_4_schema_hardening_and_docs_alignment.md)
- [docs/task/TEMPLATE.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/TEMPLATE.md)
