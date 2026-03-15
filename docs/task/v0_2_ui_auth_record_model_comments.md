# Personal Wiki v0.2 UI, Auth, Record Model, Comments

## Branch

- Working branch: `V0_2_UI_Auth_Record_Model_Comments`
- Detailed schema reference: [v0_2_schema_lock_and_migration.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_2_schema_lock_and_migration.md)

## Goal

- `v0.2`에서 UI refinement, user-based auth, record model simplification, comments를 함께 정리해 제품 구조를 다음 단계로 옮긴다.

## Scope

### 1. Figma-Based UI Refinement

- Rebuild the current working UI around a Figma-defined visual system.
- Refine typography, spacing, hierarchy, and reading layout.
- Keep the reading-first product shape intact while making the public/library surfaces feel more intentional.

### 2. User-Based Authentication

- Replace the current author-only auth assumption with user-based signup/login.
- v0.2 auth fields should stay minimal:
  - id
  - password
  - user name
- Keep the current public-reading behavior unless a later product decision changes it.

### 3. Record Model Simplification

- Reduce the current record shape.
- Target v0.2 record fields:
  - `title`
  - `contents`
  - `sourceType` (`article` or `book`)
  - `bookTitle` for book records only
  - `visibility`
  - `publishedAt` computed automatically
  - `writer` from the logged-in user name
- Remove or demote the current heavier metadata fields where possible:
  - `sourceTitle`
  - `authorName`
  - `sourceUrl`
  - `isbn`
  - explicit topic-heavy shape if it is no longer core to the UX

### 4. Comments For Logged-In Users

- Logged-in users should be able to leave comments on records.
- Comment authorship should be tied to the authenticated user account.

## Non-Goals

- rich text editor adoption in v0.2
- recommendation model overhaul beyond explicit `tags`
- changing public-reading access rules
- broad product expansion beyond UI, auth, record model, comments

## Current Problems

- current auth model is still author-only and does not match the user-based v0.2 direction.
- current record shape is heavier than the desired title/contents/source type/book title/visibility 중심 구조다.
- comment system이 없어 logged-in user interaction flow가 비어 있다.
- UI tone과 hierarchy가 아직 Figma-defined visual system으로 정리되지 않았다.

## Proposed Changes

### Working Plan

#### Phase 1. Product And Schema Lock

- Freeze the new `record` shape before UI work starts.
- Decide whether recommendations still rely on tags, derived metadata, or a lighter relation model.
- Define the exact user model for:
  - id
  - password
  - user name
- Define the exact comment model and visibility rules.

#### Phase 2. Authentication Rewrite

- Replace author-only flow with user signup/login.
- Add minimal account creation and session persistence.
- Keep public reading behavior intact unless explicitly changed.

#### Phase 3. Record Model Simplification

- Replace the current heavy metadata form with the smaller v0.2 model.
- Make `writer` derive from the logged-in user.
- Make `publishedAt` automatic.
- Keep `bookTitle` only when `sourceType` is `book`.

#### Phase 4. Comment System

- Add authenticated comment creation.
- Show comments on record detail pages.
- Tie author display to the logged-in user name.

#### Phase 5. Figma-Based UI Refinement

- Apply the approved Figma direction to:
  - public home
  - record detail
  - auth pages
  - record editor
- Preserve the reading-first shape while improving clarity and polish.

### Proposed v0.2 Decisions

#### 1. Auth Model

- v0.2 no longer assumes a single author-only account.
- Every user should be able to:
  - sign up
  - log in
  - own records
  - write comments
- Minimal account fields:
  - `email`
  - `password`
  - `userName`

#### 2. Record Model

- Primary record fields:
  - `title`
  - `contents` (`markdown`)
  - `sourceType`
  - `bookTitle` only when `sourceType = book`
  - `visibility`
  - `publishedAt`
  - `writerUserId`
  - `writerUserName`
- `publishedAt` should be system-managed instead of hand-entered.
- `writer` should come from the authenticated user, not a free input field.
- `contents` replaces the current split between `intro` and card-based connected-thought editing as the main authoring field.
- `contents` is fixed as `markdown` for v0.2.

#### 3. Comments Model

