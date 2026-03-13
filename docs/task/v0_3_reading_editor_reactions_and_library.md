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

## Locked v0.3 Workstreams

### 1. Reading / Comment Interaction Polish

목표:
- record detail 페이지의 comment UX를 더 자연스럽게 개선한다.

포함 범위:
- top-level comment input을 현재 textarea보다 `text input처럼 보이는 collapsed state`로 시작
- hover / focus / click 시 부드럽게 높이가 늘어나는 input behavior
- reply는 항상 열려 있지 않고 `Reply` action 클릭 시 열리도록 전환
- reply input은 top-level comment보다 더 작고 가볍게 보이게 설계
- comment section이 읽기 흐름을 방해하지 않도록 시각적 밀도 조정

acceptance criteria:
- 댓글 입력 UI가 기본 상태에서 과하게 크지 않다
- focus/hover 시 확장 동작이 자연스럽다
- reply UI가 기본적으로 닫혀 있다
- reply 입력은 필요할 때만 열린다
- mobile에서도 답글 흐름이 과도하게 커 보이지 않는다

### 2. Editor UX Upgrade

목표:
- 현재 markdown-first writing flow를 실제 작성 경험에 더 맞게 개선한다.

현재 문제:
- markdown 작성/수정 UX가 불안정하게 느껴진다
- `Markdown supported` 문구는 사용자를 돕기보다 불완전한 editor처럼 보이게 만들 수 있다

추천 방향:
- `v0.3`에서는 lightweight rich text / block editor를 우선 검토한다
- 후보:
  - `Tiptap`
  - markdown 유지 + toolbar 강화

권장 결정:
- 가능하면 `Tiptap` 같은 lightweight rich text editor로 전환
- 만약 범위가 커지면 fallback으로:
  - markdown 유지
  - toolbar 추가
  - preview 개선
  - `Markdown supported` 문구 제거

acceptance criteria:
- 작성/수정 중 formatting UX가 지금보다 명확하게 좋아진다
- 본문 입력 중 preview나 formatting이 덜 깨진다
- editor가 form-heavy 느낌보다 writing surface에 가깝다
- 기존 public reading 렌더링과 충돌하지 않는다

### 3. Bookmark

목표:
- 로그인 사용자가 나중에 다시 보고 싶은 record를 저장할 수 있게 한다.

포함 범위:
- public record detail에서 bookmark toggle
- 로그인 사용자 기준 bookmark 저장/해제
- workspace 또는 별도 personal library surface에서 bookmark 모아보기

acceptance criteria:
- 로그인 유저는 public record를 bookmark할 수 있다
- bookmark 상태가 재방문 시 유지된다
- bookmark한 record를 한곳에서 다시 볼 수 있다

### 4. Like + Personal Library Surface

목표:
- `like`를 가벼운 반응으로 추가하고,
- bookmark / like 결과를 다시 볼 수 있는 최소한의 personal library surface를 만든다.

포함 범위:
- public record detail에서 like toggle
- like count 또는 like state 표시
- 내 activity / saved view의 최소 버전
  - liked records
  - bookmarked records

이 workstream을 둔 이유:
- `bookmark`와 `like`를 추가하면 결과를 모아보는 surface가 필요하다
- 그렇지 않으면 기능은 생기지만 제품 경험이 닫히지 않는다

acceptance criteria:
- 로그인 유저는 record를 like할 수 있다
- like 상태가 유지된다
- bookmarked / liked records를 보는 최소한의 개인 공간이 존재한다

## Non-Goals For v0.3

- 팔로우 시스템
- 알림 시스템
- 복잡한 activity feed
- 추천 알고리즘 고도화
- 댓글 수정/신고/모더레이션 확장
- 여러 문서 타입 동시 확장

## Suggested Product Decisions

### Comment UX

- top-level comment:
  - collapsed input-like shell
  - focus 시 확장
- reply:
  - `Reply` button 클릭 시만 입력창 노출
  - 기본 hidden

### Editor UX

- preferred:
  - lightweight rich text editor
- fallback:
  - markdown 유지 + toolbar
- remove:
  - `Markdown supported` 같은 설명성 문구를 기본 surface에 크게 노출하는 방식

### Bookmark vs Like

- `Bookmark`:
  - 나중에 다시 보기
- `Like`:
  - 가벼운 반응

둘은 역할을 분리해서 유지한다.

### Personal Library Surface

- full social profile까지는 가지 않는다
- 최소한 아래는 필요하다
  - My Bookmarks
  - My Likes

## Suggested Execution Order

### Phase 1. UX Lock

- comment input / reply behavior 확정
- editor 방향(`rich text` vs `improved markdown`) 확정
- bookmark / like surface 최소 범위 확정

### Phase 2. Reading / Comment UX

- comment section interaction 개선
- reply UX 개선

### Phase 3. Editor UX

- editor 교체 또는 개선
- record create/edit flow 안정화

### Phase 4. Reactions

- bookmark
- like
- reaction persistence

### Phase 5. Personal Library Surface

- bookmarked / liked records 모아보기
- workspace와 충돌하지 않는 개인 기록 surface 설계

## Recommended Next Step

`v0.3`는 바로 구현에 들어가기보다 아래 두 결정만 먼저 닫는 것이 좋다.

1. editor를 `rich text`로 갈지, `improved markdown`로 갈지
2. bookmark / like 결과를 `workspace 내부 탭`으로 둘지, `별도 my library 화면`으로 둘지

이 두 개가 정해지면 implementation plan을 더 정확히 자를 수 있다.
