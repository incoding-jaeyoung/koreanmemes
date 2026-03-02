"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import NotificationItem from "./NotificationItem";

interface Notification {
  id: string;
  type: "comment" | "like" | "reply" | "welcome";
  actor_name: string;
  post_title: string;
  post_id: string | null;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
  post_translations?: { lang: string; title: string }[];
}

const POLL_INTERVAL = 30_000;

export default function NotificationBell() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  // 모바일 fixed 포지셔닝을 위한 좌표
  const [mobilePos, setMobilePos] = useState<{ top: number; maxHeight: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count ?? 0);
      }
    } catch {
      // 폴링 실패는 무시
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);


  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unread_count ?? 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleOpen = () => {
    if (!isOpen) {
      fetchNotifications();
      // 모바일 여부 판단 후 fixed 좌표 계산
      if (buttonRef.current && window.innerWidth < 768) {
        const rect = buttonRef.current.getBoundingClientRect();
        const maxHeight = window.innerHeight - rect.bottom - 24; // 24px 하단 여백
        setMobilePos({ top: rect.bottom + 8, maxHeight });
      } else {
        setMobilePos(null);
      }
    }
    setIsOpen((prev) => !prev);
  };

  // 외부 클릭 시 닫힘
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const deleteAll = async () => {
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const navigateToPost = async (notification: Notification) => {
    if (!notification.post_id) return;
    try {
      const res = await fetch(`/api/posts/${notification.post_id}`);
      if (res.ok) {
        const data = await res.json();
        const boardType = data.post?.board_type ?? "general";

        if (boardType === "video") {
          router.push(`/gallery/${notification.post_id}`);
        } else if (boardType === "news") {
          router.push(`/news/${notification.post_id}`);
        } else {
          router.push(`/board/${notification.post_id}`);
        }
      } else {
        router.push(`/board/${notification.post_id}`);
      }
    } catch {
      router.push(`/board/${notification.post_id}`);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await fetch("/api/notifications/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [notification.id] }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }

    setIsOpen(false);

    if (notification.type === 'welcome' || notification.link_url) {
      router.push(notification.link_url || '/profile');
      return;
    }

    await navigateToPost(notification);
  };

  // 모바일: fixed + inset-x-4, 데스크탑: absolute right-0
  const dropdownStyle = mobilePos
    ? { position: "fixed" as const, top: mobilePos.top, left: 16, right: 16, maxHeight: mobilePos.maxHeight }
    : undefined;

  const dropdownClass = mobilePos
    ? "flex flex-col bg-neutral-900/95 backdrop-blur-[16px] border border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden"
    : "absolute right-0 top-14 w-80 flex flex-col bg-neutral-900/95 backdrop-blur-[16px] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden";

  const listMaxHeight = mobilePos ? "flex-1 min-h-0" : "max-h-80";

  return (
    <div className="relative">
      {/* 벨 버튼 */}
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        className="flex relative justify-center items-center w-8 h-8 rounded-full border transition-all cursor-pointer bg-white/5 border-white/10 hover:bg-white/10"
        aria-label={t("notification.title")}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center bg-brand-red text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={dropdownStyle}
            className={dropdownClass}
          >
            {/* 헤더 */}
            <div className="flex flex-none justify-between items-center px-4 h-12 border-b border-white/10">
              <span className="text-sm font-bold">{t("notification.title")}</span>
              <div className="flex gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="px-3 py-1 text-xs font-bold rounded-full border transition-colors cursor-pointer bg-white/5 hover:bg-white/10 border-white/10"
                  >
                    {t("notification.markAllRead")}
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={deleteAll}
                    className="px-3 py-1 text-xs font-bold rounded-full border transition-colors cursor-pointer bg-white/5 hover:bg-brand-red/20 hover:border-brand-red/40 hover:text-brand-red border-white/10"
                  >
                    {t("notification.deleteAll")}
                  </button>
                )}
              </div>
            </div>

            {/* 알림 목록 */}
            <div className={`overflow-y-auto ${listMaxHeight}`}>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-5 h-5 rounded-full border-2 animate-spin border-white/20 border-t-white/60" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-10 text-neutral-500">
                  <Bell className="mb-2 w-8 h-8 opacity-30" />
                  <p className="text-xs">{t("notification.empty")}</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
