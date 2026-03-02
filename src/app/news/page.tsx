"use client";

import { useEffect, useState } from "react";
import BoardListLayout from "@/components/board/BoardListLayout";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";

export default function NewsPage() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      }
    }
    checkAdmin();
  }, []);

  return (
    <BoardListLayout
      heroConfig={{
        title: t("news.title"),
        highlightTitle: t("news.highlight"),
        subtitle: t("news.desc"),
        tags: ["NEWS", "NOTICE", "UPDATE", "EVENT"],
      }}
      apiEndpoint="/api/news"
      getPostHref={(post) => `/news/${post.id}`}
      writePath="/news/write"
      showWriteButton={isAdmin}
      emptyKey="news.empty"
      searchPlaceholderKey="news.search"
      postsPerPage={15}
      categoryBadge={{
        labelMap: {
          notice: "news.cat.notice",
          update: "news.cat.update",
          official: "news.cat.official",
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
