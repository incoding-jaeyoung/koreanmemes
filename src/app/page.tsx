"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import RecentPostsWidget from "@/components/widgets/RecentPostsWidget";
import HotTopicsWidget from "@/components/widgets/HotTopicsWidget";
// import RecentCommentsWidget from "@/components/widgets/RecentCommentsWidget"; // Recent Comments 숨김 해제 시 함께 주석 해제
import UserProfileWidget from "@/components/widgets/UserProfileWidget";
import BestVideoWidget from "@/components/widgets/BestVideoWidget";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="relative">
      {/* 1. Cinematic Background Video (Fixed Fullscreen) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-full object-cover opacity-50"
        >
          <source src="/videos/kvmovie-pc.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </div>

      {/* 2. Main Content Container (Scrollable Overlay) */}
      <div className="relative z-10 pt-12 md:pt-24 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Header / Intro Text */}
        <div className="mb-12 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-2xl mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-red">Virtua Fighter</span> Mania
            </h1>
            <p className="text-neutral-300 font-medium max-w-xl text-sm md:text-base">
              {t('hero.desc')}
            </p>
          </motion.div>
        </div>

        {/* Mobile Profile Widget (Visible only on mobile) */}
        <div className="block lg:hidden mb-8">
          <UserProfileWidget />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 space-y-8">
            <HotTopicsWidget />
            <RecentPostsWidget />
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Login / Profile Widget (Desktop) */}
            <div className="hidden lg:block">
              <UserProfileWidget />
            </div>

            {/* Best Media Widget */}
            <BestVideoWidget />

            {/* Recent Comments — 나중에 다시 보이게 할 때 아래 주석 해제 */}
            {/* <RecentCommentsWidget /> */}

          </div>
        </div>
      </div>
    </div>
  );
}
