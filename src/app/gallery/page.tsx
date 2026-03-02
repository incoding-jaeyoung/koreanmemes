"use client";

import BoardListLayout from "@/components/board/BoardListLayout";
import SliderSection from "@/components/SliderSection";
import { useLanguage } from "@/context/LanguageContext";

/** 미디어 갤러리 카테고리 */
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

export default function GalleryPage() {
  const { t } = useLanguage();

  return (
    <BoardListLayout
      heroConfig={{
        title: t("gallery.title"),
        highlightTitle: t("gallery.highlight"),
        subtitle: t("gallery.desc"),
        tags: ["MEDIA", "GALLERY", "VIDEO", "IMAGE"],
      }}
      apiEndpoint="/api/gallery"
      getPostHref={(post) => `/gallery/${post.id}`}
      writePath="/gallery/write"
      showWriteButton={true}
      emptyKey="gallery.empty"
      searchPlaceholderKey="gallery.search"
      postsPerPage={16}
      categoryBadge={GALLERY_CATEGORY_BADGE}
      listVariant="thumbnail"
      slotBetweenHeroAndContent={<SliderSection />}
    />
  );
}
