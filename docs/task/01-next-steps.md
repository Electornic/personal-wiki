# Personal Wiki Next Tasks

## Immediate Next Tasks

1. Author CRUD real-use pass
- Create one real document from the author workspace.
- Edit that document and confirm updates render on the public detail page.
- Delete a document and confirm it disappears from author/public surfaces as expected.

2. Seed real starter content
- Add 3-5 real book/article records.
- Add shared topics intentionally so recommendation quality can be inspected visually.

3. Integration verification
- Add Supabase-backed integration checks for:
  - callback -> session -> author access
  - `author_profiles` bootstrap expectations
  - anonymous access denial for private docs
  - no private leakage in related-document queries

## Product / UX Tasks

4. Figma-based UI refinement
- Translate the current working MVP into a more polished visual system.
- Refine typography, spacing, and editorial reading layout.
- Keep the reading-first product shape intact.

5. Information architecture refinement
- Decide whether the public home stays newest-first only.
- Decide whether lightweight topic normalization or author-side suggestions are needed.

## Technical Follow-ups

6. Developer ergonomics
- Add a deterministic local seed script.
- Add a simple reset/cleanup script for local verification data.

7. Test depth
- Keep current Vitest unit coverage.
- Add at least one browser/session-aware end-to-end check before deployment.

8. Deployment readiness
- Confirm production redirect URLs.
- Confirm Supabase Auth settings for deployed domain.
- Add a short production checklist to docs once deployment target is chosen.

## Suggested Order

1. Author CRUD real-use pass
2. Seed real starter content
3. Integration verification
4. Figma-based UI refinement
5. Deployment readiness
