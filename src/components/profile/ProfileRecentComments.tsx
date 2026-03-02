"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EllipsisVertical } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/utils/date";

export interface ProfileRecentCommentItem {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  posts?: { title?: string } | null;
}

interface ProfileRecentCommentsProps {
  comments: ProfileRecentCommentItem[];
  /** framer-motion transition delay */
  transitionDelay?: number;
  /** 제목 (기본: 최근 댓글) */
  title?: string;
  /** 삭제된 게시글 표시 문구 */
  deletedPostLabel?: string;
}

export default function ProfileRecentComments({
  comments,
  transitionDelay = 0,
  title = "최근 댓글",
  deletedPostLabel = "삭제된 게시글",
}: ProfileRecentCommentsProps) {
  const router = useRouter();
  const { locale } = useLanguage();

  // 내용이 비어 있는 댓글(삭제된 댓글 등)은 표시하지 않음
  const visibleComments = comments.filter(
    (comment) => comment.content && comment.content.trim().length > 0
  );

  if (visibleComments.length === 0) return null;

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
        {visibleComments.map((comment) => (
          <button
            key={comment.id}
            onClick={() => router.push(`/board/${comment.post_id}`)}
            className="flex gap-3 justify-between items-center p-3 w-full text-left rounded-lg border transition-colors bg-white/5 hover:bg-white/10 border-white/10"
          >
            <p className="min-w-0 text-sm font-bold text-white truncate">
              {comment.content}
            </p>
            <span className="text-xs text-neutral-500 shrink-0">
              {formatDate(comment.created_at, locale)}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
