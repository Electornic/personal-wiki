# v0.6.9 Topic Query Optimization

## Goal

- topic page가 더 적은 Supabase query 수로 정상 렌더링되는지 확인한다.

## Preconditions

- `pnpm dev`가 실행 중이다.
- `.env.local`에 `SUPABASE_DEBUG_LOG=1`이 설정되어 있다.
- public record 중 특정 tag를 공유하는 문서가 최소 1개 있다.

## 1. Topic Page Query Count

- 홈에서 topic pill을 눌러 `/topics/[topic]`로 이동한다.
- 서버 터미널에 출력되는 Supabase query 로그를 기록한다.

Expected:
- topic page query 수가 기존 `5`보다 줄어든다.
- tag slug 기반 candidate lookup, record list fetch, tag hydrate 정도의 쿼리만 남는다.

## 2. Home Query Count

- `/`로 진입한다.
- 서버 터미널의 Supabase query 로그를 기록한다.

Expected:
- home 기본 진입 query 수가 기존 `4`보다 줄어든다.
- count용 `HEAD /records` 요청 없이 목록 query에서 count를 같이 처리한다.

## 3. Topic Content Integrity

- topic page의 record card 제목, excerpt, writer, tag pill을 확인한다.
- related topic 링크를 눌러 다른 topic page로 이동한다.

Expected:
- 기존과 같은 record card 정보가 보인다.
- current topic을 제외한 tag만 secondary pill로 노출된다.
- related topic 링크가 정상 동작한다.

## 4. Home Discovery Search

- `/`에서 discovery search input에 검색어를 입력한다.
- Enter를 누르지 않고 입력을 멈춘다.

Expected:
- 잠시 후 `q` search param이 반영되며 목록이 갱신된다.
- 입력 중 route가 깨지지 않고, Enter 없이도 검색이 적용된다.

## 5. Not Found

- 존재하지 않는 topic slug로 직접 진입한다.

Expected:
- not-found 페이지가 렌더링된다.

## Regression Focus

- home query 수나 detail query 수가 이번 변경으로 늘어나지 않았는지 확인한다.
- Unicode topic slug가 계속 정상 동작하는지 확인한다.
