"use client";

import { motion } from "framer-motion";
import { EllipsisVertical } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SOCIAL_ACCOUNT_FIELDS = [
  { key: "psn_id", label: "PSN ID" },
  { key: "steam_id", label: "Steam ID" },
  { key: "xbox_gamertag", label: "Xbox Gamertag" },
  { key: "discord_id", label: "Discord" },
] as const;

type SocialAccountKey = (typeof SOCIAL_ACCOUNT_FIELDS)[number]["key"];

interface ProfileGameInfoProps {
  profile: {
    psn_id?: string;
    steam_id?: string;
    xbox_gamertag?: string;
    discord_id?: string;
  };
  /** 편집 모드 */
  isEditing?: boolean;
  formData?: {
    main_character_id: string;
    rank_level: string;
    psn_id: string;
    steam_id: string;
    xbox_gamertag: string;
    discord_id: string;
  };
  onFormDataChange?: (key: string, value: string) => void;
  transitionDelay?: number;
}

export default function ProfileGameInfo({
  profile,
  isEditing = false,
  formData,
  onFormDataChange,
  transitionDelay = 0,
}: ProfileGameInfoProps) {
  const { t } = useLanguage();

  const hasAnyInfo =
    profile.psn_id || profile.steam_id || profile.xbox_gamertag || profile.discord_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: transitionDelay }}
      className="glass-card p-5 md:p-8 mb-6"
    >
      <h3 className="flex items-center gap-2 mb-2 text-lg md:text-xl font-bold">
        <EllipsisVertical className="w-4 h-4 md:w-5 md:h-5 text-brand-yellow" />
        {t("profile.gameInfo.title")}
      </h3>
      {isEditing && (
        <p className="text-sm text-neutral-500 mb-4">
          {t("profile.gameInfo.hint")}
        </p>
      )}

      {/* 소셜/게임 계정 */}
      <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_ACCOUNT_FIELDS.map((field) => {
          const value = profile[field.key as SocialAccountKey];

          if (!isEditing && !value) return null;

          return (
            <div key={field.key}>
              <label className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2 block">
                {field.label}
              </label>
              {isEditing && formData ? (
                <input
                  type="text"
                  value={formData[field.key as SocialAccountKey]}
                  onChange={(e) => onFormDataChange?.(field.key, e.target.value)}
                  placeholder={`${field.label} ${t("profile.gameInfo.optional")}`}
                  autoComplete="off"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-yellow/50 transition-colors"
                />
              ) : (
                <p className="text-lg">{value || "-"}</p>
              )}
            </div>
          );
        })}
      </form>

      {!isEditing && !hasAnyInfo && (
        <p className="text-neutral-500 italic text-center py-4">
          {t("profile.gameInfo.noInfo")}
        </p>
      )}
    </motion.div>
  );
}
