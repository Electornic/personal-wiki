# Personal Wiki v0.1 MVP Foundation And Verification

## Branch

- Historical release documentation for `v0.1`
- No dedicated working branch name was recorded in this document

## Goal

- personal library-style wiki의 첫 MVP foundation을 세우고 release 기준 검증까지 완료한다.

## Scope

- 제품 정의와 실행 계획 확정
- Supabase, auth, content model 기반 MVP 구현
- public/private visibility와 recommendation 검증
- release cut과 verified commit 정리

## Non-Goals

- user-oriented auth 모델 전환
- record schema 단순화
- comments, reactions, my library 같은 후속 버전 기능

## Current Problems

- 초기 상태는 minimal Next.js starter라 auth, schema, public reading flow가 없었다.
- public/private visibility, RLS, callback-session 안정성을 같이 잡아야 했다.
- release 전 실제 환경 기준으로 Unicode slug와 authoring flow까지 확인이 필요했다.

## Proposed Changes

### Product Definition And Planning

- Deep interview completed and converted into an execution-ready spec.
- Ralplan consensus completed and approved.
- Project-specific `AGENTS.md` created.
- MVP plan and open questions recorded under `.omx/plans/`.

### MVP Implementation

- Public library home implemented.
- Public document detail page implemented.
- Author sign-in page implemented.
- Author workspace implemented.
- Author new/edit form implemented.
- Supabase SSR/public/admin client helpers implemented.
- SQL migration for `author_profiles`, `documents`, `topics`, `document_topics`, `document_note_cards` added.

### Verification And Hardening

- Utility tests for slugs, visibility, recommendations added.
- Callback redirect sanitization added.
- Authoring env contract aligned with `author_profiles` bootstrap dependency.
- Demo fallback limited to env-missing only.
- RLS recursion bug fixed in migration.

## Acceptance Criteria

- Product direction is fixed:
  - personal library-style wiki
  - public reading without login
  - author-only login for writing/editing
  - document-level `public` / `private`
  - book/article records only in v1
  - connected thoughts stored as card/bullet notes
  - recommendations based on shared topics/tags
- Local app, Supabase schema, and auth foundation are implemented.
- RLS and callback-session bugs found during verification have been fixed.
- `.env.local` values detected correctly.
- Supabase tables confirmed present.
- Magic-link auth confirmed.
- `author_profiles` row confirmed.
- Public document visible on public surfaces.
- Private document blocked from public detail route.
- Private document not leaked through related/public listing checks.
- Author workspace confirmed in the browser.
- Public article slug handling fixed for Korean/Unicode titles.

## Risks

- Automated CLI verification still does not fully cover browser-session-based author CRUD.
- Live Supabase-backed integration/e2e tests are not in place yet.
- Current auth model is still author-only and not yet user-oriented.
- Record schema is still heavier than the desired v0.2 shape.

## Verification

- Verified commits:
  - `978aec6` `docs: add planning guardrails and commit workflow`
  - `e566df8` `fix: harden auth callback and authoring contract`
  - `c1854d7` `fix: correct personal wiki rls policies`
  - `c08af8c` `fix: persist auth callback session`
  - `c376c6a` `fix: avoid redirect errors in author actions`
  - `8cf1046` `fix: support unicode slugs for public articles`
- Release tag:
  - `v0.1` -> `8cf1046`

## Related Docs

- [.omx/specs/deep-interview-personal-wiki-foundation.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/specs/deep-interview-personal-wiki-foundation.md)
- [.omx/plans/personal-wiki-mvp-ralplan.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/plans/personal-wiki-mvp-ralplan.md)
