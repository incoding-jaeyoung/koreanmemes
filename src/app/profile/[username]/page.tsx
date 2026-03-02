"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, ArrowLeft, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import ProfileSummary from "@/components/profile/ProfileSummary";
import ProfileGameInfo from "@/components/profile/ProfileGameInfo";
import ProfileActivityStats from "@/components/profile/ProfileActivityStats";
import ProfileRecentPosts from "@/components/profile/ProfileRecentPosts";
import ProfileRecentComments from "@/components/profile/ProfileRecentComments";

export default function UserProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkAdmin();
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: p } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setIsAdmin(p?.role === 'admin');
    }
  };

  const handleBan = async () => {
    const nextBannedState = !profile.is_banned;
    if (!confirm(nextBannedState ? `${profile.username} - ${t('admin.ban.confirmBan')}` : t('admin.ban.confirmUnban'))) return;

    try {
      const response = await fetch(`/api/profile/${encodeURIComponent(profile.username)}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_banned: nextBannedState }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({ ...profile, is_banned: data.is_banned });
        alert(data.is_banned ? t('admin.ban.bannedSuccess') : t('admin.ban.unbannedSuccess'));
      } else {
        const data = await response.json();
        alert(data.error || t('admin.ban.failed'));
      }
    } catch (error) {
      console.error("Error banning user:", error);
      alert(t('admin.ban.error'));
    }
  };

  const fetchProfile = async () => {
    try {
      const decodedUsername = decodeURIComponent(username as string);
      const response = await fetch(`/api/profile/${encodeURIComponent(decodedUsername)}`);

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setStats(data.stats);
        setRecentPosts(data.recentPosts || []);
        setRecentComments(data.recentComments || []);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-yellow" />
      </div>
    );
  }

  // 프로필이 없으면 기본 정보만 표시
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-neutral-500" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter mb-2">{username}</h1>
          <p className="text-neutral-500 mb-6">{t('profile.public.notConfigured')}</p>

          {stats && (
            <ProfileActivityStats stats={stats} className="max-w-md mx-auto" />
          )}
        </motion.div>
      </div>
    );
  }

  const adminActions = isAdmin && profile.role !== 'admin' ? (
    <button
      onClick={handleBan}
      className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold transition-all ${
        profile.is_banned
          ? 'bg-brand-red/10 border-brand-red text-brand-red hover:bg-brand-red/20'
          : 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-400'
      }`}
    >
      {profile.is_banned ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
      {profile.is_banned ? t('admin.ban.unbanButton') : t('admin.ban.banButton')}
    </button>
  ) : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* 뒤로가기 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>돌아가기</span>
      </motion.button>

      {/* 프로필 써머리 */}
      <ProfileSummary
        profile={profile}
        headerActions={adminActions}
        showBannedBadge
      />

      {/* 활동 통계 */}
      {/* 게임 정보 */}
      <ProfileGameInfo
        profile={profile}
        transitionDelay={0.1}
      />

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
          transitionDelay={0.2}
        />
      )}

      <ProfileRecentPosts posts={recentPosts} title={t("profile.recentPosts")} transitionDelay={0.3} />
      <ProfileRecentComments comments={recentComments} title={t("profile.recentComments")} deletedPostLabel={t("profile.deletedPost")} transitionDelay={0.4} />
    </div>
  );
}
