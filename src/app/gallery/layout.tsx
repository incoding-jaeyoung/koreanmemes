import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Gallery",
  description:
    "Virtua Fighter media gallery — match videos, combo highlights, and tournament footage. Auto-translated in Korean, English, and Japanese. 버추어파이터 미디어 갤러리 — 대회 영상·콤보·하이라이트, AI 다국어 자동번역. バーチャファイターメディアギャラリー — 大会動画・コンボ・ハイライト、AI多言語翻訳対応。",
  openGraph: {
    title: "Media Gallery | VF Mania",
    description:
      "Virtua Fighter match videos, combo highlights & tournament footage with real-time AI translation (KO/EN/JA). 버추어파이터 영상·콤보 갤러리. バーチャファイター動画ギャラリー。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media Gallery | VF Mania",
    description:
      "Virtua Fighter match videos, combo highlights & tournament footage with real-time AI translation (KO/EN/JA). 버추어파이터 영상·콤보 갤러리. バーチャファイター動画ギャラリー。",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
