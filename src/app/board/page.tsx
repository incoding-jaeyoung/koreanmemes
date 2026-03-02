"use client";

import BoardListLayout from "@/components/board/BoardListLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function BoardPage() {
  const { t } = useLanguage();

  return (
    <BoardListLayout
      heroConfig={{
        title: t("board.title"),
        highlightTitle: t("board.highlight"),
        subtitle: t("board.desc"),
        tags: ["COMMUNITY", "FREE TALK", "ARENA"],
      }}
      apiEndpoint="/api/board"
      getPostHref={(post) => `/board/${post.id}`}
      writePath="/board/write"
      showWriteButton={true}
      emptyKey="board.empty"
      searchPlaceholderKey="board.search"
      postsPerPage={15}
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
