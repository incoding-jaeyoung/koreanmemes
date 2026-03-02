"use client";

import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
  ko: {
    title: "AUTH",
    titleHighlight: "CODE ERROR",
    description: "인증 코드를 확인하는 중에 문제가 발생했습니다.\n주로 잘못된 설정이나 만료된 링크를 클릭했을 때 발생합니다.",
    helpTitle: "해결 방법:",
    tip1: "이메일 인증 링크의 유효 시간이 지났을 수 있습니다.",
    tip2: "다시 회원가입 또는 로그인을 시도해 보세요.",
    tip3: "문제가 지속되면 관리자에게 문의해 주세요.",
    retryButton: "다시 시도하기",
    homeButton: "홈으로 가기",
  },
  en: {
    title: "AUTH",
    titleHighlight: "CODE ERROR",
    description: "There was a problem verifying the authentication code.\nThis usually happens when clicking an expired or invalid link.",
    helpTitle: "How to fix:",
    tip1: "The email verification link may have expired.",
    tip2: "Try signing up or logging in again.",
    tip3: "If the problem persists, please contact support.",
    retryButton: "Try Again",
    homeButton: "Go to Home",
  },
  ja: {
    title: "AUTH",
    titleHighlight: "CODE ERROR",
    description: "認証コードの確認中に問題が発生しました。\n主に期限切れまたは無効なリンクをクリックした場合に発生します。",
    helpTitle: "解決方法：",
    tip1: "メール認証リンクの有効期限が切れている可能性があります。",
    tip2: "もう一度新規登録またはログインをお試しください。",
    tip3: "問題が続く場合は、管理者にお問い合わせください。",
    retryButton: "もう一度試す",
    homeButton: "ホームへ",
  },
};

export default function AuthCodeError() {
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.ko;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="flex items-center justify-center w-20 h-20 mb-8 rounded-full bg-brand-red/20 animate-pulse">
        <AlertTriangle className="w-10 h-10 text-brand-red" />
      </div>

      <h2 className="mb-4 text-2xl font-black italic tracking-tighter">
        {t.title} <span className="text-brand-red">{t.titleHighlight}</span>
      </h2>

      <p className="max-w-md mb-10 leading-relaxed whitespace-pre-line text-neutral-400">
        {t.description}
      </p>

      <div className="p-6 mb-10 space-y-4 text-left glass-card max-w-lg border-brand-red/20">
        <h3 className="flex items-center gap-2 font-bold text-brand-red">
          {t.helpTitle}
        </h3>
        <ul className="space-y-2 text-sm list-disc list-inside text-neutral-300">
          <li>{t.tip1}</li>
          <li>{t.tip2}</li>
          <li>{t.tip3}</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <a href="/login" className="flex items-center gap-2 px-6 py-3 font-black italic text-black rounded-lg transition-transform bg-brand-yellow hover:scale-105">
          <RefreshCcw className="w-4 h-4" />
          {t.retryButton}
        </a>
        <a href="/" className="flex items-center gap-2 px-6 py-3 font-bold italic rounded-lg transition-colors glass-card hover:bg-white/10">
          <Home className="w-4 h-4" />
          {t.homeButton}
        </a>
      </div>
    </div>
  );
}
