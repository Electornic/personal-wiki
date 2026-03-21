# Personal Wiki v0.5.3 Author Workspace Cleanup And Editor Support

## Branch

- Working branch: `V0_5_3_Author_Workspace_Cleanup_And_Editor_Support`

## Goal

- author workspace를 피그마 의도에 더 가깝게 정리하고, write/edit 화면의 작성 지원을 보강하면서, author record 조회 경로의 불필요한 비용을 줄인다.

## Scope

- `/author`에서 `Curation Shelves` 관리 UI를 제거한다.
- record 저장/삭제 이후 workspace에서 바로 확인 가능한 피드백을 추가한다.
- write/edit 화면에 작성 보조 요소를 추가한다.
- edit 진입과 author workspace 목록에 맞는 최소 쿼리/인덱스 개선을 적용한다.
- 이번 변경에 맞는 문서를 함께 갱신한다.

## Non-Goals

- home/topic의 public curation shelf surface 전면 제거
- block editor나 rich text editor 교체
- records/tags/comments 전반의 스키마 재설계
- dashboard형 author 관리 화면 확장

## Current Problems

- author workspace 하단의 `Curation Shelves`는 현재 피그마의 핵심 관리 범위와 맞지 않는다.
- record 저장/삭제 후 workspace로 돌아와도 사용자 피드백이 보이지 않는다.
- write/edit 화면은 markdown toolbar는 있지만, 시작 구조나 작성 가이드를 바로 받기 어렵다.
- edit 페이지는 단일 record를 열기 위해 author record 전체 목록을 먼저 읽는 구조라 비용이 불필요하게 크다.
- author workspace 목록 쿼리는 `writer_user_id` 필터와 `updated_at desc` 정렬을 함께 사용하지만 이를 직접 받는 복합 인덱스가 없다.

## Proposed Changes

- author workspace는 record 관리에 집중하도록 `Curation Shelves` 블록을 제거한다.
- workspace query param 기준 success/error banner를 추가해 저장/삭제 결과를 바로 보여준다.
- write/edit 화면에는 starter outline, reflection prompt, markdown guide, word/line count를 추가한다.
- `getAuthorDocumentById`는 전체 author 목록 대신 단일 record를 직접 조회하도록 바꾼다.
- public shelf 렌더는 shelf에 포함된 record id만 조회하도록 줄인다.
- `records (writer_user_id, updated_at desc)` 복합 인덱스를 migration으로 추가한다.

## Acceptance Criteria

- `/author` 화면에서 record 관리만 남고 `Curation Shelves` UI는 보이지 않는다.
- record 저장 후 `/author?saved=1`, 삭제 후 `/author?deleted=1`에서 사용자 피드백이 보인다.
- write/edit 화면에서 starter outline, reflection prompt, markdown guide, word/line count를 확인할 수 있다.
- edit 페이지는 대상 record 1건만 직접 조회한다.
- public curation shelf가 있어도 홈/토픽에서 전체 public records를 매번 먼저 읽지 않는다.
- 새 migration 적용 후 author workspace 목록 쿼리가 `writer_user_id + updated_at` 패턴에 맞는 인덱스를 사용할 수 있다.

## Risks

- shelf authoring UI를 숨기면 새 shelf를 앱 내부에서 바로 관리할 수 없게 된다.
- starter template가 과하면 writing surface가 폼처럼 느껴질 수 있다.
- query 경로를 줄이는 과정에서 public/private visibility 규칙이 깨지지 않도록 확인이 필요하다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- manual:
  - `/author`에서 save/delete banner 확인
  - `/author/documents/new`와 `/author/documents/[documentId]`에서 writing support UI 확인
  - home/topic의 existing curation shelf 노출 회귀 확인

## Related Docs

- [docs/task/v0_5_2_library_filter_and_navigation_speed.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_5_2_library_filter_and_navigation_speed.md)
- [docs/task/v0_5_discovery_hub_curation.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_5_discovery_hub_curation.md)
- [docs/figma_prompts/v0_2_author_workspace_record_management.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/figma_prompts/v0_2_author_workspace_record_management.md)
- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)
- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
