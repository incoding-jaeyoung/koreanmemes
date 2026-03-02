# @front 작업: K-pop 커뮤니티 브랜딩 교체

> ⚠️ **중요: 이 작업은 반드시 복사된 새 프로젝트(dev-kpop)에서만 수행하세요.**
> 현재 작업 중인 디렉토리가 `dev-kpop` 인지 먼저 확인하세요.
> `dev-vf6` (원본 프로젝트)에서는 절대 실행하지 마세요.

이 프로젝트를 격투게임 커뮤니티에서 K-pop 커뮤니티로 리브랜딩합니다.

## 사이트 설정 파일 생성

`src/config/site.ts` 파일을 새로 만들어 사이트 설정을 중앙화:

```ts
export const siteConfig = {
  name: 'Kpop Community',
  description: 'Global K-pop fan community',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  defaultLocale: 'ko',
} as const;
```

## 하드코딩된 사이트명 교체

코드베이스에서 기존 게임명/사이트명 하드코딩을 찾아 `siteConfig.name`으로 교체:
- `grep -r "VF6\|dev-vf6\|Virtua Fighter" src/` 로 탐색
- layout.tsx, metadata 등 SEO 관련 파일 우선

## Header 네비게이션 수정

`src/components/Header.tsx` 에서:
- Characters, Ranks 메뉴 항목 제거
- 메뉴 구성: 홈 / 게시판(Board) / 갤러리(Gallery) / 뉴스(News)
- 로고/사이트명을 `siteConfig.name` 으로 표시

## HeroSection 수정

`src/components/HeroSection.tsx`:
- 게임 관련 텍스트/이미지 제거
- K-pop 커뮤니티 소개 문구로 교체 (i18n 키 사용, 하드코딩 금지)
- 히어로 배경: 단색 그라디언트 또는 추후 교체 가능한 placeholder로

## Footer 수정

`src/components/Footer.tsx`:
- 게임 관련 링크 제거
- 사이트명 `siteConfig.name` 으로 교체

## 메타데이터

`src/app/layout.tsx`:
- title, description을 `siteConfig` 값으로 교체
- og:image 등 SNS 미리보기 이미지는 placeholder로

## 주의사항

- 모든 텍스트는 i18n 키 사용 (하드코딩 금지)
- 디자인 규칙 유지: brand-blue(#0ea5e9), brand-red(#ff0055), glass-card
- 폰트 크기: text-sm ~ text-2xl (히어로만 text-3xl 이상)
