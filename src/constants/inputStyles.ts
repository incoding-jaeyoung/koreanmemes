/**
 * 앱 전체에서 통일된 인풋 스타일
 * - 로그인/회원가입 폼 (Supabase Auth)
 * - 게시글 검색 등 검색 필드
 */

/** 브랜드 인풋 Tailwind className (직접 제어 가능한 input용) */
export const INPUT_BRAND_CLASS =
  "font-black text-brand-yellow text-sm placeholder:text-white/50 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-yellow/50 transition-colors";

/** Supabase Auth UI input className (style은 INPUT_BRAND_STYLE 사용) */
export const INPUT_AUTH_CLASS =
  "font-black text-brand-yellow glass-card border-white/10 focus:border-brand-yellow/50 transition-colors";

/** Supabase Auth UI용 inline style (Stitches 오버라이드) */
export const INPUT_BRAND_STYLE = {
  color: "#E2E800",
  fontWeight: 900,
  fontFamily: "'SUIT Variable', Arial, Helvetica, sans-serif",
  fontSize: "14px",
};
