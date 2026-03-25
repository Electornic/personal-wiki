# v0.4 Final Smoke Checklist

## Goal

Release 전에 `v0.4`의 핵심 layout, navigation speed, reading flow 개선이 실제 환경에서 정상 동작하는지 빠르게 확인한다.

이 체크리스트는 다음 범위를 검증한다.
- layout alignment
- loading / navigation speed
- reading detail
- related reading
- mobile regression
- private visibility

## Preconditions

- `.env.local`이 채워져 있다.
- `pnpm dev` 또는 배포 환경이 떠 있다.
- 최소 2개 이상의 public record가 존재한다.
- related reading이 있는 record와 없는 record를 각각 1개 이상 준비한다.

## 1. Layout Alignment

- `/`에 접속한다.
- `/author`, `/author/documents/new`, `/library/[slug]`를 차례로 연다.
- 데스크탑 폭에서 header와 본문 정렬선을 비교한다.

Expected:
- 주요 페이지의 폭과 좌우 여백이 갑자기 바뀌지 않는다
- header와 주요 body wrapper가 같은 제품처럼 보인다
- section gap과 card spacing이 거칠게 튀지 않는다

## 2. Navigation Speed

- `/`에서 library 카드 여러 개를 연속으로 클릭해 `/library/[slug]`로 이동한다.
- 브라우저 뒤로 가기와 다시 진입을 반복한다.
- 홈 진입 시 hero 이후 library 섹션이 어떻게 보이는지 확인한다.

Expected:
- 페이지 전환이 이전보다 비어 보이지 않는다
- loading 상태가 없이 멈춘 것처럼 느껴지지 않는다
- home에서 hero 이후 섹션이 한 번에 무겁게 늦게 뜨지 않는다

## 3. Reading Detail

- public record 상세 페이지에서 메타데이터와 본문을 확인한다.
- markdown heading, blockquote, list가 정상 렌더링되는지 본다.

Expected:
- title, writer, date, tags가 정상 보인다
- markdown 본문이 읽기 화면 기준으로 자연스럽게 렌더링된다
- layout 조정이 detail readability를 해치지 않는다

## 4. Related Reading

- related reading이 있는 record를 연다.
- 추천 카드와 추천 이유 문구를 확인한다.
- related reading이 없는 record도 연다.

Expected:
- related reading이 있을 때 다음 문서로 이동할 이유가 보인다
- recommendation reason 또는 연결 근거가 읽힌다
- empty state가 방치된 느낌 없이 다음 행동을 제시한다

## 5. Mobile Regression

- 모바일 폭에서 `/`, `/library/[slug]`, `/author`를 확인한다.

Expected:
- width alignment 수정이 mobile 기본 동작을 깨지 않는다
- 텍스트와 카드가 화면 밖으로 밀리지 않는다
- 주요 버튼과 링크가 터치 가능하게 보인다

## 6. Private Visibility

- private record를 하나 준비한다.
- 비로그인 상태에서 홈, 상세, 추천 영역을 확인한다.

Expected:
- private record가 홈에 보이지 않는다
- private record slug 직접 접근이 막힌다
- related reading에도 private record가 섞이지 않는다

## Regression Focus

- `/`
- `/library/[slug]`
- `/author`
- `/author/documents/new`
- 주요 route 전환 시 layout / loading / recommendation이 함께 깨지지 않는지 확인한다.

## Pass Criteria

아래가 모두 만족되면 `v0.4` smoke test pass로 본다.

- layout alignment가 안정적이다
- route transition 체감이 비어 보이지 않는다
- reading detail과 related reading이 정상 동작한다
- mobile 기본 동작이 유지된다
- private visibility 회귀가 없다
