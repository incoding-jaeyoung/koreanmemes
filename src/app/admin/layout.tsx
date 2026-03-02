"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  Settings,
  Users,
  MessageSquare,
  FileText,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const supabase = createClient();

  // 초기 화면 크기에 따라 사이드바 상태 설정
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // 초기 실행
    handleResize();

    // 리사이즈 이벤트 리스너 (선택 사항, 필요 시 추가)
    // window.addEventListener('resize', handleResize);
    // return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }

      setIsAdmin(true);
    };

    checkAdmin();
  }, []);

  // 모바일에서 경로 변경 시 사이드바 닫기
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="w-12 h-12 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "대시보드", href: "/admin" },
    { icon: Settings, label: "사이트 설정 (CMS)", href: "/admin/settings" },
    { icon: Users, label: "사용자 관리", href: "/admin/users" },
    { icon: FileText, label: "게시글 관리", href: "/board" },
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-[#D6D6D6] flex relative">
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 h-screen overflow-y-auto left-0 z-50 bg-[#1a1a1a] border-r border-white/5 transition-all duration-300 ${
          isSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0">
            <ShieldCheck className="w-8 h-8 text-brand-yellow shrink-0" />
            <span className={`ml-3 font-black italic tracking-tighter text-xl transition-opacity duration-300 whitespace-nowrap overflow-hidden ${!isSidebarOpen && "lg:opacity-0 lg:hidden"}`}>
              ADMIN<span className="text-brand-yellow">PANEL</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all group whitespace-nowrap overflow-hidden ${
                  pathname === item.href 
                    ? "bg-brand-yellow text-black font-bold shadow-[0_0_15px_rgba(226,232,0,0.3)]" 
                    : "hover:bg-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${pathname === item.href ? "" : "group-hover:text-brand-yellow transition-colors"}`} />
                <span className={`ml-3 text-sm transition-opacity duration-300 ${!isSidebarOpen && "lg:opacity-0 lg:hidden"}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Bottom Link */}
          <div className="p-4 border-t border-white/5 shrink-0">
            <Link 
              href="/"
              className="flex items-center px-4 py-3 text-neutral-400 hover:text-white transition-colors whitespace-nowrap overflow-hidden"
            >
              <ArrowLeft className="w-5 h-5 shrink-0" />
              <span className={`ml-3 text-sm font-bold ${!isSidebarOpen && "lg:opacity-0 lg:hidden"}`}>사이트로 돌아가기</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-20 flex items-center justify-between px-6 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white"
          >
            {isSidebarOpen ? <Menu className="w-6 h-6 lg:hidden" /> : <Menu className="w-6 h-6" />}
            {isSidebarOpen && <X className="w-6 h-6 hidden lg:block" />}
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">Administrator</p>
              <p className="text-[10px] text-brand-yellow uppercase tracking-widest font-black">System Superuser</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
