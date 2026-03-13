# SETUP GUIDE

이 문서는 Personal Wiki 프로젝트를 처음 세팅하거나, 새 SQL migration이 추가될 때 따라야 하는 순서를 정리한 가이드입니다.

## 1. Environment Variables

`.env.local`에 아래 값을 채웁니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
```

## 2. Supabase Auth Settings

Supabase 대시보드에서 아래를 확인합니다.

1. Email/Password 로그인 활성화
2. Redirect URL에 `http://localhost:3000/auth/callback` 추가

## 3. SQL Execution Order

SQL은 아래 순서대로 실행합니다.

### Step 1. v0.1 foundation

실행 파일:
- [supabase/migrations/20260310T140000Z_personal_wiki_mvp.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260310T140000Z_personal_wiki_mvp.sql)

역할:
- `author_profiles`
- `documents`
- `topics`
- `document_topics`
- `document_note_cards`
- 기본 RLS 정책

### Step 2. v0.2 auth foundation

실행 파일:
- [supabase/migrations/20260312T130000Z_v0_2_profiles_auth.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260312T130000Z_v0_2_profiles_auth.sql)

역할:
- `author_profiles` -> `profiles` 전환
- `profiles.user_name` 추가
- user-based signup/login 기준 정책 정리
- `documents` / `topics` / `document_topics` / `document_note_cards`를 `auth.uid()` ownership 기준으로 갱신

### Step 3. v0.2 record model simplify

실행 파일:
- [supabase/migrations/20260312T150000Z_v0_2_record_model_simplify.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260312T150000Z_v0_2_record_model_simplify.sql)

역할:
- `documents.contents` 추가
- `documents.book_title` 추가
- 기존 `intro` + `document_note_cards` 기반 내용을 `contents`로 backfill
- 기존 book record의 `source_title`을 `book_title`로 backfill

### Step 4. v0.2 record comments

실행 파일:
- [supabase/migrations/20260312T170000Z_v0_2_record_comments.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260312T170000Z_v0_2_record_comments.sql)

역할:
- `record_comments` 테이블 추가
- public record comment read 정책 추가
- authenticated user comment create/update/delete 정책 추가
- reply depth 최대 `5` 제한

### Step 5. v0.2 records and tags transition

실행 파일:
- [supabase/migrations/20260313T210000Z_v0_2_records_tags_transition.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260313T210000Z_v0_2_records_tags_transition.sql)

역할:
- `documents` -> `records` 테이블 전환
- `topics` -> `tags` 테이블 전환
- `document_topics` -> `record_tags` 전환
- `created_by` -> `writer_user_id` 컬럼 전환
- comments 정책을 `records` 기준으로 갱신
- 앱 read/write가 v0.2 데이터 모델을 직접 사용하도록 준비

### Step 6. v0.2 PR review fixes

실행 파일:
- [supabase/migrations/20260313T220000Z_v0_2_pr_review_fixes.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260313T220000Z_v0_2_pr_review_fixes.sql)

역할:
- `tags` 직접 update 정책 제거
- `record_comments` update 정책 제거
- comment row의 `updated_at` touch trigger 추가

## 4. Recommended Execution Flow

1. Supabase 프로젝트 생성
2. `.env.local` 작성
3. 위 SQL 여섯 개를 순서대로 SQL Editor에서 실행
4. 로컬 서버 실행

```bash
pnpm dev
```

## 5. Verification

세팅 후 아래를 확인합니다.

1. `/` public reading 동작
2. `/author/sign-in` signup/login 화면 동작
3. signup 후 `profiles` row 생성 확인
4. 로그인 후 `/author` 접근 가능 여부 확인
5. public/private visibility 규칙 확인
6. public record comment read / authenticated comment create 확인

## 6. Rule For Future SQL Changes

- 새 migration SQL 파일을 추가할 때마다 이 문서의 `SQL Execution Order`와 `Recommended Execution Flow`를 함께 갱신합니다.
- 순서가 바뀌면 기존 SQL 위에 어떤 파일을 추가로 실행해야 하는지도 명확히 적습니다.
