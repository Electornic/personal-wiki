# v0.6.7 Unicode Routes And Error Pages

## Goal

- Unicode route 처리와 App Router 에러/404 경험을 함께 검증한다.

## Preconditions

- `pnpm dev`가 실행 중이다.
- 한글 tag가 포함된 public record가 최소 1개 있다.

## 1. Unicode Topic Route

- `/topics/칸나` 또는 실제 한글 tag route로 직접 진입한다.
- topic pill과 related topic 링크를 눌러 이동한다.

Expected:
- URL이 깨지지 않고 해당 topic page가 정상 렌더링된다.
- 같은 한글 tag 기준으로 record 목록이 정상 매칭된다.

## 2. Not Found Experience

- 존재하지 않는 topic route로 이동한다.
- 존재하지 않는 `/library/[slug]` route로 이동한다.

Expected:
- 공통 not-found 페이지가 렌더링된다.
- library/workspace로 이동할 수 있는 CTA가 보인다.

## 3. Error Experience

- 강제로 예외가 나는 화면에서 error UI를 확인한다.

Expected:
- route-level error 또는 global error 화면이 렌더링된다.
- `Try again` 동작이 제공된다.

## Regression Focus

- 기존 ASCII topic/tag route가 계속 정상 동작하는지 확인한다.
- library topic 링크와 topic pill 링크가 같은 인코딩 규칙을 사용하는지 확인한다.
