"use client";

import BoardDetailLayout from "@/components/board/BoardDetailLayout";
import { useLanguage } from "@/context/LanguageContext";

const GALLERY_CATEGORY_BADGE = {
  labelMap: {
    match_tournament: "gallery.cat.match_tournament",
    today_match: "gallery.cat.today_match",
    combo_guide: "gallery.cat.combo_guide",
    legendary: "gallery.cat.legendary",
    free: "gallery.cat.free",
    showcase: "gallery.cat.showcase",
  },
  colorMap: {
    match_tournament: "text-brand-red",
    today_match: "text-brand-yellow",
    combo_guide: "text-sky-400",
    legendary: "text-violet-400",
    free: "text-neutral-400",
    showcase: "text-pink-400",
  },
  defaultColor: "text-neutral-400",
};

export default function GalleryDetailClient({
  processedContent,
}: {
  processedContent?: string;
}) {
  const { t } = useLanguage();

  return (
    <BoardDetailLayout
      processedContent={processedContent}
      heroConfig={{
        title: t("gallery.title"),
        highlightTitle: t("gallery.highlight"),
        subtitle: t("gallery.desc"),
        tags: ["MEDIA", "GALLERY", "VIDEO", "IMAGE"],
      }}
      getPostApiUrl={(id) => `/api/posts/${id}`}
      getViewApiUrl={(id) => `/api/posts/${id}/view`}
      getLikeApiUrl={(id) => `/api/posts/${id}/like`}
      getPinApiUrl={(id) => `/api/posts/${id}/pin`}
      getDeleteApiUrl={(id) => `/api/posts/${id}`}
      getEditPath={(id) => `/gallery/write?edit=${id}`}
      listPath="/gallery"
      showRelatedPosts={true}
      relatedPostsApiEndpoint="/api/gallery"
      getRelatedPostHref={(id) => `/gallery/${id}`}
      relatedPostsListHref="/gallery"
      relatedPostsSectionLabel="GALLERY"
      showCategory={true}
      categoryBadge={GALLERY_CATEGORY_BADGE}
    />
  );
}
