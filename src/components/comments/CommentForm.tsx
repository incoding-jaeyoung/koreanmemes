"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, ImagePlus, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  /** 대댓글의 답글 시 실제 알림 대상 댓글 id (YouTube식 flat 구조에서 알림 정확도 보장) */
  replyToCommentId?: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  isReply?: boolean;
}

export default function CommentForm({
  postId,
  parentId = null,
  replyToCommentId = null,
  onSuccess,
  onCancel,
  placeholder,
  autoFocus = false,
  isReply = false,
}: CommentFormProps) {
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미지 첨부 상태
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 업로드 완료 후 cleanup 추적 (취소/언마운트 시 Cloudinary 삭제)
  const uploadedRef = useRef<{ url: string; publicId: string } | null>(null);

  // 언마운트 시 업로드된 미사용 이미지 정리
  useEffect(() => {
    return () => {
      if (uploadedRef.current) {
        fetch("/api/upload/image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: uploadedRef.current.publicId }),
        }).catch(() => {});
        uploadedRef.current = null;
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // 기존 업로드 이미지 정리
    if (uploadedRef.current) {
      fetch("/api/upload/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: uploadedRef.current.publicId }),
      }).catch(() => {});
      uploadedRef.current = null;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // input 초기화 (같은 파일 재선택 가능)
    e.target.value = "";
  };

  const removeImage = () => {
    if (uploadedRef.current) {
      fetch("/api/upload/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: uploadedRef.current.publicId }),
      }).catch(() => {});
      uploadedRef.current = null;
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      let imagePublicId: string | undefined;

      // 이미지 업로드
      if (imageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          alert(err.error || t("editor.imageUploadFailed"));
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }

        const { url, publicId } = await uploadRes.json();
        imageUrl = url;
        imagePublicId = publicId;
        // 업로드 성공 후 cleanup 추적 등록
        uploadedRef.current = { url, publicId };
        setIsUploading(false);
      }

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          parent_id: parentId,
          ...(replyToCommentId && { reply_to_comment_id: replyToCommentId }),
          ...(imageUrl && { image_url: imageUrl }),
          ...(imagePublicId && { image_public_id: imagePublicId }),
        }),
      });

      if (response.ok) {
        // 성공 시 cleanup 추적 해제 (댓글에 저장됨)
        uploadedRef.current = null;
        setContent("");
        setImageFile(null);
        setImagePreview(null);
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || t("Comments.postFailed"));
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert(t("common.error"));
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const canSubmit = (content.trim().length > 0 || imageFile !== null) && !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className={isReply ? "" : "mb-6"}>
      <div className="relative group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || t("Comments.placeholder")}
          autoFocus={autoFocus}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-5 md:pr-32 text-sm text-neutral-200 placeholder:text-neutral-400 placeholder:font-semibold focus:outline-none focus:border-brand-yellow/30 focus:bg-white/[0.05] transition-all resize-none min-h-[120px]"
          disabled={isSubmitting}
        />

        {/* 이미지 미리보기 */}
        {imagePreview && (
          <div className="relative inline-block mt-2 ml-1">
            <img
              src={imagePreview}
              alt=""
              className="max-h-32 max-w-[200px] rounded-lg border border-white/10 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center hover:bg-brand-red/80 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 md:absolute md:bottom-6 md:right-4 md:mt-0 md:flex-row-reverse md:gap-2">
          {/* 이미지 첨부 버튼 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-white/5 rounded-lg transition-colors md:order-last"
            title={t("Comments.addImage")}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4" />
            )}
          </button>

          <div className="flex gap-3 items-center">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-sm font-bold tracking-wide text-neutral-500 hover:text-white px-3 py-1.5 transition-colors"
                disabled={isSubmitting}
              >
                {t("Comments.cancel")}
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-yellow text-black rounded-lg font-bold shadow-[0_0_15px_rgba(226,232,0,0.2)] hover:shadow-[0_0_25px_rgba(226,232,0,0.3)] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group/btn"
            >
              <span className="text-xs font-bold">{t("Comments.post")}</span>
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleImageChange}
        className="hidden"
      />
    </form>
  );
}
