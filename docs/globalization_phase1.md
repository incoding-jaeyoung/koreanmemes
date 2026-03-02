# Project: vfmania.com Globalization - Phase 1 (Foundation & Titles)

## 1. 목표 및 전략 (Goal & Strategy)
이 문서는 **vfmania.com**의 다국어 지원을 위한 **1단계(기반 구축 및 제목 번역)** 개발 명세서입니다.

### 핵심 전략: Hybrid Translation
1.  **제목(Title) -> Eager Translation (즉시 번역)**
    - **이유:** 리스트 페이지의 로딩 속도를 최적화하기 위함.
    - **시점:** 게시글 작성(`create`) 및 수정(`update`) 시점에 즉시 수행.
2.  **본문/댓글 -> Lazy Translation (지연 번역)**
    - **참고:** *이번 Phase 1에서는 구현하지 않음.* (DB 스키마만 미리 준비).

### 기술 스택 (Tech Stack)
- **Framework:** Next.js (App Router)
- **Database:** Prisma (PostgreSQL)
- **AI Model:** Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Languages:** Korean(ko), English(en), Japanese(jp)

---

## 2. 데이터베이스 스키마 (Database Schema)

**Task:** `schema.prisma` 파일에 아래 모델들을 추가/수정하시오.

### A. PostTranslation 모델 (추가)
- **목적:** 게시글의 번역된 제목과 본문을 저장.
- **필드:**
  - `id`: String (CUID/UUID, PK)
  - `postId`: String (FK -> Post)
  - `lang`: String (예: 'en', 'jp', 'ko')
  - `title`: String (번역된 제목)
  - `content`: String? (번역된 본문 - *Phase 1에서는 null 가능*)
  - `createdAt`: DateTime
- **제약조건:** `@@unique([postId, lang])` (한 게시글에 언어별 데이터는 하나만 존재)

### B. CommentTranslation 모델 (추가 - Future Use)
- **목적:** 댓글 번역 저장 (미리 생성).
- **필드:**
  - `id`: String (PK)
  - `commentId`: String (FK -> Comment)
  - `lang`: String
  - `content`: String (번역된 댓글)
- **제약조건:** `@@unique([commentId, lang])`

### C. 기존 모델 연결
- `Post` 모델에 `translations PostTranslation[]` 관계 필드 추가.
- `Comment` 모델에 `translations CommentTranslation[]` 관계 필드 추가.

---

## 3. Gemini 유틸리티 설정 (Gemini Configuration)

**Task:** `lib/gemini.ts` (또는 적절한 유틸리티 경로)에 Gemini 클라이언트를 설정하시오.

1.  **초기화:**
    - `@google/generative-ai` 패키지 사용.
    - API Key는 환경변수(`GOOGLE_GEMINI_API_KEY`)에서 로드.
    - 모델: `gemini-1.5-flash` (비용 효율성 및 속도 최적화).

2.  **번역 함수 구현 (`translateTitle`):**
    - 입력: `text` (원본 제목), `targetLangs` (대상 언어 배열 예: ['en', 'jp'])
    - **System Instruction (프롬프트):**
      > "You are a specialized translator for the 'Virtua Fighter' game community. Translate the gaming terminology accurately. Output MUST be a clean JSON object mapping language codes to translated text. Example: {\"en\": \"...\", \"jp\": \"...\"}"
    - **출력:** 파싱된 JSON 객체 반환.

---

## 4. 제목 번역 비즈니스 로직 (Business Logic)

**Task:** 게시글 작성, 수정 및 **조회(Display)** 로직을 구현하시오.

### A. 게시글 작성 (`createPost`)
1.  사용자가 글을 작성하여 DB에 원본 `Post` 저장.
2.  **저장 직후 (After Save):**
    - `lib/gemini.ts`의 번역 함수를 호출하여 제목을 나머지 언어로 번역.
    - 예: 원본이 'ko'라면 -> 'en', 'jp' 제목 생성.
3.  번역된 결과를 `PostTranslation` 테이블에 저장 (`createMany`).
4.  *주의:* 번역 실패가 원본 글 작성을 막지 않도록 예외 처리(`try-catch`)할 것.

### B. 게시글 수정 (`updatePost`)
1.  사용자가 제목을 수정했는지 확인.
2.  **제목 변경 시:**
    - 해당 `postId`의 기존 `PostTranslation` 데이터를 모두 삭제 (`deleteMany`).
    - 새로운 제목으로 Gemini 번역 재실행 -> DB 저장.

### C. 사용자 언어 감지 및 동적 표시 (Dynamic Display Logic) - **중요**
1.  **언어 감지 (Language Detection):**
    - 현재 사이트에서 사용 중인 언어 설정(Cookie, Header, 혹은 Store 상태)을 가져오는 로직을 활용할 것.
    - 예: `cookie.get('NEXT_LOCALE')` 또는 현재 구현된 언어 상태 관리 로직 참조.

2.  **데이터 매핑 (Data Mapping):**
    - 게시글 목록(`getPosts`) 조회 시 `include: { translations: true }`를 포함.
    - **UI 렌더링 시 로직:**
      ```typescript
      const currentLang = userLanguage; // 현재 사용자 언어 (예: 'en')
      const translatedData = post.translations.find(t => t.lang === currentLang);
      
      // 우선순위: 1. 해당 언어 번역본 -> 2. 원본 제목
      const displayTitle = translatedData?.title || post.title;
      ```
3.  **UI 표시:**
    - 번역된 제목이 표시될 경우, 원본과 구분할 수 있는 시각적 힌트(예: 지구본 아이콘 🌐)를 제목 옆에 작게 표시할 것.

    4.더 좋은 방법이나 마크다운에서 틀린게 있다면 알려줘