"use client";

import BoardDetailLayout from "@/components/board/BoardDetailLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function NewsDetailClient({
  processedContent,
}: {
  processedContent?: string;
}) {
  const { t } = useLanguage();

  return (
    <BoardDetailLayout
      processedContent={processedContent}
      heroConfig={{
        title: t("news.title"),
        highlightTitle: t("news.highlight"),
        subtitle: t("news.desc"),
        tags: ["NEWS", "NOTICE", "UPDATE", "EVENT"],
      }}
      getPostApiUrl={(id) => `/api/posts/${id}`}
      getViewApiUrl={(id) => `/api/posts/${id}/view`}
      getLikeApiUrl={(id) => `/api/posts/${id}/like`}
      getPinApiUrl={(id) => `/api/posts/${id}/pin`}
      getDeleteApiUrl={(id) => `/api/posts/${id}`}
      getEditPath={(id) => `/news/write?edit=${id}`}
      listPath="/news"
      showRelatedPosts={false}
      categoryBadge={{
        labelMap: {
          notice: "news.cat.notice",
          update: "news.cat.update",
          event: "news.cat.event",
          official: "news.cat.official",
          community: "news.cat.community",
        },
        colorMap: {
          notice: "text-brand-red",
          update: "text-brand-yellow",
          official: "text-sky-400",
        },
        defaultColor: "text-neutral-400",
      }}
    />
  );
}
