# Personal Wiki v0.6.5 Comment, Markdown, Performance Fixes

## Branch

- Working branch: `V0_6_5_Comment_Markdown_Performance_Fixes`

## Goal

- 댓글 스레드 깊이를 줄이고 읽기 경험을 다듬는다.
- 작성 워크스페이스와 기본 discovery 목록의 과도한 조회를 페이지 단위 조회로 줄이고, `/author/documents/new` 진입 오류를 막는다.

## Scope

- 댓글 reply depth를 3레벨 기준으로 제한한다.
- conversation UI를 카드형 스레드로 정리한다.
- markdown 이미지 렌더링과 작성 툴바 이미지 삽입을 지원한다.
- `/author`, `/`, `/me/library`의 기본 목록을 서버 페이지네이션으로 바꾸고, discovery 필터 상태에서도 후보 집합을 서버 쿼리로 먼저 줄인다.
- Supabase SSR auth cookie 처리에서 `/author/documents/new` 진입 시 발생하던 ByteString 오류를 완화한다.

## Non-Goals

- public discovery를 완전한 전용 검색 인프라로 재설계하지 않는다.
- markdown editor를 별도 리치 텍스트 에디터로 확장하지 않는다.
- 댓글 권한 모델이나 데이터 스키마를 바꾸지 않는다.

## Current Problems

- 댓글 reply가 너무 깊어져 읽기 흐름이 무거워질 수 있다.
- markdown 이미지 문법이 작성 UX에서 드러나지 않고, 읽기 화면 스타일도 보장되지 않는다.
- `/author`, `/`, `/me/library`는 기본 목록에서 한 번에 너무 많은 문서를 불러올 수 있다.
- 일부 auth 세션에서 `/author/documents/new`가 ByteString 오류로 깨질 수 있다.

## Proposed Changes

- 댓글 depth 상한을 3레벨로 맞추고, reply 버튼 노출 조건도 동일 기준으로 통일한다.
- conversation UI를 가벼운 카드형 스레드와 단계별 들여쓰기로 정리한다.
- markdown renderer에 이미지 스타일을 추가하고, 작성 툴바에 image 삽입 버튼을 넣는다.
- 작성 워크스페이스와 기본 discovery 목록은 페이지당 8개씩 조회하고, 현재 페이지 표시와 최대 8개 번호 버튼을 포함한 페이지네이션을 제공한다.
- server/route handler Supabase client를 tokens-only cookie encoding으로 맞춰 세션 메타데이터 기반 cookie 직렬화 리스크를 낮춘다.

## Acceptance Criteria

- public record 댓글은 최대 3레벨까지만 reply를 만들 수 있다.
- markdown `![alt](url)`이 preview와 public reading 양쪽에서 렌더링된다.
- `/author`, `/`, `/me/library`의 기본 목록은 현재 페이지에 필요한 문서만 조회하고 페이지 이동이 가능하다.
- `/author/documents/new`가 기존 세션에서 ByteString 오류 없이 렌더링된다.

## Risks

- 기존 세션 cookie 상태에 따라 재로그인이 한 번 필요할 수 있다.
- 검색/태그/정렬 discovery는 후보 집합 축소 후 애플리케이션 레벨 정렬이 일부 남아 있다.
- 외부 이미지 URL 품질은 애플리케이션이 보장하지 않는다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- `/author`, `/author/documents/new`, `/library/[slug]`에서 수동 확인

## Related Docs

- [v0_6_5_comment_markdown_performance_fixes.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/test_guide/v0_6_5_comment_markdown_performance_fixes.md)
- [v0_6_final_smoke_checklist.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/test_guide/v0_6_final_smoke_checklist.md)
