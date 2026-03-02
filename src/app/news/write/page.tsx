"use client";

import { Suspense } from "react";
import BoardWriteLayout from "@/components/board/BoardWriteLayout";
import { useLanguage } from "@/context/LanguageContext";

/** 새소식 카테고리 */
const NEWS_CATEGORIES = [
  { id: "notice", key: "news.cat.notice" },
  { id: "update", key: "news.cat.update" },
  { id: "official", key: "news.cat.official" },
];

function WriteNewsContent() {
  const { t } = useLanguage();

  return (
    <BoardWriteLayout
      heroConfig={{
        title: t("news.title"),
        highlightTitle: t("news.highlight"),
        subtitle: t("news.desc"),
        tags: ["NEWS", "NOTICE", "UPDATE", "EVENT"],
      }}
      categories={NEWS_CATEGORIES}
      defaultCategory="notice"
      listPath="/news"
      getPostApiUrl={(id) => `/api/posts/${id}`}
      createApiUrl="/api/news"
      updateApiUrl={(id) => `/api/posts/${id}`}
      draftKey="news"
      extraFields={{ board_type: "news" }}
      showComboHelp={false}
    />
  );
}

export default function WriteNewsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
        </div>
      }
    >
      <WriteNewsContent />
    </Suspense>
  );
}
