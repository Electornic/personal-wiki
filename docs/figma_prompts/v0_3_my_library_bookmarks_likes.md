# v0.3 My Library, Bookmarks, And Likes

## Prompt

Design the `Personal Wiki` v0.3 personal reaction layer and private collection surface.

This prompt covers:
1. Bookmark interaction
2. Like interaction
3. A separate `My Library` screen for saved activity

This is not a social feed.
It is a quiet, personal reading companion layer inside the existing `Personal Wiki` product.

## Product Context

The product already supports:
- public reading
- authenticated writing/editing
- comments and replies
- workspace for managing authored records

v0.3 adds lightweight reader-side personal actions:
- bookmark
- like

Locked product decision:
- bookmark / like results should **not** live inside the author workspace
- they should live in a separate `My Library` surface

## Product Intent

### Bookmark

Meaning:
- “I want to return to this later.”

### Like

Meaning:
- “I appreciate this.”

These two actions should feel different in both semantics and interface tone.

Bookmark is archival / intentional.
Like is lightweight / expressive.

## Main Design Goals

### A. Record detail reactions

On the public record detail page:
- show bookmark action
- show like action
- if useful, show like count or subtle liked state
- reactions should feel integrated into the reading surface
- reactions should not overpower title/content/comments

Avoid:
- noisy social-media style counts
- giant colorful engagement bars
- over-gamified patterns

### B. My Library surface

Create a separate authenticated screen that lets the user view:
- bookmarked records
- liked records

This should not feel like the author workspace.

Workspace is:
- for managing what I wrote

My Library is:
- for collecting what I want to revisit or what resonated with me

## Screen Requirements

### 1. Record detail reaction area

Design a subtle reaction module that includes:
- bookmark toggle
- like toggle
- clear active/inactive states
- optional count/state expression

Should work on:
- desktop
- mobile

### 2. My Library screen

Include:
- clear screen identity distinct from workspace
- segmented navigation or tabs for:
  - Bookmarks
  - Likes
- list/grid of saved records
- enough metadata to identify the record quickly
- access back to the public record detail

Optional but useful:
- empty state for each tab
- subtle filtering or sorting if it fits

## Data Shown Per Record

For cards/items on `My Library`, likely enough:
- title
- writer
- published date
- source type
- key tags

No need to show full record metadata management controls here.

This screen is for reading collections, not editing.

## Design Direction

Keep aligned with the existing product:
- warm editorial palette
- serif-forward typography
- soft borders
- elegant spacing
- quiet atmosphere

But let `My Library` feel slightly more personal/intimate than the author workspace.

Avoid:
- dashboard analytics
- social feed layouts
- cluttered card controls
- noisy engagement UI

Prefer:
- personal shelf / saved reading desk
- calm collection browsing
- soft distinction between bookmark and like

## UX Priorities

- quick recognition of saved items
- clear difference between bookmarks and likes
- pleasant re-entry into saved reading
- mobile usability without crowding

## Output Expectation

Produce desktop and mobile designs for:
- public record detail reaction area
- separate `My Library` screen

The output should make bookmark / like feel like a meaningful extension of the product, not a bolted-on social feature.

## Tone

- reflective
- quiet
- personal
- literary
- modern
- understated
