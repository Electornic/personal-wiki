# Personal Wiki v0.2 Schema Lock And Migration

## Goal

Lock the v0.2 database shape before implementation so auth, records, comments, and recommendation behavior can be changed without drifting requirements mid-build.

## Locked Inputs

- auth login id: `email`
- record `contents`: `markdown`
- comments: replies allowed, max depth `5`
- recommendations: explicit `tags` retained in v0.2

## v0.2 Data Model

### 1. Profiles

Purpose:
- user-facing identity for all registered members
- replaces the current author-only profile assumption

Suggested table:

```sql
profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  user_name text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
)
```

Notes:
- `email` remains the login id
- `user_name` is the public-facing writer/comment display value

### 2. Records

Purpose:
- simplified replacement for `documents`
- remove v0.1 metadata-heavy shape

Suggested table:

```sql
records (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  contents text not null,
  source_type text not null check (source_type in ('article', 'book')),
  book_title text,
  visibility text not null check (visibility in ('public', 'private')),
  published_at timestamptz not null default timezone('utc', now()),
  writer_user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (source_type = 'book' and book_title is not null)
    or (source_type = 'article' and book_title is null)
  )
)
```

Notes:
- `published_at` should be system-managed on create
- `writer_user_id` is the single source of authorship
- `writer user_name` should be joined from `profiles`, not duplicated into the record row unless denormalization becomes necessary later

### 3. Record Tags

Purpose:
- preserve recommendation input model in v0.2

Suggested tables:

```sql
tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
)

record_tags (
  record_id uuid not null references records(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (record_id, tag_id)
)
```

Notes:
- this is the v0.2 replacement for `topics` / `document_topics`
- recommendation ranking can keep using overlap count + recency tie-breaker

### 4. Record Comments

Purpose:
- comments by authenticated users with reply support

Suggested table:

```sql
record_comments (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references records(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  parent_comment_id uuid references record_comments(id) on delete cascade,
  depth integer not null default 0 check (depth >= 0 and depth <= 5),
  contents text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
)
```

Rules:
- top-level comment: `parent_comment_id is null`, `depth = 0`
- replies increment depth from parent
- max reply depth is `5`

## RLS Direction

### Profiles

- authenticated user can read/update self
- public surfaces should only expose `user_name` through joined record/comment queries, not broad profile listing

### Records

- anyone can read `public` records
- authenticated owner can read/write own `private` and `public` records
- non-owners cannot read private records

### Tags / Record Tags

- public can only read tags linked to visible public records
- authenticated owners can manage tags on their own records

### Comments

- public can read comments only when parent record is public
- authenticated users can create comments on public records
- authenticated users can manage their own comments
- private record comments must not leak through public queries

## API / UI Implications

### Signup/Login

- replace owner magic-link flow with general email + password auth
- add `profiles` bootstrap on signup
- derive current `writer` from the session user profile

### Record Editor

- editor fields become:
  - title
  - contents (markdown)
  - source type
  - book title when source type = book
  - visibility
  - tags
- remove:
  - source title
  - author name
  - source url
  - isbn
  - free-form published-at input

### Public Record Page

- render markdown safely
- show writer via joined profile
- show comments below record content
- keep related-record recommendation module backed by tags

## Migration Strategy From v0.1

### Existing v0.1 -> v0.2 mapping

- `author_profiles` -> `profiles`
- `documents` -> `records`
- `topics` -> `tags`
- `document_topics` -> `record_tags`
- `document_note_cards` -> merged into `records.contents`

### Migration assumptions

1. `documents.title` -> `records.title`
2. `documents.source_type` -> `records.source_type`
3. `documents.visibility` -> `records.visibility`
4. `documents.created_by` -> `records.writer_user_id`
5. `documents.created_at` / `updated_at` carry over
6. `documents.published_at` can be retained when present, otherwise backfill with `created_at`
7. `documents.intro` + ordered `document_note_cards` should be merged into markdown

### Proposed markdown migration shape

If a v0.1 document has:
- `intro`
- multiple note cards

then `records.contents` becomes:

```md
{intro}

## {card heading 1}
{card content 1}

## {card heading 2}
{card content 2}
```

Fallback:
- if no heading exists, use a bullet or paragraph block instead of an empty heading

## Implementation Order

1. Add new v0.2 tables in a new migration
2. Add data migration from v0.1 tables
3. Switch app reads to v0.2 tables
4. Switch app writes to v0.2 tables
5. Add comments UI
6. Remove or archive unused v0.1 fields/tables after verification

## Verification Targets

- signup creates both `auth.users` and `profiles`
- login session exposes `user_name`
- record create/edit/delete works with the new schema
- book/article branching works correctly
- tags still power recommendations
- comment creation works for authenticated users only
- reply depth > 5 is blocked
- private records and their comments do not leak publicly

## Open Questions

1. Should public comments be readable without login on public records, or only visible to logged-in users?
2. Should recommendation tags stay visibly editable in the UI, or become a lighter, secondary field in the editor?
