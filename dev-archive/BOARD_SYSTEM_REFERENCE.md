# 게시판 시스템 참조 (Board System Reference)

작업 시 **항상 이 문서와 기존 컴포넌트를 참조**하여 동일한 방식으로 확장한다.

---

## 1. 컴포넌트 파일 구조

```
src/components/board/
├── BoardListLayout.tsx   # 목록 페이지 전체 (fetch + 검색 + 페이지네이션 + 테이블)
├── BoardTable.tsx         # 테이블 형식 게시글 목록 (제목, 글쓴이, 추천, 조회, 날짜)
├── BoardDetailLayout.tsx  # 게시글 상세 (본문 + 댓글 + MiniBoardList 관련글)
├── BoardWriteLayout.tsx   # 글쓰기/수정 (TipTap 에디터)
├── BoardPagination.tsx    # 페이지네이션 (최대 5페이지, 항상 노출)
├── BoardSearchBar.tsx     # 검색 입력 + 리셋
├── BoardActionButtons.tsx # 상세 액션 (좋아요, 수정, 삭제, 핀)
└── index.ts               # barrel export

src/components/
└── MiniBoardList.tsx      # 게시글 상세 하단 "LATEST POSTS" / "CHARACTER POSTS" 미니 리스트
```

- **import**: `@/components/board` 에서 필요한 것만 가져오거나, `BoardListLayout` 등 직접 경로 사용.
- **MiniBoardList** 는 `BoardDetailLayout` 내부에서만 사용 (상세 하단 관련글). `characterSlug` 있으면 캐릭터 게시판 최신글, 없으면 자유게시판 최신글.

---

## 2. 컴포넌트별 역할 및 Props

### BoardListLayout (`src/components/board/BoardListLayout.tsx`)

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `heroConfig` | `HeroConfig` | ✅ | title, highlightTitle?, subtitle?, backgroundImage?, tags? |
| `apiEndpoint` | string | ✅ | 목록 fetch URL (예: `/api/board`, `/api/news`, `/api/characters/${slug}/board`) |
| `getPostHref` | `(post: PostRow) => string` | ✅ | 행 클릭 시 이동 경로 |
| `writePath` | string | - | 글쓰기 경로. 여기서 `/write` 제거한 값이 목록 basePath로 사용됨 |
| `showWriteButton` | boolean | - | 기본 true |
| `emptyKey` | string | - | 빈 목록 i18n 키 (기본 `board.empty`) |
| `searchPlaceholderKey` | string | - | 검색 placeholder i18n 키 |
| `postsPerPage` | number | - | 기본 15 |
| `categoryBadge` | CategoryBadgeConfig | - | 없으면 카테고리 뱃지 숨김 |
| `hideHero` | boolean | - | true면 HeroSection 숨김 (캐릭터 페이지 등) |

- 내부에서 `useSearchParams` 사용 → **Suspense** 로 감싸서 사용됨. 페이지는 그냥 `<BoardListLayout ... />` 만 넣으면 됨.

### BoardDetailLayout (`src/components/board/BoardDetailLayout.tsx`)

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `heroConfig` | `HeroConfig` | ✅ | 상세 상단 히어로 |
| `getPostApiUrl` | `(id: string) => string` | ✅ | 예: `(id) => /api/posts/${id}` |
| `getViewApiUrl` | `(id: string) => string` | ✅ | 조회수 증가 POST |
| `getLikeApiUrl` | `(id: string) => string` | ✅ | 좋아요 토글 POST |
| `getPinApiUrl` | `(id: string) => string` | - | 관리자 상단고정 (없으면 핀 버튼 숨김) |
| `getDeleteApiUrl` | `(id: string) => string` | ✅ | 삭제 DELETE |
| `getEditPath` | `(id: string) => string` | ✅ | 예: `(id) => /board/write?edit=${id}` |
| `listPath` | string | ✅ | 목록으로 돌아가기 경로 |
| `showRelatedPosts` | boolean | - | true면 하단에 MiniBoardList 표시 |
| `showCategory` | boolean | - | 카테고리 뱃지 표시 여부 |
| `categoryColorMap` | Record<string, string> | - | 카테고리별 Tailwind 텍스트 색상 |

- 관련글: 내부에서 `post.character_slug` 를 `MiniBoardList` 의 `characterSlug` 로 전달. **페이지에서 characterSlug 를 넘길 필요 없음.**

