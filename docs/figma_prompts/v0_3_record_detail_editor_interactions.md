# v0.3 Record Detail And Editor Interactions

## Prompt

Design the `Personal Wiki` v0.3 interaction upgrade for two connected surfaces:

1. Public record detail page
2. Authenticated record editor page

This is not a full redesign from scratch.
It is an interaction-focused refinement on top of the existing warm, editorial `Personal Wiki` v0.2 visual language.

## Product Context

The product is a personal library / reading journal, not a generic productivity app.

Current foundation already exists:
- public users can read public records
- authenticated users can create and edit records
- comments and replies exist
- records are centered on title, contents, source type, optional book title, visibility, and tags

For v0.3, the goal is to improve the feeling of:
- reading
- commenting
- replying
- writing

without changing the overall quiet, literary visual system.

## Main v0.3 Goals For This Prompt

### A. Comment interaction upgrade on record detail

Current problems:
- top-level comment textarea feels too heavy from the start
- reply UI is too visually large
- replies are always too structurally loud in the reading flow

Design goals:
- top-level comment input should initially feel closer to a text input shell than a large textarea
- on hover, focus, or click, the input should expand smoothly and gain more breathing room
- reply input should not always be open
- each comment should have a visible but lightweight `Reply` action
- clicking `Reply` reveals a smaller inline reply input
- reply input should feel lighter and less dominant than the top-level comment input

Important:
- comments must still feel secondary to reading
- the detail page should stay reading-first
- reply depth should remain visually understandable without becoming noisy

### B. Improved markdown editor

Locked product decision:
- v0.3 does **not** move to rich text
- v0.3 keeps `improved markdown`

Current problems:
- writing experience feels rough
- preview interaction is not satisfying enough
- `Markdown supported` helper copy feels weak and not product-level

Design goals:
- keep markdown as the authoring model
- make the editor feel like a writing tool, not a raw textarea
- introduce a lightweight formatting toolbar or insertion controls
- improve the write / preview flow
- remove the need for obvious “Markdown supported” explanatory text as a crutch
- make the content area feel more intentional, spacious, and writer-friendly

The editor should support:
- headings
- bold / italic
- blockquotes
- lists
- links if useful

But it should still look minimal and calm, not like a complex CMS.

## Surfaces To Design

### 1. Public record detail

Include:
- record title
- writer
- published date
- tags
- markdown-rendered longform content
- related reading section
- comments section

Comment-specific requirements:
- collapsed top-level comment input shell
- expanded interaction state
- visible `Reply` action on comments
- inline reply composer reveal state
- mobile version should still feel compact and elegant

### 2. Authenticated editor

Include:
- title
- source type
- optional book title for book records
- tags
- visibility
- content editor
- write / preview mode
- formatting affordances for improved markdown

Editor-specific requirements:
- markdown remains the underlying model
- no rich text toolbar overload
- no enterprise CMS styling
- formatting controls should feel minimal, quiet, and useful

## Design Direction

Keep and reinforce:
- warm paper-like palette
- serif-forward editorial typography
- subtle borders and soft surfaces
- quiet, confident interface tone

Avoid:
- generic SaaS admin layout
- heavy dark mode concepts
- complex multicolumn editor chrome
- obvious “developer tool” feeling
- over-designed social-comment styling

## Output Expectation

Produce desktop and mobile designs for:
- public record detail with upgraded comments
- authenticated editor with improved markdown interaction

The result should make v0.3 feel like:
- the same product as v0.2
- but noticeably more mature in reading and writing interactions

## Tone

- thoughtful
- literary
- warm
- modern
- calm
- precise
