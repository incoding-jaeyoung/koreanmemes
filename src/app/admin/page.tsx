"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Activity,
  Clock,
  ArrowRight,
  Settings,
  Heart,
  Eye,
  UserPlus,
  Flame,
  MonitorSmartphone,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    comments: 0,
    todayPosts: 0,
    todaySignups: 0,
    weekSignups: 0,
    totalLikes: 0,
    totalViews: 0,
    todayVisitors: 0,
    returningVisitors: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const [
          { count: userCount },
          { count: postCount },
          { count: commentCount },
          { count: todayCount },
          { count: todaySignupCount },
          { count: weekSignupCount },
          { count: totalLikeCount },
          { data: viewData },
          { data: recentPosts },
          { data: newUsers },
          visitorsRes,
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("comments").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
          supabase.from("post_likes").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("views"),
          supabase.from("posts").select("id, title, author_name, created_at, views, likes").order("created_at", { ascending: false }).limit(5),
          supabase.from("profiles").select("id, username, created_at").order("created_at", { ascending: false }).limit(5),
          fetch("/api/admin/stats/visitors").then((r) => r.ok ? r.json() : { todayVisitors: 0, returningVisitors: 0 }).catch(() => ({ todayVisitors: 0, returningVisitors: 0 })),
        ]);

        const totalViews = (viewData || []).reduce((sum: number, p: any) => sum + (p.views || 0), 0);

        setStats({
          users: userCount || 0,
          posts: postCount || 0,
          comments: commentCount || 0,
          todayPosts: todayCount || 0,
          todaySignups: todaySignupCount || 0,
          weekSignups: weekSignupCount || 0,
          totalLikes: totalLikeCount || 0,
          totalViews,
          todayVisitors: visitorsRes?.todayVisitors || 0,
          returningVisitors: visitorsRes?.returningVisitors || 0,
        });

        setRecentActivities(recentPosts || []);
        setRecentSignups(newUsers || []);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const primaryCards = [
    { label: "총 사용자", value: stats.users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "총 게시글", value: stats.posts, icon: FileText, color: "text-brand-yellow", bg: "bg-brand-yellow/10", border: "border-brand-yellow/20" },
    { label: "총 댓글", value: stats.comments, icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "총 조회수", value: stats.totalViews, icon: Eye, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  ];

  const activityCards = [
    { label: "오늘 방문자", value: stats.todayVisitors, icon: MonitorSmartphone, color: "text-violet-400", bg: "bg-violet-500/10", sub: "명" },
    { label: "오늘 재방문", value: stats.returningVisitors, icon: RefreshCw, color: "text-teal-400", bg: "bg-teal-500/10", sub: "명" },
    { label: "오늘 신규 가입", value: stats.todaySignups, icon: UserPlus, color: "text-emerald-400", bg: "bg-emerald-500/10", sub: "명" },
    { label: "7일 신규 가입", value: stats.weekSignups, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10", sub: "명" },
    { label: "오늘 새 글", value: stats.todayPosts, icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10", sub: "개" },
    { label: "총 좋아요", value: stats.totalLikes, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10", sub: "개" },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black italic tracking-tighter text-white mb-2">대시보드 요약</h2>
        <p className="text-neutral-400">사이트의 전반적인 활동 현황을 실시간으로 확인합니다.</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`glass-card p-5 border-white/5`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <Activity className="w-3.5 h-3.5 text-neutral-700" />
            </div>
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
            <h3 className="text-2xl font-black italic text-white">{card.value.toLocaleString()}</h3>
          </motion.div>
        ))}
      </div>

      {/* Activity Stats */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">활성화 지표</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {activityCards.map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 + idx * 0.08 }}
              className="glass-card p-5 border-white/5"
            >
              <div className={`inline-flex p-2.5 rounded-xl ${card.bg} mb-3`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-black italic text-white">{card.value.toLocaleString()}</h3>
                <span className="text-neutral-500 text-xs">{card.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 glass-card border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-yellow" />
              <h3 className="font-bold text-sm">최근 게시글</h3>
            </div>
            <Link href="/board" className="text-xs text-neutral-500 hover:text-brand-yellow flex items-center gap-1 transition-colors">
              전체보기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentActivities.map((post) => (
              <div key={post.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate group-hover:text-brand-yellow transition-colors">{post.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{post.author_name} • {new Date(post.created_at).toLocaleString('ko-KR')}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 text-xs text-neutral-600 shrink-0">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                  <Link href={`/board/${post.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Signups + CMS */}
        <div className="space-y-4">
          {/* Recent Signups */}
          <div className="glass-card border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm">최근 가입자</h3>
            </div>
            <div className="divide-y divide-white/5">
              {recentSignups.map((u) => (
                <div key={u.id} className="px-5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                      <Users className="w-3 h-3 text-neutral-500" />
                    </div>
                    <span className="text-sm font-bold text-white">{u.username}</span>
                  </div>
                  <span className="text-xs text-neutral-600">{new Date(u.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CMS */}
          <div className="glass-card border-white/5 p-5 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20">
              <Settings className="w-6 h-6 text-brand-yellow animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">사이트 설정</h3>
              <p className="text-neutral-500 text-xs">메인 페이지 CMS를 관리합니다.</p>
            </div>
            <Link
              href="/admin/settings"
              className="w-full py-2 bg-brand-yellow text-black font-black italic rounded-lg hover:scale-105 transition-transform text-sm"
            >
              CMS 관리
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
