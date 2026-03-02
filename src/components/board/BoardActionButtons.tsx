"use client";

import { ArrowLeft, ThumbsUp, Pencil, Trash2, Pin, PinOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface BoardActionButtonsProps {
  /** 뒤로가기 클릭 핸들러 */
  onBack: () => void;
  /** 좋아요 상태 */
  liked: boolean;
  /** 좋아요 처리 중 여부 */
  isLiking: boolean;
  onLike: () => void;
  /** 작성자 여부 */
  isAuthor: boolean;
  /** 관리자 여부 */
  isAdmin: boolean;
  /** 고정 여부 */
  isPinned: boolean;
  onEdit?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
}

export default function BoardActionButtons({
  onBack,
  liked,
  isLiking,
  onLike,
  isAuthor,
  isAdmin,
  isPinned,
  onEdit,
  onPin,
  onDelete,
}: BoardActionButtonsProps) {
  const { t } = useLanguage();
  const canDelete = isAuthor || isAdmin;

  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      {/* 왼쪽: 뒤로가기 + 좋아요 */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("board.detail.back")}
        </button>

        <button
          onClick={onLike}
          disabled={isLiking}
          aria-pressed={liked}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-bold transition-all disabled:opacity-50 ${
            liked
              ? "bg-brand-yellow/20 border-brand-yellow text-brand-yellow"
              : "bg-white/5 hover:bg-white/10 border-white/10"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          {liked ? t("board.detail.unlike") : t("board.detail.like")}
        </button>
      </div>

      {/* 오른쪽: 수정/고정/삭제 */}
      {canDelete && (
        <div className="flex gap-3">
          {isAuthor && onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-all"
            >
              <Pencil className="w-4 h-4" />
              {t("board.detail.edit")}
            </button>
          )}

          {isAdmin && onPin && (
            <button
              onClick={onPin}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-bold transition-all ${
                isPinned
                  ? "bg-brand-yellow/10 border-brand-yellow text-brand-yellow hover:bg-brand-yellow/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-neutral-400"
              }`}
            >
              {isPinned ? (
                <PinOff className="w-4 h-4" />
              ) : (
                <Pin className="w-4 h-4" />
              )}
              {isPinned ? t("board.detail.unpin") : t("board.detail.pin")}
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-brand-red/10 hover:bg-brand-red/20 border border-brand-red/30 text-brand-red rounded-full text-sm font-bold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              {isAdmin && !isAuthor
                ? t("board.detail.admin_delete")
                : t("board.detail.delete")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
