"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { TrendingUp, MessageSquare, Heart, User, Globe } from "lucide-react";
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

export default function HotTopicsWidget() {
  const { t, locale } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchHotPosts = async () => {
      try {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from('posts_with_comments')
          .select('*')
          .gt('likes', 0)
          .gte('created_at', since)
          .order('likes', { ascending: false })
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

    fetchHotPosts();
  }, []);

  if (isLoading) return (
    <div className="bg-white/5 rounded-xl h-[300px]" />
  );

  if (posts.length === 0) return null; // 인기글 없으면 숨김

  return (
    <div className="bg-gradient-to-br from-brand-yellow/10 to-transparent border border-brand-yellow/20 rounded-xl overflow-hidden shadow-lg backdrop-blur-md mb-8">
      <div className="px-5 py-2 border-b border-brand-yellow/10 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-yellow/5" />
        <h3 className="font-black text-base flex items-center gap-2 tracking-tight text-brand-yellow relative z-10">
          <span className="w-1 h-4 bg-brand-yellow rounded-full"></span>
          {t('widget.hotTopics.title')}
        </h3>
      </div>
      <div className="divide-y divide-brand-yellow/10">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={getPostPath(post)}
            className="block px-5 py-3 hover:bg-brand-yellow/5 transition-all group"
          >
            <div className="flex items-start gap-3">
              <span className={`text-xl font-black italic text-brand-yellow/30 group-hover:text-brand-yellow/80 transition-colors w-6 text-center shrink-0 mt-0.5`}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0 space-y-1.5">
                <h4 className="text-sm font-bold text-white group-hover:text-brand-yellow transition-colors flex items-center gap-1 min-w-0">
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
                
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-bold text-neutral-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author_name}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-brand-yellow/80 flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes}
                    </span>
                    <span className="text-[10px]">
                      {formatDate(post.created_at, locale)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
