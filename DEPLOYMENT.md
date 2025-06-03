# Korean Memes Platform - Vercel 배포 가이드

## 🚀 배포 과정

### 1. Vercel 계정 연결
1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. "New Project" 클릭
3. 이 GitHub 레포지토리 선택
4. "Import" 클릭

### 2. 환경변수 설정
Vercel 프로젝트 설정에서 다음 환경변수들을 추가하세요:

#### 필수 환경변수
```
ADMIN_EMAIL=admin@koreanmemes.com
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=your-super-secure-jwt-secret-key-here
SECRET_ACCESS_KEY=your-secret-access-key-here
```

#### 기존 환경변수 (있다면 추가)
```
DATABASE_URL=your-database-url
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
OPENAI_API_KEY=your-openai-api-key
```

### 3. 도메인 설정 업데이트
배포 후 실제 도메인으로 변경해야 할 파일들:

#### `src/app/layout.tsx`
```typescript
// localhost:3000을 실제 도메인으로 변경
metadataBase: new URL('https://your-domain.vercel.app'),
```

#### `src/components/ProtectedRoute.tsx`
비밀 액세스 키는 자동으로 URL에서 제거되므로 수정 불필요

## 🔐 권한 시스템 사용법

### 관리자 로그인
1. `/login` 페이지에서 로그인
2. 이메일: `admin@koreanmemes.com`  
3. 비밀번호: 환경변수에 설정한 비밀번호

### 비밀 URL 접근
관리자 로그인 없이도 다음과 같이 접근 가능:
```
https://your-domain.vercel.app/write?access=your-secret-access-key
https://your-domain.vercel.app/edit/[id]?access=your-secret-access-key
```

## 🛠️ 기능 테스트

### 배포 후 확인사항
- [ ] 로그인/로그아웃 작동
- [ ] 비로그인 시 글쓰기 페이지 접근 차단
- [ ] 비밀 URL로 글쓰기 접근 가능
- [ ] 포스트 수정/삭제 권한 체크
- [ ] 댓글 기능 정상 작동
- [ ] 이미지 업로드/번역 정상 작동

## 📝 관리 방법

### 일반 사용자
- 홈페이지에서 포스트 조회
- 댓글 작성/조회만 가능

### 관리자 (로그인 후)
- 모든 기능 사용 가능
- 글 작성/수정/삭제
- 이미지 업로드/번역

### 특별 접근 (비밀 URL)
- 로그인 없이 관리자 기능 사용
- URL에서 access 파라미터 자동 제거
- 세션 동안 권한 유지

## 🔧 문제 해결

### 로그인이 안 되는 경우
1. 환경변수 `ADMIN_EMAIL`, `ADMIN_PASSWORD` 확인
2. JWT_SECRET 설정 확인
3. 브라우저 쿠키 삭제 후 재시도

### 권한 오류가 발생하는 경우
1. SECRET_ACCESS_KEY 환경변수 확인
2. 비밀 URL 형식 확인
3. 브라우저 개발자 도구에서 네트워크 탭 확인

## 🚀 배포 완료!

모든 설정이 완료되면 Korean Memes Platform이 성공적으로 배포됩니다.
- 관리자는 로그인 또는 비밀 URL로 컨텐츠 관리
- 방문자는 댓글만 작성 가능
- 한국 문화 컨텐츠 자동 번역 기능 제공 