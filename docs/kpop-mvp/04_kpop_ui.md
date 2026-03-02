# @front 작업: K-pop 전용 UI 추가

> ⚠️ **중요: 이 작업은 반드시 복사된 새 프로젝트(dev-kpop)에서만 수행하세요.**
> 현재 작업 중인 디렉토리가 `dev-kpop` 인지 먼저 확인하세요.
> `dev-vf6` (원본 프로젝트)에서는 절대 실행하지 마세요.

## 전제 조건
- `01_backend_cleanup.md` 작업 완료 (posts 테이블에 `artist_tag` 컬럼 존재)
- `02_rebrand.md` 작업 완료
- `03_i18n_kpop.md` 작업 완료 (i18n 키 존재)

## 1. 게시글 작성 폼에 아티스트 태그 추가

`src/components/editor/` 또는 게시글 작성 컴포넌트:
- 아티스트/그룹명 입력 필드 추가 (optional, text input)
- placeholder: i18n 키 `kpop.artistTagPlaceholder`
- 라벨: i18n 키 `kpop.artistTag`
- API 전송 시 `artist_tag` 필드 포함

## 2. 게시글 목록에 아티스트 태그 표시

게시글 카드(board list item)에:
- `artist_tag` 값이 있으면 뱃지로 표시 (`bg-brand-red text-white` 스타일)
- 없으면 표시 안 함

## 3. 아티스트별 필터링

게시판 목록 페이지 상단에 필터 UI:
- 아티스트 태그가 있는 게시글에서 unique 태그 목록 추출
- 태그 클릭 시 해당 아티스트 게시글만 필터링 (URL query: `?artist=태그명`)
- "전체" 버튼으로 필터 해제

API: `GET /api/posts?artist=태그명` 쿼리 파라미터 지원 필요 (백엔드에 요청)

## 4. 게시글 상세 페이지 번역 버튼

기존 번역 기능(`/api/posts/[id]/translate`)이 이미 있으므로 UI만 확인:
- 번역 버튼이 게시글 상세에 이미 있는지 확인
- 없으면 추가: "번역 보기" 버튼 → 클릭 시 Gemini 번역 결과 표시
- 번역 중 로딩 상태 표시

## 주의사항

- 모든 텍스트는 i18n 키 사용
- 기존 glass-card, brand-blue/red 디자인 시스템 유지
- 아티스트 태그 뱃지: `text-xs font-medium px-2 py-0.5 rounded-full`
