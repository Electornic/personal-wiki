# Personal Wiki

개인 도서관형 위키를 위한 Next.js + Supabase MVP입니다.

## Key Libraries

- `next` / `react` / `react-dom`
  App Router 기반 UI와 서버 렌더링
- `@supabase/ssr` / `@supabase/supabase-js`
  Supabase session, auth, database access
- `react-markdown` / `remark-gfm`
  public record markdown rendering
- `tailwindcss`
  styling system
- `vitest`
  utility-level test runner

핵심 방향:

- 공개 문서는 로그인 없이 읽습니다.
- 로그인 사용자가 문서를 작성/수정/삭제합니다.
- 문서 타입은 v1에서 `책/아티클 기록`만 지원합니다.
- 추천은 같은 주제/태그를 기준으로 동작합니다.
- record의 중심은 `markdown contents`이며, reactions와 reading-flow 개선이 포함된 상태까지 구현돼 있습니다.

## Current Shape

현재 구현된 범위:

- public library 홈 `/`
- public document detail `/library/[slug]`
- author sign-in `/author/sign-in`
- author workspace `/author`
- author document create/edit `/author/documents/new`, `/author/documents/[documentId]`
- bookmark / like reactions
- my library `/me/library`
- topic hub `/topics/[topic]`
- author workspace cleanup and writing support improvements
- loading states, layout alignment, reading flow 개선
- Supabase SQL migrations
- Vitest 기반 유틸 테스트

Supabase public env가 없으면 public surface는 `demoDocuments`로 동작합니다.
public env가 있는데 조회가 실패하면 demo로 숨기지 않고 빈 상태로 남겨야 합니다.

## Stack

- Next.js App Router
- React 19
- Supabase SSR / Supabase JS
- Tailwind CSS v4
- Vitest

## Environment Variables

`.env.example`를 참고해 `.env.local`에 아래 값을 넣습니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
```

설명:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  public reading + browser / SSR auth 세션에 필요합니다.
- `SUPABASE_SERVICE_ROLE_KEY`
  signup/login 후 profile bootstrap과 protected server actions 보조에 사용됩니다.
- `SUPABASE_AUTH_REDIRECT_URL`
  auth callback URL입니다.

## Supabase Setup

1. Supabase 프로젝트를 생성합니다.
2. [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)를 기준으로 SQL migration 12개를 순서대로 실행합니다.
3. Authentication에서 Email/Password 로그인을 활성화합니다.
4. Redirect URL에 `http://localhost:3000/auth/callback`을 추가합니다.
5. 위 환경변수를 `.env.local`에 채웁니다.
6. auth refresh를 안정적으로 처리하려면 Next.js `proxy.ts`가 활성화된 상태로 실행합니다.

주의:

- public surface에서는 private 문서가 목록/추천/상세 어디에서도 드러나면 안 됩니다.
- 로그인 사용자는 signup/login 이후 `profiles` row를 가져야 protected write가 정상 동작합니다.
- callback의 `next` 파라미터는 로컬 상대 경로만 허용합니다.
- session refresh는 request 단계 `proxy.ts`에서 수행합니다.
- header 로그인 상태는 browser client 기준으로 반영됩니다.
- record editor는 `title / contents / source type / book title / visibility / tags` 중심입니다.
- comments는 public record에서 읽을 수 있고, 작성은 로그인 사용자만 가능합니다.
- bookmark / like / my library까지 보려면 `SETUP_GUIDE.md`의 Step 7 migration도 필요합니다.
- author workspace 목록과 edit 진입 속도 개선까지 반영하려면 `SETUP_GUIDE.md`의 Step 9 migration도 실행합니다.
- 이전 v0.5에서 추가했던 curation shelf 스키마는 `SETUP_GUIDE.md`의 Step 10 migration에서 제거됩니다.
- public record listing/query hardening과 `published_at` 기본값 정리까지 반영하려면 `SETUP_GUIDE.md`의 Step 11 migration도 실행합니다.
- `source_title` write dependency 제거까지 반영하려면 `SETUP_GUIDE.md`의 Step 12 migration도 실행합니다.

## Local Development

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## Verification

레포 기준 검증 순서:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

현재 `pnpm test`는 Vitest 유틸 테스트를 실행합니다.

## Release

- 배포 기준 브랜치는 `dist`입니다.
- 배포용 태그 규칙은 기본적으로 `VX.Y.Z_MajorTopic`를 사용합니다.
  예: `V0.4.0_Design_Speed_Reading_Flow`
- 새 릴리즈 버전 작업을 시작하거나, 최소한 `dist`에 올리기 전에는 [package.json](/Users/leejun/Desktop/Projects/personal-wiki/package.json)의 `version`을 원하는 릴리즈 버전으로 올립니다.
- `dist`에 push되면 GitHub Actions가 `package.json`의 `version`과 관련 작업 주제를 읽고,
  같은 태그가 없을 때만 해당 버전의 git tag와 GitHub Release를 자동 생성합니다.
- 브랜치 이름이 `V0_5_3_Major_Topic`처럼 세 자리 버전을 포함해도 release topic에서 버전 숫자가 다시 남지 않도록 workflow가 정규화합니다.
- 자동 릴리스 전 검증 순서는 아래와 같습니다.
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
- 자동 릴리즈 노트에는 직전 릴리즈 이후 포함된 커밋 제목 목록이 함께 정리됩니다.

## Project Structure

```text
app/
  page.tsx                     public library home
  library/[slug]/page.tsx      public reading page
  author/page.tsx              authenticated workspace
  author/sign-in/page.tsx      signup / login
  author/actions.ts            signup/login/save/delete/sign-out actions
  auth/callback/route.ts       Supabase auth callback
components/
  author-document-form.tsx
  comment-form.tsx
  comment-thread.tsx
  document-card.tsx
  my-library-card.tsx
  note-card-list.tsx
  record-reactions.tsx
  topic-pill.tsx
lib/
  env.ts
  supabase/
  wiki/
supabase/migrations/
tests/
```

## Notes

- 현재 추천은 태그 겹침 수 + 최신 수정 시점으로 정렬합니다.
- 임베딩 기반 추천, 다중 문서 타입은 현재 범위 밖입니다.
- markdown rendering은 `react-markdown` + `remark-gfm` 기준입니다.
- v0.2 comments foundation은 `record_comments` 테이블 기준입니다.
- 제품/구현 기준 문서는 아래를 따릅니다.
  - `.omx/specs/deep-interview-personal-wiki-foundation.md`
  - `.omx/plans/personal-wiki-mvp-ralplan.md`
