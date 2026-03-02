"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Edit2, Trash2, CornerDownRight, Languages, User, ImagePlus, X, Loader2 } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentContent from "./CommentContent";
import CommentMediaEmbed from "./CommentMediaEmbed";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate, formatTime } from "@/utils/date";
import LangIco from "@/components/common/LangIco";
import Link from "next/link";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface CommentItemProps {
  comment: any;
  currentUserId?: string;
  currentUserRole?: string | null;
  onRefresh: () => void;
  /** 번역 완료 시 번역 텍스트. undefined이면 원본 표시 */
  translatedContent?: string;
  /** 대댓글인 경우 부모 댓글 작성자 닉네임 */
  parentAuthorName?: string;
}

export default function CommentItem({
  comment,
  currentUserId,
  currentUserRole,
  onRefresh,
  translatedContent,
  parentAuthorName,
}: CommentItemProps) {
  const { t, locale } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // 편집 모드 이미지 상태
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(comment.image_url ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editUploadedRef = useRef<{ url: string; publicId: string } | null>(null);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!lightboxUrl) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxUrl(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxUrl]);

  const isAuthor = currentUserId === comment.author_id;
  const isAdmin = currentUserRole === "admin";
  const canDelete = isAuthor || isAdmin;

  const handleDelete = async () => {
    if (!confirm(t("Comments.deleteConfirm"))) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert(t("Comments.deleteFailed"));
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditStart = () => {
    setEditContent(comment.content);
    setEditImagePreview(comment.image_url ?? null);
    setEditImageFile(null);
    setRemoveImage(false);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    // 편집 중 업로드된 이미지 정리
    if (editUploadedRef.current) {
      fetch("/api/upload/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: editUploadedRef.current.publicId }),
      }).catch(() => {});
      editUploadedRef.current = null;
    }
    setIsEditing(false);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(t("Comments.imageSizeError"));
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(t("Comments.imageTypeError"));
      return;
    }

    // 이전 편집 업로드 정리
    if (editUploadedRef.current) {
      fetch("/api/upload/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: editUploadedRef.current.publicId }),
      }).catch(() => {});
      editUploadedRef.current = null;
    }

    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
    e.target.value = "";
  };

  const handleRemoveEditImage = () => {
    if (editUploadedRef.current) {
      fetch("/api/upload/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: editUploadedRef.current.publicId }),
      }).catch(() => {});
      editUploadedRef.current = null;
    }
    setEditImageFile(null);
    setEditImagePreview(null);
    setRemoveImage(true);
  };

  const handleUpdate = async () => {
    if (!editContent.trim() && !editImageFile && !editImagePreview && !removeImage) return;

    setIsUploading(true);
    try {
      let imageUrl: string | undefined;
      let imagePublicId: string | undefined;

      if (editImageFile) {
        const formData = new FormData();
        formData.append("file", editImageFile);
        const uploadRes = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          alert(err.error || t("editor.imageUploadFailed"));
          setIsUploading(false);
          return;
        }
        const { url, publicId } = await uploadRes.json();
        imageUrl = url;
        imagePublicId = publicId;
        editUploadedRef.current = { url, publicId };
      }

      const body: Record<string, unknown> = { content: editContent };
      if (removeImage) {
        body.remove_image = true;
      } else if (editImageFile && imageUrl) {
        body.image_url = imageUrl;
        body.image_public_id = imagePublicId;
      }

      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        editUploadedRef.current = null;
        setIsEditing(false);
        onRefresh();
      } else {
        alert(t("Comments.editFailed"));
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // 소프트 삭제된 댓글 플레이스홀더
  if (comment.is_deleted) {
    return (
      <div className={`${comment.parent_id ? "pl-4 ml-1 mt-2 mb-3" : "pb-4"}`}>
        {comment.parent_id && <CornerDownRight className="w-3.5 h-3.5 text-neutral-600 mb-1" />}
        <p className="px-1 text-sm italic text-neutral-600">{t("Comments.deleted")}</p>
      </div>
    );
  }

  const displayText = translatedContent ?? comment.content;

  return (
    <>
    <div className={`group ${comment.parent_id ? "pl-4 ml-1 mt-2 mb-3" : "pb-4"}`}>
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 min-w-0">
          <div className="flex gap-2 items-center min-w-0">
            <div
              className="flex overflow-hidden w-6 h-6 rounded-full border shrink-0 border-white/20"
              aria-hidden
            >
              {comment.author_avatar ? (
                <img
                  src={comment.author_avatar}
                  alt=""
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="flex justify-center items-center w-full h-full text-white bg-white/10">
                  <User className="w-4 h-4" />
                </span>
              )}
            </div>
            {comment.author_country && (
              <LangIco
                langOrCountry={comment.author_country}
                size={18}
                title={comment.author_country}
              />
            )}
            <Link
              href={`/profile/${comment.author_name}`}
              className="text-sm font-bold tracking-wider transition-colors text-neutral-200 hover:text-brand-yellow truncate min-w-0"
            >
              {comment.author_name}
            </Link>
          </div>
          <div className="flex gap-2 items-center shrink-0 md:gap-3">
            <span className="text-sm font-medium text-neutral-500">
              {formatDate(comment.created_at, locale)}
              <span className="ml-1.5 text-xs text-neutral-600 max-md:hidden">{formatTime(comment.created_at)}</span>
            </span>
            {translatedContent && (
              <span className="flex gap-1 items-center text-xs text-brand-blue/70" title={t("Comments.translated")}>
                <Languages className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium max-md:hidden">{t("Comments.translated")}</span>
              </span>
            )}
          </div>
        </div>

        {canDelete && !isEditing && (
          <div className="flex gap-1">
            {isAuthor && (
              <button
                onClick={handleEditStart}
                className="p-1.5 hover:bg-white/5 rounded text-neutral-500 hover:text-neutral-300 transition-colors"
                title={t("Comments.edit")}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`p-1.5 rounded transition-all ${
                isAdmin && !isAuthor
                  ? "hover:bg-brand-red/10 text-brand-red/60 hover:text-brand-red"
                  : "hover:bg-white/5 text-neutral-500 hover:text-neutral-300"
              }`}
              title={isAdmin && !isAuthor ? t("Comments.adminDelete") : t("Comments.delete")}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="my-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-brand-yellow/30 mb-3 min-h-[100px]"
          />

          {/* 편집 모드 이미지 */}
          {editImagePreview && (
            <div className="relative inline-block mb-3 ml-1">
              <img
                src={editImagePreview}
                alt=""
                className="max-h-32 max-w-[200px] rounded-lg border border-white/10 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveEditImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center hover:bg-brand-red/80 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}

          <div className="flex gap-3 justify-between items-center">
            <button
              type="button"
              onClick={() => editFileInputRef.current?.click()}
              disabled={isUploading}
              className="p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-white/5 rounded-lg transition-colors"
              title={t("Comments.addImage")}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4" />
              )}
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 text-sm font-bold rounded transition-colors hover:bg-white/5 text-neutral-400"
              >
                {t("Comments.cancel")}
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUploading}
                className="text-sm font-bold px-4 py-2 bg-brand-yellow text-black hover:scale-105 transition-all rounded shadow-[0_0_20px_rgba(226,232,0,0.2)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t("Comments.save")
                )}
              </button>
            </div>
          </div>
          <input
            ref={editFileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleEditImageChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className={comment.parent_id ? "ml-6" : "px-1"}>
          {comment.parent_id && parentAuthorName && (
            <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-brand-blue/70">
              <span>@{parentAuthorName}</span>
              <span className="font-normal opacity-60">
                {t("Comments.replyTo").replace("{name}", "").trim()}
              </span>
            </p>
          )}

          {/* 텍스트 (URL 자동 링크화) */}
          {displayText && (
            <CommentContent
              text={displayText}
              className="mb-2 text-sm leading-relaxed md:text-base text-neutral-200"
            />
          )}

          {/* 이미지: 원본 크기로 표시, 최대만 제한(맥스보다 작으면 확대 안 함) */}
          {comment.image_url && (
            <div className="mb-3">
              <img
                src={comment.image_url}
                alt=""
                onClick={() => {
                  if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
                    setLightboxUrl(comment.image_url);
                  }
                }}
                className="w-auto max-w-full sm:max-w-sm rounded-xl border border-white/10 transition-opacity max-md:cursor-default md:cursor-zoom-in md:hover:opacity-90"
              />
            </div>
          )}

          {/* YouTube / Twitter 임베드 */}
          {displayText && <CommentMediaEmbed text={displayText} />}
        </div>
      )}

      {!isEditing && (
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-sm font-black uppercase tracking-[0.15em] text-neutral-500 hover:text-brand-yellow flex items-center gap-2 transition-colors pl-5 mt-2"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {t("Comments.reply")}
        </button>
      )}

      {showReplyForm && (
        <div className="mt-4 pl-5">
          <CommentForm
            postId={comment.post_id}
            parentId={comment.parent_id ?? comment.id}
            replyToCommentId={comment.parent_id ? comment.id : null}
            onSuccess={() => {
              setShowReplyForm(false);
              onRefresh();
            }}
            onCancel={() => setShowReplyForm(false)}
            autoFocus
            placeholder={`@${comment.author_name}${t("Comments.replyPlaceholder")}`}
            isReply
          />
        </div>
      )}
    </div>

    {/* 라이트박스 */}
    {lightboxUrl && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={() => setLightboxUrl(null)}
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() => setLightboxUrl(null)}
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <img
          src={lightboxUrl}
          alt=""
          className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}
    </>
  );
}
