# SETUP GUIDE

이 문서는 Personal Wiki 프로젝트를 처음 세팅하거나, 새 SQL migration이 추가될 때 따라야 하는 순서를 정리한 가이드입니다.

## 1. Environment Variables

`.env.local`에 아래 값을 채웁니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
SUPABASE_DEBUG_LOG=0
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

### Step 7. v0.3 record reactions

실행 파일:
- [supabase/migrations/20260313T233000Z_v0_3_record_reactions.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260313T233000Z_v0_3_record_reactions.sql)

역할:
- `record_bookmarks` 테이블 추가
- `record_likes` 테이블 추가
- 로그인 사용자 기준 bookmark / like 저장 정책 추가
- `My Library` 및 record detail reaction 동작 준비

### Step 8. v0.5 curation shelves

실행 파일:
- [supabase/migrations/20260316T123000Z_v0_5_curation_shelves.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260316T123000Z_v0_5_curation_shelves.sql)

역할:
- `curation_shelves` 테이블 추가
- `curation_shelf_records` 테이블 추가
- author 기준 선반 authoring 정책 추가
- public home에서 public record만 포함하는 선반 노출 준비

### Step 9. v0.5.3 author record query index

실행 파일:
- [supabase/migrations/20260321T120000Z_v0_5_3_author_records_index.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260321T120000Z_v0_5_3_author_records_index.sql)

역할:
- `records (writer_user_id, updated_at desc)` 복합 인덱스 추가
- author workspace 목록과 edit 진입 전후의 record 조회 비용 완화

### Step 10. v0.5.3 remove curation shelves

실행 파일:
- [supabase/migrations/20260321T123000Z_v0_5_3_remove_curation_shelves.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260321T123000Z_v0_5_3_remove_curation_shelves.sql)

역할:
- `curation_shelves`, `curation_shelf_records` 테이블 제거
- curation shelf trigger/function 정리
- 현재 제품 범위에서 제외된 수동 shelf 기능 제거 반영

### Step 11. v0.5.4 schema hardening

실행 파일:
- [supabase/migrations/20260321T140000Z_v0_5_4_schema_hardening.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260321T140000Z_v0_5_4_schema_hardening.sql)

역할:
- `records.published_at` null row backfill 및 default/not null 정리
- `book` / `article` 기준 `book_title` 일관성 check 추가
- public library listing 패턴에 맞는 `records` public index 추가

### Step 12. v0.5.4 source title compatibility cleanup

실행 파일:
- [supabase/migrations/20260321T150000Z_v0_5_4_source_title_nullable.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260321T150000Z_v0_5_4_source_title_nullable.sql)

역할:
- 기존 row의 빈 `source_title`을 `book_title/title` 기준으로 보정
- 새 record write path가 `source_title` 없이도 동작할 수 있게 nullable 완화

### Step 13. v0.5.4 author name compatibility cleanup

실행 파일:
- [supabase/migrations/20260321T160000Z_v0_5_4_author_name_nullable.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260321T160000Z_v0_5_4_author_name_nullable.sql)

역할:
- 기존 row의 빈 `author_name`을 `profiles.user_name` 기준으로 보정
- 새 record write path가 `author_name` 없이도 동작할 수 있게 nullable 완화

### Step 14. v0.5.4 drop unused legacy record columns

실행 파일:
- [supabase/migrations/20260321T170000Z_v0_5_4_drop_unused_legacy_record_columns.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260321T170000Z_v0_5_4_drop_unused_legacy_record_columns.sql)

역할:
- 현재 app read/write에서 더 이상 쓰지 않는 `source_title`, `source_url`, `isbn`, `intro` 제거
- `records` schema를 v0.2 이후 실제 제품 계약에 더 가깝게 정리

### Step 15. v0.5.4 public record comments only

실행 파일:
- [supabase/migrations/20260321T180000Z_v0_5_4_public_record_comments_only.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260321T180000Z_v0_5_4_public_record_comments_only.sql)

역할:
- `record_comments` insert 정책을 public record 전용으로 tighten
- owner private preview에서 comment write가 우회되지 않도록 정책 정리

### Step 16. v0.6 public record reactions only

실행 파일:
- [supabase/migrations/20260322T130000Z_v0_6_public_record_reactions_only.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260322T130000Z_v0_6_public_record_reactions_only.sql)

역할:
- 기존 private record bookmark / like row 정리
- `record_bookmarks`, `record_likes` insert 정책을 public record 전용으로 tighten
- 앱의 private record reaction 제거와 policy 계약을 맞춤

### Step 17. v0.6.6 record reaction count

실행 파일:
- [supabase/migrations/20260327T120000Z_v0_6_6_record_reaction_count.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260327T120000Z_v0_6_6_record_reaction_count.sql)

역할:
- `records.reaction_count` 컬럼 추가 및 기존 like 수 backfill
- `record_likes` insert/delete 시 reaction count를 유지하는 trigger 추가
- public discovery의 `most-reacted` 정렬 비용을 줄이기 위한 index 추가

### Step 18. v0.6.8 public reading search performance

실행 파일:
- [supabase/migrations/20260329T120000Z_v0_6_8_public_reading_search_performance.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260329T120000Z_v0_6_8_public_reading_search_performance.sql)

역할:
- `records.excerpt`, `records.search_vector` 컬럼 추가 및 기존 row backfill
- public reading list/query 최적화를 위한 trigger, GIN index, 복합 index 추가
- public discovery query에서 사용할 `search_public_records` RPC 추가

### Step 19. v0.6.11 record image storage

실행 파일:
- [supabase/migrations/20260330T120000Z_v0_6_11_record_images_storage.sql](/Users/leejun/Desktop/Projects/personal-wiki/supabase/migrations/20260330T120000Z_v0_6_11_record_images_storage.sql)

역할:
- private storage bucket `record-images` 추가
- 업로드 제한 `10MB`, `jpg/png/webp` 허용 mime 설정
- owner 기준 insert/update/delete/select storage policy 추가
- author editor 이미지 업로드/preview/cleanup 경로 준비

## 4. Recommended Execution Flow

1. Supabase 프로젝트 생성
2. `.env.local` 작성
3. 위 SQL 열아홉 개를 순서대로 SQL Editor에서 실행
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
