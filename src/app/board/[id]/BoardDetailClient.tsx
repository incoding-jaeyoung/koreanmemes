"use client";

import BoardDetailLayout from "@/components/board/BoardDetailLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function BoardDetailClient({
  processedContent,
}: {
  processedContent?: string;
}) {
  const { t } = useLanguage();

  return (
    <BoardDetailLayout
      processedContent={processedContent}
      heroConfig={{
        title: t("board.title"),
        highlightTitle: t("board.highlight"),
        subtitle: t("board.desc"),
        tags: ["COMMUNITY", "FREE TALK", "ARENA"],
      }}
      getPostApiUrl={(id) => `/api/posts/${id}`}
      getViewApiUrl={(id) => `/api/posts/${id}/view`}
      getLikeApiUrl={(id) => `/api/posts/${id}/like`}
      getPinApiUrl={(id) => `/api/posts/${id}/pin`}
      getDeleteApiUrl={(id) => `/api/posts/${id}`}
      getEditPath={(id) => `/board/write?edit=${id}`}
      listPath="/board"
      showRelatedPosts={true}
      showCategory={true}
      categoryBadge={{
        labelMap: {
          greeting: "board.cat.greeting",
          chat: "board.cat.chat",
          question: "board.cat.question",
          tips: "board.cat.tips",
          gear: "board.cat.gear",
          match: "board.cat.match",
        },
        colorMap: {
          greeting: "text-emerald-500",
          chat: "text-stone-400",
          question: "text-sky-500",
          tips: "text-rose-500",
          gear: "text-violet-500",
          match: "text-orange-500",
        },
        defaultColor: "text-emerald-500",
      }}
    />
  );
}
