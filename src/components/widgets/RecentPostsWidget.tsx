"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MessageSquare, Heart, Eye, User, Clock, Globe } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/utils/date";

function getPostPath(post: any): string {
  switch (post.board_type) {
    case 'news': return `/news/${post.id}`;
    case 'video': return `/gallery/${post.id}`;
    default: return `/board/${post.id}`;
  }
}

// 자유게시판(general) 전용 — 다국어 키 매핑
const BOARD_CATEGORY_KEY_MAP: Record<string, string> = {
  greeting: "board.cat.greeting",
  chat: "board.cat.chat",
  question: "board.cat.question",
  tips: "board.cat.tips",
  gear: "board.cat.gear",
  match: "board.cat.match",
  review: "board.cat.review",
  info: "board.cat.info",
  discussion: "board.cat.discussion",
};

const BOARD_CATEGORY_COLOR_MAP: Record<string, string> = {
  greeting: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
  chat: "text-stone-400 border-stone-400/30 bg-stone-400/10",
  question: "text-sky-500 border-sky-500/30 bg-sky-500/10",
  tips: "text-rose-500 border-rose-500/30 bg-rose-500/10",
  gear: "text-violet-500 border-violet-500/30 bg-violet-500/10",
  match: "text-orange-500 border-orange-500/30 bg-orange-500/10",
  review: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  info: "text-indigo-500 border-indigo-500/30 bg-indigo-500/10",
  discussion: "text-rose-500 border-rose-500/30 bg-rose-500/10",
};

const CATEGORY_KEY_MAP: Record<string, string> = {
  // news
  notice: "news.cat.notice",
  update: "news.cat.update",
  event: "news.cat.event",
  official: "news.cat.official",
  community: "news.cat.community",
  // gallery
  match_tournament: "gallery.cat.match_tournament",
  today_match: "gallery.cat.today_match",
  combo_guide: "gallery.cat.combo_guide",
  legendary: "gallery.cat.legendary",
  free: "gallery.cat.free",
  showcase: "gallery.cat.showcase",
};

const CATEGORY_COLOR_MAP: Record<string, string> = {
  // news
  notice: "text-brand-red border-brand-red/30 bg-brand-red/10",
  update: "text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10",
  event: "text-pink-400 border-pink-400/30 bg-pink-400/10",
  official: "text-sky-400 border-sky-400/30 bg-sky-400/10",
  community: "text-lime-400 border-lime-400/30 bg-lime-400/10",
  // gallery
  match_tournament: "text-brand-red border-brand-red/30 bg-brand-red/10",
  today_match: "text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10",
  combo_guide: "text-sky-400 border-sky-400/30 bg-sky-400/10",
  legendary: "text-violet-400 border-violet-400/30 bg-violet-400/10",
  free: "text-neutral-400 border-neutral-400/30 bg-neutral-400/10",
  showcase: "text-pink-400 border-pink-400/30 bg-pink-400/10",
};

function getCategoryKey(post: { board_type?: string; category?: string }): string | undefined {
  return post.board_type === "general"
    ? BOARD_CATEGORY_KEY_MAP[post.category ?? ""]
    : CATEGORY_KEY_MAP[post.category ?? ""];
}

function getCategoryColor(post: { board_type?: string; category?: string }): string {
  const map = post.board_type === "general" ? BOARD_CATEGORY_COLOR_MAP : CATEGORY_COLOR_MAP;
  return map[post.category ?? ""] || "text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10";
}

export default function RecentPostsWidget() {
  const { t, locale } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts_with_comments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        let enrichedPosts = data || [];

        // 다국어 제목 매핑 (post_translations)
        if (enrichedPosts.length > 0) {
          const postIds = enrichedPosts.map((p) => p.id);
          const { data: translations } = await supabase
            .from('post_translations')
            .select('post_id, lang, title')
            .in('post_id', postIds);

          const translationsMap: Record<string, { lang: string; title: string }[]> = {};
          for (const tr of translations || []) {
            if (!translationsMap[tr.post_id]) translationsMap[tr.post_id] = [];
            translationsMap[tr.post_id].push({
              lang: tr.lang,
              title: tr.title,
            });
          }

          enrichedPosts = enrichedPosts.map((post) => ({
            ...post,
            post_translations: translationsMap[post.id] ?? [],
          }));
        }

        setPosts(enrichedPosts);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  if (isLoading) return (
    <div className="bg-white/5 rounded-xl h-[300px]" />
  );

  return (
    <div className="bg-neutral-900/50 border border-white/5 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
      <div className="px-5 py-2 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <h3 className="font-black text-base flex items-center gap-2 tracking-tight">
          <span className="w-1 h-4 bg-brand-yellow rounded-full"></span>
          {t('widget.posts.title')}
        </h3>
        <Link href="/board" className="text-xs text-neutral-500 hover:text-white transition-colors uppercase font-bold tracking-wider flex items-center gap-1 group">
          {t('widget.posts.more')} <span className="text-brand-yellow group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
      <div className="divide-y divide-white/5">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={getPostPath(post)}
            className="block pl-5 pr-5 py-3 hover:bg-white/10 hover:pl-7 transition-all duration-300 group relative"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                  getCategoryColor(post)
                }`}>
                  {getCategoryKey(post) ? t(getCategoryKey(post)!) : (post.category || "General")}
                </span>
                <h4 className="text-sm font-bold text-neutral-200 group-hover:text-white transition-colors flex items-center gap-1 min-w-0 flex-1">
                  <span className="truncate min-w-0">
                    {(post.post_translations as { lang: string; title: string }[] | undefined)?.find(tr => tr.lang === locale)?.title || post.title}
                  </span>
                  {(post.post_translations as { lang: string; title: string }[] | undefined)?.some(tr => tr.lang === locale) && post.language !== locale && (
                    <Globe className="w-3 h-3 text-brand-blue shrink-0 opacity-60" />
                  )}
                  {post.comment_count > 0 && (
                    <span className="ml-1 text-xs font-black text-brand-yellow">
                      ({post.comment_count})
                    </span>
                  )}
                </h4>
              </div>
              
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-bold text-neutral-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {post.author_name}
                </span>
                
                <div className="flex items-center gap-2">
                  {post.likes > 0 && (
                    <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes}
                    </span>
                  )}
                  <span className="text-[10px]">
                    {formatDate(post.created_at, locale)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {posts.length === 0 && (
          <div className="py-12 text-center text-neutral-500 text-sm">
            {t('widget.posts.empty')}
          </div>
        )}
      </div>
    </div>
  );
}
