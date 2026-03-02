import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Board",
  description:
    "Virtua Fighter global community board — share strategies, combos, and match reviews. Posts are auto-translated into Korean, English, and Japanese by AI. 버추어파이터 게시판 — 공략·콤보·대전 후기, AI 다국어 자동번역 지원. バーチャファイター掲示板 — 攻略・コンボ・対戦レビュー、AI多言語自動翻訳対応。",
  openGraph: {
    title: "Community Board | VF Mania",
    description:
      "Virtua Fighter global board — strategies, combos, match reviews with real-time AI translation (KO/EN/JA). 버추어파이터 공략·콤보 게시판, AI 다국어 자동번역. バーチャファイター攻略掲示板、AI多言語翻訳。",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Community Board | VF Mania",
    description:
      "Virtua Fighter global board — strategies, combos, match reviews with real-time AI translation (KO/EN/JA). 버추어파이터 공략·콤보 게시판, AI 다국어 자동번역. バーチャファイター攻略掲示板、AI多言語翻訳。",
  },
};

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
