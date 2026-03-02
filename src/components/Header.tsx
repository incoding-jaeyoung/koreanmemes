"use client";

import { User, Globe, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ user, profile, logout }: { user: any; profile: any; logout: any }) {
  const router = useRouter();
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const rawEmail = user?.email || ''
  const emailPrefix = rawEmail ? rawEmail.split('@')[0] : null
  const metaName = user?.user_metadata?.custom_claims?.global_name
    || user?.user_metadata?.nickname || user?.user_metadata?.name
    || user?.user_metadata?.full_name || user?.user_metadata?.user_name
  // 트리거가 자동 설정한 이메일 기반 username은 무시 (UserProfileWidget과 동일 로직)
  const profileUsername = profile?.username
    && profile.username !== rawEmail
    && profile.username !== emailPrefix
    ? profile.username : null
  const displayName = profileUsername || metaName || emailPrefix || 'User';

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    window.location.href = '/api/auth/signout';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="sticky top-0 w-full z-50 glass-card rounded-none border-x-0 border-t-0 py-0 min-[851px]:py-2 pl-4 pr-1 min-[851px]:px-6 flex justify-between items-center min-h-16">
        {/* Logo */}
        <Link href="/" className="relative h-9 w-auto z-50">
          <Image
            src="/images/logo-white1.png"
            alt="VFMANIA"
            width={162}
            height={48}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden min-[851px]:flex gap-8 font-bold items-center">
          <div className="flex items-center gap-6 lg:gap-8 text-sm lg:text-base">
            <Link href="/news" className="hover:text-brand-yellow transition-colors">{t('nav.news')}</Link>
            <Link href="/board" className="hover:text-brand-yellow transition-colors">{t('nav.board')}</Link>
            <Link href="/gallery" className="hover:text-brand-yellow transition-colors">{t('nav.gallery')}</Link>
            
            {profile?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="flex items-center gap-1.5 px-3 py-1 bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg text-brand-yellow hover:bg-brand-yellow/20 transition-all group scale-95 hover:scale-100"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest pt-0.5">Admin</span>
              </Link>
            )}
          </div>
          
          {/* Language Switcher */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 relative group">
            <Globe className="w-4 h-4 text-neutral-400" />
            <select 
              value={locale} 
              onChange={(e) => setLocale(e.target.value as any)}
              className="bg-transparent text-sm font-bold uppercase outline-none cursor-pointer appearance-none pr-1 focus:ring-0 text-white"
            >
              <option value="ko" className="bg-neutral-900 text-white">KO</option>
              <option value="en" className="bg-neutral-900 text-white">EN</option>
              <option value="ja" className="bg-neutral-900 text-white">JA</option>
            </select>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 group">
                <Link
                  href="/profile"
                  className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:border-brand-yellow/50 border border-transparent transition-all overflow-hidden"
                >
                  {profile?.avatar_url && !avatarError ? (
                    <Image
                      src={profile.avatar_url}
                      alt={displayName}
                      fill
                      sizes="32px"
                      className="object-cover shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </Link>
                <div className="flex flex-col items-start -space-y-1">
                  <Link href="/profile" className="text-sm font-bold hover:text-brand-yellow transition-colors">
                    {displayName}{t('common.greeting')}
                  </Link>
                </div>
              </div>
              <NotificationBell />
              <button
                onClick={handleLogout}
                title={t('nav.logout')}
                className="group relative flex items-center justify-center h-8 bg-white/5 border border-white/10 rounded-full hover:bg-brand-red/10 hover:text-brand-red hover:border-brand-red/30 transition-all px-2 hover:px-3 overflow-hidden cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover:max-w-[80px] group-hover:ml-2">
                  {t('nav.logout')}
                </span>
              </button>
            </div>
          ) : (
            <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="px-4 py-1.5 glass-card text-sm font-bold hover:bg-brand-yellow/10 hover:text-brand-yellow transition-colors">{t('nav.login')}</Link>
          )}
        </nav>

        {/* Mobile: 알림 + 햄버거 버튼 */}
        <div className="min-[851px]:hidden z-50 flex items-center gap-1">
          {user && <NotificationBell />}
          <button
            className="p-2 text-white hover:text-brand-yellow transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 min-[851px]:hidden flex flex-col items-center gap-8"
          >
            {/* Mobile Nav Links */}
            <div className="flex flex-col items-center gap-6 text-xl font-bold">
              <Link href="/news" className="hover:text-brand-yellow transition-colors" onClick={toggleMobileMenu}>{t('nav.news')}</Link>
              <Link href="/board" className="hover:text-brand-yellow transition-colors" onClick={toggleMobileMenu}>{t('nav.board')}</Link>
              <Link href="/gallery" className="hover:text-brand-yellow transition-colors" onClick={toggleMobileMenu}>{t('nav.gallery')}</Link>
              
              {profile?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg text-brand-yellow hover:bg-brand-yellow/20 transition-all text-sm font-bold"
                  onClick={toggleMobileMenu}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ADMIN PANEL</span>
                </Link>
              )}
            </div>

            <div className="w-full h-px bg-white/10 max-w-xs my-2"></div>

            {/* Mobile User Section */}
            {user ? (
              <div className="flex flex-col items-center gap-6 w-full">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 group"
                  onClick={toggleMobileMenu}
                >
                  <div className="relative w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:border-brand-yellow/50 border border-transparent transition-all overflow-hidden">
                    {profile?.avatar_url && !avatarError ? (
                      <Image
                        src={profile.avatar_url}
                        alt={displayName}
                        fill
                        sizes="48px"
                        className="object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-bold text-white group-hover:text-brand-yellow transition-colors">
                      {displayName}
                    </span>
                    <span className="text-xs text-neutral-400">View Profile</span>
                  </div>
                </Link>

                {/* Mobile Language Switcher (Moved Here) */}
                <div className="flex flex-col items-center gap-2">
                   <span className="text-sm text-neutral-500 uppercase font-bold tracking-widest">Language</span>
                   <div className="flex items-center gap-2 bg-white/5 rounded-full p-1 border border-white/10">
                    {['ko', 'en', 'ja'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLocale(lang as any)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
                          locale === lang ? 'bg-brand-yellow text-black' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 w-full">
                <Link 
                  href={`/login?next=${encodeURIComponent(pathname)}`} 
                  className="px-6 py-2 glass-card text-sm font-bold hover:bg-brand-yellow/10 hover:text-brand-yellow transition-colors w-full max-w-xs text-center"
                  onClick={toggleMobileMenu}
                >
                  {t('nav.login')}
                </Link>

                 {/* Mobile Language Switcher (Moved Here for Guests too) */}
                 <div className="flex flex-col items-center gap-2">
                   <span className="text-sm text-neutral-500 uppercase font-bold tracking-widest">Language</span>
                   <div className="flex items-center gap-2 bg-white/5 rounded-full p-1 border border-white/10">
                    {['ko', 'en', 'ja'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLocale(lang as any)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
                          locale === lang ? 'bg-brand-yellow text-black' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                   </div>
                </div>
              </div>
            )}

            {/* Mobile Logout Button (Moved to Bottom) */}
            {user && (
              <div className="mt-auto mb-12 w-full px-6">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-brand-red/10 hover:text-brand-red hover:border-brand-red/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-bold text-sm">{t('nav.logout')}</span>
                </button>
              </div>
            )}
            {!user && <div className="mt-auto mb-12"></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
