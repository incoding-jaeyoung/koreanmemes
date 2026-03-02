"use client";

import Image from "next/image";

type IcoKey = "ko" | "en" | "ja";

/**
 * 언어 코드(ko, en, ja) 또는 국가 코드(KR, JP, US 등)를
 * /images/ico/ 의 ko, en, ja 아이콘으로 매핑합니다.
 */
function getIcoKey(langOrCountry?: string | null): IcoKey {
  if (!langOrCountry) return "en";
  const v = langOrCountry.trim().toUpperCase();
  if (v === "KO" || v === "KR") return "ko";
  if (v === "JA" || v === "JP") return "ja";
  return "en";
}

export interface LangIcoProps {
  /** 언어 코드(ko, en, ja) 또는 국가 코드(KR, JP, US 등) */
  langOrCountry?: string | null;
  /** 아이콘 크기(px). 기본 20 */
  size?: number;
  className?: string;
  title?: string;
}

/**
 * /images/ico/ko.png, en.png, ja.png 로 국기/언어 아이콘을 표시하는 공통 컴포넌트.
 * 게시판·댓글·로그인 등 전체에서 동일한 아이콘을 쓸 때 사용합니다.
 */
export default function LangIco({
  langOrCountry,
  size = 20,
  className = "",
  title,
}: LangIcoProps) {
  const key = getIcoKey(langOrCountry);
  const alt = key === "ko" ? "KO" : key === "ja" ? "JA" : "EN";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      title={title}
      aria-hidden
    >
      <Image
        src={`/images/ico/${key}.png`}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
      />
    </span>
  );
}
