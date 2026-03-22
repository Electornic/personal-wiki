# Personal Wiki v0.6 Recommendation And Reaction Cleanup

## Branch

- Working branch: `V0_6_Recommendation_Reaction_Cleanup`

## Goal

- 추천 이유를 더 납득 가능하게 보여주고, reaction 의미를 `bookmark 저장 / like 공개 카운트`로 정리해 reading flow를 더 단순하게 만든다.

## Scope

- related reading 설명 문구와 empty state를 개선한다.
- 추천 tie-break를 최근 문서 우선 기준으로 정리한다.
- `My Library`를 bookmark 전용 저장 목록으로 정리한다.
- private record에서 bookmark / like UI를 제거한다.
- private record에 reaction row가 쌓이지 않도록 app + policy를 함께 tighten 한다.
- 목록의 기본 정렬을 최근 문서 우선으로 유지하고 관련 문서를 같은 기준으로 설명 가능하게 맞춘다.
- 이번 변경에 맞는 README / SETUP_GUIDE를 갱신한다.

## Non-Goals

- embedding 기반 추천
- manual relation editor
- reader 개인화 추천
- graph view나 reading path authoring

## Current Problems

- related reading이 왜 추천되는지 설명이 약하다.
- 추천이 비었을 때 다음 이동 경로가 충분히 제시되지 않는다.
- `My Library`에서 likes를 별도 탭으로 보여주는 것은 저장 흐름과 의미가 겹친다.
- private record에서도 reaction이 가능해 제품 의미가 흐려진다.
- 정렬 기준과 추천 설명이 최근 문서 우선이라는 인상을 충분히 주지 못한다.

## Proposed Changes

- related reading 카드는 shared topic 기반 이유를 더 직접적으로 노출한다.
- 추천 empty state에서는 topic hub 또는 전체 library로 이어지는 다음 행동을 제시한다.
- public surface의 like는 공개 count 신호로만 쓰고, bookmark는 개인 저장 용도로 유지한다.
- `My Library`는 bookmark 전용 페이지로 단순화한다.
- private record는 reaction UI를 렌더하지 않고, DB 정책도 public record만 허용하도록 tighten 한다.
- public list / topic / recommendation tie-break는 더 최근 문서를 우선하는 방향으로 정리한다.

## Acceptance Criteria

- public record detail에서 like count가 보인다.
- private record detail에서는 bookmark / like UI가 보이지 않는다.
- private record에는 새 bookmark / like row를 만들 수 없다.
- `/me/library`는 bookmark 전용 저장 목록으로 동작한다.
- related reading 카드가 shared topic 기반 이유를 보여준다.
- related reading이 비었을 때 topic hub 또는 library로 이동할 수 있다.
- public list와 related reading이 최근 문서 우선 기준으로 정렬된다.

## Risks

- 기존 private reaction row를 제거하면 과거 데이터가 사라진다.
- 정렬 기준을 최근 문서 쪽으로 더 맞추면 예전 문서 노출 빈도가 줄 수 있다.
- like count를 공개 신호로 쓰기 시작하면 이후 sort label과 문구를 계속 일치시켜야 한다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- manual:
  - public record detail에서 bookmark / like + like count 확인
  - private record detail에서 reaction 미노출 확인
  - `/me/library`에서 bookmark 목록과 최신순 정렬 확인
  - related reading reason / empty state 확인

## Related Docs

- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)
- [docs/task/v0_5_discovery_hub_curation.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_5_discovery_hub_curation.md)
- [docs/task/v0_5_3_author_workspace_cleanup_and_editor_support.md](/Users/leejun/Desktop/Projects/personal-wiki/docs/task/v0_5_3_author_workspace_cleanup_and_editor_support.md)
