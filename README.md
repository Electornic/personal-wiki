# Personal Wiki

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-149eca.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6.svg)](https://www.typescriptlang.org/)
[![Supabase JS](https://img.shields.io/badge/Supabase_JS-2.99.0-3ecf8e.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.1-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0.18-729b1b.svg)](https://vitest.dev/)

개인 도서관형 personal wiki를 위한 Next.js + Supabase 프로젝트입니다.

핵심 목표는 `문서 하나를 읽다가 연관된 다음 문서로 자연스럽게 이동하는 경험`을 만드는 것입니다.

## What This Is

- 공개 문서는 로그인 없이 읽을 수 있습니다.
- 로그인 사용자는 자신의 record를 작성, 수정, 삭제할 수 있습니다.
- 문서 타입은 현재 `book` / `article` 두 가지입니다.
- 추천은 shared topic / tag 기준으로 동작합니다.
- 각 record의 중심은 원문 요약보다 `읽고 난 뒤 남은 connected thoughts`입니다.

## What This Is Not

- 범용 노트 앱
- reader 계정이 필수인 서비스
- 임베딩 기반 추천 제품
- 여러 문서 타입을 동시에 깊게 다루는 아카이브

## Current Implemented Scope

현재 구현된 범위:

- public library home `/`
- public record detail `/library/[slug]`
- topic hub `/topics/[topic]`
- author sign-in `/author/sign-in`
- author workspace `/author`
- author record create/edit `/author/documents/new`, `/author/documents/[documentId]`
- public record bookmark / like reactions
- bookmark 중심 `My Library` `/me/library`
- public comments / replies
- public reading PWA foundation
- Vercel Analytics on public reading routes
- loading states, reading flow, recommendation explanation 개선
- Supabase SQL migrations
- Vitest 기반 유틸 테스트

## Product Rules

- private 문서는 public surface의 목록, 추천, 상세 어디에서도 노출되면 안 됩니다.
- `My Library`는 bookmark 전용 저장 목록입니다.
- like는 public record 전용 반응이며 공개 count 신호로만 사용합니다.
- private record에서는 bookmark / like를 제공하지 않습니다.
- 추천은 shared topic 수를 우선하고, 같은 점수에서는 더 최근 문서를 먼저 보여줍니다.
- PWA 캐시는 public reading route 중심으로만 적용하고, `author` / `auth` / `me` 경로는 캐시 대상에서 제외합니다.

## Current Content Contract

현재 record 입력 계약은 아래 기준에 가깝습니다.

- `title`
- `contents` markdown
- `sourceType` (`book` | `article`)
- `bookTitle` (`book`일 때)
- `visibility` (`public` | `private`)
- `tags`

주의:

- public page에 보이는 `writerName`은 현재 로그인한 profile 이름 기준입니다.
- article의 원문 저자, source URL, publication 같은 출처 메타는 현재 핵심 입력 계약에 포함되어 있지 않습니다.
- 실데이터를 많이 넣기 전에는 tag naming과 markdown 구조를 먼저 고정하는 편이 좋습니다.

## Stack

- Next.js App Router
- React 19
- Supabase SSR / Supabase JS
- Vercel Analytics
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

## Local Development

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

Supabase public env가 없으면 public surface는 `demoDocuments`로 동작합니다.
public env가 있는데 조회가 실패하면 demo로 숨기지 않고 빈 상태로 남겨야 합니다.

PWA 메모:

- development에서는 service worker를 자동 등록하지 않습니다.
- production build 기준으로만 service worker를 등록합니다.
- offline fallback은 public reading route 중심으로 동작합니다.

## Supabase Setup

1. Supabase 프로젝트를 생성합니다.
2. [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)를 기준으로 SQL migration 16개를 순서대로 실행합니다.
3. Authentication에서 Email/Password 로그인을 활성화합니다.
4. Redirect URL에 `http://localhost:3000/auth/callback`을 추가합니다.
5. 위 환경변수를 `.env.local`에 채웁니다.
6. auth refresh를 안정적으로 처리하려면 Next.js `proxy.ts`가 활성화된 상태로 실행합니다.

현재 migration 기준 메모:

- Step 7: public record bookmark / like / my library
- Step 9: author workspace 목록 / edit 진입 query 개선
- Step 10: v0.5 curation shelf 제거
- Step 11~14: runtime record schema hardening
- Step 15: public record comments only
- Step 16: public record reactions only

## Working With Data

실데이터를 넣기 전에는 아래 규칙을 먼저 정하는 편이 좋습니다.

- article title을 원문 제목으로 둘지, 내 노트 제목으로 둘지
- tag 표기 규칙을 어떻게 통일할지
- `contents` markdown 구조를 어떤 템플릿으로 유지할지
- 초안은 `private`, 검수 후 `public`로 전환할지

권장 순서:

1. 입력 규칙 정리
2. 샘플 5~10개 수기 입력
3. 흐름 검토
4. 필요하면 import script 검토

## PWA Scope

현재 PWA 범위는 `public reading` 중심입니다.

- installable manifest
- exported app icons
- service worker registration
- public route cache for `/`, `/library/[slug]`, `/topics/[topic]`, `/offline`
- offline fallback page

현재 범위 밖:

- author workspace 오프라인 편집
- push notification
- background sync
- private/auth route offline cache

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
- 기본 흐름은 `task branch -> PR -> main merge -> dist deploy` 입니다.
- 배포용 태그 규칙은 기본적으로 `VX.Y.Z_MajorTopic`를 사용합니다.
  예: `V0.4.0_Design_Speed_Reading_Flow`
- 새 릴리즈 버전 작업을 시작하거나, 최소한 `dist`에 올리기 전에는 [package.json](/Users/leejun/Desktop/Projects/personal-wiki/package.json)의 `version`을 원하는 릴리즈 버전으로 올립니다.
- `dist`에 push되면 GitHub Actions가 `package.json`의 `version`과 관련 작업 주제를 읽고, 같은 태그가 없을 때만 해당 버전의 git tag와 GitHub Release를 자동 생성합니다.
- 브랜치 이름이 `V0_5_3_Major_Topic`처럼 세 자리 버전을 포함해도 release topic에서 버전 숫자가 다시 남지 않도록 workflow가 정규화합니다.

## Project Structure

```text
app/
  page.tsx                     public library home
  library/[slug]/page.tsx      public reading page
  library/[slug]/_components/  record detail route-only sections
  author/page.tsx              authenticated workspace
  author/sign-in/page.tsx      signup / login
  author/actions.ts            signup/login/save/delete/sign-out actions
  auth/callback/route.ts       Supabase auth callback
  topics/[topic]/_lib/         topic route-only helpers
components/
  author-document-form.tsx
  comment-form.tsx
  my-library-card.tsx
  note-card-list.tsx
  record-reactions.tsx
entities/
  comment/
  record/
  reaction/
  tag/
lib/
  wiki/
shared/
  api/supabase/
  config/env.ts
supabase/migrations/
tests/
```

- route 전용 조립 코드는 `app/**/_components`, `app/**/_lib`에 colocate합니다.
- 공용 도메인 로직과 UI는 `entities`, 인프라 설정은 `shared`로 둡니다.

## Related Docs

- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)
- [.omx/specs/deep-interview-personal-wiki-foundation.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/specs/deep-interview-personal-wiki-foundation.md)
- [.omx/plans/personal-wiki-mvp-ralplan.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/plans/personal-wiki-mvp-ralplan.md)
