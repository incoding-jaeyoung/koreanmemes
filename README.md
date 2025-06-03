# Korean Memes & Culture Hub 🇰🇷

한국 문화와 밈을 세계와 공유하는 플랫폼입니다. 자동 번역 기능과 권한 관리 시스템을 통해 안전하고 효율적인 컨텐츠 관리를 제공합니다.

## 📋 프로젝트 개요

### 🎯 **주요 목적**
- 한국의 밈, 문화, 유머 콘텐츠를 영어로 번역하여 글로벌 공유
- AI 이미지 번역 기능으로 언어 장벽 제거
- 다중 이미지 지원으로 풍부한 콘텐츠 표현

### 🛠 **기술 스택**
- **Frontend**: React 18, Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (개발), PostgreSQL (프로덕션 예정)
- **AI/ML**: OpenAI GPT-4o-mini, Tesseract.js OCR
- **Storage**: Cloudinary (이미지 호스팅)
- **UI Components**: Lucide React Icons

## 🚀 주요 기능

### 🌏 자동 번역 기능
- **실시간 번역**: 한글 입력 시 자동으로 영어 번역
- **이미지 번역**: OpenAI Vision API를 활용한 이미지 내 텍스트 자동 번역
- **댓글 번역**: 한국 커뮤니티 댓글 자동 번역 및 표시

### 📱 반응형 디자인
- **모바일 최적화**: 모든 디바이스에서 완벽한 사용자 경험
- **현대적 UI**: Tailwind CSS 기반의 깔끔하고 직관적인 인터페이스

### 🏷️ 카테고리 시스템
- **K-Humor** 😂: 한국 유머, 밈, 재미있는 컨텐츠
- **K-Culture** 🏮: 한국 문화, 전통, 관습
- **K-Drama** 📺: K-드라마, 엔터테인먼트, 연예인
- **K-Lifestyle** 🌸: 한국 라이프스타일, 일상
- **K-Tech** 💻: 한국 IT, 스타트업, 기술
- **General** 💬: 기타 한국 관련 주제

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── posts/          # 게시글 API
│   │   ├── translate/      # 번역 API
│   │   └── upload/         # 이미지 업로드 API
│   ├── post/[id]/         # 게시글 상세 페이지
│   ├── edit/[id]/         # 게시글 수정 페이지
│   ├── write/             # 게시글 작성 페이지
│   └── globals.css        # 전역 스타일
├── components/
│   ├── ImageTranslator.tsx      # 이미지 번역 에디터
│   ├── MultipleImageUpload.tsx  # 다중 이미지 업로드
│   └── InfiniteScroll.tsx       # 무한 스크롤
└── lib/
    └── db.ts             # 데이터베이스 설정
```

## 🛠 개발 진행사항

### 📅 **2024-01-30 (최근 업데이트)**

#### 🔧 **버그 수정**
1. **이미지 번역 좌표 문제 해결**
   - 문제: 이미지 크기 조정 시 마우스 포인터와 선택 영역 좌표 불일치
   - 해결: 캔버스 크기를 화면 표시 크기와 일치시키고 좌표 변환 로직 개선
   - 파일: `src/components/ImageTranslator.tsx`

2. **조회수 중복 증가 문제 해결**
   - 문제: 게시물 클릭 시 조회수가 2개씩 증가
   - 해결: useEffect 의존성 배열 최적화 (post 전체 → post?.id)
   - 파일: `src/app/post/[id]/page.tsx`

#### 🎨 **UI/UX 개선**
- 번역 배경 컬러 설정 위치 안내
- 이미지 번역 에디터 좌표 정확도 향상

### 📅 **이전 주요 마일스톤**

#### ✅ **Phase 1: 기본 플랫폼 구축**
- Next.js 15 + TypeScript 프로젝트 초기 설정
- Prisma ORM을 통한 데이터베이스 스키마 설계
- 게시글 CRUD API 구현
- 기본 UI/UX 설계 및 구현

#### ✅ **Phase 2: AI 번역 기능**
- OpenAI API 연동
- Tesseract.js OCR 엔진 통합
- 자동 이미지 번역 파이프라인 구축
- 수동 번역 에디터 개발

#### ✅ **Phase 3: 다중 이미지 지원**
- Cloudinary 이미지 호스팅 연동
- 다중 이미지 업로드 시스템
- 드래그앤드롭 UI 구현
- 이미지 순서 변경 기능

#### ✅ **Phase 4: 사용자 경험 개선**
- 자동 번역 시스템 (제목/내용)
- 한국어 우선 UI 재설계
- React 렌더링 최적화
- 무한 스크롤 구현

## 🚀 시작하기

### 📋 **필수 요구사항**
- Node.js 18 이상
- npm 또는 yarn

### ⚙️ **환경 설정**
1. 저장소 클론
```bash
git clone [repository-url]
cd KoreanMemes
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정 (`.env.local` 파일 생성)
```env
# 데이터베이스
DATABASE_URL="file:./dev.db"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

4. 데이터베이스 초기화
```bash
npx prisma generate
npx prisma db push
```

5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 📊 **데이터베이스 스키마**

```prisma
model Post {
  id               String   @id @default(cuid())
  title            String
  koreanTitle      String?
  content          String
  koreanContent    String?
  category         String
  imageUrl         String?
  additionalImages Json     @default("[]")
  likes            Int      @default(0)
  views            Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

## 🎨 **주요 컴포넌트**

### `ImageTranslator.tsx`
- 이미지 번역 에디터의 핵심 컴포넌트
- Canvas 기반 영역 선택 및 실시간 번역
- 좌표 변환 로직 및 번역 결과 오버레이

### `MultipleImageUpload.tsx`
- 다중 이미지 업로드 및 관리
- 드래그앤드롭, 순서 변경, 개별 삭제 기능
- React 최적화로 불필요한 리렌더링 방지

## 🔄 **API 엔드포인트**

### 게시글 관리
- `GET /api/posts` - 게시글 목록 조회
- `POST /api/posts` - 새 게시글 생성
- `GET /api/posts/[id]` - 특정 게시글 조회
- `PUT /api/posts/[id]` - 게시글 수정
- `DELETE /api/posts/[id]` - 게시글 삭제
- `POST /api/posts/[id]/view` - 조회수 증가

### 번역 및 업로드
- `POST /api/translate` - 텍스트 번역
- `POST /api/upload` - 이미지 업로드 및 번역

## 🐛 **알려진 이슈**

### 해결 완료 ✅
- ~~이미지 번역 시 좌표 불일치 문제~~
- ~~조회수 중복 증가 문제~~
- ~~React 렌더링 무한 루프 문제~~
- ~~다중 이미지 저장 안되는 문제~~

### 개선 예정 🔄
- 사용자 인증 시스템 추가
- 댓글 및 평점 시스템
- 카테고리별 필터링 고도화
- 검색 기능 강화

## 🚀 **향후 계획**

### **Phase 5: 소셜 기능**
- 사용자 회원가입/로그인
- 프로필 시스템
- 좋아요/북마크 기능

### **Phase 6: 커뮤니티 기능**
- 댓글 시스템
- 게시글 공유 기능
- 태그 시스템

### **Phase 7: 성능 최적화**
- 이미지 캐싱 시스템
- API 응답 속도 개선
- SEO 최적화

## 📝 **라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**개발자**: damanegi  
**최종 업데이트**: 2025-06-03  
**프로젝트 상태**: 활발한 개발 중 🚧
