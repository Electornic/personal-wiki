# Personal Wiki v0.5.4 Schema Hardening And Docs Alignment

## Branch

- Working branch: `V0_5_4_Schema_Hardening_And_Docs_Alignment`

## Goal

- 현재 앱이 실제로 의존하는 record/profile/comment schema 계약을 다시 고정하고, v0.5.3 이후 남아 있는 코드/문서 불일치를 최소 수정으로 정리한다.

## Scope

- `records` 중심의 실제 read/write 계약을 점검한다.
- legacy column 의존(`author_name`, `source_title`, `intro`, `isbn`, `source_url`)을 정리할 준비를 한다.
- 필요한 경우 최소 migration 1개로 constraint/index/policy를 보강한다.
- `README.md`, `SETUP_GUIDE.md` 등 현재 상태와 어긋난 문서를 갱신한다.
- v0.5.4 기준 검증 범위를 문서화한다.

## Non-Goals

- editor UI 재설계
- recommendation 알고리즘 변경
- comments/reactions 기능 확장
- records/tags/comments 전체 재모델링

## Current Problems

- 앱 코드는 `records`를 사용하지만 여전히 일부 v0.1/v0.2 legacy column에 의존한다.
- `writerName`과 book fallback이 `profiles.user_name`, `book_title`보다 legacy field에 기대고 있다.
- 저장 로직도 record 중심 editor 계약과 별개로 legacy field를 계속 채우고 있다.
- README에는 이미 제거된 curation shelf surface가 현재 구현 범위처럼 남아 있다.
- README와 setup 문서는 “현재 앱이 실제로 요구하는 schema 계약”을 한 번 더 고정할 필요가 있다.

## Proposed Changes

- `records` read/write 경로에서 실제 필수 column과 legacy compatibility column을 구분한다.
- public/author query 패턴에 맞는 constraint, index, policy 빈틈이 있으면 최소 migration으로 보강한다.
- app code에서 가능한 범위까지 profile/book 중심으로 값을 읽도록 정리한다.
- 문서에서 제거된 기능 설명과 현재 verification 기준을 최신 상태로 맞춘다.
- 후속 migration에서 제거할 legacy field 목록과 조건을 task 문서에 명확히 남긴다.

## Acceptance Criteria

- v0.5.4 작업 문서에 schema hardening 범위와 non-goal이 고정돼 있다.
- 현재 브랜치 버전이 `0.5.4`로 올라가 있다.
- README에서 현재 범위와 맞지 않는 curation shelf 설명이 제거되거나 수정된다.
- schema 정리 과정에서 손대야 할 legacy field와 코드 진입점이 문서에 명시돼 있다.
- 이후 migration을 추가할 경우 `SETUP_GUIDE.md` 반영 지점이 명확하다.

## Risks

- legacy column 제거를 서두르면 기존 row insert/update와 충돌할 수 있다.
- `profiles.user_name` 기반 전환 시 fallback 규칙을 잘못 잡으면 writer 표시가 흔들릴 수 있다.
- 문서만 먼저 정리하고 코드 계약을 뒤따라 맞추지 않으면 혼란이 남을 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- manual:
  - README의 current shape와 setup 설명이 실제 앱 상태와 맞는지 확인
  - `lib/wiki/documents.ts`의 legacy schema 의존 지점이 task 문서 범위와 맞는지 확인

## Related Docs

- [docs/task/v0_5_3_author_workspace_cleanup_and_editor_support.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_5_3_author_workspace_cleanup_and_editor_support.md)
- [docs/task/v0_2_schema_lock_and_migration.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_2_schema_lock_and_migration.md)
- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)
- [.omx/specs/deep-interview-personal-wiki-foundation.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/specs/deep-interview-personal-wiki-foundation.md)
