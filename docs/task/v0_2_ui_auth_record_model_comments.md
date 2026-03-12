# Personal Wiki v0.2 UI, Auth, Record Model, Comments

## Branch

- Working branch: `V0_2_UI_Auth_Record_Model_Comments`

## v0.2 Scope

### 1. Figma-based UI refinement

- Rebuild the current working UI around a Figma-defined visual system.
- Refine typography, spacing, hierarchy, and reading layout.
- Keep the reading-first product shape intact while making the public/library surfaces feel more intentional.

### 2. User-based authentication

- Replace the current author-only auth assumption with user-based signup/login.
- v0.2 auth fields should stay minimal:
  - id
  - password
  - user name
- Keep the current public-reading behavior unless a later product decision changes it.

### 3. Record model simplification

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

### 4. Comments for logged-in users

- Logged-in users should be able to leave comments on records.
- Comment authorship should be tied to the authenticated user account.

## Working Plan

### Phase 1. Product and schema lock

- Freeze the new `record` shape before UI work starts.
- Decide whether recommendations still rely on tags, derived metadata, or a lighter relation model.
- Define the exact user model for:
  - id
  - password
  - user name
- Define the exact comment model and visibility rules.

Acceptance criteria:
- v0.2 schema is written down before implementation starts.
- migration strategy from v0.1 to v0.2 is explicit.

## Proposed v0.2 Decisions

### 1. Auth model

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

### 2. Record model

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

### 3. Comments model

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

### 4. Recommendation direction

- v0.2 keeps recommendations.
- Recommendation input model stays with explicit `tags` in v0.2.
- Tag-based recommendation remains the primary recommendation source during the v0.2 transition.

## Proposed Schema Draft

### users / profiles

- `profiles`
  - `id`
  - `user_name`
  - `created_at`
  - `updated_at`

### records

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

### comments

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

## Migration Direction From v0.1

- `documents` -> `records`
- `created_by` -> `writer_user_id`
- `author_profiles` should be replaced by a user/profile model for all members
- `intro` + `document_note_cards` should be merged or transformed into `contents`
- `source_title`, `author_name`, `source_url`, `isbn` should be removed from the primary v0.2 record model unless a strong requirement reappears
- existing `topics` / `document_topics` stay in v0.2 as the recommendation input model

## Contents Editor Options

### Plain textarea

Pros:
- simplest implementation
- lowest migration risk
- easiest validation and storage
- lowest UI complexity for v0.2

Cons:
- weak reading structure for long records
- no lightweight formatting beyond raw line breaks
- comments and records can start to feel visually flat

### Markdown

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

### Rich text

Pros:
- easiest for non-technical users to format visually
- strongest authoring UX on paper
- good fit if comments and records should feel polished and social

Cons:
- highest implementation complexity
- harder schema/migration story
- harder validation, serialization, and long-term editor maintenance
- easiest way for v0.2 scope to bloat

## Recommendation

- `markdown` is selected for v0.2.
- Reason:
  - `plain textarea` is probably too bare for a wiki that is meant to be read publicly.
  - `rich text` is too expensive for this phase because auth, record schema, and comments are already changing together.
  - `markdown` gives enough structure without pushing v0.2 into editor-heavy work.

## Locked Decisions

- login id: `email`
- `contents`: `markdown`
- comments: replies allowed, max depth `5`
- recommendation model: explicit `tags` retained in v0.2

### Phase 2. Authentication rewrite

- Replace author-only flow with user signup/login.
- Add minimal account creation and session persistence.
- Keep public reading behavior intact unless explicitly changed.

Acceptance criteria:
- signup works
- login works
- session persists across refresh
- writer identity is available in record/comment flows

### Phase 3. Record model simplification

- Replace the current heavy metadata form with the smaller v0.2 model.
- Make `writer` derive from the logged-in user.
- Make `publishedAt` automatic.
- Keep `bookTitle` only when `sourceType` is `book`.

Acceptance criteria:
- create/edit/read paths use the new record model
- old unnecessary fields are removed from the primary UI
- public reading still works after the schema change

### Phase 4. Comment system

- Add authenticated comment creation.
- Show comments on record detail pages.
- Tie author display to the logged-in user name.

Acceptance criteria:
- logged-in users can create comments
- anonymous users cannot create comments
- comments render under records correctly

### Phase 5. Figma-based UI refinement

- Apply the approved Figma direction to:
  - public home
  - record detail
  - auth pages
  - record editor
- Preserve the reading-first shape while improving clarity and polish.

Acceptance criteria:
- UI is visually aligned with Figma direction
- mobile and desktop both remain usable
- auth and record flows still pass verification

## Follow-up Tasks

### Architecture / Data

- Redesign the database schema for user accounts and the simplified record model.
- Decide how recommendation logic changes if topics are reduced or removed from the authoring model.
- Introduce a migration path from v0.1 records to the v0.2 schema.

### Verification

- Add Supabase-backed integration checks for:
  - signup/login
  - session persistence
  - record creation/edit/delete with the new schema
  - comment creation by authenticated users
  - public/private visibility behavior under the new auth model

### Delivery / Docs

- Add a v0.2 migration note once the schema direction is fixed.
- Add a short production checklist once deployment target and auth URLs are finalized.

## Suggested Order

1. Product and schema lock
2. User signup/login
3. Record model simplification
4. Comments
5. Figma-based UI refinement
6. Integration verification and migration notes
