"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ArrowLeft,
  SquarePen,
  ChevronDown,
} from "lucide-react";

const TiptapEditor = dynamic(() => import("@/components/TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-white/5 border border-white/10 rounded-lg animate-pulse" />
  ),
});
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import HeroSection from "@/components/HeroSection";
import { HeroConfig } from "@/components/board/BoardListLayout";

export interface CategoryOption {
  /** DB에 저장될 카테고리 ID */
  id: string;
  /** i18n 번역 키 */
  key: string;
}

interface BoardWriteLayoutProps {
  heroConfig: HeroConfig;
  /** 카테고리 목록 (없으면 카테고리 선택 UI 숨김) */
  categories?: CategoryOption[];
  /** 기본 선택 카테고리 ID */
  defaultCategory?: string;
  /** 글 목록 경로 (제출 성공 후 이동) */
  listPath: string;
  /** 게시글 상세 경로 베이스 (수정 완료 후 이동, 미입력 시 listPath 사용) */
  postBasePath?: string;
  /** 게시글 조회 API (수정 모드용) */
  getPostApiUrl: (id: string) => string;
  /** 게시글 생성 API */
  createApiUrl: string;
  /** 게시글 수정 API */
  updateApiUrl: (id: string) => string;
  /** 초안 저장 localStorage 키 접두어 */
  draftKey?: string;
  /** 추가 POST body 필드 (예: board_type) */
  extraFields?: Record<string, string>;
}

