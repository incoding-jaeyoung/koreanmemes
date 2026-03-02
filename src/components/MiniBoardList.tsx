"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageSquare, ThumbsUp, Eye, Pin, Image as ImageIcon, Video } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface MiniBoardListProps {
  currentPostId: string;
  /** 커스텀 API 엔드포인트 (기본값: /api/board) */
  apiEndpoint?: string;
  /** 커스텀 게시글 링크 생성 함수 */
  getPostHref?: (postId: string) => string;
  /** "View All" 링크 */
  listHref?: string;
  /** 섹션 레이블 (기본값: LATEST) */
  sectionLabel?: string;
}

export default function MiniBoardList({
  currentPostId,
  apiEndpoint,
  getPostHref,
  listHref,
  sectionLabel,
}: MiniBoardListProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, locale } = useLanguage();

  useEffect(() => {
    fetchLatestPosts();
  }, [apiEndpoint]);

  const fetchLatestPosts = async () => {
    setIsLoading(true);
    try {
      const url = apiEndpoint
        ? `${apiEndpoint}?limit=10`
        : `/api/board?limit=10`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Failed to fetch mini board posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMiniDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  };

  const hasImage = (content: string) => content.includes('<img');
  const hasVideo = (content: string) => content.includes('youtube-video') || content.includes('<iframe');

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <div className="w-8 h-8 rounded-full animate-spin border-3 border-brand-yellow/30 border-t-brand-yellow" />
    </div>
  );

  if (posts.length === 0) return null;

  const resolvedListHref = listHref ?? '/board';
  const resolvedLabel = sectionLabel ?? 'LATEST';

  return (
    <div className="mt-20 space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-white/20">
        <h3 className="text-xl font-black tracking-tighter">
          {resolvedLabel} <span className="text-brand-yellow">POSTS</span>
        </h3>
        <Link
          href={resolvedListHref}
          className="text-xs font-bold tracking-widest uppercase transition-colors text-neutral-500 hover:text-brand-yellow"
        >
          View All →
        </Link>
      </div>

      <div className="overflow-hidden glass-card">
        <div className="divide-y divide-white/5">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={getPostHref ? getPostHref(post.id) : `/board/${post.id}`}
              className={`flex items-center px-4 py-3 hover:bg-white/[0.03] transition-all group ${
                post.id === currentPostId ? 'bg-white/5 pointer-events-none' : ''
              }`}
            >
              <div className="flex flex-1 gap-2 items-center min-w-0">
                {post.is_pinned && <Pin className="w-3 h-3 fill-current text-brand-yellow shrink-0" />}
                <span className={`text-sm truncate transition-colors ${
                  post.id === currentPostId ? 'text-neutral-500 font-bold' : 'text-neutral-200 group-hover:text-brand-yellow'
                }`}>
                  {post.post_translations?.find((tr: { lang: string; title: string }) => tr.lang === locale)?.title || post.title}
                </span>
                {post.comments > 0 && (
                  <span className="text-sm text-brand-yellow shrink-0">
                    [{post.comments}]
                  </span>
                )}
                {hasImage(post.content || '') && <ImageIcon className="w-3 h-3 text-neutral-500 shrink-0" />}
                {hasVideo(post.content || '') && <Video className="w-3 h-3 text-neutral-500 shrink-0" />}
              </div>
              <div className="flex gap-4 items-center ml-4 text-sm font-base text-neutral-500 shrink-0">
                <span className="hidden w-40 text-right truncate sm:inline-block">{post.author_name}</span>
                <span className="w-10 font-light text-right">{formatMiniDate(post.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
