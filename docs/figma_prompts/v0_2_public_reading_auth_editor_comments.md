# v0.2 Public Reading, Auth, Editor, Comments

## Prompt

Design a web product UI for a "Personal Wiki" v0.2.

This is not a generic productivity app or admin dashboard.
It should feel like a personal library and reading space first, with social/auth features layered in carefully.

Core product goals:
- public users can read records without logging in
- logged-in users can sign up, log in, write records, and leave comments
- records are simplified and centered on writing/reading, not metadata management
- related record discovery still exists through tags

Target surfaces to design:
1. Public home / library index
2. Public record detail page
3. Sign up / log in page
4. Authenticated record editor page
5. Comment section on record detail

Product constraints:
- record fields in v0.2:
  - title
  - contents (markdown-oriented writing experience)
  - source type (`article` or `book`)
  - book title only when source type is `book`
  - visibility (`public` or `private`)
  - published date is system-managed
  - writer comes from logged-in user profile
- comments:
  - readable on public records without login
  - writing comments requires login
  - replies are supported
- recommendation:
  - keep related-record recommendation
  - keep explicit tags in the editor

Design direction:
- reading-first, editorial, quiet, intentional
- should feel more like an independent reading journal / library than a SaaS admin tool
- avoid enterprise dashboard patterns
- avoid heavy tables and boxy settings screens as the dominant visual language
- support desktop and mobile cleanly

Desired visual qualities:
- strong typographic hierarchy
- warm, tactile, paper-like atmosphere
- elegant spacing and rhythm
- minimal but expressive controls
- comments should feel integrated into reading, not bolted on
- editor should feel like writing, not form-filling

Do not prioritize:
- analytics dashboards
- complex management sidebars
- multi-panel CMS layouts
- feature overload

Specific guidance per screen:

### 1. Public home
- showcase the library feeling
- highlight recent/public records
- tags can appear as discovery cues
- should invite browsing and reading

### 2. Public record detail
- make longform reading comfortable
- title, writer, source type, optional book title, tags, and body should read clearly
- related records should feel like a natural continuation of reading
- comments should sit below the reading experience without visually overpowering it

### 3. Sign up / log in
- simple, clean, calm
- not corporate or generic
- sign up and log in can be on the same page if designed clearly

### 4. Record editor
- should feel like a writing studio
- markdown-oriented writing area should be visually central
- metadata inputs should stay lightweight
- tags should remain editable but not dominate the page

### 5. Comments
- readable for everyone on public records
- replies should be visually clear
- hierarchy should be visible without becoming visually noisy
- should preserve the reading-first tone

Output expectation:
- create a coherent design system direction for all five surfaces
- make the design feel like one product, not five separate mockups
- prioritize usability and atmosphere equally

Style guardrails:
- no default SaaS blue/white dashboard aesthetic
- no purple-heavy AI startup look
- no overly playful social app style
- no dark-mode-first concept unless there is a strong reason

Tone:
- thoughtful
- literary
- modern
- warm
- quiet but confident