### BoardWriteLayout (`src/components/board/BoardWriteLayout.tsx`)

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `heroConfig` | `HeroConfig` | ✅ | 글쓰기 상단 히어로 |
| `listPath` | string | ✅ | 제출 성공 후 이동 경로 |
| `getPostApiUrl` | `(id: string) => string` | ✅ | 수정 모드에서 게시글 조회 |
| `createApiUrl` | string | ✅ | POST 생성 |
| `updateApiUrl` | `(id: string) => string` | ✅ | PATCH 수정 |
| `categories` | CategoryOption[] | - | 없으면 카테고리 UI 숨김 |
| `defaultCategory` | string | - | 기본 선택 카테고리 |
| `draftKey` | string | - | localStorage 초안 키 접두어 |
| `extraFields` | Record<string, string> | - | POST body 추가 (예: board_type) |
| `showComboHelp` | boolean | - | 콤보/조이스틱 도움말 표시 |

- 수정 모드: URL `?edit=:id` 로 판단. `getPostApiUrl(editId)` 로 데이터 로드.

### MiniBoardList (`src/components/MiniBoardList.tsx`)

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `characterSlug` | string \| null \| undefined | - | 있으면 해당 캐릭터 게시판 최신글, 없으면 자유게시판 최신글 |
| `currentPostId` | string | ✅ | 현재 글 ID (해당 행 강조 + 클릭 비활성화) |

- **링크 규칙**: `characterSlug` 있으면 `/characters/${characterSlug}/board/${post.id}`, 없으면 `/board/${post.id}`. 절대 상세 페이지에서 다른 게시판으로 링크하지 않음.

### 기타 (BoardTable, BoardPagination, BoardSearchBar, BoardActionButtons)

- 목록/상세/글쓰기 레이아웃 내부에서만 사용. **페이지에서 직접 사용하지 않음.**

---

## 3. 페이지별 사용 패턴 (현재 구현)

| 구분 | 목록 페이지 | 상세 페이지 | 글쓰기 페이지 |
|------|-------------|-------------|----------------|
| **자유게시판** | `app/board/page.tsx` → BoardListLayout | `app/board/[id]/page.tsx` → BoardDetailLayout | `app/board/write/page.tsx` → BoardWriteLayout |
| **새소식** | `app/news/page.tsx` → BoardListLayout | `app/news/[id]/page.tsx` → BoardDetailLayout | `app/news/write/page.tsx` → BoardWriteLayout |
| **캐릭터 게시판** | `app/characters/[slug]/board/page.tsx` → BoardListLayout (hideHero) | `app/characters/[slug]/board/[id]/page.tsx` → BoardDetailLayout | `app/characters/[slug]/board/write/page.tsx` → BoardWriteLayout |

- 자유게시판: `apiEndpoint="/api/board"`, `getPostHref={(p) => /board/${p.id}}`, `writePath="/board/write"`, `listPath="/board"`.
- 새소식: `apiEndpoint="/api/news"`, `getPostHref={(p) => /news/${p.id}}`, `writePath="/news/write"`, `listPath="/news"`, 관리자만 글쓰기 버튼.
- 캐릭터: `apiEndpoint={/api/characters/${slug}/board}`, `getPostHref={(p) => /characters/${slug}/board/${p.id}}`, `writePath={/characters/${slug}/board/write}`, `hideHero` 사용 가능.

---

## 4. 새 게시판 추가 시 패턴

1. **목록**: 새 페이지에서 `BoardListLayout` 만 사용. 필수 연결:
   - `apiEndpoint`: 목록 API URL
   - `getPostHref`: 상세 경로
   - `writePath`: 글쓰기 경로
   - `heroConfig` (또는 `hideHero`)
2. **상세**: `BoardDetailLayout` 에 API/경로만 맞게 연결. 관련글 필요하면 `showRelatedPosts={true}`.
3. **글쓰기**: `BoardWriteLayout` 에 `listPath`, create/update API, 필요 시 `extraFields`(예: board_type).
4. **API**: 목록 GET(페이지/검색), 단건 GET, 조회수/좋아요/핀/삭제 등 기존 패턴과 동일하게 구현.

**원칙**: 목록/상세/글쓰기 UI는 새 컴포넌트 만들지 말고, 기존 Board* 레이아웃을 재사용한다.

---

## 5. 참고 사항 (과거 수정 이력)

- **BoardPagination**: `totalPages <= 1` 이어도 항상 노출 (`safeTotalPages = Math.max(1, totalPages)`).
- **MiniBoardList**: 링크는 반드시 `characterSlug` 유무에 따라 `/characters/.../board/:id` vs `/board/:id` 로 분기.
- **캐릭터 페이지**: 커스텀 카드/자체 fetch 제거, 전부 `BoardListLayout` + `apiEndpoint` 로 통일.
