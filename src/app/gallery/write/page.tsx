"use client";

import { Suspense } from "react";
import BoardWriteLayout from "@/components/board/BoardWriteLayout";
import { useLanguage } from "@/context/LanguageContext";

/** 미디어 갤러리 카테고리 */
const GALLERY_CATEGORIES = [
  { id: "today_match", key: "gallery.cat.today_match" },
  { id: "showcase", key: "gallery.cat.showcase" },
  { id: "combo_guide", key: "gallery.cat.combo_guide" },
  { id: "match_tournament", key: "gallery.cat.match_tournament" },
  { id: "legendary", key: "gallery.cat.legendary" },
  { id: "free", key: "gallery.cat.free" },
];

function WriteGalleryContent() {
  const { t } = useLanguage();

  return (
    <BoardWriteLayout
      heroConfig={{
        title: t("gallery.title"),
        highlightTitle: t("gallery.highlight"),
        subtitle: t("gallery.desc"),
        tags: ["MEDIA", "GALLERY", "VIDEO", "IMAGE"],
      }}
      categories={GALLERY_CATEGORIES}
      defaultCategory="today_match"
      listPath="/gallery"
      getPostApiUrl={(id) => `/api/posts/${id}`}
      createApiUrl="/api/gallery"
      updateApiUrl={(id) => `/api/posts/${id}`}
      draftKey="gallery"
      extraFields={{ board_type: "video" }}
      showComboHelp={true}
    />
  );
}

export default function WriteGalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
        </div>
      }
    >
      <WriteGalleryContent />
    </Suspense>
  );
}
