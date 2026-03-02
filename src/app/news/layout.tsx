import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Latest Virtua Fighter news, patch notes, events, and official announcements. 버추어파이터 최신 뉴스·패치노트·이벤트·공지사항. バーチャファイター 最新ニュース・パッチノート・イベント・公式お知らせ。",
  openGraph: {
    title: "News & Updates | VF Mania",
    description:
      "Latest Virtua Fighter news, patch notes, events & official announcements — KO/EN/JA. 버추어파이터 최신 뉴스·패치노트. バーチャファイター 最新ニュース・パッチノート。",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "News & Updates | VF Mania",
    description:
      "Latest Virtua Fighter news, patch notes, events & official announcements — KO/EN/JA. 버추어파이터 최신 뉴스·패치노트. バーチャファイター 最新ニュース・パッチノート。",
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
