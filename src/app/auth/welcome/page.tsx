"use client";

import { CheckCircle, User, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
  ko: {
    title: "가입 완료!",
    subtitle: "이메일 인증이 완료되었습니다.",
    description: "VFMania 커뮤니티에 오신 것을 환영합니다.\n프로필을 설정하고 커뮤니티 활동을 시작하세요.",
    profileButton: "프로필 설정하기",
    homeButton: "홈으로 가기",
  },
  en: {
    title: "Welcome!",
    subtitle: "Your email has been verified.",
    description: "Welcome to the VFMania community.\nSet up your profile and start engaging with the community.",
    profileButton: "Set Up Profile",
    homeButton: "Go to Home",
  },
  ja: {
    title: "登録完了！",
    subtitle: "メール認証が完了しました。",
    description: "VFManiaコミュニティへようこそ。\nプロフィールを設定して、コミュニティ活動を始めましょう。",
    profileButton: "プロフィール設定",
    homeButton: "ホームへ",
  },
};

export default function WelcomePage() {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.ko;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="flex items-center justify-center w-20 h-20 mb-8 rounded-full bg-brand-yellow/20">
        <CheckCircle className="w-10 h-10 text-brand-yellow" />
      </div>

      <h2 className="mb-2 text-2xl font-black italic tracking-tighter">
        {t.title}
      </h2>
      <p className="mb-4 text-lg font-bold text-brand-yellow">
        {t.subtitle}
      </p>
      <p className="max-w-md mb-10 leading-relaxed whitespace-pre-line text-neutral-400">
        {t.description}
      </p>

      <div className="flex gap-3">
        <a
          href="/profile"
          className="flex items-center gap-2 px-6 py-2 bg-brand-yellow text-black font-bold rounded-lg hover:scale-105 transition-transform text-sm shrink-0"
        >
          <User className="w-4 h-4" />
          {t.profileButton}
        </a>
        <a
          href="/"
          className="flex items-center gap-2 px-6 py-2 font-bold rounded-lg transition-colors glass-card hover:bg-white/10 text-sm shrink-0"
        >
          <Home className="w-4 h-4" />
          {t.homeButton}
        </a>
      </div>
    </div>
  );
}
