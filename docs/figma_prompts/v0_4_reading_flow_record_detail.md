# v0.4 Reading Flow Record Detail

## Prompt

Design the `Personal Wiki` v0.4 reading flow upgrade for the public record detail page.

This is not a full redesign from scratch.
It is a reading-flow-focused refinement on top of the existing warm, editorial `Personal Wiki` visual language.

## Product Context

The product is a personal library / reading journal, not a generic productivity app.

Current foundation already exists:
- public users can read public records
- authenticated users can write, edit, and manage records
- each record detail page already includes title, writer, published date, tags, markdown-rendered content, related reading, reactions, and comments

For v0.4, the goal is to improve what happens after someone starts or finishes reading a record:
- make the next reading action feel clearer
- make related reading feel more intentional
- keep comments secondary to the reading journey

This prompt is specifically about the public record detail page.
Do not redesign the entire app.

## Main v0.4 Goals For This Prompt

### A. Improve reading continuation

Current problems:
- after reading the main content, the next action is not strong enough
- related reading exists, but it does not yet feel like a confident continuation of the reading experience
- the page does not clearly guide the reader toward another record

Design goals:
- make it clearer what to read next
- make the transition from current record to related records feel natural
- help the user understand why a related record is being recommended
- introduce a stronger sense of reading progression without turning the page into a feed or dashboard

### B. Clarify related reading structure

Current problems:
- related reading cards are functional but not yet expressive enough
- recommendation logic is based on shared tags/topics, but that reason is not visible
- empty state is technically acceptable but not design-complete

Design goals:
- design a better `Related Reading` section
- show lightweight recommendation reasons such as:
  - shared tags
  - same topic
  - similar reading path language
- improve hierarchy inside each related record item
- make the empty state feel intentional rather than unfinished

Important:
- recommendation remains tag/topic based in v0.4
- recommendation must not imply complex ranking or AI summarization
- private records must never be exposed through the design

### C. Keep the page reading-first

Current problems:
- if related reading or comments become too visually loud, the page can lose its reading-first tone

Design goals:
- preserve a calm, literary, editorial feel
- keep longform content as the main focus
- make comments feel secondary to reading continuation
- avoid turning the lower part of the page into a social product pattern

## Surface To Design

### Public record detail page

Include:
- back-to-library affordance
- title
- writer
- published date
- tags
- markdown-rendered longform content
- reactions section
- related reading section
- comments section

## Reading Flow Requirements

The design should explore how to improve:
- the transition from content to related reading
- the hierarchy between `Related Reading` and `Comments`
- recommendation explanation labels
- next-action cues such as:
  - `Continue Reading`
  - `Read Next`
  - `Related by Topic`
- an empty state when there are no strong related records

The section should feel like:
- a natural continuation of reflective reading
- not an e-commerce recommendation rail
- not a social engagement trap
- not a content feed

## What To Decide In Design

Please propose design decisions for:
- where the `Related Reading` section should sit relative to reactions and comments
- whether recommendation reasons appear as pills, sublabels, or supporting metadata
- how many related records should feel appropriate in the default state
- how strong the next-step CTA should be
- how the empty state should guide the reader without feeling pushy

## Design Direction

Keep and reinforce:
- warm paper-like palette
- serif-forward editorial typography
- quiet spacing rhythm
- subtle borders and low-noise surfaces
- literary, calm, confident tone

Avoid:
- dashboard-like recommendation modules
- social-media engagement styling
- heavy cards with loud badges everywhere
- overly algorithmic wording
- dense UI that competes with the body text

## Output Expectation

Produce desktop and mobile designs for:
- the public record detail page with improved reading flow

The output should make v0.4 feel like:
- the same product as before
- but noticeably better at guiding one reading session into the next

## Tone

- thoughtful
- literary
- warm
- modern
- calm
- precise
