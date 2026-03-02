"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { User, LogOut, FileText, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function UserProfileWidget() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ posts: 0, comments: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUserData = async (userId: string) => {
    const [postsResponse, commentsResponse, profileResponse] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', userId),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('author_id', userId),
      supabase.from('profiles').select('*').eq('id', userId).single(),
    ]);

    setStats({
      posts: postsResponse.count || 0,
      comments: commentsResponse.count || 0,
    });

    if (profileResponse.data) {
      setProfile(profileResponse.data);
    }
  };

  useEffect(() => {
    // Use getUser() to verify auth against server (not cached getSession)
    supabase.auth.getUser().then(async ({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.id);
      } else {
        setUser(null);
        setProfile(null);
        setStats({ posts: 0, comments: 0 });
      }
      setLoading(false);
    });

    // Listen for client-side auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchUserData(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setStats({ posts: 0, comments: 0 });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = () => {
    window.location.href = '/api/auth/signout';
  };

  if (loading) {
    return <div className="glass-card p-6 rounded-xl border border-white/10 h-[200px] bg-white/5" />;
  }

  if (!user) {
    return (
      <div className="glass-card p-6 rounded-xl border border-white/10 backdrop-blur-xl bg-black/40">
        <h3 className="text-sm font-bold text-neutral-400 mb-4 uppercase tracking-wider">{t('widget.profile.title')}</h3>
        <div className="text-center py-4">
          <p className="text-neutral-500 text-sm mb-4 whitespace-pre-line">
            {t('widget.profile.loginPrompt')}
          </p>
          <Link
            href="/login"
            className="flex w-full items-center justify-center px-6 py-2 bg-brand-yellow text-black text-sm font-bold rounded-lg hover:scale-105 transition-transform shadow-lg shadow-brand-yellow/20 hover:shadow-brand-yellow/40"
          >
            {t('widget.profile.loginButton')}
          </Link>
        </div>
      </div>
    );
  }

  // Get user display name and avatar
  // username이 이메일 형태(트리거 초기값)이면 표시명으로 사용하지 않음
  const emailPrefix = user.email ? user.email.split('@')[0] : null
  const profileUsername = profile?.username && profile.username !== user.email && profile.username !== emailPrefix ? profile.username : null
  const profileNickname = profile?.nickname && profile.nickname !== user.email && profile.nickname !== emailPrefix ? profile.nickname : null
  const displayName = profileUsername || profileNickname
    || user.user_metadata?.custom_claims?.global_name
    || user.user_metadata?.nickname || user.user_metadata?.name
    || user.user_metadata?.full_name || user.user_metadata?.user_name
    || emailPrefix || 'User';
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="glass-card p-6 rounded-xl border border-white/10 backdrop-blur-xl bg-black/40">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-yellow to-brand-red p-[2px] shrink-0 relative">
          <div className="w-full h-full rounded-full bg-neutral-900 overflow-hidden flex items-center justify-center relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <User className="w-7 h-7 text-white" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider mb-0.5">{t('widget.profile.welcomeBack')}</p>
          <h3 className="font-bold text-white truncate leading-tight">
            {displayName}{t('widget.profile.welcomeUser')}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {t('widget.profile.joinedAt')} {new Date(user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-neutral-400 group-hover:text-brand-blue transition-colors" />
            <span className="text-xl font-black text-white group-hover:text-brand-blue transition-colors">{stats.posts}</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider group-hover:text-white transition-colors">{t('widget.profile.myPosts')}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-neutral-400 group-hover:text-brand-red transition-colors" />
            <span className="text-xl font-black text-white group-hover:text-brand-red transition-colors">{stats.comments}</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider group-hover:text-white transition-colors">{t('widget.profile.comments')}</span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:bg-brand-red/10 hover:text-brand-red hover:border-brand-red/30 transition-all text-xs font-bold cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        {t('nav.logout')}
      </button>
    </div>
  );
}
