"use client";

import Link from "next/link";
import { Pin, Image as ImageIcon, Video, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LangIco from "@/components/common/LangIco";

export interface PostTranslation {
  id: string;
  post_id: string;
  lang: string;
  title: string;
}

export interface PostRow {
  id: string;
  title: string;
  author_name: string;
  language?: string;
  likes: number;
  views: number;
  created_at: string;
  is_pinned?: boolean;
  content?: string;
  comments?: number;
  category?: string;
  post_translations?: PostTranslation[];
  rank_level?: number | null;
  /** 작성자 프로필 단위 (게시판 표시용) */
  author_rank_level?: number | null;
  /** 작성자 프로필 국기 (갤러리/리스트 표시용) */
  author_country?: string | null;
  /** K-pop 아티스트 / 그룹 태그 */
  artist_tag?: string | null;
}

export interface CategoryBadgeConfig {
  /** 카테고리 ID → i18n 키 매핑 */
  labelMap: Record<string, string>;
  /** 카테고리 ID → 색상 클래스 매핑 (선택) */
  colorMap?: Record<string, string>;
  /** 기본 색상 클래스 */
  defaultColor?: string;
}

interface BoardTableProps {
  posts: PostRow[];
  isLoading: boolean;
  /** 게시글 링크 경로 생성 함수 - 기본값: /board/:id */
  getPostHref?: (post: PostRow) => string;
  /** 빈 목록 메시지 키 (i18n) */
  emptyKey?: string;
  /** 카테고리 뱃지 설정 — 없으면 뱃지 숨김 */
  categoryBadge?: CategoryBadgeConfig;
}

const hasImage = (content: string) => content.includes("<img");
const hasVideo = (content: string) =>
  content.includes("youtube-video") ||
  content.includes("<iframe") ||
  content.includes("<video");

export default function BoardTable({
  posts,
  isLoading,
  getPostHref,
  emptyKey = "board.empty",
  categoryBadge,
}: BoardTableProps) {
  const { t, locale } = useLanguage();

  // 날짜 포맷 (오늘이면 HH:MM, 아니면 MM.DD)
  const formatBoardDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString(
        locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US",
        { hour: "2-digit", minute: "2-digit", hour12: false }
      );
    }
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}.${day}`;
  };

  const resolveHref = (post: PostRow) =>
    getPostHref ? getPostHref(post) : `/board/${post.id}`;

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="glass-card p-20 text-center text-neutral-500 font-bold italic">
        {t(emptyKey)}
      </div>
    );
  }

  return (
    <div className="space-y-0 border-t border-white/20">
      {/* 목록 헤더 */}
      <div className="hidden md:flex items-center px-4 py-2 border-b border-white/10 text-sm font-black uppercase tracking-widest text-neutral-400">
        <div className="flex-1 text-center md:text-left">
          {t("board.table.title")}
        </div>
        <div className="w-44 px-2 hidden md:block">
          {t("board.table.author")}
        </div>
        <div className="w-14 text-center hidden md:block">
          {t("board.table.likes")}
        </div>
        <div className="w-16 text-center hidden md:block">
          {t("board.table.views")}
        </div>
        <div className="w-16 text-right hidden md:block">
          {t("board.table.date")}
        </div>
      </div>

      {posts.map((post) => {
        const translatedItem = post.post_translations?.find(tr => tr.lang === locale);
        const displayTitle = translatedItem?.title || post.title;
        const isTranslated = !!translatedItem && translatedItem.title !== post.title;

        return (
        <div
          key={post.id}
          className={`w-full flex items-center px-0 md:px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-all text-sm ${
            post.is_pinned ? "bg-brand-blue/5" : ""
          }`}
        >
          {/* 제목 영역 */}
          <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center pr-2 md:pr-4 gap-1.5 md:gap-0">
            <div className="flex items-center min-w-0">
              {post.is_pinned && (
                <Pin className="w-3.5 h-3.5 text-brand-yellow fill-current shrink-0 mr-1.5" />
              )}
              {categoryBadge && post.category && (
                <span
                  className={`shrink-0 mr-2 px-1.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider border border-current/20 ${
                    categoryBadge.colorMap?.[post.category] ??
                    categoryBadge.defaultColor ??
                    "text-neutral-400"
                  }`}
                >
                  {t(categoryBadge.labelMap[post.category] ?? post.category)}
                </span>
              )}
              <Link
                href={resolveHref(post)}
                className={`truncate hover:text-brand-yellow hover:underline transition-colors mr-1 ${
                  post.is_pinned
                    ? "text-brand-yellow font-extrabold"
                    : "text-neutral-100 font-bold"
                }`}
              >
                {displayTitle}
              </Link>
              {isTranslated && (
                <Globe className="w-3 h-3 text-brand-blue shrink-0 ml-0.5 opacity-70" aria-label="Translated" />
              )}
              {post.artist_tag && (
                <span className="bg-brand-red text-white text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-1">
                  {post.artist_tag}
                </span>
              )}
              {(post.comments ?? 0) > 0 && (
                <span className="text-brand-yellow font-bold shrink-0 text-sm mr-1">
                  ({post.comments})
                </span>
              )}
              {hasImage(post.content ?? "") && (
                <ImageIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1" />
              )}
              {hasVideo(post.content ?? "") && (
                <Video className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1" />
              )}
            </div>
            
            {/* 모바일 메타 정보 (제목 아래) */}
            <div className="flex md:hidden items-center justify-between w-full text-xs text-neutral-500 font-medium pl-0.5 mt-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <Link
                  href={`/profile/${post.author_name}`}
                  className="truncate max-w-[100px] text-neutral-300 hover:text-brand-yellow transition-colors"
                >
                  {post.author_name}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <span>View {post.views}</span>
                <span className="w-px h-2.5 bg-white/10"></span>
                <span className={`${(post.likes ?? 0) > 0 ? "text-brand-yellow font-bold" : ""}`}>Like {post.likes}</span>
                <span className="w-px h-2.5 bg-white/10"></span>
                <span>{formatBoardDate(post.created_at)}</span>
              </div>
            </div>
          </div>

          {/* 작성자 (데스크탑) */}
          <div className="hidden md:flex w-44 px-2 text-neutral-300 text-left text-sm font-bold items-center gap-1.5 shrink-0 min-w-0">
            <LangIco langOrCountry={post.language} size={20} />
            <Link
              href={`/profile/${post.author_name}`}
              className="truncate hover:text-brand-yellow transition-colors"
            >
              {post.author_name}
            </Link>
          </div>

          {/* 추천 (데스크탑) */}
          <div
            className={`w-14 text-center text-xs font-bold hidden md:block ${
              (post.likes ?? 0) > 0 ? "text-brand-yellow" : "text-neutral-400"
            }`}
          >
            {post.likes}
          </div>

          {/* 조회 (데스크탑) */}
          <div className="w-16 text-center text-xs text-neutral-400 hidden md:block">
            {post.views}
          </div>

          {/* 날짜 (데스크탑) */}
          <div className="w-16 text-right text-xs text-neutral-400 font-bold whitespace-nowrap hidden md:block">
            {formatBoardDate(post.created_at)}
          </div>
        </div>
        );
      })}
    </div>
  );
}
