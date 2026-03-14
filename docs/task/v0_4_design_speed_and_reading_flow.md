# Personal Wiki v0.4 Design, Speed, And Reading Flow

## Branch

- Working branch: `V0_4_Design_Speed_Reading_Flow`

## Goal

`v0.4`의 목적은 현재 제품의 어색한 사용감을 줄이고, 읽기 중심 경험을 더 자연스럽게 만드는 것이다.

핵심 방향:
- 데스크탑 기준 레이아웃 폭과 여백 규칙을 통일한다
- 페이지 전환과 로딩 체감을 더 빠르게 만든다
- 문서를 읽은 뒤 다음 문서로 이동하는 흐름을 더 분명하게 만든다

## Locked v0.4 Workstreams

### 1. Design Alignment

목표:
- header와 주요 body 영역의 width, padding, spacing 규칙을 정리한다.

현재 문제:
- `library`, `workspace`, `write/edit` 화면의 컨테이너 폭이 제각각이라 제품이 분리되어 보인다.
- 같은 제품 안에서도 데스크탑 기준 정렬선이 자주 바뀐다.

포함 범위:
- 공통 page shell 정리
- desktop 기준 header/body width alignment
- `library`, `workspace`, `write/edit`, reading detail의 주요 wrapper 정리
- section gap, card spacing의 거친 불일치 정리

acceptance criteria:
- 데스크탑에서 header와 주요 body content의 정렬선이 일관된다
- `library`, `workspace`, `write/edit` 페이지 전환 시 폭이 갑자기 바뀌지 않는다
- 레이아웃 수정이 mobile 기본 동작을 깨지 않는다

### 2. Speed Improvement

목표:
- 페이지 이동 시 느리게 느껴지는 지점을 줄이고 체감 속도를 개선한다.

현재 문제:
- 페이지 전환이 대략 `0.7~0.8s` 정도로 느껴진다.
- 실제 응답 시간과 별개로 loading feedback이 약해서 더 느리게 느껴질 수 있다.

포함 범위:
- 느린 route 전환 원인 파악
- 불필요한 fetch/render 확인
- prefetch, loading UI, caching strategy 검토

acceptance criteria:
- 주요 페이지 이동 체감이 지금보다 명확히 빨라진다
- 느린 구간이 남더라도 loading 상태가 비어 보이지 않는다
- 성능 개선이 auth/visibility 동작을 깨지 않는다

### 3. Reading Flow Improvement

목표:
- 한 문서를 읽고 난 뒤 다음 문서로 넘어가는 흐름을 더 자연스럽게 만든다.

포함 범위:
- related reading module 개선
- 추천 이유나 연결 근거 표시 검토
- empty state와 다음 행동 유도 문구 정리

acceptance criteria:
- reading detail에서 다음 문서로 이동할 이유가 더 분명해진다
- related reading empty state가 방치된 느낌을 주지 않는다
- recommendation은 여전히 private 문서를 노출하지 않는다

## Non-Goals For v0.4

- 추천 알고리즘의 대규모 고도화
- 새 문서 타입 추가
- reader용 소셜 기능 확장
- 대규모 editor 아키텍처 교체

## Suggested Execution Order

### Phase 1. Layout Lock

- 공통 shell 정의
- width mismatch 정리

### Phase 2. Navigation Speed

- 느린 전환 원인 파악
- loading/prefetch/cache 개선

### Phase 3. Reading Flow

- related reading 정보 구조 개선
- empty state와 next action 정리

## Locked Decisions

- `v0.4`의 첫 구현은 새 기능 추가보다 사용감 개선에 집중한다
- 아이디어 백로그와 실제 `v0.4` 범위는 별도다

## Recommended Next Step

1. 공통 layout shell 적용
2. route transition 병목 확인
3. reading detail의 related reading 개선안 구체화
