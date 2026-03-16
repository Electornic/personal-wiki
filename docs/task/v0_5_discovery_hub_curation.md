# Personal Wiki v0.5 Discovery, Hub, And Curation

## Branch

- Working branch: `V0_5_Discovery_Hub_Curation`

## Goal

- `v0.5`의 목적은 문서 탐색성과 다음 읽기 흐름을 한 단계 더 끌어올려, 개인 도서관형 위키의 연결 경험을 더 분명하게 만드는 것이다.

## Scope

### 1. Tag Filter, Sort, And Simple Search

- library와 my library에서 태그 필터를 제공한다.
- 기본 정렬 옵션을 제공한다.
  - 최신순
  - 오래된 순
  - 최근 수정순
  - 반응 많은 순
- 제목, writer, tag 기준의 간단 검색을 제공한다.

### 2. Topic Hub Page

- 특정 태그나 주제를 눌렀을 때 진입하는 주제 허브 페이지를 만든다.
- 해당 주제에 연결된 문서들을 묶어 보여준다.
- 대표 메모나 대표 문장을 함께 보여줄 수 있는 구조를 검토한다.

### 3. Recommendation Card Memo Preview

- related reading 카드에 제목만이 아니라 대표 thought 또는 메모 한 줄을 같이 보여준다.
- 추천 이유를 더 이해하기 쉽게 보여주는 보조 정보 구조를 같이 검토한다.

### 4. Curation Shelf

- author가 수동으로 문서 묶음을 만들 수 있는 큐레이션 선반을 추가한다.
- 예:
  - 입문용
  - 같이 읽으면 좋은 3개
  - 이번 달 다시 읽은 글
- 홈 또는 주제 허브, 문서 상세 중 어디에 노출할지 정보 구조를 정한다.

## Non-Goals

- recommendation 알고리즘 자체를 embedding 기반으로 고도화하는 작업
- reader 계정이나 소셜 기능 확장
- block-level editor나 note-to-note graph 같은 대규모 구조 변경
- analytics 시스템 본격 도입
- 새 문서 타입 추가

## Current Problems

- 현재 탐색 흐름은 목록, 관련 문서, reactions 기반까지는 갖췄지만 tag/filter/search 축이 약하다.
- related reading이 다음 문서를 클릭할 이유를 더 강하게 전달하지 못한다.
- 자동 추천만으로는 개인 도서관형 위키다운 큐레이션 느낌이 부족하다.
- 하나의 주제를 깊게 파고들기 위한 허브형 진입점이 없다.

## Proposed Changes

### Discovery Layer

- library와 my library에 탐색 도구를 추가한다.
- tag filter, sort, simple search는 함께 설계해 중복 UI를 줄인다.
- public/private visibility 규칙을 깨지 않는 범위에서 public surfaces와 signed-in surfaces에 맞는 조건을 분리한다.

### Topic Hub

- tag 클릭 시 단순 필터 결과가 아니라 주제 허브 페이지로 들어가게 한다.
- 주제 허브는 관련 문서 목록, 대표 메모, 큐레이션 선반을 함께 담을 수 있는 중심 페이지로 설계한다.

### Related Reading Upgrade

- recommendation card에 대표 메모 preview를 넣는다.
- 추천 이유를 짧은 문구나 메타 정보로 함께 보여준다.
- preview가 너무 길어져 reading detail을 무겁게 만들지 않도록 밀도를 조정한다.

### Curation Shelf

- author가 수동으로 선반을 구성할 수 있는 최소 모델을 정의한다.
- 선반 제목, 설명, 포함 문서 순서 정도의 최소 구조부터 시작한다.
- 자동 추천과 수동 큐레이션이 충돌하지 않도록 역할을 분리한다.

### Suggested Execution Order

#### Phase 1. Discovery Spec Lock

- filter / sort / search 범위 고정
- topic hub 정보 구조 고정
- curation shelf 최소 모델 고정

#### Phase 2. Discovery UI And Query Layer

- library / my library filter, sort, search 구현
- topic 기반 query shape 정리

#### Phase 3. Related Reading Upgrade

- recommendation memo preview
- recommendation reason 노출

#### Phase 4. Curation Surface

- curation shelf data model
- shelf authoring / display 최소 버전 구현

## Acceptance Criteria

- library와 my library에서 태그 필터가 동작한다.
- library와 my library에서 정렬 옵션이 동작한다.
- 제목, writer, tag 기준의 간단 검색이 동작한다.
- 주제 허브 페이지가 존재하고, 하나의 tag/topic 아래 연결된 문서를 묶어 보여준다.
- related reading 카드에 대표 메모 또는 thought preview가 노출된다.
- recommendation reason이 지금보다 더 이해하기 쉽게 노출된다.
- author가 최소 1개 이상의 큐레이션 선반을 만들고 노출할 수 있다.
- public surface에서 private 문서가 filter, search, hub, recommendation, shelf 어디에서도 누출되지 않는다.
- 탐색성 추가가 reading detail의 밀도와 성능을 과도하게 해치지 않는다.

## Risks

- filter, sort, search, hub, shelf를 한 버전에 넣으면 범위가 커질 수 있다.
- topic hub와 curation shelf의 정보 구조가 겹치면 제품이 복잡해질 수 있다.
- related reading preview가 길어지면 reading detail이 오히려 산만해질 수 있다.
- 반응 많은 순 정렬은 데이터 양이 적을 때 품질이 낮게 느껴질 수 있다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- manual:
  - public library filter / sort / search
  - my library filter / sort / search
  - tag/topic hub navigation
  - related reading preview / recommendation reason
  - curation shelf create / display
  - private visibility regression

## Related Docs

- [2026_03_16_01_Idea.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/idea/2026_03_16_01_Idea.md)
- [2026_03_14_02_Idea.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/idea/2026_03_14_02_Idea.md)
- [v0_3_reading_editor_reactions_and_library.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_3_reading_editor_reactions_and_library.md)
- [v0_4_design_speed_and_reading_flow.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_4_design_speed_and_reading_flow.md)
