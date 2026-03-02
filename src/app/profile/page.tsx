"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EllipsisVertical, Loader2, Save } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { BUTTON_SMALL_CLASS } from "@/constants/buttonStyles";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import ProfileSummary from "@/components/profile/ProfileSummary";
import ProfileGameInfo from "@/components/profile/ProfileGameInfo";
import ProfileActivityStats from "@/components/profile/ProfileActivityStats";
import ProfileRecentPosts from "@/components/profile/ProfileRecentPosts";
import ProfileRecentComments from "@/components/profile/ProfileRecentComments";
import ProfileNotifications from "@/components/profile/ProfileNotifications";
import type { Notification as ProfileNotification } from "@/components/notifications/NotificationItem";

export default function ProfilePage() {
  const { setLocale, t } = useLanguage();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState<ProfileNotification[]>([]);

  const [formData, setFormData] = useState({
    username: "",
    comment: "",
    main_character_id: "",
    rank_level: "",
    psn_id: "",
    steam_id: "",
    xbox_gamertag: "",
    discord_id: "",
    preferred_language: "ko",
  });

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
  }, []);

  const fetchProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const appProvider = user.app_metadata?.provider;
        const metaProvider = user.user_metadata?.provider;
        // 이메일 유저: app_metadata.provider가 'email'이고 user_metadata에 소셜 provider가 없는 경우
        setIsEmailUser(appProvider === "email" && (!metaProvider || metaProvider === "email"));
      }

      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data.profile) {
        setProfile(data.profile);
        setStats(data.stats);
        setRecentPosts(data.recentPosts || []);
        setRecentComments(data.recentComments || []);
        // user_metadata.preferred_language 우선, 없으면 profile 값
        const prefLang = data.effectivePreferredLanguage || data.profile.preferred_language || "ko";
        setFormData({
          username: data.profile.username || "",
          comment: data.profile.comment || "",
          main_character_id: data.profile.main_character_id || "",
          rank_level: data.profile.rank_level != null ? String(data.profile.rank_level) : "",
          psn_id: data.profile.psn_id || "",
          steam_id: data.profile.steam_id || "",
          xbox_gamertag: data.profile.xbox_gamertag || "",
          discord_id: data.profile.discord_id || "",
          preferred_language: prefLang,
        });

        if (prefLang) {
          setLocale(prefLang as any);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // ignore
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      alert(t("profile.avatar.sizeError"));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert(t("profile.avatar.typeError"));
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: fd,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({ ...profile, avatar_url: data.url });
        alert(t("profile.avatar.uploadSuccess"));
      } else {
        const error = await response.json();
        alert(error.error || t("profile.avatar.uploadFailed"));
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert(t("profile.avatar.uploadError"));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert(t("profile.password.enterBoth"));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t("profile.password.mismatch"));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert(t("profile.password.tooShort"));
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(t("profile.password.changeSuccess"));
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert(data.error || t("profile.password.changeFailed"));
      }
    } catch (error) {
      console.error("Password change error:", error);
      alert(t("profile.password.changeError"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsEditing(false);

        if (formData.preferred_language) {
          setLocale(formData.preferred_language as any);
        }

        router.refresh();
        alert(t("profile.save.success"));
      } else {
        const data = await response.json();
        if (data.error === 'USERNAME_TAKEN') {
          alert(t("profile.username.taken"));
        } else if (data.error === 'USERNAME_LENGTH') {
          alert(t("profile.username.lengthError"));
        } else {
          alert(data.message || t("profile.save.failed"));
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      alert(t("profile.save.error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormDataChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleWithdrawal = async () => {
    if (!confirm(t("profile.withdrawal.confirm"))) return;
    setIsWithdrawing(true);
    try {
      const res = await fetch("/api/profile/delete", { method: "DELETE" });
      if (res.ok) {
        createClient().auth.signOut().catch(() => {});
        window.location.href = "/auth/withdrawal";
      } else {
        const data = await res.json();
        alert(data.error || t("profile.withdrawal.processError"));
      }
    } catch {
      alert(t("profile.withdrawal.processError"));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const handleDeleteAll = async () => {
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      setNotifications([]);
    } catch {
      // ignore
    }
  };

  const handleProfileNotificationClick = async (notification: ProfileNotification) => {
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
      } catch {
        // ignore
      }
    }

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-yellow" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">{t("profile.loadError")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-black tracking-tighter mb-2">
          {t("profile.pageTitle")}
        </h1>
        <p className="text-neutral-400">{t("profile.pageDesc")}</p>
      </motion.div>

      {/* 프로필 써머리 */}
      <ProfileSummary
        profile={profile}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onAvatarUpload={handleAvatarUpload}
        isUploadingAvatar={isUploadingAvatar}
        onEditStart={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={() => {
          setIsEditing(false);
          fetchProfile();
        }}
        isSaving={isSaving}
        greeting={t('common.greeting')}
        onLocaleChange={(code) => setLocale(code as any)}
        transitionDelay={0.1}
      />

      {/* 게임 정보 */}
      <ProfileGameInfo
        profile={profile}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        transitionDelay={0.2}
      />

      {/* 활동 통계 */}
      {stats && (
        <ProfileActivityStats
          stats={stats}
          asCard
          labels={{
            title: t("profile.stats.title"),
            posts: t("profile.stats.posts"),
            comments: t("profile.stats.comments"),
            likes: t("profile.stats.likes"),
          }}
          transitionDelay={0.4}
        />
      )}

      <ProfileNotifications
        notifications={notifications}
        transitionDelay={0.45}
        onNotificationClick={handleProfileNotificationClick}
        onMarkAllRead={handleMarkAllRead}
        onDeleteAll={handleDeleteAll}
      />

      <ProfileRecentPosts posts={recentPosts} title={t("profile.recentPosts")} transitionDelay={0.5} />
      <ProfileRecentComments comments={recentComments} title={t("profile.recentComments")} deletedPostLabel={t("profile.deletedPost")} transitionDelay={0.6} />

      {/* 보안 설정 (이메일 가입 유저만 표시) */}
      {isEmailUser && <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="mt-6 glass-card p-5 md:p-8"
      >
        <h3 className="flex items-center gap-2 mb-4 text-lg md:text-xl font-bold">
          <EllipsisVertical className="w-4 h-4 md:w-5 md:h-5 text-brand-yellow" />
          {t("profile.security.title")}
        </h3>

        <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2 block">
              {t("profile.security.currentPassword")}
            </label>
            <input
              type="password"
              autoComplete="off"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder={t("profile.security.currentPlaceholder")}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-yellow/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2 block">
              {t("profile.security.newPassword")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder={t("profile.security.newPlaceholder")}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-yellow/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2 block">
              {t("profile.security.confirmPassword")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder={t("profile.security.confirmPlaceholder")}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-yellow/50 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handlePasswordChange}
            disabled={isChangingPassword}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            {isChangingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{t("profile.security.changeButton")}</span>
          </button>
        </form>
      </motion.div>}

      {/* 회원 탈퇴 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 glass-card p-5 md:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 mb-2 text-lg md:text-xl font-bold">
              <EllipsisVertical className="w-4 h-4 md:w-5 md:h-5 text-brand-yellow" />
              {t("profile.withdrawal.title")}
            </h3>
            <p className="text-sm text-neutral-400">
              {t("profile.withdrawal.desc")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleWithdrawal}
            disabled={isWithdrawing}
            className={`${BUTTON_SMALL_CLASS} border border-red-500/50 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-50 self-start sm:self-auto`}
          >
            {isWithdrawing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            {t("profile.withdrawal.button")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
