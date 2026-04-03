# Personal Wiki v0.7.0 Chat-Driven Writing

## Branch

- Working branch: `V0_7_0_Chat_Driven_Writing`

## Goal

- 대화를 통해 문서와 메모를 생성하는 챗 인터페이스를 추가한다.
- 글쓰기 마찰을 낮춰 위키를 실제로 쓰게 만드는 것이 핵심 목표다.

## Scope

- `/author/chat` 페이지 — 챗 UI
- OpenAI API 연동 (GPT-4o-mini, 추후 모델 교체 가능)
- 대화에서 문서 메타(제목, source_type, tags) + 메모 카드(contents) 추출
- 추출 결과 미리보기 → 사용자 확인 후 기존 `upsertDocument` API로 저장
- 기존 문서에 메모 추가하는 흐름 (대화 중 기존 문서 언급 시)

## Non-Goals

- 대화 히스토리 DB 저장 (세션 내 메모리만 유지)
- RAG / 임베딩 기반 문서 검색
- 복잡한 멀티턴 분기 (단순 추출 + 확인 흐름)
- 챗에서 문서 삭제/수정 (생성만)
- 모바일 전용 최적화 (반응형은 기본 지원)

## Current Problems

- 글쓰기가 귀찮아서 위키를 실제로 사용하지 않게 된다.
- 에디터에서 제목, 타입, 태그, 본문을 모두 채우는 건 마찰이 크다.
- 머릿속 생각을 바로 던질 수 있는 가벼운 입력 방식이 없다.

## Proposed Changes

### A. 챗 페이지 (`/author/chat`)

- author 전용 페이지 (인증 필요)
- 심플한 챗 UI: 메시지 목록 + 입력창
- 세션 내 대화 유지 (페이지 벗어나면 리셋)

### B. API Route (`/api/author/chat`)

- Next.js Route Handler로 OpenAI API 프록시
- OpenAI API 키는 서버 환경변수 (`OPENAI_API_KEY`)
- 스트리밍 응답 (SSE)으로 체감 속도 확보

### C. 메모 추출 프롬프트

- 시스템 프롬프트로 역할 정의: "사용자의 독서 메모/생각을 듣고 문서 구조로 정리"
- 추출 대상:
  - `title`: 문서 제목
  - `source_type`: `book` 또는 `article`
  - `book_title`: source_type이 book일 때 원서 제목
  - `tags`: 태그 배열
  - `contents`: 마크다운 본문 (메모 카드)
  - `visibility`: 기본 `private`
- 대화 흐름:
  1. 사용자가 자유롭게 이야기
  2. AI가 대화하면서 정보를 모음
  3. 충분한 정보가 모이면 문서 구조를 JSON으로 제안
  4. 사용자가 확인/수정 후 저장

### D. 문서 미리보기 + 저장

- AI가 제안한 구조를 카드 형태로 미리보기
- 제목, 태그, 본문을 인라인 수정 가능
- "저장" 버튼 → 기존 `upsertDocument` 함수 호출
- 저장 성공 시 해당 문서 페이지로 이동

### E. 기존 문서에 메모 추가

- "사피엔스에 메모 추가해줘" 같은 요청 처리
- 기존 문서 검색 (제목 기반 간단 매칭)
- 기존 contents에 새 메모를 append하여 upsert

## Acceptance Criteria

- [ ] `/author/chat` 페이지 접근 시 인증 체크
- [ ] 챗 UI에서 메시지 송수신 가능
- [ ] AI 응답이 스트리밍으로 표시됨
- [ ] 대화 후 문서 구조(제목, 타입, 태그, 본문)가 제안됨
- [ ] 제안된 구조를 미리보기로 확인 가능
- [ ] 미리보기에서 제목/태그/본문 수정 가능
- [ ] 저장 시 DB에 record + tags 정상 생성
- [ ] 저장 후 해당 문서 페이지로 이동
- [ ] 기존 문서에 메모 추가 가능
- [ ] OpenAI API 키 미설정 시 안내 메시지
- [ ] `pnpm lint` / `tsc --noEmit` / `pnpm test` / `pnpm build` 통과

## Risks

- **OpenAI API 키 관리**: 서버 환경변수로만 노출. 클라이언트에 절대 노출 안 됨.
- **프롬프트 품질**: 메모 추출이 부정확할 수 있음 → 사용자가 반드시 미리보기에서 확인/수정 후 저장하는 흐름으로 보호.
- **API 비용**: GPT-4o-mini 기준 대화 1회 ~$0.0003. 월 30회 사용 시 ~$0.01. 무시 가능 수준이나 rate limit은 고려.
- **기존 문서 매칭 정확도**: 제목 기반 단순 매칭이라 동명 문서 시 혼란 가능 → 후보가 여럿이면 사용자에게 선택 요청.

## Verification

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

- 챗 → 문서 생성 → 문서 페이지 확인 end-to-end 흐름 검증
- 기존 문서 메모 추가 흐름 검증
- OpenAI API 키 없을 때 에러 핸들링 확인
- 인증 없이 `/author/chat` 접근 시 리다이렉트 확인

## Related Docs

- `docs/idea/2026_04_04_01_Idea.md` — 디자인 리뷰 피드백 (0.7.x 패치 예정)
- `docs/task/TEMPLATE.md`
- `supabase/consolidated-schema.sql` — records, tags, record_tags 스키마
- `entities/record/api/documents.ts` — `upsertDocument` 함수
