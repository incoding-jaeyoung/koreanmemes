"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pin, Eye, ThumbsUp, MessageSquare, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getThumbnailFromContent } from "@/utils/thumbnail";
import LangIco from "@/components/common/LangIco";
import type { PostRow } from "./BoardTable";
import type { CategoryBadgeConfig } from "./BoardTable";

interface BoardThumbnailGridProps {
  posts: PostRow[];
  isLoading: boolean;
  getPostHref?: (post: PostRow) => string;
  emptyKey?: string;
  categoryBadge?: CategoryBadgeConfig;
}

export default function BoardThumbnailGrid({
  posts,
  isLoading,
  getPostHref,
  emptyKey = "board.empty",
  categoryBadge,
}: BoardThumbnailGridProps) {
  const router = useRouter();
  const { t, locale } = useLanguage();

  const formatDate = (dateString: string) => {
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
        <div className="w-10 h-10 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {posts.map((post) => {
        const thumbnailUrl = getThumbnailFromContent(post.content, post.id);
        const translatedItem = post.post_translations?.find((tr: { lang: string; title: string }) => tr.lang === locale);
        const displayTitle = translatedItem?.title || post.title;
        const isTranslated = !!translatedItem && translatedItem.title !== post.title;
        return (
          <Link
            key={post.id}
            href={resolveHref(post)}
            className="group block glass-card overflow-hidden rounded-lg border border-white/10 hover:border-brand-yellow/50 transition-colors"
          >
            {/* 썸네일 */}
            <div className="relative aspect-video bg-neutral-900 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
{post.is_pinned && (
                <div className="absolute top-2 left-2 bg-brand-yellow/90 text-black p-1 rounded">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </div>
              )}
            </div>
            {/* 제목 + 카테고리 */}
            <div className="p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {categoryBadge && post.category && (
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider border border-current/20 ${
                      categoryBadge.colorMap?.[post.category] ??
                      categoryBadge.defaultColor ??
                      "text-neutral-400"
                    }`}
                  >
                    {t(categoryBadge.labelMap[post.category] ?? post.category)}
                  </span>
                )}
                {post.artist_tag && (
                  <span className="bg-brand-red text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {post.artist_tag}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-neutral-100 group-hover:text-brand-yellow truncate transition-colors flex items-center gap-1">
                <span className="truncate">{displayTitle}</span>
                {isTranslated && (
                  <Globe className="w-3 h-3 text-brand-blue shrink-0 opacity-70" aria-label="Translated" />
                )}
              </h3>
              <div className="flex flex-col gap-1.5 text-sm text-neutral-300">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 truncate min-w-0 font-bold overflow-visible">
                    {(post.author_country || post.language) && (
                      <LangIco
                        langOrCountry={post.author_country ?? post.language}
                        size={18}
                        className="shrink-0"
                        title={post.author_country ?? undefined}
                      />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/profile/${post.author_name}`);
                      }}
                      className="truncate text-left text-neutral-300 hover:text-brand-yellow transition-colors"
                    >
                      {post.author_name}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-neutral-400">
                  <div className="flex items-center gap-x-2">
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      {post.views ?? 0}
                    </span>
                    <span className="text-neutral-500">·</span>
                    <span className="flex items-center gap-0.5 text-brand-yellow">
                      <ThumbsUp className="w-3 h-3" />
                      {post.likes ?? 0}
                    </span>
                    <span className="text-neutral-500">·</span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="w-3 h-3" />
                      {post.comments ?? 0}
                    </span>
                  </div>
                  <span className="shrink-0">{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
