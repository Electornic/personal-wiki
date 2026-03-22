# Personal Wiki v0.6.1 README Docs Refresh

## Branch

- Working branch: `V0_6_1_README_Docs_Refresh`

## Goal

- README를 제품 설명, 현재 구현 범위, 데이터 계약, setup 흐름이 더 빨리 이해되도록 다시 정리한다.

## Scope

- README의 구조를 제품 중심으로 재배치한다.
- 현재 구현 범위와 비범위를 더 명확히 적는다.
- 현재 record 입력 계약과 운영상 주의점을 README에 반영한다.
- setup / verification / release 흐름을 실제 상태와 맞게 정리한다.
- 문서 작업 버전에 맞춰 `package.json.version`을 `0.6.1`로 올린다.

## Non-Goals

- 기능 변경
- migration 추가
- 데이터 모델 변경
- 별도 import 도구 추가

## Current Problems

- README가 현재 제품의 핵심 경험보다 기술 스택 설명을 먼저 보여준다.
- 현재 구현 범위와 운영 규칙이 한눈에 잘 드러나지 않는다.
- 실데이터를 넣기 전 어떤 입력 계약을 먼저 정해야 하는지 README에서 보이지 않는다.
- setup 섹션에 현재 migration 개수와 중요 단계가 빠르게 읽히지 않는다.

## Proposed Changes

- `What This Is`, `Current Implemented Scope`, `Product Rules` 중심으로 문서 상단 구조를 재정리한다.
- 현재 content contract와 data 입력 전 체크 포인트를 별도 섹션으로 분리한다.
- Supabase setup과 release 흐름을 현재 상태에 맞게 업데이트한다.
- 문서가 marketing copy가 아니라 작업 기준 문서처럼 읽히도록 톤을 정리한다.

## Acceptance Criteria

- README 상단만 읽어도 이 프로젝트가 무엇인지 빠르게 이해할 수 있다.
- 현재 구현 범위와 비범위가 혼동 없이 보인다.
- setup 섹션이 현재 migration 개수와 주요 단계 기준으로 맞아 있다.
- 실데이터 투입 전 참고할 운영 규칙이 README에 포함돼 있다.
- 기능/코드 동작은 바뀌지 않는다.

## Risks

- README를 너무 넓게 쓰면 현재 구현보다 미래 계획 설명이 많아질 수 있다.
- 제품 정의와 실제 구현 상태가 어긋나면 다시 혼란이 생길 수 있다.

## Verification

- README 내용 검토
- 문서 내 setup / scope / release 설명이 현재 레포 상태와 맞는지 확인

## Related Docs

- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)
- [.omx/specs/deep-interview-personal-wiki-foundation.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/specs/deep-interview-personal-wiki-foundation.md)
- [.omx/plans/personal-wiki-mvp-ralplan.md](/Users/leejun/Desktop/Projects/personal-wiki/.omx/plans/personal-wiki-mvp-ralplan.md)
