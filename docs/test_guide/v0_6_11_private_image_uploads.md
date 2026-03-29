# v0.6.11 Private Image Uploads

## Goal

- author editor 이미지 업로드, private bucket 렌더링, cleanup 흐름을 검증한다.

## Preconditions

- `pnpm dev`가 실행 중이다.
- Supabase Storage bucket `record-images`와 관련 RLS 정책이 적용되어 있다.
- 로그인 가능한 author 계정이 있다.
- 테스트용 `jpg`, `png`, `webp` 파일과 10MB 초과 파일이 준비되어 있다.

## 1. Upload Button

- `/author/documents/new` 또는 기존 문서 edit 화면으로 이동한다.
- 이미지 업로드 버튼으로 파일을 선택한다.

Expected:
- 업로드가 성공하고 markdown contents에 storage token 기반 이미지 문법이 삽입된다.
- 업로드 중 상태와 성공/실패 피드백이 보인다.

## 2. Drag And Drop

- editor textarea 또는 drop target에 이미지 파일을 드롭한다.

Expected:
- 업로드가 같은 경로로 처리된다.
- 삽입 위치가 크게 어긋나지 않는다.

## 3. Paste Image

- 클립보드에 이미지가 있는 상태에서 editor에 paste 한다.

Expected:
- 이미지가 업로드되고 markdown에 자동 삽입된다.

## 4. File Validation

- 10MB 초과 파일을 업로드한다.
- 허용하지 않은 mime type 파일을 업로드한다.

Expected:
- 업로드가 거부되고 명확한 오류가 보인다.

## 5. Public Render

- public record에 이미지를 포함해 저장한다.
- `/library/[slug]`에서 이미지를 확인한다.

Expected:
- signed URL을 통해 이미지가 정상 렌더링된다.
- broken image 없이 표시된다.

## 6. Private Preview Render

- private record에 이미지를 포함해 저장한다.
- workspace preview 경로로 private record를 연다.

Expected:
- private preview에서도 이미지가 정상 렌더링된다.
- public route에서 private image가 누출되지 않는다.

## 7. Cleanup

- 문서에서 기존 이미지 markdown을 제거하고 저장한다.

Expected:
- 제거된 storage key가 cleanup 대상으로 정리된다.
- 남아 있는 이미지 key는 유지된다.

## Regression Focus

- 기존 markdown preview와 public markdown render가 깨지지 않는지 확인한다.
- signed URL 기반 이미지가 route 이동 후에도 안정적으로 보이는지 확인한다.
