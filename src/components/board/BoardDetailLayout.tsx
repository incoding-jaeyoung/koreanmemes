"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Calendar, Eye, ThumbsUp, MessageSquare, Globe } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import CommentList from "@/components/comments/CommentList";
import MiniBoardList from "@/components/MiniBoardList";
import HeroSection from "@/components/HeroSection";
import BoardActionButtons from "@/components/board/BoardActionButtons";
import TweetRenderer from "@/components/TweetRenderer";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate, formatTime } from "@/utils/date";
import { HeroConfig } from "@/components/board/BoardListLayout";
import type { CategoryBadgeConfig } from "@/components/board/BoardTable";
import LangIco from "@/components/common/LangIco";

// 모듈 레벨 메모리 캐시 — 같은 세션에서 재방문 시 API 재호출 없이 즉시 표시
const _translationCache = new Map<string, string>(); // key: `${postId}:${lang}`

interface BoardDetailLayoutProps {
  heroConfig: HeroConfig;
  /** 서버에서 SEO 후처리된 content (없으면 API 응답의 원본 content 사용) */
  processedContent?: string;
  /** 게시글 조회 API (예: /api/posts/:id) */
  getPostApiUrl: (id: string) => string;
  /** 조회수 증가 API */
  getViewApiUrl: (id: string) => string;
  /** 좋아요 API */
  getLikeApiUrl: (id: string) => string;
  /** 핀 API */
  getPinApiUrl?: (id: string) => string;
  /** 삭제 API */
  getDeleteApiUrl: (id: string) => string;
  /** 수정 경로 */
  getEditPath: (id: string) => string;
  /** 목록 경로 */
  listPath: string;
  /** 관련글 표시 여부 */
  showRelatedPosts?: boolean;
  /** 캐릭터 slug (관련글에서 해당 캐릭터 게시판 글을 가져올 때 사용) */
  characterSlug?: string;
  /** 관련글 커스텀 API 엔드포인트 */
  relatedPostsApiEndpoint?: string;
  /** 관련글 커스텀 링크 생성 함수 */
  getRelatedPostHref?: (postId: string) => string;
  /** 관련글 "View All" 링크 */
  relatedPostsListHref?: string;
  /** 관련글 섹션 레이블 */
  relatedPostsSectionLabel?: string;
  /** 카테고리 뱃지 표시 여부 */
  showCategory?: boolean;
  /** 카테고리 뱃지 설정 (리스트와 동일한 형태) */
  categoryBadge?: CategoryBadgeConfig;
  /** 카테고리 색상 매핑 (옵션, categoryBadge가 없을 때 폴백) */
  categoryColorMap?: Record<string, string>;
}

const DEFAULT_CATEGORY_COLOR_MAP: Record<string, string> = {
  공략: "text-brand-blue",
  질문: "text-brand-red",
  영상: "text-purple-400",
};

