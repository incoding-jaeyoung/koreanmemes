"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";

export interface SlideItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  backgroundImage?: string;
  href?: string;
}

const STATIC_SLIDES: SlideItem[] = [
  { id: "1", title: "버파는김법화", subtitle: "버파는김법화 채널의 최신 영상과 하이라이트를 확인하세요.", image: "/images/player/banner-01.jpg", backgroundImage: "/images/player/bg-01.jpg", href: "https://www.youtube.com/channel/UChLlMfcqz-mrMA9skV5r3fA" },
  { id: "2", title: "슝슝슌", subtitle: "〈ㅑㅇ~〈ㅑㅇ~〈ㅑJ(슝슝슌)의 채널입니다. 주로 VF5REVO 랭크 매치를 위주로 플레이 합니다.", image: "/images/player/banner-02.jpg", backgroundImage: "/images/player/bg-02.jpg", href: "https://www.youtube.com/@yokker2532" },
  { id: "3", title: "VirtuAnalytics", subtitle: "매일 업로드되는 일본 고수들의 리플레이와 심층 분석 콘텐츠를 만나보세요!", image: "/images/player/banner-04.jpg", backgroundImage: "/images/player/bg-analytics.jpg", href: "https://www.youtube.com/@VirtuAnalytics" },
  { id: "4", title: "스테이지원", subtitle: "버파5 레보 월드스테이지 한국유저입니다.", image: "/images/player/stage.jpg", href: "https://www.youtube.com/@stagewon-kor" },
  { id: "5", title: "miho", subtitle: "버추어 파이터를 좋아하는 파이 유저 / 즐겜러입니다", image: "/images/player/banner-03.jpg", href: "https://www.youtube.com/@vivid_dot4/featured" },
  { id: "6", title: "HINO mvp", subtitle: "격겜덕후 채널 [ 버추어파이터, 철권, 스파 ]", image: "/images/player/hino.jpg", href: "https://www.youtube.com/@hwoaring1" },
  { id: "7", title: "버파연구소", subtitle: "버파연구소에서 꿀팁과 가이드를 만나보세요.", image: "/images/player/banner-05.jpg", href: "https://www.youtube.com/@Dr.M-k7o" },
  { id: "8", title: "욘다", subtitle: "철권8 미소녀 비키니 모드, 버추어파이터5US, 추억의 버파 영상들", image: "/images/player/yonda.jpg", href: "https://www.youtube.com/@yon111" },
];

const SLIDE_ACCENTS = [
  { dark: "rgba(80,0,51,0.85)", mid: "#993366", light: "#FF0077" },
  { dark: "rgba(0,0,80,0.85)", mid: "#3366AA", light: "#0033FF" },
  { dark: "rgba(120,60,0,0.85)", mid: "#CC6633", light: "#FF8800" },   /* MiHO 오렌지 */
  { dark: "rgba(30,80,50,0.85)", mid: "#2E7D32", light: "#66BB6A" },   /* 4번 스테이지원 연두 */
  { dark: "rgba(48,0,80,0.85)", mid: "#6633AA", light: "#8000FF" },   /* 5번 버파연구소 퍼플 */
];

interface SliderSectionProps {
  slides?: SlideItem[];
  children?: React.ReactNode;
}

const SLIDE_DURATION_MS = 320;
const AUTOPLAY_ENABLED = true;

