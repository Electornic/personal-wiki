# AGENTS.md

이 문서는 `/Users/leejun/Desktop/Projects/personal-wiki` 전체에 적용되는 레포 전용 작업 지침입니다.

## Project Intent

- 이 프로젝트는 `개인 도서관형 Personal Wiki`를 만든다.
- 잘 만든 상태의 기준은 `문서 하나를 읽다가 연관 지식으로 자연스럽게 이동하는 경험`이다.
- 생산성 툴이나 범용 노트 앱처럼 넓게 가지 않는다.

## MVP Product Rules

- 문서 타입은 v1에서 `책/아티클 기록`만 지원한다.
- 각 문서는 `public` 또는 `private` 중 하나의 visibility를 가진다.
- 공개 문서는 로그인 없이 읽을 수 있어야 한다.
- 로그인은 `작성/수정`을 위한 author 전용 기능이다.
- v1은 `한 명의 author`만 고려한다.
- 문서의 핵심 가치는 `원문 요약`보다 `읽고 난 뒤 연결된 생각`에 둔다.
- 문서 내부 생각 단위는 `카드/불릿 메모` 중심으로 다룬다.

v0.2 branch note:
- `V0_2_*` 브랜치에서는 위 author-only 가정을 일반 사용자 signup/login 모델로 바꾸는 작업을 진행한다.

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

## Scope Guardrails

### Must Have

- Supabase 연동
- author 로그인
- 문서별 public/private 제어
- 책/아티클 기록 CRUD
- 태그 기반 관련 문서 추천
- 카드/불릿 메모 기반 connected thoughts

### Must Not Have

- reader 계정
- 블록 단위 권한
- 여러 문서 타입 동시 지원
- 임베딩 기반 추천
- 관리자 기능이 제품 경험을 덮는 UI

## Implementation Bias

- 읽기 경험을 우선하고 관리 화면은 최소로 유지한다.
- 초기 구현은 단순하고 설명 가능한 규칙을 선호한다.
- 자동 추천 품질은 이후 개선할 수 있지만, 추천 자체는 제거하지 않는다.
- 확신이 낮은 큰 구조 변경보다 작은 단위의 안전한 진행을 우선한다.

## Verification

코드 변경 시 가능한 범위에서 아래 순서로 확인한다.

1. `pnpm lint`
2. `pnpm exec tsc --noEmit`
3. `pnpm test`
4. `pnpm build`

주의:
- 현재 레포에는 `pnpm test` 스크립트가 없을 수 있다. 이 경우 테스트 러너/스크립트를 먼저 추가하고 그 사실을 결과에 명시한다.

## Docs

- 아키텍처, 환경변수, 인증 흐름, 데이터 모델, 주요 사용자 플로우가 바뀌면 문서를 함께 갱신한다.
- 새 SQL migration을 만들거나 순서를 바꾸면 `SETUP_GUIDE.md`도 함께 갱신한다.
- 현재 제품 정의의 기준 문서는 아래 두 파일이다.
  - `.omx/specs/deep-interview-personal-wiki-foundation.md`
  - `.omx/plans/personal-wiki-mvp-ralplan.md`
- `docs/task` 아래의 태스크 파일은 `v0_1_[major-topic].md` 같은 형식으로 만든다.
- `docs/figma_prompts` 아래의 프롬프트 파일도 `v0_2_[major-topic].md` 같은 형식으로 만든다.
- 새 태스크 문서를 만들거나 이름을 바꿀 때는 파일 내용을 읽고 가장 이해하기 쉬운 주제를 파일명에 반영한다.
- 새 Figma 프롬프트 문서를 만들거나 이름을 바꿀 때도 파일 내용을 읽고 가장 이해하기 쉬운 주제를 파일명에 반영한다.
- `status`, `notes`, `next-steps`처럼 추상적인 이름보다 실제 주요 작업 주제를 드러내는 이름을 우선한다.
- 예시:
  - `v0_1_mvp_foundation_and_verification.md`
  - `v0_2_ui_auth_record_model_comments.md`
  - `v0_2_public_reading_auth_editor_comments.md`
- 번호와 주제는 함께 봤을 때 문서의 목적이 바로 드러나야 한다.

## Working Style

- 최소 변경으로 진행한다.
- 불필요한 리팩터링, 대규모 포맷 변경, 파일 이동은 피한다.
- 제품 정의와 충돌하는 아이디어가 나오면 구현 전에 먼저 지적하고 범위를 다시 맞춘다.
- 요청이 모호하면 바로 구현하지 말고 `deep-interview` 또는 `ralplan` 경로를 우선 검토한다.

## Git Workflow

- 적당한 작업 단위가 끝날 때마다 `git add .` 후 `git commit`까지 진행해 변경을 작은 단위로 남긴다.
- 하나의 태스크를 시작할 때는 해당 태스크 전용 브랜치를 만든다.
- 브랜치 이름은 `V0_2_[Major_Topic]` 형식을 따른다.
- 하나의 태스크가 끝나면 PR을 만들고 `main`에 머지한 뒤, 배포는 `dist` 브랜치 기준으로 진행한다.
- 앞으로 배포용 기준 브랜치는 `dist`다. 릴리스/배포 상태는 `dist`에서 관리한다.
- 기본 흐름은 `task branch -> PR -> main merge -> dist deploy` 순서로 본다.
