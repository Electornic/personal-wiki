# v0.2 Author Workspace Record Management

## Prompt

Design a dedicated authenticated workspace screen for the `Personal Wiki` v0.2 product.

This screen is not a dashboard for metrics or administration.
It should feel like a calm editorial workspace for managing personal records that will later be read publicly.

The product context:
- public users can read public records without logging in
- authenticated users can create, edit, delete, and manage their own records
- records are centered on writing and reading, not metadata-heavy knowledge management
- the overall product tone is literary, warm, quiet, and reading-first

This prompt is specifically for the `author workspace` screen, not the public home, record detail, auth screen, or editor screen.

## What This Screen Needs To Do

The workspace should let a logged-in user:
- understand who is signed in
- quickly create a new record
- scan their existing records
- distinguish `public` and `private` records
- open a record for editing
- preview the public version of a record
- delete a record

## Data Shown Per Record

Each record currently has:
- title
- contents
- source type (`article` or `book`)
- optional book title when source type is `book`
- visibility (`public` or `private`)
- published date
- writer name from the logged-in profile
- tags

The workspace does not need to expose every field at full detail.
It should show only the minimum information needed to manage records effectively.

## Screen Requirements

Design one coherent workspace screen with:
1. Header / intro area
   - clear title for the workspace
   - lightweight signed-in identity display
   - primary action to create a new record
   - sign out action

2. Record list / collection area
   - each item should clearly show title
   - visibility should be obvious
   - source type should be visible but secondary
   - optional book title can appear when helpful
   - actions should include:
     - preview
     - edit
     - delete

3. Empty state
   - if no records exist yet, the workspace should still feel intentional
   - should encourage creating the first record

## Design Direction

The workspace should still feel like part of the same product as:
- public home
- public record detail
- sign in / sign up
- editor

But this screen can be slightly more utilitarian than the public reading surfaces.

Visual direction:
- warm, paper-like palette
- refined serif-forward typography
- soft borders and subtle surfaces
- no enterprise dashboard feel
- no analytics widgets
- no heavy side navigation
- no dense tables as the dominant layout unless handled very elegantly

## UX Priorities

- fast scanning
- low visual noise
- clear status visibility
- obvious next actions
- works well on both desktop and mobile

## Style Guardrails

Avoid:
- generic SaaS dashboard aesthetics
- dark-mode-first concepts
- complicated management panels
- large admin sidebars
- overly playful consumer-social patterns

Prefer:
- editorial workspace
- elegant list or card-based management
- balanced hierarchy
- soft controls
- strong spacing rhythm

## Output Expectation

Produce desktop and mobile designs for the authenticated `author workspace` screen.

The result should feel like:
- a writer's quiet management desk
- still aligned with the reading-first product identity
- practical enough for everyday content management
