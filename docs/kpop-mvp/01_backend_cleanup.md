# @back 작업: 게임 특화 코드 제거

> ⚠️ **중요: 이 작업은 반드시 복사된 새 프로젝트(dev-kpop)에서만 수행하세요.**
> 현재 작업 중인 디렉토리가 `dev-kpop` 인지 먼저 확인하세요.
> `dev-vf6` (원본 프로젝트)에서는 절대 실행하지 마세요.

이 프로젝트는 격투게임 커뮤니티(dev-vf6)에서 K-pop 커뮤니티로 전환합니다.
게임 특화 코드를 제거하고 범용 커뮤니티 플랫폼으로 정리해주세요.

## 삭제할 파일/폴더

```
src/app/characters/          # 캐릭터 페이지
src/app/ranks/               # 랭크 페이지
src/app/api/moves/           # 무브 API
src/components/character/    # 캐릭터 컴포넌트
src/data/                    # 게임 데이터 (캐릭터/무브 JSON 등)
parse_moves.cjs              # 루트의 파싱 스크립트
parse-char.js                # 루트의 파싱 스크립트
```

## 수정할 파일

### `src/app/api/posts/route.ts`
- posts 생성/조회 시 게임 특화 필드(rank, level 등) 참조 제거
- K-pop 관련 필드로 대체: `artist_tag` (아티스트/그룹 이름 태그, nullable string)

### Supabase 마이그레이션 파일 생성
`supabase/migrations/` 에 새 마이그레이션 파일 추가:

```sql
-- posts 테이블에서 게임 특화 컬럼 제거, k-pop 컬럼 추가
ALTER TABLE posts DROP COLUMN IF EXISTS rank;
ALTER TABLE posts DROP COLUMN IF EXISTS level;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS artist_tag TEXT;

-- profiles 테이블 게임 특화 컬럼 제거
ALTER TABLE profiles DROP COLUMN IF EXISTS rank;
ALTER TABLE profiles DROP COLUMN IF EXISTS level;
```

### `src/middleware.ts`
- `/characters`, `/ranks` 경로 관련 라우팅 규칙이 있다면 제거

### navigation/메뉴 관련 상수
- `src/constants/` 또는 Header 컴포넌트에서 characters, ranks 메뉴 항목 제거

## 확인 사항

- 삭제 후 빌드 에러 없는지 `npm run build` 또는 타입 체크로 검증
- characters/ranks를 import하는 다른 파일이 있으면 함께 정리
- gallery, board, news, profile API는 그대로 유지
