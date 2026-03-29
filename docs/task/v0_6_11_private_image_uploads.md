# Personal Wiki v0.6.11 Private Image Uploads

## Branch

- Working branch: `V0_6_11_Image_Uploads`

## Goal

- author editor에서 이미지를 업로드하고, private bucket 기반으로 안전하게 렌더링할 수 있게 만든다.

## Scope

- Supabase Storage private bucket 기반 이미지 업로드를 추가한다.
- author editor에 업로드 버튼을 추가한다.
- drag and drop 업로드를 지원한다.
- paste image 업로드를 지원한다.
- 업로드 성공 시 markdown에 이미지 토큰을 자동 삽입한다.
- public/private record 렌더에서 storage key를 signed URL로 변환해 이미지를 보여준다.
- 문서 저장 시 더 이상 참조하지 않는 업로드 이미지는 cleanup 대상으로 정리한다.
- 업로드 제한을 둔다.
  - max file size: `10MB`
  - allowed mime types: `image/jpeg`, `image/png`, `image/webp`

## Non-Goals

- image crop / resize UI
- gallery / asset manager 화면
- 문서 외부에서 이미지 단독 열람 UI
- svg, gif, video 지원

## Current Problems

- 현재 editor는 markdown 이미지 문법만 삽입할 수 있고 실제 업로드 경로가 없다.
- public/private record 모두 markdown 이미지는 렌더할 수 있지만 storage 연동이 없어 실사용성이 떨어진다.
- private record 이미지가 향후 필요해질 경우 public bucket은 visibility 규칙과 충돌한다.

## Proposed Changes

- private bucket `record-images`를 추가한다.
- 이미지 경로는 `record-images/{userId}/{uuid}.{ext}` 규칙으로 저장한다.
- markdown에는 signed URL이 아니라 storage key 기반 토큰을 저장한다.
  - 예: `![alt](storage://record-images/user-id/file.webp)`
- 렌더 시 storage token을 signed URL로 변환한다.
- upload server action은 author only로 제한한다.
- storage RLS는 업로드/조회/삭제를 owner 기준으로 제한한다.
- 문서 저장 시 이전 contents와 새 contents를 비교해 더 이상 참조되지 않는 storage key를 삭제한다.
- editor에서 다음 UX를 제공한다.
  - file picker 업로드
  - drop zone 업로드
  - clipboard image paste 업로드
  - 업로드 진행 상태와 실패 메시지

## Acceptance Criteria

- author editor에서 이미지를 선택하면 storage에 업로드되고 markdown에 자동 삽입된다.
- drag and drop / paste image가 동일한 업로드 경로를 사용한다.
- public record는 signed URL을 통해 이미지가 정상 렌더링된다.
- private record preview도 signed URL을 통해 이미지가 정상 렌더링된다.
- 문서에서 제거된 이미지 key는 저장 후 cleanup 된다.
- 10MB 초과 파일과 비허용 mime type은 거부된다.
- lint, typecheck, test, build가 통과한다.

## Risks

- signed URL 만료 시간을 너무 짧게 잡으면 reading session 도중 이미지가 깨질 수 있다.
- cleanup 비교가 잘못되면 아직 참조 중인 이미지를 지울 수 있다.
- drag/drop, paste 이벤트 처리에서 textarea selection 복구가 어색할 수 있다.
- private bucket 사용 시 `next/image` remotePatterns와 signed URL query string handling을 같이 확인해야 한다.

## Verification

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- author image upload button
- drag and drop upload
- paste image upload
- public record image render
- private record preview image render
- orphan cleanup after save

## Related Docs

- [docs/test_guide/v0_6_11_private_image_uploads.md](../test_guide/v0_6_11_private_image_uploads.md)
- [README.md](/Users/leejun/Desktop/Projects/personal-wiki/README.md)
- [SETUP_GUIDE.md](/Users/leejun/Desktop/Projects/personal-wiki/SETUP_GUIDE.md)