export default function BoardDetailLayout({
  heroConfig,
  processedContent,
  getPostApiUrl,
  getViewApiUrl,
  getLikeApiUrl,
  getPinApiUrl,
  getDeleteApiUrl,
  getEditPath,
  listPath,
  showRelatedPosts = true,
  characterSlug,
  relatedPostsApiEndpoint,
  getRelatedPostHref,
  relatedPostsListHref,
  relatedPostsSectionLabel,
  showCategory = true,
  categoryBadge,
  categoryColorMap = DEFAULT_CATEGORY_COLOR_MAP,
}: BoardDetailLayoutProps) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const supabase = createClient();

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const viewCountedRef = useRef(false);

  // 본문 번역 상태
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslatingContent, setIsTranslatingContent] = useState(false);
  const [translationFailed, setTranslationFailed] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function init() {
      await fetchPost();
      await getCurrentUser();
      await checkLikeStatus();
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 본문 번역: post 로딩 완료 후 원본 언어 ≠ 현재 locale 시 번역 요청
  useEffect(() => {
    if (!post) return;
    const postLang = post.language ?? 'ko';
    if (postLang === locale) {
      setTranslatedContent(null);
      return;
    }

    // 1순위: 모듈 메모리 캐시 (재방문 즉시 표시, 스피너 없음)
    const cacheKey = `${post.id}:${locale}`;
    const memCached = _translationCache.get(cacheKey);
    if (memCached) {
      setTranslatedContent(memCached);
      return;
    }

    // 2순위: API 응답에 포함된 post_translations (첫 방문 시 DB 캐시)
    const dbCached = (post.post_translations as { lang: string; content?: string | null }[] | undefined)
      ?.find(tr => tr.lang === locale && tr.content);
    if (dbCached?.content) {
      setTranslatedContent(dbCached.content);
      _translationCache.set(cacheKey, dbCached.content);
      return;
    }

    // 3순위: 번역 API 호출 (DB에 없는 경우)
    requestTranslation(post.id, locale);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id, locale]);

  const requestTranslation = (postId: string, targetLang: string) => {
    const cacheKey = `${postId}:${targetLang}`;
    setIsTranslatingContent(true);
    setTranslationFailed(false);
    fetch(`/api/posts/${postId}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetLang }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          console.warn('[translate] API error:', res.status, data?.error ?? data);
          setTranslationFailed(true);
          return;
        }
        if (data.content) {
          setTranslatedContent(data.content);
          _translationCache.set(cacheKey, data.content);
        } else {
          console.warn('[translate] No content in response:', data);
          setTranslationFailed(true);
        }
      })
      .catch(err => {
        console.warn('[translate] Fetch error:', err);
        setTranslationFailed(true);
      })
      .finally(() => setIsTranslatingContent(false));
  };

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setCurrentUserRole(profile?.role ?? "user");
    }
  };

  const fetchPost = async () => {
    try {
      const res = await fetch(getPostApiUrl(id));
      const data = await res.json();
      if (data.post) {
        setPost(data.post);
        setLikeCount(data.post.likes ?? 0);
        // 조회수 증가 (중복 방지)
        if (!viewCountedRef.current) {
          viewCountedRef.current = true;
          fetch(getViewApiUrl(id), { method: "POST" }).catch(console.error);
        }
      }
    } catch (err) {
      console.error("Error fetching post:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const res = await fetch(getLikeApiUrl(id));
      const data = await res.json();
      setLiked(data.liked);
    } catch (err) {
      console.error("Error checking like status:", err);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch(getLikeApiUrl(id), { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.likes);
      } else {
        const data = await res.json();
        alert(data.error ?? t("board.load_error"));
      }
    } catch {
      alert(t("board.load_error"));
    } finally {
      setIsLiking(false);
    }
  };

  const handlePin = async () => {
    if (!getPinApiUrl) return;
    const nextPinned = !post.is_pinned;
    try {
      const res = await fetch(getPinApiUrl(id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: nextPinned }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost({ ...post, is_pinned: data.is_pinned });
        alert(
          data.is_pinned
            ? t("board.detail.pin_success")
            : t("board.detail.unpin_success")
        );
      } else {
        const data = await res.json();
        alert(data.error ?? t("board.load_error"));
      }
    } catch {
      alert(t("board.load_error"));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("board.detail.delete_confirm"))) return;
    try {
      const res = await fetch(getDeleteApiUrl(id), { method: "DELETE" });
      if (res.ok) {
        alert(t("board.detail.delete_success"));
        router.push(listPath);
      } else {
        const data = await res.json();
        alert(data.error ?? t("board.load_error"));
      }
    } catch {
      alert(t("board.load_error"));
    }
  };

  const handleBack = () => {
    if (post?.character_slug) {
      router.push(`/characters/${post.character_slug}`);
    } else {
      router.push(listPath);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 animate-spin border-brand-blue/30 border-t-brand-blue" />
      </div>
    );
  }

  // 게시글 없음
  if (!post) {
    return (
      <div className="flex flex-col justify-center items-center space-y-4 min-h-screen">
        <h2 className="text-2xl italic font-black">
          {t("board.detail.post_not_found")}
        </h2>
        <button
          onClick={() => router.push(listPath)}
          className="px-6 py-2 font-bold text-black rounded-lg bg-brand-blue"
        >
          {t("board.detail.back")}
        </button>
      </div>
    );
  }

  const isAuthor = currentUserId === post.author_id;
  const isAdmin = currentUserRole === "admin";

  // 다국어 제목 처리
  const translatedItem = (post.post_translations as { lang: string; title: string }[] | undefined)
    ?.find(tr => tr.lang === locale);
  const displayTitle = translatedItem?.title || post.title;
  const isTranslated = !!translatedItem && translatedItem.title !== post.title;

  const categoryColor = categoryBadge
    ? (categoryBadge.colorMap?.[post.category] ?? categoryBadge.defaultColor ?? "text-brand-blue")
    : (categoryColorMap[post.category] ?? "text-brand-blue");
  const categoryLabel = categoryBadge
    ? t(categoryBadge.labelMap[post.category] ?? post.category)
    : (post.category ?? "GENERAL");

  return (
    <div>
      <HeroSection
        title={heroConfig.title}
        highlightTitle={heroConfig.highlightTitle}
        subtitle={heroConfig.subtitle}
        tags={heroConfig.tags}
      />

      <div className="px-4 py-6 mx-auto space-y-6 max-w-6xl md:px-6 md:py-8">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden shadow-2xl glass-card border-white/10"
        >
          {/* 게시글 헤더 */}
          <header className="flex flex-col gap-4 px-5 py-5 md:px-10 md:pb-6">
          {(showCategory || post.character_slug || post.artist_tag) && (
                <div className="flex flex-wrap gap-2 items-center text-xs font-black tracking-widest uppercase text-neutral-400">
                  {showCategory && (
                    <span
                      className={`px-2 py-0.5 rounded border border-current/30 ${categoryColor}`}
                    >
                      {categoryLabel}
                    </span>
                  )}
                  {post.character_slug && (
                    <>
                      {showCategory && <span className="opacity-40">/</span>}
                      <span className="text-neutral-300">
                        {post.character_slug.replace("-", " ")}
                      </span>
                    </>
                  )}
                  {post.artist_tag && (
                    <span className="bg-brand-red text-white font-medium px-2 py-0.5 rounded-full normal-case tracking-normal">
                      {post.artist_tag}
                    </span>
                  )}
                </div>
              )}
            <div className="flex gap-4 shrink-0 max-md:flex-col">
              <button
                type="button"
                onClick={() => router.push(`/profile/${post.author_name}`)}
                className="block overflow-hidden w-12 h-12 rounded-xl border transition-opacity border-white/20 md:w-14 md:h-14 hover:opacity-90 focus:outline-none"
                aria-label={post.author_name}
              >
                {post.author_avatar ? (
                  <img
                    src={post.author_avatar}
                    alt=""
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="flex justify-center items-center w-full h-full text-white bg-white/10">
                    <User className="w-6 h-6 md:w-7 md:h-7" />
                  </span>
                )}
              </button>
              <div className="flex flex-col flex-1 gap-3 min-w-0">
              

              <h1 className="flex gap-2 items-center text-xl font-black tracking-tighter leading-tight text-white max-md:items-start">
                {displayTitle}
                {isTranslated && (
                  <Globe className="w-4 h-4 opacity-70 text-brand-blue shrink-0 max-md:mt-1" aria-label={t("board.detail.translated")} />
                )}
              </h1>

              <div className="flex flex-wrap gap-4 justify-between items-center text-sm font-bold text-neutral-400">
                {/* 1줄(모바일): 뱃지까지 / 2줄: 날짜 + 조회·좋아요·댓글 */}
                <div className="flex flex-wrap gap-3 items-center max-md:w-full max-md:flex-nowrap max-md:gap-2">
                  <LangIco langOrCountry={post.language} size={18} className="text-sm" />
                  <button
                    onClick={() => router.push(`/profile/${post.author_name}`)}
                    className="transition-colors group text-neutral-200 hover:text-brand-blue shrink-0"
                  >
                    <span>{post.author_name}</span>
                  </button>
                  <span className="opacity-30 max-md:hidden">|</span>
                </div>

                <div className="flex flex-wrap gap-4 items-center max-md:w-full max-md:gap-2 max-md:flex-nowrap max-md:justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-sm font-light text-neutral-500">
                      {formatDate(post.created_at, locale)}
                      <span className="ml-1.5 text-xs text-neutral-600 max-md:hidden">{formatTime(post.created_at)}</span>
                    </span>
                  </div>
                  <div className="flex gap-4 items-center max-md:gap-2">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 opacity-60" />
                      <span>{post.views}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5 opacity-60" />
                      <span>{likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 opacity-60" />
                      <span>{post.comment_count ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            
          </header>

          {/* 게시글 본문 */}
          <div className="px-5 py-8 space-y-3 border-t md:px-12 md:py-10 md:min-h-80 border-white/5">

            {/* 번역 상태 바 — 언어가 다를 때만 표시 */}
            {(post.language ?? 'ko') !== locale && (
              <div className={`flex items-center justify-between text-sm rounded-lg px-3 py-2 transition-all duration-300 ${
                isTranslatingContent
                  ? 'border bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                  : translationFailed
                  ? 'text-red-400 border bg-red-500/10 border-red-500/30'
                  : 'text-neutral-500'
              }`}>
                <span className="flex gap-2 items-center font-semibold">
                  <Globe className={`w-3.5 h-3.5 shrink-0 ${isTranslatingContent ? 'animate-spin' : ''}`} />
                  {isTranslatingContent
                    ? (
                      <span className="flex flex-col gap-0.5">
                        <span>{t("board.detail.translating")}</span>
                        <span className="text-sm font-normal opacity-60">{t("board.detail.translating_hint")}</span>
                      </span>
                    )
                    : translationFailed
                    ? (
                      <span className="flex gap-2 items-center">
                        <span>{t("board.detail.translation_failed")}</span>
                        <button
                          onClick={() => requestTranslation(post.id, locale)}
                          className="underline transition-opacity underline-offset-2 hover:opacity-80"
                        >
                          {t("board.detail.retry_translation")}
                        </button>
                      </span>
                    )
                    : <span className="flex gap-1 items-center">
                        <span className="opacity-60">AI</span>
                        <span className="opacity-40">·</span>
                        <span className="opacity-60">{locale.toUpperCase()}</span>
                      </span>
                  }
                  {isTranslatingContent && (
                    <span className="flex gap-1 ml-1">
                      {[0, 150, 300].map(delay => (
                        <span
                          key={delay}
                          className="w-1 h-1 rounded-full animate-bounce bg-brand-blue"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </span>
                  )}
                </span>
                {translatedContent && !isTranslatingContent && (
                  <button
                    onClick={() => setShowOriginal(prev => !prev)}
                    className="font-semibold transition-colors hover:text-brand-blue shrink-0"
                  >
                    {showOriginal ? t("board.detail.view_translated") : t("board.detail.view_original")}
                  </button>
                )}
              </div>
            )}

            {/* 본문 — 번역 중 opacity-0으로 자리 유지, 스켈레톤 absolute 오버레이 (스크롤 방지) */}
            <div className="relative">
              <div
                className={`transition-opacity duration-200 ${
                  isTranslatingContent ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <TweetRenderer
                  htmlContent={showOriginal || !translatedContent
                    ? (processedContent ?? post.content)
                    : translatedContent}
                />
              </div>
              {isTranslatingContent && (
                <div className="absolute inset-0 space-y-2.5 animate-pulse pt-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`h-4 bg-white/10 rounded ${i === 5 ? 'w-1/2' : i === 2 ? 'w-5/6' : 'w-full'}`} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* YouTube / 이미지 반응형 스타일 */}
          <style jsx global>{`
            .prose iframe[src*="youtube.com"],
            .prose iframe[src*="youtu.be"] {
              width: 100% !important;
              aspect-ratio: 16 / 9;
              max-width: 100%;
              height: auto !important;
              border-radius: 8px;
              margin: 1rem 0;
            }
            .prose img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              display: block;
              margin: 1.5rem 0;
            }
            /* 문단 간격 조정 (에디터와 동일하게) */
            .prose p {
              margin-top: 0;
              margin-top: 0;
              margin-bottom: 0;
              line-height: 2;
              min-height: 2em;
            }
            .prose h1, .prose h2 {
              margin-top: 0;
              margin-bottom: 0;
              line-height: 2;
            }
            .prose strong {
              font-weight: 900;
            }
            /* 리스트 및 일반 텍스트 간격 조정 */
            .prose ul, .prose ol {
              margin-top: 0;
              margin-bottom: 0;
              padding-left: 1.5em;
            }
            .prose li {
              margin-top: 0;
              margin-bottom: 0;
              line-height: 2;
            }
            .prose {
              line-height: 2;
            }
            .prose hr {
              margin-top: 2rem;
              margin-bottom: 2rem;
              border: none;
              border-top: 1px solid rgba(255, 255, 255, 0.5);
            }
            /* 동영상 */
            .prose .video-embed {
              border-radius: 8px;
              overflow: hidden;
              display: block;
            }
            .prose .video-embed[data-full-width="true"],
            .prose .video-embed:not([data-full-width]) {
              width: 100%;
              margin: 1rem 0;
            }
            .prose .video-embed[data-full-width="false"] {
              width: fit-content;
              max-width: 100%;
              margin: 1rem 0;
            }
            .prose video {
              height: auto;
              border-radius: 8px;
              display: block;
              background: #111;
            }
            .prose .video-embed[data-full-width="false"] video {
              width: auto;
              max-width: 100%;
            }
            .prose .video-embed[data-full-width="true"] video,
            .prose .video-embed:not([data-full-width]) video {
              width: 100%;
            }
            .prose .vimeo-embed iframe {
              aspect-ratio: 16 / 9;
              height: auto;
              border: none;
              border-radius: 8px;
              display: block;
            }
            .prose .vimeo-embed[data-full-width="false"] iframe {
              width: 640px;
              max-width: 100%;
            }
            .prose .vimeo-embed[data-full-width="true"] iframe,
            .prose .vimeo-embed:not([data-full-width]) iframe {
              width: 100%;
            }
            /* YouTube */
            .prose .youtube-embed {
              border-radius: 8px;
              overflow: hidden;
              display: block;
            }
            .prose .youtube-embed iframe {
              aspect-ratio: 16 / 9;
              border: none;
              display: block;
            }
            /* 이미지 */
            .prose img[data-full-width="false"] {
              width: auto;
              max-width: 100%;
            }
            .prose img[data-full-width="true"],
            .prose img:not([data-full-width]) {
              width: 100%;
            }
          `}</style>

          {/* 푸터 액션 버튼 */}
          <footer className="px-5 py-6 md:px-10 md:py-8 bg-white/[0.01] border-t border-white/10">
            <BoardActionButtons
              onBack={handleBack}
              liked={liked}
              isLiking={isLiking}
              onLike={handleLike}
              isAuthor={isAuthor}
              isAdmin={isAdmin}
              isPinned={post.is_pinned ?? false}
              onEdit={isAuthor ? () => router.push(getEditPath(id)) : undefined}
              onPin={isAdmin && getPinApiUrl ? handlePin : undefined}
              onDelete={isAuthor || isAdmin ? handleDelete : undefined}
            />
          </footer>
        </motion.article>

        {/* 댓글 섹션 */}
        <CommentList postId={id} onCommentChange={fetchPost} />

        {/* 관련글 섹션 */}
        {showRelatedPosts && (
          <MiniBoardList
            characterSlug={relatedPostsApiEndpoint ? undefined : (characterSlug ?? post.character_slug)}
            currentPostId={id}
            apiEndpoint={relatedPostsApiEndpoint}
            getPostHref={getRelatedPostHref}
            listHref={relatedPostsListHref}
            sectionLabel={relatedPostsSectionLabel}
          />
        )}
      </div>
    </div>
  );
}
