# AGENTS.md

이 문서는 `/Users/leejun/Desktop/Projects/personal-wiki` 전체에 적용되는 레포 전용 작업 지침입니다.

## Project Intent

- 이 프로젝트는 `개인 도서관형 Personal Wiki`를 만든다.
- 잘 만든 상태의 기준은 `문서 하나를 읽다가 연관 지식으로 자연스럽게 이동하는 경험`이다.
- 생산성 툴이나 범용 노트 앱처럼 넓게 가지 않는다.

## Agent Priorities

- 요구사항 충족
- 최소 변경
- 안전성
- 가독성

## Current Product Rules

- 문서 타입은 현재 `book` / `article` 두 가지만 다룬다.
- 각 문서는 `public` 또는 `private` visibility를 가진다.
- 공개 문서는 로그인 없이 읽을 수 있어야 한다.
- 인증은 작성/수정용 기능이며, public reading에는 reader 로그인을 요구하지 않는다.
- 현재 구현에는 signup/login이 있지만 제품 범위는 여전히 `personal wiki` 중심이며, 범용 multi-user publishing product로 확장하지 않는다.
- 문서의 핵심 가치는 `원문 요약`보다 `읽고 난 뒤 연결된 생각`에 둔다.
- 문서 내부 생각 단위는 `카드/불릿 메모` 중심으로 다룬다.

## Recommendation Rules

- 추천은 v1에서 반드시 포함한다.
- v1 추천 기준은 `같은 주제/태그`다.
- 임베딩, 행동 데이터, 복잡한 랭킹 시스템은 v1 범위에서 제외한다.
- public reader 기준의 추천/목록/검색에서는 private 문서의 존재가 드러나면 안 된다.
- 추천이 비어 있을 때는 억지 결과를 보여주지 말고 명확한 empty state를 둔다.

## Technical Direction

- 프론트엔드는 Next.js App Router를 유지한다.
- 데이터베이스/백엔드는 Supabase를 사용한다.
- 인증은 Supabase Auth를 기준으로 설계한다.
- 권한 제어는 UI에서만 숨기지 말고 데이터 레이어에서도 강제한다.
- 라우트는 public reading 흐름과 authoring 흐름을 분리하는 방향을 우선한다.
- 프로젝트 구조는 `colocation + minimal FSD` 방향을 기본값으로 본다.
- route 전용 코드는 `app/**/_components`, `app/**/_lib`에 colocate한다.
- 여러 곳에서 재사용되는 도메인 로직과 UI만 `entities`로 올리고, 공용 인프라는 `shared`에 둔다.
- 아직 필요하지 않은 `widgets`, `features` 같은 레이어는 미리 만들지 않는다.

## Scope Guardrails

### Must Have

- Supabase 연동
- authoring auth
- 문서별 public/private 제어
- 책/아티클 기록 CRUD
- 태그 기반 관련 문서 추천
- 카드/불릿 메모 기반 connected thoughts

### Must Not Have

- reader 계정이 필수인 제품 플로우
- 블록 단위 권한
- 여러 문서 타입 동시 지원
- 임베딩 기반 추천
- 관리자 기능이 제품 경험을 덮는 UI

## Execution Checklist

### Before Starting

- 새 태스크를 시작할 때는 전용 브랜치를 먼저 만든다.
- 새 버전 작업을 시작할 때는 `README.md` 업데이트 필요 여부를 먼저 검토한다.
- 제품 정의와 관련된 변경이면 아래 기준 문서를 먼저 확인한다.
  - `.omx/specs/deep-interview-personal-wiki-foundation.md`
  - `.omx/plans/personal-wiki-mvp-ralplan.md`
- 요청이 모호하고 제품 범위 판단이 필요하면 바로 구현하지 말고 `deep-interview` 또는 `ralplan` 경로를 우선 검토한다.

### While Implementing

- 최소 변경으로 진행한다.
- 불필요한 리팩터링, 대규모 포맷 변경, 파일 이동은 피한다.
- 제품 정의와 충돌하는 아이디어가 나오면 구현 전에 먼저 지적하고 범위를 다시 맞춘다.
- auth / visibility / recommendation을 건드릴 때는 public/private 누출 가능성을 먼저 점검한다.
- 중첩 삼항연산자는 피하고, 삼항연산자는 한 표현식에서 최대 1~2단까지만 사용한다.

