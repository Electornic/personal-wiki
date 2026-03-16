# v0.5 Discovery, Hub, And Curation

## Prompt

Design the `Personal Wiki` v0.5 discovery and curation upgrade.

This is not a full redesign from scratch.
It is an information-architecture and exploration-focused refinement on top of the existing warm, editorial `Personal Wiki` visual language.

This prompt covers:
1. Discovery controls for library surfaces
2. Topic hub page
3. Related reading card upgrade
4. Curation shelf surface

## Product Context

The product already supports:
- public reading
- authenticated writing/editing
- comments and replies
- bookmark / like reactions
- `My Library`
- related reading on record detail

Current product direction:
- reading-first
- literary and editorial, not dashboard-like
- recommendations are still based on shared tags/topics
- private records must never leak through public surfaces

For v0.5, the goal is to make it easier to:
- find what to read
- understand why a record is related
- explore one topic more deeply
- revisit author-curated reading paths

## Main v0.5 Goals For This Prompt

### A. Discovery controls

Current problems:
- library and `My Library` are still weak on active exploration controls
- there is no strong filter/sort/search layer
- readers can browse, but narrowing and re-finding records is still limited

Design goals:
- introduce tag filter controls
- introduce sort controls
- introduce simple search UI
- keep the controls calm and editorial, not like a noisy data table toolbar
- support both public library and `My Library`

Important:
- the product should still feel reading-first
- controls should aid exploration, not make the app feel like admin software

### B. Topic hub page

Current problems:
- clicking a tag is not yet a deep exploration experience
- the product lacks a strong page for going deeper into one theme or topic

Design goals:
- create a dedicated topic hub page
- show records connected to one topic/tag
- allow the page to feel like a curated shelf or thematic reading table, not just a raw filtered list
- optionally include a representative memo, quote, or highlighted record for the topic

Important:
- this page should feel like a discovery hub
- it should encourage onward reading without becoming an algorithmic feed

### C. Related reading card memo preview

Current problems:
- related reading is structurally better than before, but cards are still title-heavy
- recommendation reasons exist conceptually, but the section could feel more readable and persuasive

Design goals:
- show a short memo/thought preview inside related reading cards
- clarify recommendation reason with lightweight supporting metadata
- make related records feel like meaningful continuations of reading

Important:
- previews must remain compact
- the lower part of the record page should not become visually crowded

### D. Curation shelf

Current problems:
- the product has automatic recommendation, but not enough author-shaped curation
- there is no simple shelf-like structure for “start here”, “read together”, or “return to this”

Design goals:
- introduce a curation shelf surface
- support shelf concepts like:
  - intro reading
  - read together
  - this month’s revisits
- define where shelves can appear most naturally:
  - library home
  - topic hub
  - record detail

Important:
- curation shelf should feel human and intentional
- it should complement automatic recommendation rather than replace it

## Surfaces To Design

### 1. Public library discovery controls

Include:
- tag filter UI
- sort controls
- simple search input
- list/grid of records after filtering

The page should still feel like a library, not a search console.

### 2. My Library discovery controls

Include:
- tag filter
- sort controls
- simple search
- compatibility with bookmarks / likes browsing

This should feel slightly more personal than the public library, but still part of the same product.

### 3. Topic hub page

Include:
- topic title
- short intro/context area
- connected records
- optional highlighted memo / representative note
- optional curation shelf section

### 4. Public record detail related reading cards

Include:
- title
- recommendation reason
- compact memo/thought preview
- enough structure to invite the next click

### 5. Curation shelf module

Include:
- shelf title
- optional shelf description
- ordered records
- enough metadata for quick recognition

## Data Shown Per Record

Likely enough:
- title
- writer
- published date
- source type
- tags
- short memo preview when context calls for it

Do not overload every surface with full metadata.

## Design Direction

Keep and reinforce:
- warm paper-like palette
- serif-forward editorial typography
- quiet spacing rhythm
- subtle borders and low-noise surfaces
- calm, reflective product tone

Avoid:
- dashboard filter bars
- dense chip overload
- giant search-console layouts
- social-feed recommendation styling
- e-commerce recommendation rail patterns

Prefer:
- discovery as browsing
- thematic reading tables
- calm navigation aids
- light but expressive structure

## UX Priorities

- fast topic-based exploration
- calm filtering and re-finding
- stronger “read next” clarity
- clear distinction between automatic recommendation and manual curation
- desktop and mobile usability

## What To Decide In Design

Please propose design decisions for:
- how visible filter/sort/search controls should be by default
- whether tag filtering should feel like pills, a drawer, or a compact panel
- how the topic hub differs from a filtered library result
- how memo previews appear without making cards too tall
- where curation shelves belong first in the product
- whether curation shelves should feel more like lists, cards, or reading trays

## Output Expectation

Produce desktop and mobile designs for:
- public library with discovery controls
- `My Library` with discovery controls
- topic hub page
- public record detail related reading card upgrade
- curation shelf module

The output should make v0.5 feel like:
- the same product as before
- but noticeably stronger at helping one record lead into a wider reading path

## Tone

- thoughtful
- literary
- warm
- modern
- calm
- precise
