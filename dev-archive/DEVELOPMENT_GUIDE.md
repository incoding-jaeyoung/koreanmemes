# 버추어파이터 커뮤니티 개발 가이드

이 문서는 프로젝트의 일관성을 유지하고 코드 품질을 보장하기 위한 개발 가이드입니다.

## 📐 디자인 시스템

### 폰트 크기 규칙

**히어로 영역을 포함하여 모든 페이지는 `text-xs` ~ `text-3xl`의 표준 클래스만 사용합니다.**

- ✅ 허용: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`
- ❌ 금지: `text-[10px]` 등 `text-xs`보다 작은 모든 커스텀 사이즈, `text-4xl` 이상의 과도한 사이즈 (히어로 영역 제외)

**예외:**
- 메인 페이지 히어로 섹션만 `text-3xl` 이상 사용 가능

### 색상 시스템

- **Primary**: `brand-blue` (#0ea5e9) - 주요 액션, 링크
- **Accent**: `brand-red` (#ff0055) - 강조, 경고
- **Neutral**: `neutral-*` - 텍스트, 배경

## 🌍 다국어 지원 (i18n)

### 원칙

**모든 정적 텍스트는 i18n으로 관리합니다.**

사용자의 언어 설정(`preferred_language`)에 따라 자동으로 번역됩니다.

### 지원 언어

- 한국어 (ko) - 기본
- 영어 (en)
- 일본어 (ja)

### 구현 방법

```tsx
// ❌ 하드코딩된 텍스트
<h1>게시판</h1>

// ✅ i18n 사용
import { useTranslation } from 'next-i18next';

const { t } = useTranslation('common');
<h1>{t('board.title')}</h1>
```

### 번역 파일 구조

```
/public/locales/
  ├── ko/
  │   ├── common.json
  │   ├── board.json
  │   └── profile.json
  ├── en/
  │   ├── common.json
  │   ├── board.json
  │   └── profile.json
  └── ja/
      ├── common.json
      ├── board.json
      └── profile.json
```

### 마이그레이션 계획

**현재 만들어진 모든 페이지의 정적 텍스트를 i18n으로 변환합니다.**

우선순위:
1. 공통 컴포넌트 (헤더, 푸터)
2. 주요 페이지 (메인, 게시판, 프로필)
3. 캐릭터 페이지
4. 기타 페이지

## 🎨 UI/UX 가이드

### 버튼

- Primary: `bg-brand-blue text-white`
- Secondary: `bg-white/5 border border-white/10`
- Danger: `bg-brand-red text-white`

### 카드

```tsx
<div className="glass-card p-8">
  {/* 내용 */}
</div>
```

### 입력 필드

```tsx
<input className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-blue/50 transition-colors" />
```

## 📝 코드 스타일

### 컴포넌트 구조

```tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

export default function ComponentName() {
  const { t } = useTranslation('namespace');
  
  // State
  const [data, setData] = useState(null);
  
  // Effects
  useEffect(() => {
    // ...
  }, []);
  
  // Handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 네이밍 규칙

- 컴포넌트: PascalCase (`ProfilePage`, `CommentList`)
- 함수: camelCase (`handleSubmit`, `fetchData`)
- 상수: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `ALLOWED_TYPES`)

## 🔒 보안

### API 라우트

- 모든 민감한 작업은 사용자 인증 확인 필수
- Rate limiting 적용
- 입력 검증 철저히

### 환경 변수

- `.env.local`에 민감한 정보 저장
- Git에 커밋하지 않음
- 예시: `.env.example` 제공

## 📦 폴더 구조

```
src/
├── app/                 # Next.js 앱 라우터
│   ├── api/            # API 라우트
│   ├── board/          # 게시판 페이지
│   ├── characters/     # 캐릭터 페이지
│   └── profile/        # 프로필 페이지
├── components/         # 재사용 컴포넌트
├── utils/             # 유틸리티 함수
└── styles/            # 전역 스타일
```

## 🚀 배포 전 체크리스트

- [ ] i18n 번역 완료
- [ ] 폰트 크기 규칙 준수 (`text-xs` ~ `text-3xl`)
- [ ] 모든 API 라우트 인증 확인
- [ ] 이용약관 및 개인정보처리방침 업데이트
- [ ] SEO 메타 태그 설정
- [ ] 성능 최적화 (이미지, 번들 크기)

## 📚 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [next-i18next 문서](https://github.com/i18next/next-i18next)
