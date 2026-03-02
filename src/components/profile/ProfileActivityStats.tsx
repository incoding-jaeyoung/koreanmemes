"use client";

import { motion } from "framer-motion";
import { EllipsisVertical, FileText, MessageSquare, ThumbsUp } from "lucide-react";

export interface ProfileActivityStatsLabels {
  title?: string;
  posts?: string;
  comments?: string;
  likes?: string;
}

interface ProfileActivityStatsProps {
  stats: {
    posts: number;
    comments: number;
    likes_given: number;
  };
  /** true이면 독립 glass-card로 감싸고, false이면 그리드만 렌더링 */
  asCard?: boolean;
  /** 제목 + 게시글/댓글/좋아요 라벨 (i18n 등에서 전달) */
  labels?: ProfileActivityStatsLabels;
  transitionDelay?: number;
  className?: string;
}

const DEFAULT_LABELS: Required<ProfileActivityStatsLabels> = {
  title: "활동 통계",
  posts: "게시글",
  comments: "댓글",
  likes: "좋아요",
};

const STAT_ITEMS: { key: "posts" | "comments" | "likes_given"; Icon: typeof FileText; labelKey: "posts" | "comments" | "likes"; color: string }[] = [
  { key: "posts", Icon: FileText, labelKey: "posts", color: "text-brand-yellow bg-brand-yellow/10 border-brand-yellow/20" },
  { key: "comments", Icon: MessageSquare, labelKey: "comments", color: "text-sky-400 bg-sky-400/10 border-sky-400/20" },
  { key: "likes_given", Icon: ThumbsUp, labelKey: "likes", color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
];

export default function ProfileActivityStats({
  stats,
  asCard = false,
  labels: labelsProp,
  transitionDelay = 0,
  className = "",
}: ProfileActivityStatsProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  const grid = (
    <div className={`grid grid-cols-3 gap-3 md:gap-4 ${className}`}>
      {STAT_ITEMS.map(({ key, Icon, labelKey, color }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: transitionDelay + i * 0.05 }}
          className="group relative flex flex-col items-center rounded-xl border p-4 md:p-5 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/15 transition-all duration-300"
        >
          <div className={`mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-2xl md:text-3xl font-black tabular-nums tracking-tight text-white">
            {stats[key]}
          </p>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-neutral-500">
            {labels[labelKey] ?? ""}
          </p>
        </motion.div>
      ))}
    </div>
  );

  if (!asCard) return grid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: transitionDelay }}
      className="p-5 md:p-8 mt-6 glass-card"
    >
      <h3 className="flex gap-2 items-center mb-4 text-lg md:text-xl font-bold">
        <EllipsisVertical className="w-4 h-4 md:w-5 md:h-5 text-brand-yellow" />
        {labels.title}
      </h3>
      {grid}
    </motion.div>
  );
}
