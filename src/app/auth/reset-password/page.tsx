"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
  ko: {
    title: "새 비밀번호 설정",
    description: "사용할 새 비밀번호를 입력해 주세요.",
    newPassword: "새 비밀번호",
    newPasswordPlaceholder: "6자 이상",
    confirmPassword: "비밀번호 확인",
    confirmPasswordPlaceholder: "비밀번호 다시 입력",
    submitButton: "비밀번호 변경",
    laterButton: "나중에 하기",
    successMessage: "비밀번호가 변경되었습니다.",
    errorMinLength: "비밀번호는 6자 이상이어야 합니다.",
    errorMismatch: "비밀번호가 일치하지 않습니다.",
    errorGeneric: "비밀번호 변경에 실패했습니다.",
  },
  en: {
    title: "Set New Password",
    description: "Enter your new password below.",
    newPassword: "New Password",
    newPasswordPlaceholder: "Min 6 characters",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter password",
    submitButton: "Change Password",
    laterButton: "Do it later",
    successMessage: "Password has been changed.",
    errorMinLength: "Password must be at least 6 characters.",
    errorMismatch: "Passwords do not match.",
    errorGeneric: "Failed to change password.",
  },
  ja: {
    title: "新しいパスワードの設定",
    description: "新しいパスワードを入力してください。",
    newPassword: "新しいパスワード",
    newPasswordPlaceholder: "6文字以上",
    confirmPassword: "パスワード確認",
    confirmPasswordPlaceholder: "パスワードを再入力",
    submitButton: "パスワード変更",
    laterButton: "後で設定する",
    successMessage: "パスワードが変更されました。",
    errorMinLength: "パスワードは6文字以上である必要があります。",
    errorMismatch: "パスワードが一致しません。",
    errorGeneric: "パスワードの変更に失敗しました。",
  },
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = translations[locale as keyof typeof translations] || translations.ko;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsChecking(false);
      if (!user) {
        router.replace("/login");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t.errorMinLength);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.errorMismatch);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      alert(t.successMessage);
      router.replace("/profile");
    } catch (err: any) {
      setError(err.message || t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 text-brand-yellow animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-6">
      <div className="w-full max-w-md p-8 glass-card">
        <h1 className="mb-2 text-2xl font-black tracking-tighter">
          {t.title}
        </h1>
        <p className="mb-6 text-sm text-neutral-400">
          {t.description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-bold text-neutral-300">
              {t.newPassword}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.newPasswordPlaceholder}
              className="w-full px-4 py-3 rounded-lg border glass-card border-white/10 focus:outline-none focus:border-brand-yellow/50"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-bold text-neutral-300">
              {t.confirmPassword}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.confirmPasswordPlaceholder}
              className="w-full px-4 py-3 rounded-lg border glass-card border-white/10 focus:outline-none focus:border-brand-yellow/50"
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full gap-2 py-3 font-bold text-black rounded-lg transition-opacity bg-brand-yellow hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              t.submitButton
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full py-2 mt-4 text-sm transition-colors text-neutral-400 hover:text-white"
        >
          {t.laterButton}
        </button>
      </div>
    </div>
  );
}
