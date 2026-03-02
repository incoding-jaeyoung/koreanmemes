"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EllipsisVertical, Eye, ThumbsUp, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/utils/date";

export interface ProfileRecentPostItem {
  id: string;
  title: string;
  category?: string;
  created_at: string;
  likes?: number;
  views?: number;
  post_translations?: { lang: string; title: string }[];
}

interface ProfileRecentPostsProps {
  posts: ProfileRecentPostItem[];
  /** framer-motion transition delay */
  transitionDelay?: number;
  /** 제목 (기본: 최근 게시글) */
  title?: string;
}

export default function ProfileRecentPosts({
  posts,
  transitionDelay = 0,
  title = "최근 게시글",
}: ProfileRecentPostsProps) {
  const router = useRouter();
  const { locale } = useLanguage();

  if (posts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: transitionDelay }}
      className="p-5 md:p-8 mt-6 glass-card"
    >
      <h3 className="flex gap-2 items-center mb-4 text-lg md:text-xl font-bold">
        <EllipsisVertical className="w-4 h-4 md:w-5 md:h-5 text-brand-yellow" />
        {title}
      </h3>
      <div className="space-y-2">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => router.push(`/board/${post.id}`)}
            className="flex gap-3 items-center p-3 w-full text-left rounded-lg border transition-colors bg-white/5 hover:bg-white/10 border-white/10"
          >
            <h4 className="flex-1 min-w-0 text-sm font-bold text-white truncate flex items-center gap-1">
              {post.post_translations?.find(tr => tr.lang === locale)?.title || post.title}
              {post.post_translations?.some(tr => tr.lang === locale) && (
                <Globe className="w-3 h-3 text-brand-blue shrink-0 opacity-60" />
              )}
            </h4>
            <span className="hidden md:block text-xs shrink-0 text-neutral-500">
              {formatDate(post.created_at, locale)}
            </span>
            <span className="hidden md:flex text-xs shrink-0 text-neutral-500 items-center gap-0.5">
              <Eye className="w-3 h-3" />
              {post.views ?? 0}
            </span>
            <span className="hidden md:flex text-xs shrink-0 text-neutral-500 items-center gap-0.5 text-brand-yellow">
              <ThumbsUp className="w-3 h-3" />
              {post.likes ?? 0}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