export default function BoardWriteLayout({
  heroConfig,
  categories,
  defaultCategory,
  listPath,
  postBasePath,
  getPostApiUrl,
  createApiUrl,
  updateApiUrl,
  draftKey = "post",
  extraFields = {},
}: BoardWriteLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const supabase = createClient();

  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [artistTag, setArtistTag] = useState("");
  const [category, setCategory] = useState(
    defaultCategory ?? categories?.[0]?.id ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const initRan = useRef(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;
    async function init() {
      if (isEditMode && editId) {
        // 수정 모드: 기존 게시글 로드
        try {
          const res = await fetch(getPostApiUrl(editId));
          const data = await res.json();
          if (data.post) {
            setTitle(data.post.title);
            setContent(data.post.content);
            if (data.post.category) setCategory(data.post.category);
            if (data.post.artist_tag) setArtistTag(data.post.artist_tag);
          }
        } catch {
          alert(t("board.load_error"));
          router.push(listPath);
        } finally {
          setIsLoading(false);
        }
      } else {
        // 새 글: 로그인 확인
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        // 초안 복원
        const draftContent = localStorage.getItem(`${draftKey}_draft_content`);
        const draftTitle = localStorage.getItem(`${draftKey}_draft_title`);
        if (draftContent || draftTitle) {
          if (confirm(t("board.write.draftRestore"))) {
            if (draftContent) setContent(draftContent);
            if (draftTitle) setTitle(draftTitle);
          } else {
            localStorage.removeItem(`${draftKey}_draft_title`);
            localStorage.removeItem(`${draftKey}_draft_content`);
          }
        }
        setIsLoading(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editId]);

  const saveDraft = (newTitle: string, newContent: string) => {
    if (submittedRef.current) return;
    localStorage.setItem(`${draftKey}_draft_title`, newTitle);
    localStorage.setItem(`${draftKey}_draft_content`, newContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const strippedContent = content.replace(/<[^>]*>?/gm, "").trim();
    const hasMedia =
      content.includes("<img") ||
      content.includes("<iframe") ||
      content.includes("<video") ||
      content.includes('data-video="') ||
      content.includes('class="direction-icon"') ||
      content.includes('class="tweet-embed"');

    if (!title.trim()) {
      alert(t("board.write.titleRequired"));
      return;
    }

    if (!strippedContent && !hasMedia) {
      alert(t("board.write.contentRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editId) {
        // 수정
        const res = await fetch(updateApiUrl(editId), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            ...(categories ? { category } : {}),
            artist_tag: artistTag.trim() || null,
          }),
        });

        if (res.ok) {
          submittedRef.current = true;
          localStorage.removeItem(`${draftKey}_draft_title`);
          localStorage.removeItem(`${draftKey}_draft_content`);
          alert(t("board.write.update"));
          router.replace(`${postBasePath ?? listPath}/${editId}`);
        } else {
          const data = await res.json();
          alert(data.error ?? t("board.load_error"));
        }
      } else {
        // 새 글 등록
        const res = await fetch(createApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            ...(categories ? { category } : {}),
            language: locale,
            artist_tag: artistTag.trim() || null,
            ...extraFields,
          }),
        });

        if (res.ok) {
          submittedRef.current = true;
          localStorage.removeItem(`${draftKey}_draft_title`);
          localStorage.removeItem(`${draftKey}_draft_content`);
          router.replace(listPath);
          router.refresh();
        } else {
          const data = await res.json();
          alert(data.error ?? t("board.load_error"));
        }
      }
    } catch (err: any) {
      alert(t("board.load_error") + " " + (err.message ?? ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (
        confirm(t("board.write.cancelConfirm"))
      ) {
        localStorage.removeItem(`${draftKey}_draft_title`);
        localStorage.removeItem(`${draftKey}_draft_content`);
        router.back();
      }
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <HeroSection
        title={heroConfig.title}
        highlightTitle={heroConfig.highlightTitle}
        subtitle={heroConfig.subtitle}
        tags={heroConfig.tags}
      />

      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-black tracking-tighter">
            {isEditMode ? "EDIT" : "WRITE"}{" "}
            <span className="text-brand-blue">
              {isEditMode ? "POST" : "YOUR STORY"}
            </span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 카테고리 + 제목 */}
          <div
            className={`grid grid-cols-1 gap-6 ${
              categories ? "md:grid-cols-4" : ""
            }`}
          >
            {/* 카테고리 (옵션) */}
            {categories && categories.length > 0 && (
              <div className="md:col-span-1 space-y-2">
                <label className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500 pl-1">
                  {t("board.write.category")}
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-blue/50 text-base font-bold uppercase transition-all appearance-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                        className="bg-neutral-900 text-white"
                      >
                        {t(cat.key)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* 제목 */}
            <div
              className={`${
                categories ? "md:col-span-3" : ""
              } space-y-2`}
            >
              <label className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500 pl-1">
                {t("board.table.title")}
              </label>
              <input
                type="text"
                placeholder={t("board.write.placeholder")}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  saveDraft(e.target.value, content);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-blue/50 text-base font-bold transition-all placeholder:text-neutral-700"
              />
            </div>
          </div>

          {/* 아티스트 / 그룹 태그 */}
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500 pl-1">
              {t("kpop.artistTag")}
            </label>
            <input
              type="text"
              placeholder={t("kpop.artistTagPlaceholder")}
              value={artistTag}
              onChange={(e) => setArtistTag(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-blue/50 text-base font-bold transition-all placeholder:text-neutral-700"
            />
          </div>

          {/* 에디터 */}
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500 pl-1">
              {t("board.write.content")}
            </label>
            <TiptapEditor
              content={content}
              onChange={(val) => {
                setContent(val);
                saveDraft(title, val);
              }}
              placeholder={t("board.write.contentPlaceholder")}
              postTitle={title}
              submittedRef={submittedRef}
            />

          </div>

          {/* 하단 버튼 */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/5">
            <p className="text-sm text-neutral-500 max-w-sm text-center md:text-left">
              {t("board.write.guide")}
            </p>
            <div className="flex gap-4 w-full md:w-auto justify-center md:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
              >
                {t("board.write.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-black font-bold rounded-lg hover:scale-105 transition-transform text-sm shrink-0 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <SquarePen className="w-4 h-4" />
                )}
                <span>
                  {isEditMode
                    ? t("board.write.update")
                    : t("board.write.submit")}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