export default function SliderSection({ slides = STATIC_SLIDES, children }: SliderSectionProps) {
  const count = slides.length;
  const slidesForRender = count > 0 ? [slides[count - 1], ...slides, slides[0]] : [];
  const totalSlides = slidesForRender.length;

  const [activeIndex, setActiveIndex] = useState(1);
  const [isResetting, setIsResetting] = useState(false);
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isResettingRef = useRef(false);

  const realIndex = activeIndex === 0 ? count - 1 : activeIndex === totalSlides - 1 ? 0 : activeIndex - 1;

  const runSlideAnimation = useCallback(() => {
    if (isResettingRef.current || !trackRef.current || totalSlides === 0) return;
    const boxes = trackRef.current.children;
    const activeBox = boxes[activeIndex] as HTMLElement;
    if (!activeBox) return;
    const sliderBg = activeBox.querySelector(".slider-bg:not(.slider-bg-2)");
    const sliderBg2 = activeBox.querySelector(".slider-bg-2");
    const p = activeBox.querySelector(".slider-details p");
    const h1 = activeBox.querySelector(".slider-details h1");
    const btn = activeBox.querySelector(".slider-details .slider-cta");
    const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "power2.inOut" } });
    if (sliderBg) tl.from(sliderBg, { x: "-100%", ease: "power2.out", delay: 0.2 });
    if (sliderBg2) tl.from(sliderBg2, { x: "-100%", ease: "power2.out", delay: 0.2 }, 0.2);
    if (p) tl.from(p, { opacity: 0 }, "-=0.3");
    tl.from(h1, { opacity: 0, y: "30px" }, "-=0.3");
    if (btn) tl.fromTo(btn, { opacity: 0, y: "-40px" }, { opacity: 1, y: 0, clearProps: "opacity,transform" }, "-=0.8");
  }, [activeIndex, totalSlides]);

  const hasInitialAnimated = useRef(false);
  useEffect(() => {
    if (!hasInitialAnimated.current) {
      hasInitialAnimated.current = true;
      const t = setTimeout(() => runSlideAnimation(), 80);
      return () => clearTimeout(t);
    }
    runSlideAnimation();
  }, [activeIndex, runSlideAnimation]);

  const resetToLoop = useCallback(() => {
    if (activeIndex === totalSlides - 1) {
      isResettingRef.current = true;
      setIsResetting(true);
      setActiveIndex(1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsResetting(false);
          isResettingRef.current = false;
        });
      });
    } else if (activeIndex === 0) {
      isResettingRef.current = true;
      setIsResetting(true);
      setActiveIndex(count);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsResetting(false);
          isResettingRef.current = false;
        });
      });
    }
  }, [activeIndex, count, totalSlides]);

  useEffect(() => {
    if (totalSlides < 2) return;
    if (activeIndex !== 0 && activeIndex !== totalSlides - 1) return;
    const t = setTimeout(resetToLoop, SLIDE_DURATION_MS);
    return () => clearTimeout(t);
  }, [activeIndex, totalSlides, resetToLoop]);

  const goToNext = useCallback(() => {
    if (count === 0) return;
    setActiveIndex((i) => (i < totalSlides - 1 ? i + 1 : i));
  }, [count, totalSlides]);

  const goToPrev = useCallback(() => {
    if (count === 0) return;
    setActiveIndex((i) => (i > 0 ? i - 1 : i));
  }, [count]);

  const goToIndex = useCallback((i: number) => {
    setActiveIndex(i + 1);
  }, []);

  const resetAutoplayTimer = useCallback(() => {
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    if (!AUTOPLAY_ENABLED || count === 0) return;
    autoplayTimerRef.current = setInterval(goToNext, 5000);
  }, [count, goToNext]);

  useEffect(() => {
    if (!AUTOPLAY_ENABLED || count === 0) return;
    autoplayTimerRef.current = setInterval(goToNext, 5000);
    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [count, goToNext]);

  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);

  const getClientX = useCallback((e: React.TouchEvent | React.MouseEvent): number => {
    if ("touches" in e && e.touches.length) return e.touches[0].clientX;
    if ("changedTouches" in e && (e as React.TouchEvent).changedTouches.length) return (e as React.TouchEvent).changedTouches[0].clientX;
    return (e as React.MouseEvent).clientX;
  }, []);

  const handleDragEnd = useCallback((clientX: number) => {
    const diff = dragStartX.current - clientX;
    const threshold = 50;
    if (diff > threshold) {
      goToNext();
      resetAutoplayTimer();
    } else if (diff < -threshold) {
      goToPrev();
      resetAutoplayTimer();
    }
    setIsDragging(false);
    setDragOffset(0);
  }, [goToNext, goToPrev, resetAutoplayTimer]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    dragStartX.current = e.touches[0].clientX;
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setDragOffset(e.touches[0].clientX - dragStartX.current);
  }, [isDragging]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    handleDragEnd(e.changedTouches[0].clientX);
  }, [isDragging, handleDragEnd]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => setDragOffset(e.clientX - dragStartX.current);
    const handleMouseUp = (e: MouseEvent) => {
      handleDragEnd(e.clientX);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleDragEnd]);

  if (children !== undefined) {
    return (
      <div className="px-4 py-6 mx-auto max-w-6xl md:px-6 md:py-10">
        {children}
      </div>
    );
  }

  if (count === 0) return null;

  return (
    <div id="gallery-slider" className="flex flex-col gap-4 px-4 pt-6 mx-auto w-full max-w-6xl md:px-6 md:pt-10">
      <div
        ref={containerRef}
        className={`overflow-hidden relative rounded-2xl slider-container select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div
          ref={trackRef}
          className="slider-track flex h-[200px] ease-out"
          style={{
            width: `${totalSlides * 100}%`,
            transform: isDragging
              ? `translateX(calc(-${activeIndex * (100 / totalSlides)}% + ${dragOffset}px))`
              : `translateX(-${activeIndex * (100 / totalSlides)}%)`,
            transition: isResetting || isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >
          {slidesForRender.map((slide, j) => {
            const realIdx = j === 0 ? count - 1 : j === totalSlides - 1 ? 0 : j - 1;
            const accent = SLIDE_ACCENTS[realIdx % SLIDE_ACCENTS.length];
            const key = j === 0 ? `clone-last-${slide.id}` : j === totalSlides - 1 ? `clone-first-${slide.id}` : slide.id;
            return (
              <div
                key={key}
                className="grid overflow-hidden relative grid-cols-1 w-full h-full slider-box md:grid-cols-[2fr_1fr] shrink-0"
                style={{
                  width: `${100 / totalSlides}%`,
                  backgroundColor: slide.backgroundImage ? undefined : accent.mid,
                  ...(slide.backgroundImage && {
                    backgroundImage: `url(${slide.backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }),
                }}
              >
                {/* 스큐 배경 1: 좌측 상단 → 우측 하단 */}
                <div
                  className="slider-bg absolute inset-0 w-[75%] left-[-10%] origin-center"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    transform: "skewX(7deg)",
                  }}
                />
                {/* 스큐 배경 2: slider-bg와 동일, 기울기 20deg */}
                <div
                  className="slider-bg slider-bg-2 absolute inset-0 w-[75%] left-[-10%] origin-center"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    transform: "skewX(20deg)",
                  }}
                />
                <div className="flex relative z-10 flex-col order-2 justify-center p-5 slider-details md:p-8 md:pl-12 md:order-1 max-md:pb-15">
                  <h1 className="mb-1.5 text-lg font-bold text-white md:text-2xl">
                    {slide.title} 
                  </h1>
                  {slide.subtitle != null && slide.subtitle !== "" && (
                    <p className="mb-2 text-sm whitespace-pre-line slider-subtitle text-white/80 md:text-base">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.href ? (
                    <a
                      href={slide.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex gap-2 justify-center items-center px-6 py-2 mt-2 text-sm font-black text-white rounded-lg transition-opacity slider-cta w-fit hover:opacity-90 max-md:text-xs max-md:px-2"
                      style={{ backgroundColor: accent.light, opacity: 1 }}
                    >
                      YOUTUBE
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      
                    </a>
                  ) : (
                    <span
                      className="inline-flex gap-2 justify-center items-center px-6 py-2 mt-2 text-sm font-medium text-white rounded-full opacity-80 slider-cta w-fit"
                      style={{ backgroundColor: accent.light }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      보러가기
                    </span>
                  )}
                </div>
                <div className="flex hidden overflow-hidden relative order-1 justify-center items-center min-h-0 slider-illustration md:order-2 md:block">
                  <div className="flex relative justify-end items-center pr-4 w-full h-full slider-illustration-inner md:pr-12" style={{ transform: "skewX(-4deg)" }}>
                    <div className="relative w-[70%] h-[80%] max-w-[140px] max-h-[120px]  md:max-w-[180px] md:max-h-[140px] ">
                      <div
                        className="absolute inset-0 rounded-xl opacity-90"
                        style={{ backgroundColor: accent.light, transform: "translate(4px, 4px)" }}
                        aria-hidden
                      />
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{ backgroundColor: accent.light }}
                        aria-hidden
                      />
                      <div className="overflow-hidden absolute inset-0 rounded-xl">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 768px) 140px, 180px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination - 라인 + 4초 채워지는 애니메이션 */}
        <div className="slideshow-pagination">
          <div className="pagination-block">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`slideshow-pagination-item ${i === realIndex ? "active" : ""}`}
                onClick={() => {
                  goToIndex(i);
                  resetAutoplayTimer();
                }}
              >
                <span className="pagination-number">{i + 1}</span>
                <span className="pagination-separator">
                  <span
                    key={i === realIndex ? `active-${realIndex}` : `inactive-${i}`}
                    className="pagination-separator-loader"
                    aria-hidden
                  />
                </span>
              </button>
            ))}
          </div>
          <div className="slideshow-navigation">
          <button
            type="button"
            className="slideshow-navigation-button"
            onClick={() => {
              goToPrev();
              resetAutoplayTimer();
            }}
            aria-label="이전"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className="slideshow-navigation-button"
            onClick={() => {
              goToNext();
              resetAutoplayTimer();
            }}
            aria-label="다음"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        </div>

        {/* Prev / Next - 우측 하단 원형 버튼 */}
        {/* <div className="slideshow-navigation">
          <button
            type="button"
            className="slideshow-navigation-button"
            onClick={() => {
              goToPrev();
              resetAutoplayTimer();
            }}
            aria-label="이전"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className="slideshow-navigation-button"
            onClick={() => {
              goToNext();
              resetAutoplayTimer();
            }}
            aria-label="다음"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div> */}
      </div>
    </div>
  );
}
