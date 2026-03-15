# Personal Wiki

개인 도서관형 위키를 위한 Next.js + Supabase MVP입니다.

핵심 방향:

- 공개 문서는 로그인 없이 읽습니다.
- 로그인 사용자가 문서를 작성/수정/삭제합니다.
- 문서 타입은 v1에서 `책/아티클 기록`만 지원합니다.
- 추천은 같은 주제/태그를 기준으로 동작합니다.
- v0.2에서는 문서의 중심을 `markdown contents`로 단순화하는 방향으로 이동 중입니다.

## Current Shape

현재 구현된 범위:

- public library 홈 `/`
- public document detail `/library/[slug]`
- author sign-in `/author/sign-in`
- author workspace `/author`
- author document create/edit `/author/documents/new`, `/author/documents/[documentId]`
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
  public reading + SSR auth 세션에 필요합니다.
- `SUPABASE_SERVICE_ROLE_KEY`
  signup/login 후 profile bootstrap과 protected server actions 보조에 사용됩니다.
- `SUPABASE_AUTH_REDIRECT_URL`
  auth callback URL입니다.

## Supabase Setup

1. Supabase 프로젝트를 생성합니다.
2. [supabase/migrations/20260310T140000Z_personal_wiki_mvp.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260310T140000Z_personal_wiki_mvp.sql) 내용을 SQL Editor에서 실행합니다.
3. 추가로 [supabase/migrations/20260312T130000Z_v0_2_profiles_auth.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260312T130000Z_v0_2_profiles_auth.sql) 도 실행합니다.
4. 추가로 [supabase/migrations/20260312T150000Z_v0_2_record_model_simplify.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260312T150000Z_v0_2_record_model_simplify.sql) 도 실행합니다.
5. 추가로 [supabase/migrations/20260312T170000Z_v0_2_record_comments.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260312T170000Z_v0_2_record_comments.sql) 도 실행합니다.
6. Authentication에서 Email/Password 로그인을 활성화합니다.
7. Redirect URL에 `http://localhost:3000/auth/callback`을 추가합니다.
8. 위 환경변수를 `.env.local`에 채웁니다.

주의:

- public surface에서는 private 문서가 목록/추천/상세 어디에서도 드러나면 안 됩니다.
- 로그인 사용자는 signup/login 이후 `profiles` row를 가져야 protected write가 정상 동작합니다.
- callback의 `next` 파라미터는 로컬 상대 경로만 허용합니다.
- record editor는 v0.2에서 `title / contents / source type / book title / visibility / tags` 중심으로 단순화됩니다.
- comments는 public record에서 읽을 수 있고, 작성은 로그인 사용자만 가능합니다.

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
- `dist`에 push되면 GitHub Actions가 `package.json`의 `version`과 관련 작업 주제를 읽고,
  같은 태그가 없을 때만 해당 버전의 git tag와 GitHub Release를 자동 생성합니다.
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
  document-card.tsx
  note-card-list.tsx
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
