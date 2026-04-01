# v0.6.12 Image And Writer Fix

## Goal

- public reading 이미지 최적화와 홈 writer name fallback 동작을 검증한다.

## Preconditions

- `pnpm dev`가 실행 중이다.
- public record 한 개 이상에 markdown 이미지가 있다.
- 최신 SQL migration이 모두 적용되어 있다.
- `author_name`이 비어 있지만 `writer_user_id`와 profile이 있는 record가 있으면 fallback 검증이 더 정확하다.

## 1. Public Reading Image Render

- 이미지가 포함된 public record를 연다.
- `/library/[slug]`에서 이미지 로딩과 레이아웃을 확인한다.

Expected:
- 이미지가 정상 렌더링된다.
- broken image 없이 기존 reading UI와 어긋나지 않는다.

## 2. Author Preview Compatibility

- author editor preview에서 방금 업로드했거나 local preview 상태의 이미지를 확인한다.

Expected:
- blob 기반 preview 이미지가 계속 보인다.
- editor preview 흐름이 깨지지 않는다.

## 3. Home Writer Name Fallback

- `/`의 Browse Library 목록을 확인한다.
- 기존에 `unknown`이 나오던 record를 중심으로 writer label을 본다.

Expected:
- 저장된 `author_name`이 있으면 그대로 보인다.
- `author_name`이 비어 있는 경우 가능한 범위에서 profile `user_name` 또는 email prefix가 보인다.

## 4. Search By Writer Name

- 홈 검색창에서 보정된 writer name 또는 email prefix 일부를 입력한다.

Expected:
- writer name이 비어 있던 기존 record도 검색 결과에 잡힌다.
- 검색 결과 카드의 writer label이 `unknown`으로 남지 않는다.

## Regression Focus

- topic page / related documents 카드의 writer name이 함께 깨지지 않는지 확인한다.
- external image URL이나 blob URL이 필요한 preview surface가 plain `<img>` 경로로 유지되는지 확인한다.
