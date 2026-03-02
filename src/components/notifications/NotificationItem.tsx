"use client";

import { MessageSquare, ThumbsUp, CornerDownRight, PartyPopper } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatRelativeTime } from "@/utils/date";

export interface Notification {
  id: string;
  type: "comment" | "like" | "reply" | "welcome";
  actor_name: string;
  post_title: string;
  post_id: string | null;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
  /** DB 번역 제목 (locale별 표시용) */
  post_translations?: { lang: string; title: string }[];
}

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  /** 기본값: dropdown (알림창), profile에서는 card 사용 */
  variant?: "dropdown" | "card";
}

const typeIcon = {
  comment: <MessageSquare className="w-4 h-4 text-brand-blue shrink-0" />,
  like: <ThumbsUp className="w-4 h-4 text-brand-yellow shrink-0" />,
  reply: <CornerDownRight className="w-4 h-4 text-emerald-400 shrink-0" />,
  welcome: <PartyPopper className="w-4 h-4 text-brand-red shrink-0" />,
};

export default function NotificationItem({ notification, onClick, variant = "dropdown" }: NotificationItemProps) {
  const { t, locale } = useLanguage();
  const displayTitle =
    notification.post_translations?.find((tr) => tr.lang === locale)?.title ?? notification.post_title;
  const timeLabel = formatRelativeTime(notification.created_at, t);

  const isWelcome = notification.type === 'welcome';

  const buttonClassName =
    variant === "card"
      ? "flex gap-3 items-start p-3 w-full text-left rounded-lg border transition-colors cursor-pointer bg-white/5 hover:bg-white/10 border-white/10"
      : "flex gap-3 items-start px-4 py-3 w-full text-left transition-colors cursor-pointer hover:bg-white/5";

  return (
    <button
      onClick={() => onClick(notification)}
      className={buttonClassName}
    >
      <div className="mt-0.5">{typeIcon[notification.type]}</div>
      <div className="flex-1 min-w-0">
        {isWelcome ? (
          <>
            <p className="text-xs text-white leading-snug flex items-center gap-1.5 flex-wrap">
              <span className="font-bold">{t("notification.welcome.title")}</span>
              {!notification.is_read && (
                <span className="inline-flex items-center px-0.5 py-0.5 rounded text-[10px] font-black tracking-wide bg-brand-red/90 text-white leading-none">
                  N
                </span>
              )}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
              {t("notification.welcome.body")}
            </p>
            <p className="mt-1 text-xs text-neutral-600">{timeLabel}</p>
          </>
        ) : (
          <>
            <p className="text-xs text-white leading-snug flex items-center gap-1.5 flex-wrap">
              <span className="font-bold">{notification.actor_name}</span>
              <span className="text-neutral-300">{t(`notification.${notification.type}`)}</span>
              {!notification.is_read && (
                <span className="inline-flex items-center px-0.5 py-0.5 rounded text-[10px] font-black tracking-wide bg-brand-red/90 text-white leading-none">
                  N
                </span>
              )}
            </p>
            {displayTitle && (
              variant === "card" ? (
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="text-xs text-neutral-500 truncate">{displayTitle}</p>
                  <span className="text-[11px] text-neutral-600 shrink-0">
                    {timeLabel}
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">{displayTitle}</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {timeLabel}
                  </p>
                </>
              )
            )}
          </>
        )}
      </div>
    </button>
  );
}
