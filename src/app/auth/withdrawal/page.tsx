"use client";

import { Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
  ko: {
    title: "탈퇴 완료",
    subtitle: "회원 탈퇴가 완료되었습니다.",
    description: "그동안 VFMania 커뮤니티를 이용해 주셔서 감사합니다.\n언제든 다시 찾아 주세요.",
    homeButton: "홈으로 가기",
  },
  en: {
    title: "Account Deleted",
    subtitle: "Your account has been successfully deleted.",
    description: "Thank you for being part of the VFMania community.\nWe hope to see you again.",
    homeButton: "Go to Home",
  },
  ja: {
    title: "退会完了",
    subtitle: "退会が完了しました。",
    description: "VFManiaコミュニティをご利用いただきありがとうございました。\nまたのご利用をお待ちしております。",
    homeButton: "ホームへ",
  },
};

export default function WithdrawalCompletePage() {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.ko;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="flex items-center justify-center w-20 h-20 mb-8 rounded-full bg-neutral-800 border border-white/10">
        <span className="text-4xl text-neutral-500">✓</span>
      </div>

      <h2 className="mb-2 text-2xl font-black italic tracking-tighter">
        {t.title}
      </h2>
      <p className="mb-4 text-lg font-bold text-brand-yellow">{t.subtitle}</p>
      <p className="max-w-md mb-10 leading-relaxed whitespace-pre-line text-neutral-400">
        {t.description}
      </p>

      <div className="flex gap-3">
        <a
          href="/"
          className="flex items-center gap-2 px-6 py-2 bg-brand-yellow text-black font-bold rounded-lg hover:scale-105 transition-transform text-sm shrink-0"
        >
          <Home className="w-4 h-4" />
          {t.homeButton}
        </a>
      </div>
    </div>
  );
}
