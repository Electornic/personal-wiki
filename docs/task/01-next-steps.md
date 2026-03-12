# Personal Wiki Next Tasks

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

1. Finalize v0.2 schema and auth direction
2. Implement user signup/login
3. Simplify record create/read/update flows
4. Add comments
5. Apply Figma-based UI refinement
6. Add integration verification and migration notes