- Only authenticated users can create comments.
- Public readers can read comments on public records.
- Private-record comments follow the same visibility boundary as the parent record.
- Comments should support replies in v0.2.
- Reply depth is capped at `5`.
- Minimal comment fields:
  - `recordId`
  - `userId`
  - `userName`
  - `contents`
  - `parentCommentId`
  - `createdAt`
  - `updatedAt`

#### 4. Recommendation Direction

- v0.2 keeps recommendations.
- Recommendation input model stays with explicit `tags` in v0.2.
- Tag-based recommendation remains the primary recommendation source during the v0.2 transition.

### Proposed Schema Draft

#### users / profiles

- `profiles`
  - `id`
  - `user_name`
  - `created_at`
  - `updated_at`

#### records

- `records`
  - `id`
  - `slug`
  - `title`
  - `contents`
  - `source_type`
  - `book_title`
  - `visibility`
  - `published_at`
  - `writer_user_id`
  - `created_at`
  - `updated_at`

#### comments

- `record_comments`
  - `id`
  - `record_id`
  - `user_id`
  - `contents`
  - `parent_comment_id`
  - `depth`
  - `created_at`
  - `updated_at`

Comment rule:
- reply depth maximum is `5`

### Migration Direction From v0.1

- `documents` -> `records`
- `created_by` -> `writer_user_id`
- `author_profiles` should be replaced by a user/profile model for all members
- `intro` + `document_note_cards` should be merged or transformed into `contents`
- `source_title`, `author_name`, `source_url`, `isbn` should be removed from the primary v0.2 record model unless a strong requirement reappears
- existing `topics` / `document_topics` stay in v0.2 as the recommendation input model

### Contents Editor Decision

#### Plain Textarea

Pros:
- simplest implementation
- lowest migration risk
- easiest validation and storage
- lowest UI complexity for v0.2

Cons:
- weak reading structure for long records
- no lightweight formatting beyond raw line breaks
- comments and records can start to feel visually flat

#### Markdown

Pros:
- still stores as plain text
- good balance of simplicity and structure
- supports headings, lists, quotes, links, and code blocks if needed
- easy to render on public record pages
- much lighter than a full rich text editor

Cons:
- users must learn a little syntax
- toolbar/preview UX still needs design if you want it friendly
- sanitization/rendering rules need to be defined

#### Rich Text

Pros:
- easiest for non-technical users to format visually
- strongest authoring UX on paper
- good fit if comments and records should feel polished and social

Cons:
- highest implementation complexity
- harder schema/migration story
- harder validation, serialization, and long-term editor maintenance
- easiest way for v0.2 scope to bloat

Recommendation:
- `markdown` is selected for v0.2.
- `plain textarea` is too bare for a wiki that is meant to be read publicly.
- `rich text` is too expensive for this phase because auth, record schema, and comments are already changing together.
- `markdown` gives enough structure without pushing v0.2 into editor-heavy work.

## Acceptance Criteria

- v0.2 schema is written down before implementation starts.
- migration strategy from v0.1 to v0.2 is explicit.
- signup works.
- login works.
- session persists across refresh.
- writer identity is available in record/comment flows.
- create/edit/read paths use the new record model.
- old unnecessary fields are removed from the primary UI.
- public reading still works after the schema change.
- logged-in users can create comments.
- anonymous users cannot create comments.
- comments render under records correctly.
- UI is visually aligned with Figma direction.
- mobile and desktop both remain usable.
- auth and record flows still pass verification.

## Risks

- auth, record schema, comments, UI refinement이 한 버전에 함께 들어가 scope가 커질 수 있다.
- `intro`/note cards를 `contents`로 합치는 과정에서 migration ambiguity가 생길 수 있다.
- recommendation input을 tags에 남겨두는 동안 editor 단순화와 충돌할 가능성이 있다.

## Verification

- Add Supabase-backed integration checks for:
  - signup/login
  - session persistence
  - record creation/edit/delete with the new schema
  - comment creation by authenticated users
  - public/private visibility behavior under the new auth model
- Add a v0.2 migration note once the schema direction is fixed.
- Add a short production checklist once deployment target and auth URLs are finalized.

## Related Docs

- [v0_2_schema_lock_and_migration.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_2_schema_lock_and_migration.md)
- [.omx/specs/deep-interview-personal-wiki-foundation.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/specs/deep-interview-personal-wiki-foundation.md)
- [.omx/plans/personal-wiki-mvp-ralplan.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/plans/personal-wiki-mvp-ralplan.md)
