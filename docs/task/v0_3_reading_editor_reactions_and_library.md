# Personal Wiki v0.3 Reading, Editor, Reactions, And Library

## Branch

- Working branch: `V0_3_Guide_Docs`

## Goal

`v0.3`의 목적은 `v0.2`에서 만든 기본 구조를 더 실제 사용감 있는 제품으로 끌어올리는 것이다.

핵심 방향:
- 읽는 경험을 더 부드럽게 만들기
- 댓글 인터랙션을 더 가볍고 자연스럽게 만들기
- 쓰기 경험을 markdown 설명형 UI에서 더 실제적인 editor UX로 끌어올리기
- 사용자 반응 데이터(`bookmark`, `like`)를 추가해 기록과 독서 경험의 깊이를 늘리기

## Scope

### 1. Reading / Comment Interaction Polish

목표:
- record detail 페이지의 comment UX를 더 자연스럽게 개선한다.

포함 범위:
- top-level comment input을 현재 textarea보다 `text input처럼 보이는 collapsed state`로 시작
- hover / focus / click 시 부드럽게 높이가 늘어나는 input behavior
- reply는 항상 열려 있지 않고 `Reply` action 클릭 시 열리도록 전환
- reply input은 top-level comment보다 더 작고 가볍게 보이게 설계
- comment section이 읽기 흐름을 방해하지 않도록 시각적 밀도 조정

### 2. Editor UX Upgrade

목표:
- 현재 markdown-first writing flow를 실제 작성 경험에 더 맞게 개선한다.

포함 범위:
- markdown 유지
- toolbar 추가
- preview 안정화
- shortcut / insert helpers 검토
- `Markdown supported` 문구 제거
- 작성 surface가 form보다 editor처럼 느껴지도록 인터랙션 개선

### 3. Bookmark

목표:
- 로그인 사용자가 나중에 다시 보고 싶은 record를 저장할 수 있게 한다.

포함 범위:
- public record detail에서 bookmark toggle
- 로그인 사용자 기준 bookmark 저장/해제
- 별도 personal library surface에서 bookmark 모아보기

### 4. Like + Personal Library Surface

목표:
- `like`를 가벼운 반응으로 추가하고,
- bookmark / like 결과를 다시 볼 수 있는 별도 `my library` surface를 만든다.

포함 범위:
- public record detail에서 like toggle
- like count 또는 like state 표시
- 별도 `my library` 화면의 최소 버전
  - liked records
  - bookmarked records

## Non-Goals

- 팔로우 시스템
- 알림 시스템
- 복잡한 activity feed
- 추천 알고리즘 고도화
- 댓글 수정/신고/모더레이션 확장
- 여러 문서 타입 동시 확장

## Current Problems

- comment input과 reply 흐름이 읽기 화면에서 다소 무겁게 느껴진다.
- markdown 작성/수정 UX가 불안정하게 느껴지고 editor보다 form처럼 보인다.
- `bookmark`, `like`, `my library`가 없어 기록 이후 재방문 흐름이 닫혀 있다.

## Proposed Changes

### Suggested Product Decisions

#### Comment UX

- top-level comment:
  - collapsed input-like shell
  - focus 시 확장
- reply:
  - `Reply` button 클릭 시만 입력창 노출
  - 기본 hidden

#### Editor UX

- keep:
  - markdown
- improve:
  - toolbar
  - preview stability
  - writing-focused interactions
- remove:
  - `Markdown supported` 같은 설명성 문구를 기본 surface에 크게 노출하는 방식

#### Bookmark vs Like

- `Bookmark`:
  - 나중에 다시 보기
- `Like`:
  - 가벼운 반응

둘은 역할을 분리해서 유지한다.

#### Personal Library Surface

- workspace와 분리된 별도 화면으로 둔다
- full social profile까지는 가지 않는다
- 최소한 아래는 필요하다
  - My Bookmarks
  - My Likes

### Suggested Execution Order

#### Phase 1. UX Lock

- comment input / reply behavior 확정
- improved markdown 범위 확정
- `my library` 화면 범위 확정

#### Phase 2. Reading / Comment UX

- comment section interaction 개선
- reply UX 개선

#### Phase 3. Editor UX

- improved markdown editor 개선
- record create/edit flow 안정화

#### Phase 4. Reactions

- bookmark
- like
- reaction persistence

#### Phase 5. Personal Library Surface

- bookmarked / liked records 모아보기
- workspace와 충돌하지 않는 개인 기록 surface 설계

### Locked Decisions

- editor는 `improved markdown`
- bookmark / like 결과는 `workspace`와 분리된 별도 `my library` 화면

## Acceptance Criteria

- 댓글 입력 UI가 기본 상태에서 과하게 크지 않다.
- focus/hover 시 확장 동작이 자연스럽다.
- reply UI가 기본적으로 닫혀 있다.
- reply 입력은 필요할 때만 열린다.
- mobile에서도 답글 흐름이 과도하게 커 보이지 않는다.
- 작성/수정 중 formatting UX가 지금보다 명확하게 좋아진다.
- 본문 입력 중 preview나 formatting이 덜 깨진다.
- editor가 form-heavy 느낌보다 writing surface에 가깝다.
- 기존 public reading 렌더링과 충돌하지 않는다.
- 로그인 유저는 public record를 bookmark할 수 있다.
- bookmark 상태가 재방문 시 유지된다.
- bookmark한 record를 한곳에서 다시 볼 수 있다.
- 로그인 유저는 record를 like할 수 있다.
- like 상태가 유지된다.
- bookmarked / liked records를 보는 최소한의 개인 공간이 존재한다.

## Risks

- comment/reply polish가 mobile 밀도를 해칠 수 있다.
- improved markdown 범위가 커지면 editor 자체가 별도 프로젝트처럼 불어날 수 있다.
- reactions와 my library가 social feature 확장으로 오해되면 범위가 흔들릴 수 있다.

## Verification

- auth, workspace, create/edit, public record detail, comment/reply, bookmark, like, my library 흐름을 함께 검증한다.
- private visibility regression이 없는지 확인한다.
- 최종 smoke checklist는 [v0_3_final_smoke_checklist.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/test_guide/v0_3_final_smoke_checklist.md)를 기준으로 맞춘다.

## Related Docs

- [v0_3_final_smoke_checklist.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/test_guide/v0_3_final_smoke_checklist.md)
- [.omx/specs/deep-interview-personal-wiki-foundation.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/specs/deep-interview-personal-wiki-foundation.md)
- [.omx/plans/personal-wiki-mvp-ralplan.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/plans/personal-wiki-mvp-ralplan.md)
