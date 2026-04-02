# CLAUDE.md

## Project Overview

개인 도서관형 Personal Wiki. 문서 하나를 읽다가 연관 지식으로 자연스럽게 이동하는 경험이 핵심.
생산성 툴이나 범용 노트 앱으로 확장하지 않는다.

## Tech Stack

- **Frontend**: Next.js App Router
- **Backend/DB**: Supabase (Auth 포함)
- **Package Manager**: pnpm
- **Test**: Vitest

## Commands

- `pnpm lint` — ESLint
- `pnpm exec tsc --noEmit` — 타입 체크
- `pnpm test` — Vitest 테스트
- `pnpm build` — 프로덕션 빌드

## Product Rules

- 문서 타입: `book` / `article` 두 가지만
- 각 문서는 `public` 또는 `private` visibility
- 공개 문서는 로그인 없이 읽을 수 있어야 함
- 인증은 작성/수정용이며 public reading에 reader 로그인 불필요
- multi-user publishing product로 확장하지 않음
- 문서 핵심 가치: 원문 요약보다 읽고 난 뒤 연결된 생각
- 문서 내부 생각 단위: 카드/불릿 메모 중심
- 추천 기준은 같은 주제/태그 (임베딩/행동 데이터/복잡 랭킹 제외)
- public reader 기준 추천/목록/검색에서 private 문서 존재가 드러나면 안 됨
- 추천이 비면 억지 결과 없이 명확한 empty state

## Architecture

- 프로젝트 구조: colocation + minimal FSD
- route 전용 코드: `app/**/_components`, `app/**/_lib`에 colocate
- 재사용 도메인 로직/UI: `entities`로 올림
- 공용 인프라: `shared`에 배치
- 불필요한 레이어(`widgets`, `features` 등) 미리 만들지 않음
- 권한 제어는 UI뿐 아니라 데이터 레이어에서도 강제
- public reading 흐름과 authoring 흐름 라우트 분리

## Coding Standards

- 최소 변경 원칙
- 불필요한 리팩터링, 대규모 포맷 변경, 파일 이동 금지
- auth/visibility/recommendation 변경 시 public/private 누출 가능성 먼저 점검
- 중첩 삼항연산자 금지, 삼항연산자는 한 표현식에서 최대 1~2단까지

## Git Workflow

- 새 태스크 시작 시 전용 브랜치 생성
- 브랜치명: `V0_[Minor]_[Patch]_[Major_Topic]`
- 아이디어 브랜치: `idea/YYYY_MM_DD`
- 적당한 단위로 관련 파일만 선택적 `git add`, 작은 단위 커밋
- 흐름: task branch → PR → main merge → dist deploy
- 배포: PR merge → local main sync → task branch delete → dist를 main commit으로 맞춤 → dist push
- 배포 브랜치: `dist`, 태그: `VX.Y.Z_MajorTopic`
- 새 릴리즈 시 `package.json` version 갱신
- GitHub 작업은 `gh` CLI 우선

## Verification

코드 변경 시 아래 순서로 검증:
1. `pnpm lint`
2. `pnpm exec tsc --noEmit`
3. `pnpm test`
4. `pnpm build`

문서/주석 전용 변경이면 build/test 생략 가능하나 생략 이유 명시.

## Docs

- 제품 정의 관련 변경 시 기준 문서 먼저 확인:
  - `.omx/specs/deep-interview-personal-wiki-foundation.md`
  - `.omx/plans/personal-wiki-mvp-ralplan.md`
- 아키텍처/환경변수/인증/데이터 모델/사용자 플로우 변경 시 관련 문서 함께 갱신
- 새 SQL migration 시 `SETUP_GUIDE.md` 갱신
- `docs/task` → `docs/task/TEMPLATE.md` 기준, 파일명 `v0_[minor]_[patch]_[major-topic].md`
- `docs/figma_prompts` → 파일명 `v0_[minor]_[patch]_[major-topic].md`
- `docs/test_guide` → `docs/test_guide/TEMPLATE.md` 기준, 동일 파일명 형식
- `docs/idea` → `docs/idea/TEMPLATE.md` 기준, 파일명 `YYYY_MM_DD_NN_Idea.md`
- PR 전에 해당 범위의 test_guide 존재 확인
- PR 작성 시 `.github/pull_request_template.md` 템플릿 사용

## Scope Guardrails

### Must Not Have
- reader 계정 필수 플로우
- 블록 단위 권한
- 여러 문서 타입 동시 지원
- 임베딩 기반 추천
- 관리자 기능이 제품 경험을 덮는 UI
