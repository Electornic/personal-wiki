# Personal Wiki v0.6.4 AGENTS.md Refresh

## Branch

- Working branch: `V0_6_4_AGENTS_MD_Refresh`

## Goal

- `AGENTS.md`를 현재 레포 상태와 실제 작업 흐름에 맞게 다시 정리해, 에이전트가 stale rule 없이 더 일관되게 작업할 수 있도록 만든다.

## Scope

- 현재 구현 기준으로 product/auth 설명을 다시 맞춘다.
- 오래된 branch/test 문구를 정리한다.
- `AGENTS.md` 섹션 구조를 실행 중심으로 재배치한다.
- task 완료 시 test guide 작성/업데이트 의무를 `AGENTS.md`에 추가한다.
- 현재까지 누락된 release-level `docs/test_guide`를 backfill 한다.
- 작업 시작 전, 구현 중, PR/배포 전 체크 성격이 더 잘 보이도록 정리한다.
- 이번 버전에 맞춰 `package.json.version`을 `0.6.4`로 올린다.

## Non-Goals

- 제품 기능 변경
- README 대규모 개편
- SETUP_GUIDE 변경
- 코드 구조 리팩터링

## Current Problems

- `AGENTS.md` 안에 현재 구현과 어긋나는 오래된 문구가 남아 있다.
- branch naming 규칙이 현재 실제 버전 흐름과 다르다.
- `pnpm test` 관련 주의 문구가 현재 레포 상태와 맞지 않는다.
- `docs/task`는 쌓였지만 `docs/test_guide`는 `v0.2`, `v0.3` 이후가 비어 있다.
- 제품 규칙, 실행 체크, 문서 규칙이 섞여 있어 참고성이 조금 떨어진다.

## Proposed Changes

- auth/product 설명을 현재 앱 현실과 맞게 갱신한다.
- stale rule을 제거하고 실제 워크플로우 규칙만 남긴다.
- `Current Product Rules`, `Execution Checklist`, `Docs`, `Git Workflow` 중심으로 재구성한다.
- task 완료 시 test guide를 반드시 만들거나 갱신해야 한다는 규칙을 추가한다.
- `v0.4`, `v0.5`, `v0.6` final smoke checklist를 현재 문서 체계에 맞게 보강한다.
- PR/배포 전에 확인해야 하는 규칙을 더 짧고 직접적으로 정리한다.

## Acceptance Criteria

- `AGENTS.md`가 현재 signup/login 기반 구현과 충돌하지 않는다.
- branch/version/test 관련 규칙이 현재 레포 상태와 맞다.
- `AGENTS.md`에 test guide 작성/업데이트 의무가 명시된다.
- `docs/test_guide`에 `v0.4`, `v0.5`, `v0.6` release-level 가이드가 추가된다.
- 작업 시작 전, 구현 중, PR/배포 전 규칙을 빠르게 훑을 수 있다.
- 문서명 규칙과 배포 흐름이 현재 실제 절차와 맞게 적혀 있다.
- 코드 동작은 바뀌지 않는다.

## Risks

- 문서를 너무 줄이면 기존에 유용하던 세부 규칙이 빠질 수 있다.
- auth/product 설명을 잘못 단순화하면 범위 해석이 다시 흔들릴 수 있다.
- backfill하는 smoke checklist가 실제 릴리스 최종 상태와 어긋나지 않도록 주의가 필요하다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- manual:
  - `AGENTS.md`와 현재 README / package.json / 배포 흐름 간 충돌 여부 확인
  - `docs/test_guide`의 새 문서가 실제 task 범위를 반영하는지 확인

## Related Docs

- [AGENTS.md](/Users/leejun/Desktop/Projects/personal-wiki/AGENTS.md)
- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [docs/task/TEMPLATE.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/TEMPLATE.md)
- [docs/test_guide/TEMPLATE.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/test_guide/TEMPLATE.md)
