# Personal Wiki v0.1 MVP Foundation And Verification

## Current State

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
- `v0.1` release cut is based on commit `8cf1046`.

## Completed Tasks

1. Product definition
- Deep interview completed and converted into an execution-ready spec.
- Ralplan consensus completed and approved.

2. Repo rules and planning docs
- Project-specific `AGENTS.md` created.
- MVP plan and open questions recorded under `.omx/plans/`.

3. MVP implementation
- Public library home implemented.
- Public document detail page implemented.
- Author sign-in page implemented.
- Author workspace implemented.
- Author new/edit form implemented.
- Supabase SSR/public/admin client helpers implemented.
- SQL migration for `author_profiles`, `documents`, `topics`, `document_topics`, `document_note_cards` added.

4. Verification and hardening
- Utility tests for slugs, visibility, recommendations added.
- Callback redirect sanitization added.
- Authoring env contract aligned with `author_profiles` bootstrap dependency.
- Demo fallback limited to env-missing only.
- RLS recursion bug fixed in migration.

5. Environment verification
- `.env.local` values detected correctly.
- Supabase tables confirmed present.
- Magic-link auth confirmed.
- `author_profiles` row confirmed.
- Public document visible on public surfaces.
- Private document blocked from public detail route.
- Private document not leaked through related/public listing checks.
- Author workspace confirmed in the browser.
- Public article slug handling fixed for Korean/Unicode titles.

## Verified Commits

- `978aec6` `docs: add planning guardrails and commit workflow`
- `e566df8` `fix: harden auth callback and authoring contract`
- `c1854d7` `fix: correct personal wiki rls policies`
- `c08af8c` `fix: persist auth callback session`
- `c376c6a` `fix: avoid redirect errors in author actions`
- `8cf1046` `fix: support unicode slugs for public articles`

## Release Tags

- `v0.1` -> `8cf1046`

## Known Gaps

- Automated CLI verification still does not fully cover browser-session-based author CRUD.
- Live Supabase-backed integration/e2e tests are not in place yet.
- Current auth model is still author-only and not yet user-oriented.
- Record schema is still heavier than the desired v0.2 shape.
