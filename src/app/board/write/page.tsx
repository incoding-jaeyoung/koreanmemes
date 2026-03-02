"use client";

import { Suspense } from "react";
import BoardWriteLayout from "@/components/board/BoardWriteLayout";
import { useLanguage } from "@/context/LanguageContext";

const BOARD_CATEGORIES = [
  { id: "greeting", key: "board.cat.greeting" },
  { id: "chat", key: "board.cat.chat" },
  { id: "question", key: "board.cat.question" },
  { id: "tips", key: "board.cat.tips" },
  { id: "gear", key: "board.cat.gear" },
  { id: "match", key: "board.cat.match" },
];

function WriteBoardContent() {
  const { t } = useLanguage();

  return (
    <BoardWriteLayout
      heroConfig={{
        title: t("board.title"),
        highlightTitle: t("board.highlight"),
        subtitle: t("board.desc"),
        tags: ["COMMUNITY", "FREE TALK", "ARENA"],
      }}
      categories={BOARD_CATEGORIES}
      defaultCategory="chat"
      listPath="/board"
      getPostApiUrl={(id) => `/api/posts/${id}`}
      createApiUrl="/api/posts"
      updateApiUrl={(id) => `/api/posts/${id}`}
      draftKey="post"
      showComboHelp={true}
    />
  );
}

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
        </div>
      }
    >
      <WriteBoardContent />
    </Suspense>
  );
}