### Before PR / Deploy

- 코드 변경 시 가능한 범위에서 아래 순서로 검증한다.
  1. `pnpm lint`
  2. `pnpm exec tsc --noEmit`
  3. `pnpm test`
  4. `pnpm build`
- 문서/주석 전용 변경이면 build/test는 생략할 수 있지만, 생략 이유를 결과에 명시한다.
- PR review 사항을 반영한 뒤에는 해당 review thread에 답글을 달고, resolve 처리까지 진행한다.

## Verification

- 현재 레포의 `pnpm test`는 Vitest 테스트를 실행한다.
- 검증을 생략하거나 실패하면 어떤 명령을 실행했고 어디서 막혔는지 결과에 남긴다.

## Docs

- 아키텍처, 환경변수, 인증 흐름, 데이터 모델, 주요 사용자 플로우가 바뀌면 관련 문서를 함께 갱신한다.
- 새 SQL migration을 만들거나 순서를 바꾸면 `SETUP_GUIDE.md`도 함께 갱신한다.
- `docs/task` 문서는 `docs/task/TEMPLATE.md`를 기준으로 작성한다.
- `docs/task` 파일명은 `v0_[minor]_[patch]_[major-topic].md`처럼 버전과 주제가 함께 드러나야 한다.
- `docs/figma_prompts` 파일명도 `v0_[minor]_[patch]_[major-topic].md` 형식을 따른다.
- `docs/test_guide`는 `docs/test_guide/TEMPLATE.md`를 기준으로 작성하고, 파일명은 `v0_[minor]_[patch]_[major-topic].md` 형식을 따른다.
- 태스크 작업을 마치면 해당 버전의 `docs/test_guide`를 새로 만들거나 기존 가이드를 업데이트한다.
- PR 전에는 이번 작업 범위를 커버하는 `docs/test_guide`가 존재하는지 확인하고, 없으면 먼저 작성한다.
- `docs/idea`는 `docs/idea/TEMPLATE.md`를 기준으로 작성하고, 파일명은 `YYYY_MM_DD_NN_Idea.md` 형식을 유지한다.
- 새 문서나 이름 변경이 있을 때는 파일 내용을 읽고 가장 이해하기 쉬운 주제를 파일명에 반영한다.
- 아이디어는 백로그로 관리하고, 실제 버전 범위는 task / branch / plan 문서에서 확정한다.
- `status`, `notes`, `next-steps`처럼 추상적인 이름보다 실제 주요 작업 주제를 드러내는 이름을 우선한다.
- PR을 만들 때는 `.github/pull_request_template.md` 템플릿을 따른다.

## Git Workflow

- 적당한 작업 단위가 끝날 때마다 변경을 작은 단위로 커밋한다.
- 태스크 브랜치 이름은 `V0_[Minor]_[Patch]_[Major_Topic]`처럼 버전과 주제가 함께 드러나야 한다.
- 아이디어 검토/브레인스토밍용 브랜치는 `idea/YYYY_MM_DD` 형식을 따른다.
- 기본 흐름은 `task branch -> PR -> main merge -> dist deploy` 순서다.
- 기본 배포 절차는 `PR merge -> local main sync -> task branch delete (remote/local) -> dist를 main commit으로 맞춤 -> dist push` 순서로 진행한다.
- 배포용 기준 브랜치는 `dist`다.
- 배포용 태그는 기본적으로 `VX.Y.Z_MajorTopic` 형식을 따른다.
- 새 릴리즈 버전 작업을 시작하거나, 최소한 `dist` 브랜치에 올리기 전에는 `package.json.version`을 해당 릴리즈 버전으로 올린다.
- 브랜치 이름이 `V0_6_4_Major_Topic`처럼 세 자리 버전을 포함해도 release topic에는 버전 숫자가 다시 남지 않도록 정규화된 이름을 사용한다.
- GitHub 관련 작업은 가능하면 `gh` CLI를 우선 사용한다.
