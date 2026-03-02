"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

interface HeroSectionProps {
  /** 히어로 제목 (i18n 키 또는 직접 문자열) */
  title?: string;
  /** 하이라이트 색상 제목 부분 */
  highlightTitle?: string;
  /** 부제목 */
  subtitle?: string;
  /** 태그 목록 */
  tags?: string[];
  /** CTA 버튼 표시 여부 (홈 페이지 전용) */
  showCta?: boolean;
  /** CTA 링크 href */
  ctaHref?: string;
}

export default function HeroSection({
  title,
  highlightTitle,
  subtitle,
  tags = [],
  showCta = false,
  ctaHref = "/board",
}: HeroSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="relative flex items-center overflow-hidden py-7 md:py-10 border-b border-white/5">
      {/* K-pop 테마 그라디언트 배경 — brand-blue 계열 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-sky-950/60 to-slate-950" />

      {/* 상단 좌측 글로우 포인트 */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />
      {/* 하단 우측 글로우 포인트 */}
      <div className="absolute -bottom-10 right-10 w-56 h-56 rounded-full bg-brand-blue/8 blur-2xl pointer-events-none" />

      <div className="container relative z-10 px-4 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-2 md:gap-4"
        >
          {/* 히어로 타이틀 — 히어로 섹션만 text-3xl 이상 허용 */}
          <h1 className="text-2xl font-black tracking-tight leading-tight text-white md:text-4xl drop-shadow-lg">
            {title ?? t('hero.title')}
            {highlightTitle && (
              <span className="text-brand-blue ml-2">{highlightTitle}</span>
            )}
          </h1>

          {/* 서브타이틀 */}
          {(subtitle ?? t('hero.subtitle')) && (
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base whitespace-pre-line">
              {subtitle ?? t('hero.subtitle')}
            </p>
          )}

          {/* 태그 뱃지 */}
          {tags.length > 0 && (
            <div className="hidden md:flex flex-wrap gap-2 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded text-[10px] md:text-xs font-semibold uppercase tracking-widest text-brand-blue/80 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA 버튼 (홈 페이지에서만 표시) */}
          {showCta && (
            <div className="flex gap-3 pt-1 md:pt-2">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-sky-400 transition-all duration-200 shadow-lg shadow-brand-blue/20"
              >
                {t('hero.cta')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
