"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Edit, Save, X, Upload, Loader2, Languages } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES } from "./profileConstants";
import LangIco from "@/components/common/LangIco";
import type { ReactNode } from "react";

interface ProfileSummaryProps {
  profile: {
    avatar_url?: string;
    username: string;
    comment?: string;
    preferred_language?: string;
    is_banned?: boolean;
    comment_translations?: Array<{ lang: string; comment: string }>;
  };
  /** 편집 모드 */
  isEditing?: boolean;
  formData?: {
    username: string;
    comment: string;
    preferred_language: string;
  };
  onFormDataChange?: (key: string, value: string) => void;
  /** 아바타 업로드 */
  onAvatarUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingAvatar?: boolean;
  /** 편집 액션 */
  onEditStart?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  /** 닉네임 뒤에 붙는 인사 텍스트 (마이페이지) */
  greeting?: string;
  /** 헤더 우측에 추가 버튼 (관리자 차단 등) */
  headerActions?: ReactNode;
  /** banned 뱃지 표시 */
  showBannedBadge?: boolean;
  /** 언어 선택 시 사이트 언어 동기화 콜백 */
  onLocaleChange?: (code: string) => void;
  transitionDelay?: number;
}

export default function ProfileSummary({
  profile,
  isEditing = false,
  formData,
  onFormDataChange,
  onAvatarUpload,
  isUploadingAvatar = false,
  onEditStart,
  onSave,
  onCancel,
  isSaving = false,
  greeting,
  headerActions,
  showBannedBadge = false,
  onLocaleChange,
  transitionDelay = 0,
}: ProfileSummaryProps) {
  const { t, locale } = useLanguage();
  const [showOriginalComment, setShowOriginalComment] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const selectedLanguage = LANGUAGES.find(
    (l) => l.code === (formData?.preferred_language || profile.preferred_language)
  );

  // 번역된 코멘트 가져오기
  const getTranslatedComment = () => {
    if (!profile.comment) return null;
    if (showOriginalComment) return profile.comment;

    const translation = profile.comment_translations?.find(
      (tr) => tr.lang === locale && tr.comment
    );
    return translation?.comment || profile.comment;
  };

  const translatedComment = getTranslatedComment();
  const hasTranslation = profile.comment_translations?.some(
    (tr) => tr.lang === locale && tr.comment && tr.comment !== profile.comment
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: transitionDelay }}
      className="p-5 md:p-8 mb-6 glass-card relative"
    >
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 md:gap-0">
        <div className="flex gap-4 items-center w-full md:w-auto">
          {/* 아바타 */}
          <div className="relative shrink-0">
            <div className="flex overflow-hidden relative justify-center items-center w-20 h-20 md:w-24 md:h-24 rounded-full border-2 bg-white/5 border-white/10">
              {profile.avatar_url && !avatarError ? (
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  fill
                  sizes="(max-width: 768px) 80px, 96px"
                  className="object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <User className="w-10 h-10 md:w-12 md:h-12 text-neutral-500" />
              )}
            </div>
            {isEditing && onAvatarUpload && (
              <label className="flex absolute right-0 bottom-0 justify-center items-center w-7 h-7 md:w-8 md:h-8 rounded-full transition-transform cursor-pointer bg-brand-yellow hover:scale-110">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarUpload}
                  className="hidden"
                />
                {isUploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-black animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5 md:w-4 md:h-4 text-black" />
                )}
              </label>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="flex-1 min-w-0">
            {isEditing && formData ? (
              <div className="mb-2">
                <label className="block mb-1 text-xs md:text-sm font-bold tracking-wider uppercase text-neutral-500">
                  {t("profile.summary.nickname")}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    const val = e.target.value;
                    const weightedLen = [...val].reduce((acc, ch) => acc + (/[\u3131-\uD79D]/.test(ch) ? 2 : 1), 0);
                    if (weightedLen <= 16) onFormDataChange?.("username", val);
                  }}
                  placeholder={t("profile.summary.nicknamePlaceholder")}
                  className="w-full px-3 py-1 text-xl md:text-2xl font-bold rounded-lg border transition-colors bg-white/5 border-white/10 focus:outline-none focus:border-brand-yellow/50"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {t("profile.summary.nicknameGuide")}
                  <span className="ml-2 text-neutral-400">
                    {[...formData.username].reduce((acc, ch) => acc + (/[\u3131-\uD79D]/.test(ch) ? 2 : 1), 0)}/16
                  </span>
                </p>
              </div>
            ) : (
              <h2 className="mb-1 text-xl md:text-2xl font-bold truncate">
                {profile.username}
                {greeting}
              </h2>
            )}
            <div className="flex gap-2 items-center text-sm text-neutral-400">
              {selectedLanguage && (
                <LangIco langOrCountry={selectedLanguage.code} size={18} />
              )}
              <span>{selectedLanguage?.name}</span>
            </div>
            {showBannedBadge && profile.is_banned && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-brand-red/20 text-brand-red text-[10px] font-black tracking-widest uppercase rounded border border-brand-red/30">
                BANNED
              </span>
            )}
          </div>
        </div>

        {/* 헤더 우측 액션 */}
        {headerActions && (
          <div className="flex gap-2">
            {headerActions}
          </div>
        )}
      </div>

      {/* 코멘트 */}
      <div className="mb-6">
        {isEditing && formData ? (
          <div>
            <label className="block mb-2 text-sm font-bold tracking-wider uppercase text-neutral-500">
              {t("profile.summary.commentLabel")}
            </label>
            <input
              type="text"
              value={formData.comment}
              onChange={(e) => onFormDataChange?.("comment", e.target.value)}
              maxLength={100}
              placeholder="Let's fight! 🥊"
              className="px-4 py-2 w-full rounded-lg border transition-colors bg-white/5 border-white/10 focus:outline-none focus:border-brand-yellow/50"
            />
            <p className="mt-1 text-sm text-neutral-500">{formData.comment.length}/100</p>
          </div>
        ) : (
          translatedComment && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-lg text-neutral-300">&quot;{translatedComment}&quot;</p>
                {hasTranslation && (
                  <div className="flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-brand-blue/70" />
                    <button
                      onClick={() => setShowOriginalComment(!showOriginalComment)}
                      className="text-xs text-brand-blue/70 hover:text-brand-blue transition-colors font-medium"
                    >
                      {showOriginalComment ? t('board.detail.view_translated') : t('board.detail.view_original')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* 언어 선택 (항상 표시) */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-bold tracking-wider uppercase text-neutral-500">
          {t("profile.summary.languageSelect")}
        </label>
        <div className="grid grid-cols-3 gap-2 md:flex">
          {LANGUAGES.map((lang) => {
            const isActive = (formData?.preferred_language || profile.preferred_language) === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onFormDataChange?.("preferred_language", lang.code);
                  onLocaleChange?.(lang.code);
                }}
                className={`flex items-center justify-center md:justify-start gap-2 px-2 md:px-4 py-2 text-sm font-bold rounded-lg border transition-colors w-full md:w-auto ${
                  isActive
                    ? "bg-brand-yellow/20 border-brand-yellow text-brand-yellow"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <LangIco langOrCountry={lang.code} size={20} />
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 통합된 액션 버튼 그룹 */}
      {(!isEditing && onEditStart) || (isEditing && onSave && onCancel) ? (
        <div className="flex gap-3 md:gap-2 items-center justify-center md:justify-end mt-8 md:mt-0 w-full md:w-auto md:absolute md:top-16 md:right-8 animate-in fade-in slide-in-from-bottom-2 md:animate-none z-10">
          {!isEditing && onEditStart && (
            <button
              onClick={onEditStart}
              className="flex gap-2 items-center px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm font-bold text-neutral-300 hover:text-white"
            >
              <Edit className="w-4 h-4" />
              <span>{t("profile.summary.edit")}</span>
            </button>
          )}

          {isEditing && onSave && onCancel && (
            <>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex gap-2 items-center px-6 py-2 bg-brand-yellow text-black font-bold rounded-lg hover:scale-105 transition-transform shadow-lg shadow-brand-yellow/20 md:shadow-none text-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{t("profile.summary.save")}</span>
              </button>
              <button
                onClick={onCancel}
                className="flex gap-2 items-center px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm font-bold text-neutral-300 hover:text-white"
              >
                <X className="w-4 h-4" />
                <span>{t("profile.summary.cancel")}</span>
              </button>
            </>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
