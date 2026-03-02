# K-pop 커뮤니티 MVP — 사용자 작업 가이드

> ⚠️ **원본 프로젝트(dev-vf6) 보호**
> 아래 모든 작업은 복사 후 생성된 `dev-kpop` 폴더에서만 진행하세요.
> 원본 dev-vf6의 Supabase, Cloudinary, 코드에는 절대 손대지 않습니다.
> 에이전트에게 작업을 지시할 때도 반드시 `dev-kpop` 디렉토리에서 실행하도록 명시하세요.

## 복사 후 작업 순서

### Step 1. 폴더 복사 및 새 git 초기화

```bash
cp -r dev-vf6 dev-kpop
cd dev-kpop
rm -rf .git
git init
git add .
git commit -m "init: fork from dev-vf6"
```

---

### Step 2. 새로 만들어야 하는 서비스 (직접 세팅)

| 서비스 | 할 일 | 공유 여부 |
|--------|-------|-----------|
| **Supabase** | 새 프로젝트 생성 → URL/KEY 복사 | ❌ 분리 |
| **Cloudinary** | 새 계정 or 새 클라우드네임 | ❌ 분리 |
| **Gemini API** | 기존 키 그대로 `.env.local`에 복붙 | ✅ 공유 가능 |
| **Vercel** | 새 프로젝트 생성, env 입력 | ❌ 분리 |

---

### Step 3. `.env.local` 업데이트

```env
# Supabase — 새 프로젝트
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary — 분리 (새 클라우드네임)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Gemini — 기존 키 그대로 복붙
GEMINI_API_KEY=

# 사이트
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Kpop Community
```

---

### Step 4. Supabase 마이그레이션

```bash
# 새 프로젝트에 연결
supabase link --project-ref <새_프로젝트_ID>

# 마이그레이션 적용 (게임 특화 테이블은 에이전트가 별도 정리)
supabase db push
```

> 게임 특화 테이블(moves, characters 등)은 에이전트 작업 후 직접 Supabase 대시보드에서 삭제

---

### Step 5. 에이전트 작업 순서

아래 파일을 순서대로 각 에이전트에게 전달:

```
1. @back  → 01_backend_cleanup.md   게임 특화 API/DB 제거
2. @front → 02_rebrand.md           브랜딩/사이트명 교체
3. @lan   → 03_i18n_kpop.md         번역 키 K-pop 용으로 정리
4. @front → 04_kpop_ui.md           K-pop 전용 UI (아티스트 태그 등)
```

---

### MVP 포함 기능

- 회원가입 / 로그인
- 게시글 작성 (텍스트 + 이미지)
- 게시글 목록 / 상세
- 다국어 UI (ko/en/ja)
- 게시글/댓글 자동 번역 (Gemini, 기존 로직 재사용)
- 좋아요 / 댓글

### MVP 제외 (삭제 대상)

- `src/app/characters/` — 캐릭터
- `src/app/ranks/` — 랭크
- `src/components/character/` — 캐릭터 컴포넌트
- `src/data/` — 게임 데이터
- `src/app/api/moves/` — 무브 API
- `parse_moves.cjs`, `parse-char.js` — 파싱 스크립트
- `supabase/migrations/` 중 게임 관련 파일
