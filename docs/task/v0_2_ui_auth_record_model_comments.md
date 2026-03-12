# Personal Wiki v0.2 UI, Auth, Record Model, Comments

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
