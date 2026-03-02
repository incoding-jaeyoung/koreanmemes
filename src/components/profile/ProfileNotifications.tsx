"use client";

import { motion } from "framer-motion";
import { EllipsisVertical } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import NotificationItem, { Notification } from "@/components/notifications/NotificationItem";

interface ProfileNotificationsProps {
  notifications: Notification[];
  transitionDelay?: number;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onDeleteAll?: () => void;
}

export default function ProfileNotifications({
  notifications,
  transitionDelay = 0,
  onNotificationClick,
  onMarkAllRead,
  onDeleteAll,
}: ProfileNotificationsProps) {
  const { t } = useLanguage();

  if (!notifications || notifications.length === 0) return null;

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: transitionDelay }}
      className="p-5 md:p-8 mt-6 glass-card"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="flex gap-2 items-center text-lg md:text-xl font-bold">
          <EllipsisVertical className="w-4 h-4 md:w-5 md:h-5 text-brand-yellow" />
          {t("notification.title")}
        </h3>
        <div className="flex gap-1.5">
          {hasUnread && onMarkAllRead && (
            <button
              onClick={onMarkAllRead}
              className="px-3 py-1 text-xs font-bold rounded-full border transition-colors cursor-pointer bg-white/5 hover:bg-white/10 border-white/10"
            >
              {t("notification.markAllRead")}
            </button>
          )}
          {onDeleteAll && (
            <button
              onClick={onDeleteAll}
              className="px-3 py-1 text-xs font-bold rounded-full border transition-colors cursor-pointer bg-white/5 hover:bg-brand-red/20 hover:border-brand-red/40 hover:text-brand-red border-white/10"
            >
              {t("notification.deleteAll")}
            </button>
          )}
        </div>
      </div>
      <div className="overflow-y-auto max-h-[350px] space-y-2 pr-1">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onClick={onNotificationClick}
            variant="card"
          />
        ))}
      </div>
    </motion.div>
  );
}

