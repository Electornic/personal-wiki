# Test Guide Template

이 템플릿은 `docs/test_guide/v0_X_[major-topic].md` 문서를 만들 때 사용한다.

원칙:
- 사람이 그대로 따라할 수 있는 검증 절차로 적는다.
- 설계 배경보다 재현 절차와 기대 결과를 우선한다.
- 버전 릴리스 직전 확인해야 할 회귀 포인트를 분리해 둔다.

```md
# v0.X Test Guide Title

## Goal

- 이 가이드가 검증하는 사용자 흐름과 범위를 적는다.

## Preconditions

- 환경 변수, 데이터 준비, 로그인 상태, 실행 중인 서버 등 사전 조건을 적는다.

## 1. Flow Name

- step 1
- step 2

Expected:
- 기대 결과 1
- 기대 결과 2

## 2. Flow Name

- step 1
- step 2

Expected:
- 기대 결과 1
- 기대 결과 2

## Regression Focus

- 이번 버전에서 특히 다시 확인해야 하는 회귀 포인트를 적는다.
```
